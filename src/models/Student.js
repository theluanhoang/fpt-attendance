const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    className: {
        type: String,
        required: true
    },
    qrCode: {
        type: String,
        required: true,
        unique: true
    },
    isPresent: {
        type: Boolean,
        default: false
    },
    checkInTime: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Student', studentSchema); 