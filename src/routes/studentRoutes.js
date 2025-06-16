const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Middleware để gán io vào req
router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
});

// Tạo học sinh mới
router.post('/students', studentController.createStudent);

// Điểm danh học sinh
router.post('/check-in', studentController.checkIn);

// Lấy danh sách học sinh theo lớp
router.get('/class/:className', studentController.getStudentsByClass);

// Điểm danh qua GET (dùng cho QR link)
router.get('/check-in/:studentId', studentController.checkInByGet);

// Lấy danh sách tất cả học sinh (có thể lọc theo lớp, tìm kiếm)
router.get('/students', studentController.getAllStudents);

// Cập nhật học sinh
router.put('/students/:studentId', studentController.updateStudent);

// Xóa học sinh
router.delete('/students/:studentId', studentController.deleteStudent);

module.exports = router; 