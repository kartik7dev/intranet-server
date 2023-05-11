const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    categoryName : {
        type : String,
        required : true    
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    status: {
        type: Number, 
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


module.exports = mongoose.model('Category',categorySchema)