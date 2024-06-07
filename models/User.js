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
  UserSchema.methods.createResetPasswordToken=()=>{
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log(this.passwordResetToken);
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
  }
  const User = mongoose.model('user', UserSchema);
  module.exports = User;