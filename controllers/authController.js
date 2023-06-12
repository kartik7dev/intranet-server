const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const transporter = require('../config/emailConfig'); // Import the configured transporter

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()
  
   

    if (!foundUser || !foundUser.status) {
        return res.status(401).json({ message: 'User does not exist or inactive' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Invalid password' })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: false, //accessible only by web server 
        secure: false, //https
        // sameSite: 'None', //cross-site cookie 
        maxAge: 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })


    const user = {
        userId : foundUser._id,
        firstName : foundUser.firstName,
        lastName : foundUser.lastName,
        username : foundUser.username,
        email : foundUser.email,
        roles : foundUser.roles,
        status : foundUser.status
    }

    // Send accessToken containing username and roles 
    res.json({ token:accessToken, user:JSON.stringify(user) })
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies
  console.log(cookies)
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ token : accessToken, user : JSON.stringify(foundUser) })
        })
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.status(200).json({ message: 'Logout successfully' })
}

// @desc Forgot Password
// @route POST /auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body.values;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    const foundUser = await User.findOne({ email }).exec();
  
    if (!foundUser || !foundUser.status) {
      return res.status(401).json({ message: 'User does not exist or inactive' });
    }
  
    const resetToken = jwt.sign(
      { userId: foundUser._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: '30m' }
    );
  
    const resetUrl =  process.env.SITE_URL + `/auth/reset-password/${resetToken}`;
  
    // Send password reset email
    const mailOptions = {
      from: 'no-reply@iirs.gov.in',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: ${resetUrl}`,
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      res.status(200).json({ message: 'Password reset email sent successfully' });
    });
  });

// @desc Reset Password
// @route PATCH /auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body.values;
  
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
      const userId = decoded.userId;
  
      const foundUser = await User.findById(userId).exec();
      if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      foundUser.password = hashedPassword;
      await foundUser.save();
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  });

// @desc Check if Email Exists
// @route POST /auth/check-email
// @access Public
const checkEmailExists = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
  
    const foundUser = await User.findOne({ email }).exec();
  
    if (foundUser) {
      return res.json({ success: true, message: 'Email exists' });
    } else {
      return res.json({ success: false, message: 'Email does not exist' });
    }
  });  

module.exports = {
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    checkEmailExists
}