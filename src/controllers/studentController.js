const Student = require('../models/Student');
const QRCode = require('qrcode');

// Tạo QR code cho học sinh mới
exports.createStudent = async (req, res) => {
    try {
        const { studentId, fullName, className } = req.body;
        // Sửa logic sinh baseUrl cho phù hợp môi trường Render
        let baseUrl = process.env.BASE_URL;
        if (!baseUrl) {
            baseUrl = `http://localhost:${process.env.PORT || 3000}`;
        }
        // KHÔNG thêm :PORT nếu đã có BASE_URL
        const qrLink = `${baseUrl}/api/check-in/${studentId}`;
        const qrCode = await QRCode.toDataURL(qrLink);
        
        const student = new Student({
            studentId,
            fullName,
            className,
            qrCode
        });

        await student.save();
        res.status(201).json({
            studentId,
            fullName,
            className,
            qrCode,
            qrLink
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái điểm danh
exports.checkIn = async (req, res) => {
    try {
        const { studentId } = req.body;
        const student = await Student.findOne({ studentId });
        
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy học sinh' });
        }

        student.isPresent = true;
        student.checkInTime = new Date();
        await student.save();

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách học sinh theo lớp
exports.getStudentsByClass = async (req, res) => {
    try {
        const { className } = req.params;
        const students = await Student.find({ className });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Điểm danh qua GET (dùng cho QR link)
exports.checkInByGet = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).send('<div style="font-size:2em;color:red;text-align:center;margin-top:20vh;">Không tìm thấy học sinh!</div>');
        }
        student.isPresent = true;
        student.checkInTime = new Date();
        await student.save();
        // Phát sự kiện realtime qua Socket.IO
        req.io.emit('student-checked-in', student);
        res.send(`
            <html>
            <head>
                <meta charset='utf-8'/>
                <title>Điểm danh thành công</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { background: #f0f0f0; font-family: Arial, sans-serif; }
                    .success-box {
                        margin: 20vh auto;
                        max-width: 400px;
                        background: #fff;
                        border-radius: 12px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        padding: 40px 20px;
                        text-align: center;
                    }
                    .success-title { color: #28a745; font-size: 2em; margin-bottom: 10px; }
                    .student-info { font-size: 1.2em; margin-bottom: 20px; }
                    .close-btn {
                        background: #007bff; color: #fff; border: none; border-radius: 5px;
                        padding: 10px 20px; font-size: 1em; cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="success-box">
                    <div class="success-title">✅ Điểm danh thành công!</div>
                    <div class="student-info">
                        <b>${student.fullName}</b><br/>
                        Mã số: ${student.studentId}<br/>
                        Lớp: ${student.className}
                    </div>
                    <button class="close-btn" onclick="window.close()">Đóng</button>
                    <div style="margin-top:10px;font-size:0.9em;color:#888;">Tab này sẽ tự đóng sau 3 giây...</div>
                </div>
                <script>
                    setTimeout(function(){ window.close(); }, 3000);
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('<div style="font-size:2em;color:red;text-align:center;margin-top:20vh;">Có lỗi xảy ra!</div>');
    }
};

// Lấy danh sách tất cả học sinh
exports.getAllStudents = async (req, res) => {
    try {
        const { className, search } = req.query;
        let filter = {};
        if (className) filter.className = className;
        if (search) filter.fullName = { $regex: search, $options: 'i' };
        const students = await Student.find(filter).sort({ className: 1, fullName: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thông tin học sinh
exports.updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { fullName, className } = req.body;
        const student = await Student.findOneAndUpdate(
            { studentId },
            { fullName, className },
            { new: true }
        );
        if (!student) return res.status(404).json({ message: 'Không tìm thấy học sinh' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa học sinh
exports.deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOneAndDelete({ studentId });
        if (!student) return res.status(404).json({ message: 'Không tìm thấy học sinh' });
        res.json({ message: 'Đã xóa học sinh thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 