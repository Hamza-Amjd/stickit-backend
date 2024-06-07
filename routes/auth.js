const express = require('express');
const User = require('../models/User');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Hamzaisagoodb$oy';

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 8 }),
  body('confirmPassword', 'Password must be atleast 5 characters').isLength({ min: 8}),
], async (req, res) => {
  // If there are errors, return Bad request and the errors
  let success=false
  const errors = validationResult(req);
  const {name, email, password,confirmPassword}=req.body;
  
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  try {
    // Check whether the user with this email exists already
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({success, error: "Sorry a user with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);

    // Create a new user
    user = await User.create({
      name: name,
      password: secPass,
      email: email,
    });
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success=true;

    // res.json(user)
    res.json({success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success=false
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success,error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success,error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success=true;
    res.json({success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});


// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser,  async (req, res) => {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

router.post('/forgetpassword', async (req, res) => {
  const email = req.body.email;
  let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No user registered with that email!" });
    }
    const resetToken = await generateOTP();
    user.passwordResetToken=resetToken;
    user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
    await user.save().then((res)=>{console.log(res)});
    res.status(200).json({success: "reset token sent to your email",resetToken});
    await sendOTPMail(email,resetToken)
  });
  
router.patch('/resetpassword/:token', async (req, res) => {
  const resetToken=req.params.token;
  // const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");
  const user=await User.findOne({passwordResetToken:resetToken,passwordResetExpire:{$gt:Date.now()}});
  if(!user){
    return res.status(400).json({error: "Invalid token"});
  }
  if(user.passwordResetToken!==resetToken){
    return res.status(400).json({error: "Invalid token"});
  }
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password, salt);

  user.password=secPass;
  user.passwordResetToken=undefined;
  user.passwordResetExpire=undefined;
  user.passwordChangeDate=Date.now();
  await user.save();
  res.status(200).json({success: "Password has been reset"});
});

function generateOTP() { 
  let digits = '0123456789'; 
  let OTP = ''; 
  let len = digits.length 
  for (let i = 0; i < 4; i++) { 
      OTP += digits[Math.floor(Math.random() * len)]; 
  } 
   
  return OTP; 
} 

const sendOTPMail=async(email,resetToken)=>{
  const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:"hamzahumpty1@gmail.com",
      pass:"iyvcbezjswocmwjf"
    }
  })
  //compose email message
  const mailOptions={
    to:email,
    subject:"Passsword Reset",
    html:`<p>Verify your password reset request with code given below.</p>
<p style="color:tomato;font-size:32px;letter-spacing:2px">
<b>
${resetToken}
</b>
</p>
<p>    
Dont Share this code with anyone else.</p>
<p>This code <b>expires in 10 minutes</b></p>`
  };
  try {
    await transporter.sendMail(mailOptions)
    console.log("verification email sent succesfully")
  } catch (error) {
    console.log("Error sending verification email",error)
    
  }

}
module.exports = router