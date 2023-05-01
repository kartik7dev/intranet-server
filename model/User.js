const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName : {
        type : String,
        default : 'Admin'
    },
    lastName : {
        type : String,
        default : 'Kumar'
    },
    username : {
        type : String,
    },
    email : {
        type : String,
        required : true,
        index : {
            unique : true
        }
    },
    password : {
        type : String,
        required : true
    },
    roles: { 
        type: String, 
        default: 'Admin'
    },
    status: {
        type: String, 
        default: 1
    },
    created: {
        type: Date, 
        default: Date.now
    }
})


module.exports = mongoose.model('User',userSchema)