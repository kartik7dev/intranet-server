const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectDocSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required : true
    },
    projectDoc : {
        type : String,
        required : true
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


module.exports = mongoose.model('ProjectDoc',projectDocSchema)