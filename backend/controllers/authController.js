//this is the route logic part. here backend receives the code retrieved by frontend google sign in and exchanges that code for google tokens and uses them to genrate JWT token.
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const oauth2Client = require('../utils/oauth2client');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
require('dotenv').config();
const crypto = require('crypto');



const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIMEOUT,
    });
};
// Create and send Cookie ->
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    console.log(process.env.JWT_COOKIE_EXPIRES_IN);
    const cookieOptions = {
        expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN)),
        httpOnly: true,
        path: '/',
        // sameSite: "none",
        secure: false,
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'none';
    }

    user.password = undefined;

    res.cookie('jwt', token, cookieOptions);

    // console.log(user);

    res.status(statusCode).json({
        message: 'success',
        token,
        data: {
            user,
        },
    });
};


exports.verifyToken= async(req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
        if (!token) {
                return res.status(401).json({ message: 'No token provided' });
              }
              jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
                const user = await User.findById(decoded.id);

    if (!user || !user.isVerified) {
      return res.status(403).json({ message: 'Account not verified' });
    }
                    if (err) {
                      return res.status(403).json({ message: 'Invalid or expired token' });
                    }
                    
      res.json({ valid: true });
    } )
}
  
exports.getUser = async (req, res) => {
    try {
      const userId = req.user.id; // Extract user ID from the token payload
      console.log(userId)
      const user = await User.findById(userId); // Replace with your actual DB logic
      console.log(user)
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


  const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

  exports.logUser = async (req, res) => {
      try {
          const { email, pwd } = req.body; // Destructure email and password from the request body
          // console.log(email, pwd);
        
          const user = await User.findOne({ email }).select('+password'); 
  
          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }
        
          const isPasswordValid = await bcrypt.compare(pwd, user.password);
          if (!isPasswordValid) {
              return res.status(401).json({ message: 'Invalid credentials' });
          }
  
          createSendToken(user, 200, res);
      } catch (error) {
          console.error('Error during login:', error.message);
          return res.status(500).json({ message: 'Internal server error' });
      }
  };
  



  exports.authenticateToken=(req, res, next) =>{
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }
  
  exports.regUser = async (req, res) => {
    
      const username=req.body.name; 
      const email=req.body.email;
      const pwd=req.body.pwd;
      // console.log(username,email,pwd)

      let user = await User.findOne({ email: email });
   
    if (!user) {
        console.log('New User found');
        user = await User.create({
            name: username,
            email: email,
            password:pwd,
        });
    }

    createSendToken(user, 201, res);
  };



  exports.authenticateToken=(req, res, next) =>{
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }
  



/* GET Google Authentication API. */
exports.googleAuth = catchAsync(async (req, res, next) => {
    const code = req.query.code;
    console.log("USER CREDENTIAL -> ", code);

    const googleRes = await oauth2Client.oauth2Client.getToken(code);
    
    oauth2Client.oauth2Client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
	);
	
    let user = await User.findOne({ email: userRes.data.email });
   
    if (!user) {
        console.log('New User found');
        user = await User.create({
            name: userRes.data.name,
            email: userRes.data.email,
            image: userRes.data.picture,
        });
    }

    createSendToken(user, 201, res);
});




exports.sendMail = async (req, res) => {
  const email = req.body.email;
console.log(email)
  // Generate a verification token (e.g., random string)
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Set token expiration (e.g., 1 hour)
  const tokenExpiration = Date.now() + 3600000;  // 1 hour

  // Store token and expiration in the database (user must be created before)
  try {
    const h=await User.findOne({email:email})
    console.log(h)
     const ress=await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          verificationToken: verificationToken,
          tokenExpiration: tokenExpiration, 
          isVerified:false// 1 hour from now
        },
      }
    );
console.log(ress)
    // Create the verification link
    
// const verificationLink=`http://127.0.0.1:5000/api/verifyMail?token=${verificationToken}`

const verificationLink=`http://localhost:5173/dashboard?token=${verificationToken}`

    // Set up email options
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
                clientId: process.env.OAUTH_CLIENTID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    let mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: 'Email Verification',
      text: `Click this link to verify your email: ${verificationLink}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Verification email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send verification email.', error: error.message });
  }
};




exports.verifyEmail = async (req, res) => {
  const token  = req.body.token;
  console.log(token,)

  try {
    // Find the user by verification token
    const user = await User.findOne({ verificationToken: token });
console.log(user,"innauthhcontroller")
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    if (user.tokenExpiration < Date.now()) {
      return res.status(400).json({ message: 'Token has expired.' });
    }

    // Mark email as verified and remove the token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiration = undefined;

    await user.save();

    res.status(200).json({ verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify email', error: error.message });
  }
};


