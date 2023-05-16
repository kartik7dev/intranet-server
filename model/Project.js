const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required : true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    projectTitle : {
        type : String,
        required : true
    },
    piName : {
        type : String,
        required : true
    },
    focalPoint : {
        type : String,
        required : true,
    },
    projectDocs: [{
        type: Schema.Types.ObjectId,
        ref: 'ProjectDoc'
      }],
    projectType: {
        type: Number,
        enum: [0, 1], // 0 - Ongoing,1-Completed
        default: 0 
    },
    status: {
        type: Number,
        enum: [0, 1], // 0 - Inactive,1-Active
        default: 1
    },
    created: {
        type: Date, 
        default: Date.now
    },
    modified: {
        type: Date, 
        default: Date.now
    }
})


module.exports = mongoose.model('Project',projectSchema)