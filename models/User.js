const mongoose = require('mongoose');
const crypto = require('crypto');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    passwordChangeDate:Date,
    passwordResetToken:String,
    passwordResetExpire:Date,
  });

  const User = mongoose.model('user', UserSchema);
  module.exports = User;