const express = require("express");
const { sendResponse, generateOTP } = require("../utils/common");
require("dotenv").config();
const User = require("../model/user.Schema");
const userController = express.Router();
const request = require("request");
const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");

userController.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber, ...otherDetails } = req.body;
    // Check if the phone number is provided
    if (!phoneNumber) {
      return sendResponse(res, 400, "Failed", {
        message: "Phone number is required.",
      });
    }
    // Generate OTP
    const otp = generateOTP();

    // Check if the user exists
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Create a new user with the provided details and OTP
      user = await User.create({
        phoneNumber,
        otp,
        ...otherDetails,
      });

      // Generate JWT token for the new user
      const token = jwt.sign({ userId: user._id, phoneNumber: user.phoneNumber }, process.env.JWT_KEY);
      // Store the token in the user object or return it in the response
      user.token = token;
      user = await User.findByIdAndUpdate(user.id, { token }, { new: true });
    } else {
      // Update the existing user's OTP
      user = await User.findByIdAndUpdate(user.id, { otp }, { new: true });
    }

    let optResponse = await axios.post(
      `https://api.authkey.io/request?authkey=${process.env.AUTHKEY_API_KEY}&mobile=${req?.body?.phoneNumber}&country_code=91&sid=${process.env.AUTHKEY_SENDER_ID}&company=Acediva&otp=${otp}`
    );
    if (optResponse?.status == "200") {
      return sendResponse(res, 200, "Success", {
        message: "OTP send successfully",
        data: user,
      });
    } else {
      return sendResponse(res, 422, "Failed", {
        message: "Unable to send OTP",
      });
    }
  } catch (error) {
    console.error("Error in /send-otp:", error.message);
    // Respond with failure
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error.",
    });
  }
});
userController.post("/otp-verification", async (req, res) => {
  try {
    const {phoneNumber, otp} = req.body
    const user = await User.findOne({phoneNumber:phoneNumber});
    if(user){
      return sendResponse(res, 200, "Success", {
        message: "User logged in successfully",
        data: user,
      });
    }else{
      return sendResponse(res, 422, "Failed", {
        message: "Wrong OTP",
      });
    }
  } catch (error) {
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error.",
    });
  }
});
module.exports = userController;
