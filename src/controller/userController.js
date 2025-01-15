const express = require("express");
const { sendResponse, generateOTP } = require("../utils/common");
require("dotenv").config();
const User = require("../model/user.Schema");
const userController = express.Router();
const request = require("request");
const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");
// userController.post("/send-otp", async (req, res) => {
//   try {
//     const { phoneNumber, ...otherDetails } = req.body;

//     // Check if the phone number is provided
//     if (!phoneNumber) {
//       return sendResponse(res, 400, "Failed", {
//         message: "Phone number is required.",
//       });
//     }

//     // Generate OTP
//     const otp = generateOTP();

//     // Check if the user exists
//     let user = await User.findOne({ phoneNumber });

//     if (!user) {
//       // Create a new user with the provided details and OTP
//       user = await User.create({
//         phoneNumber,
//         otp,
//         ...otherDetails,
//       });
//     } else {
//       // Update the existing user's OTP
//       user = await User.findByIdAndUpdate(
//         user.id,
//         { otp },
//         { new: true } // Return the updated user document
//       );
//     }

//     // Send the OTP via AuthKey SMS API
//     const authKey = "8b38c1d3b9456205"; // Store authkey in .env
//     const sid = "16007"; // Replace with your sender ID
//     const countryCode = "91"; // Replace with the recipient's country code

//     const options = {
//       method: "GET",
//       url: "https://api.authkey.io/request", // Replace with the correct API endpoint
//       qs: {
//         authkey: authKey,
//         mobile: phoneNumber,
//         company:"DST",
//         otp:"otp",
//         country_code: countryCode,
//         sid: sid,
//       },
//     };

//     request(options, function (error, response, body) {
//       if (error) {
//         console.error("Error sending OTP:", error);
//         return sendResponse(res, 500, "Failed", {
//           message: "Failed to send OTP. Please try again later.",
//         });
//       }

//       const result = JSON.parse(body);
//       console.log(request)
//       if (result) {
//         // OTP sent successfully
//         return sendResponse(res, 200, "Success", {
//           message: "OTP sent successfully.",
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Error in /send-otp:", error.message);

//     // Respond with failure
//     return sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error.",
//     });
//   }
// });
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
module.exports = userController;
