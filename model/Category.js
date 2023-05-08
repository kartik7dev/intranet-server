const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    categoryName : {
        type : String,
        required : true    
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