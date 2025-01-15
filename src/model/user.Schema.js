const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        
    },
    lastName: {
        type: String,
        
    },
    email: {
        type: String,
       
    },
    password: {
        type: String,
        
    },
    role: {
        type: String,
    },
    description: {
        type: String
    }, 
    otp: {
        type: String
    },
    token: {
        type: String
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    }
});

userSchema.plugin(timestamps);
module.exports = mongoose.model("User", userSchema);


