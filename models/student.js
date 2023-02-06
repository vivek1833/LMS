const mongoose = require('mongoose')

const regSchema = new mongoose.Schema({
    "name": {
        type: String,
        required: true,
    },
    "email": {
        type: String,
        required: true,
        unique: true,
    },
    "phone": {
        type: Number,
        required: true,
    },
    "course": {
        type: String,
        required: true,
    },
    "password": {
        type: String,
        required: true
    },
    "confirmpassword": {
        type: String,
        required: true
    },
    "tokens": [{
        token: {
            type: String,
            required: true
        }
    }]
})

const Student = new mongoose.model("student", regSchema);

module.exports = Student;