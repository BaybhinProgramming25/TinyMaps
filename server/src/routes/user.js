const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = express.Router();

const { User } = require('../models/User');
const { ContactUs } = require('../models/ContactUs');

require('dotenv').config()

router.post('/api/signup', async (req, res) => {

  try {

    const { username, password, email } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      console.log('User already exists');
      return res.status(200).json({ status : "ERROR", message : 'Username or email already exists' });
    }
    
    const token = crypto.randomBytes(20).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    if(!sendVerificationEmail(email, token)) {
      console.log('Error sending verification email');
      return res.status(500).json({ error: 'Error sending verification email'})
    }

    await User.create({ username: username, password: hashedPassword, email: email, verificationToken: token });

    console.log('New user added successfully ');
    res.status(200).json({ success : 'true', token: token, message: 'User Successfully Added!' });

  } catch (error) {

    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login page for users 
router.post('/api/login', async (req, res) => {

  try {

    const { email, password } = req.body;
    const user = await User.findOne({ email: email })

    const passwordCheck = bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(400).json({ error: 'Invalid Credentials'})
    }

    if (!user) {
      console.log("ERROR - Invalid credentials")
      return res.status(400).json({ status : 'ERROR', message : "Invalid credentials"});
    }

    if (!user.isVerified) {
      console.log('User not verified');
      return res.status(400).json({ status : 'ERROR',  message : "User Not Verified. Please verify your email by checking your inbox" });
    }

    const accessToken = jwt.sign(
      { username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m'}
    );

    const refreshToken = jwt.sign(
      { username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d'}
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      domain: 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    })

    const user_email_pair = {
      username: user.username,
      email: user.email
    }

    res.status(200).json({ user_data: user_email_pair, accessToken: accessToken });

  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/api/verify/:token', async (req, res) => {

  try {

    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token});

    if (!user) {
      console.log('Invalid verification link');
      return res.status(200).send('Invalid verification link');
    }

    user.isVerified = true; 
    user.verificationToken = null; // Set to null, knowing that we verified 
    await user.save();

    res.redirect(`http://localhost:5173/login`)

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Generate new access token by checking refresh token
router.post('/api/refresh', async (req, res) => {

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token!'})
  }

  try {

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Get the user from the backend in case 
    const user = await User.findOne({ username: decoded.username })

    // Refresh token is valid 
    const newAccessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m'}
    );

    const user_email_pair = {
      username: user.username,
      email: user.email,
      isVerified: user.isVerified
    };

    res.status(200).json({ user: user_email_pair, accessToken: newAccessToken });
  }
  catch (error) {
    return res.status(403).json({ error: 'Refresh token expired. Please log in again for a new refresh token'})
  }
});

router.post('/api/logout', async (req, res) => {

  try {

    const { email } = req.body;
   
    const user_db = await User.findOne({ email: email });

    user_db.refreshToken = ""; // Set to empty string, get new refresh token upon login 
    await user_db.save();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      domain: 'localhost',
      path: '/'
    });

    console.log(user_db);

    res.status(200).json({ message: 'User successfully logged out!'})
  }
  catch (error) {
    res.status(500).json({ error: 'Internal Sever Error'})
  }
});

router.post('/api/contactus', async (req, res) => {

  try {

    const { name, email, subject, message} = req.body;
 
    const data = {
      name: name,
      email: email,
      subject: subject,
      message: message
    };

    const response = await ContactUs.insertOne(data);
    console.log(response);
    res.status(200).json({ success: 'Successfully inserted into contact us collections'});
  }
  catch {
    res.status(500).json({ error: 'Internal Server Error'});
  }
})


// Middleware Functions
const sendVerificationEmail = async (email, verificationToken) => {

    const transporter = nodemailer.createTransport({
      host: 'mailhog', 
      port: 1025, 
      secure: false, 
      tls: {
        rejectUnauthorized: false 
      }
    });

    const verificationLink = `http://backend-service:8000/api/verify/${verificationToken}`;

    const mailOptions = {
      from: 'no-reply@mapviewer.com', 
      to: email, 
      subject: 'Account Verification',
      text: `Please click on the following link to verify your email: ${verificationLink}`,
      html: `<p>Please click on the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`, 
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId)
      return true
    } catch (error) {
      console.error('Error sending email: ', error);
      return false; 
    }
}


module.exports = router;
