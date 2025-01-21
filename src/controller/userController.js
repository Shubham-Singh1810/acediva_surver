const express = require("express");
const { sendResponse, generateOTP } = require("../utils/common");
require("dotenv").config();
const User = require("../model/user.Schema");
const repair = require("../model/repair.Schema");
const service = require("../model/service.Schema");
const installation = require("../model/installation.Schema");
const userController = express.Router();
const request = require("request");
const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const upload = require("../utils/multer");

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
    const user = await User.findOne({phoneNumber:phoneNumber, otp:otp});
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
userController.post("/create-admin", async (req, res) => {
  try {
    const {email, password} = req.body
    const user = await User.findOne({email:email, password:password, role:"admin"});
    if(user){
      return sendResponse(res, 422, "Failed", {
        message: "Admin already exists",
        data: user,
        statusCode:422
      });
    }
    let admin = await User.create(req.body);
    return sendResponse(res, 200, "Failed", {
      message: "Admin created successfully",
      data: admin,
      statusCode:200
    });
  } catch (error) {
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error.",
      statusCode:500
    });
  }
});
userController.post("/admin-login", async (req, res) => {
  try {
    const {email, password} = req.body
    let user = await User.findOne({email:email, password:password, role:"admin"});
    if(user){
      // Generate JWT token for the new user
      const token = jwt.sign({ userId: user._id, phoneNumber: user.phoneNumber }, process.env.JWT_KEY);
      // Store the token in the user object or return it in the response
      user.token = token;
      user = await User.findByIdAndUpdate(user.id, { token }, { new: true });
      return sendResponse(res, 200, "Success", {
        message: "Admin logged in successfully",
        data: user,
        statusCode:200
      });
    }else{
      return sendResponse(res, 400, "Success", {
        message: "Invalid Credintials",
        statusCode:400
      });
    }
  } catch (error) {
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error.",
      statusCode:500
    });
  }
});
userController.post("/add-wish-list", async (req, res) => {
  try {
    const { userId, modelId, modelType } = req.body;

    // Validate input
    if (!userId || !modelId || !modelType) {
      return sendResponse(res, 400, "Failed", {
        message: "userId, modelId, and modelType are required.",
        statusCode: 400,
      });
    }

    // Check if the modelType is valid
    const validModelTypes = ["service", "repair", "installation"];
    if (!validModelTypes.includes(modelType)) {
      return sendResponse(res, 400, "Failed", {
        message: `Invalid modelType. Valid types are: ${validModelTypes.join(", ")}`,
        statusCode: 400,
      });
    }

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "Failed", {
        message: "User not found.",
        statusCode: 404,
      });
    }

    // Check if the item is already in the wish list
    const itemIndex = user.wishList.findIndex(
      (item) => item.modelId.toString() === modelId && item.modelType === modelType
    );

    if (itemIndex !== -1) {
      // Remove the item if it exists
      user.wishList.splice(itemIndex, 1);
      await user.save();

      return sendResponse(res, 200, "Success", {
        message: "Item removed from wish list successfully.",
        data: user.wishList,
        statusCode: 200,
      });
    } else {
      // Add the item to the wish list if it doesn't exist
      user.wishList.push({ modelId, modelType });
      await user.save();

      return sendResponse(res, 200, "Success", {
        message: "Item added to wish list successfully.",
        data: user.wishList,
        statusCode: 200,
      });
    }
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error.",
      statusCode: 500,
    });
  }
});
userController.get("/get-wish-list/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return sendResponse(res, 400, "Failed", {
        message: "userId is required.",
        statusCode: 400,
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "Failed", {
        message: "User not found.",
        statusCode: 404,
      });
    }

    // Define the model mapping for dynamic population
    const modelMapping = {
      service: service,
      repair: repair,
      installation: installation,
    };

    // Populate the wish list with model details based on modelType
    const populatedWishList = await Promise.all(user.wishList.map(async (item) => {
      const Model = modelMapping[item.modelType]; // Dynamically select the model
      if (Model) {
        // Find the model item and populate it with the details
        const populatedItem = await Model.findById(item.modelId)
        return {
          id: item._id,  // Adding user-friendly field names
          modelId: item.modelId,
          modelType: item.modelType,
          modelDetails: populatedItem ? {
            id: populatedItem._id,
            name: populatedItem.name,
            description: populatedItem.description,
            rate:populatedItem.rate,
            distance:populatedItem.distance,
            status:populatedItem.status
          } : null
        };
      }
      return item; // If no model found, return as is
    }));

    return sendResponse(res, 200, "Success", {
      message: "Wish list retrieved successfully.",
      data: populatedWishList,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error.",
      statusCode: 500,
    });
  }
});
userController.put("/update", upload.single("image"), async (req, res) => {
  try {
    const id = req.body._id;

    // Find the category by ID
    const userData = await User.findById(id);
    if (!userData) {
      return sendResponse(res, 404, "Failed", {
        message: "User not found",
      });
    }

    let updatedData = { ...req.body };

    // If a new image is uploaded
    if (req.file) {
      // Delete the old image from Cloudinary
      if (userData.image) {
        const publicId = User.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting old image from Cloudinary:", error);
          } else {
            console.log("Old image deleted from Cloudinary:", result);
          }
        });
      }

      // Upload the new image to Cloudinary
      const image = await cloudinary.uploader.upload(req.file.path);
      updatedData.image = image.url;
    }

    // Update the category in the database
    const updatedUserData = await User.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });

    sendResponse(res, 200, "Success", {
      message: "User updated successfully!",
      data: updatedUserData,
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
userController.get("/details/:id",  async (req, res) => {
  try {
    const {id} = req.params;
    const userData = await User.findOne({_id:id});
    sendResponse(res, 200, "Success", {
      message: "User details retrived successfully!",
      data: userData,
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = userController;
