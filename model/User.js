const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName : {
        type : String,
    },
    lastName : {
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
        select : false
    },
    roles: { 
        type: String, 
        default: 'Admin'
    },
    status: {
        type: String, 
        default: 0
    },
    created: {
        type: Date, 
        default: Date.now
    },
    refreshToken : {
        type: [String]
    }
})


module.exports = mongoose.model('User',userSchema)