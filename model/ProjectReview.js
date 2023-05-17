const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectReviewSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required : true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    remarks : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    reviewedBy : {
        type : String,
        required : true
    },
    projectReviewDoc : {
        type : String,
        required : true
    },
    reviewParameter1 : {
        type : Number,
        required : true
    },
    reviewParameter2 : {
        type : Number,
        required : true
    },
    reviewParameter3 : {
        type : Number,
        required : true
    },
    reviewParameter4 : {
        type : Number,
        required : true
    },
    reviewParameter5 : {
        type : Number,
        required : true
    },
    reviewTotal : {
        type : Number,
        required : true
    },
    reviewDate : {
        type : Date,
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


module.exports = mongoose.model('ProjectReview',projectReviewSchema)