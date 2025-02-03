const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const booking = require("../model/booking.Schema");
const bookingController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const repair = require("../model/repair.Schema");
const installation = require("../model/installation.Schema");
const service = require("../model/service.Schema");
const User = require("../model/user.Schema");

bookingController.post("/create",  async (req, res) => {
  try {
    const bookingCreated = await booking.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Booking created successfully!",
      data: bookingCreated,
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode:500
    });
  }
});
bookingController.get("/my-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bookingList = await booking.find({ userId: id });

    // Use Promise.all to wait for all async operations inside map
    const updatedBookingList = await Promise.all(
      bookingList.map(async (v) => {
        let serviceDetails = null;
        let userDetails = null;
       console.log(v?.serviceType =="installation")
        if (v?.serviceType == "service") {
          serviceDetails = await service.findOne({ _id: v?.serviceId });
        } else if (v?.serviceType == "repair") {
          serviceDetails = await repair.findOne({ _id: v?.serviceId });
        } else if (v?.serviceType == "installation") {
          serviceDetails = await installation.findOne({ _id: v?.serviceId });
        }
        userDetails =await User.findOne({ _id: v?.userId });
        console.log(v?.serviceId,  serviceDetails)
        return { ...v.toObject(), serviceDetails , userDetails};
      })
    );

    sendResponse(res, 200, "Success", {
      message: "Booking list retrieved successfully!",
      data: updatedBookingList,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});


module.exports = bookingController;
