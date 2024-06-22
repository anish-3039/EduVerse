const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
    try {
        //get an email from the request's body
        const email = req.body.email;
         //check user for this email and perform validation
        const user = await User.findOne({ email: email });   
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            });
        }
        //generate token
        const token = crypto.randomBytes(20).toString("hex");
         //update user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true }
        );
        console.log("DETAILS", updatedDetails);
      //create URL 
        const url = `http://localhost:3000/update-password/${token}`;
    //send an email containing the URL 
        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        );
      //return response
        res.json({
            success: true,
            message:
                "Email Sent Successfully, Please Check Your Email to Continue Further",
        });
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Sending the Reset Message`,
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (confirmPassword !== password) {
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not Match",
            });
        }
         //get user details from db using token 
        const userDetails = await User.findOne({ token: token });
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid",
            });
        }
         //token time check 
        if (!(userDetails.resetPasswordExpires > Date.now())) {
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenerate Your Token`,
            });
        }
        //hashed the password
        const encryptedPassword = await bcrypt.hash(password, 10);
          //update password in db 
        await User.findOneAndUpdate(
            { token: token },
            { password: encryptedPassword },
            { new: true }
        );
        res.json({
            success: true,
            message: `Password Reset Successful`,
        });
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Updating the Password`,
        });
    }
};
