const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    "name" : {
        type: String,
        required: true
    },
    "subjects": [{
        "subname": {
            type: String,
            required: true
        },
        "subdesc":{
            type: String,
            required: true
        },
        "subcontent":{
            type: String,
            required: true
        }
    }],
})

const Course = new mongoose.model("course", courseSchema);

module.exports = Course;
