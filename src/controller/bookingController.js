const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const booking = require("../model/booking.Schema");
const bookingController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

bookingController.post("/create",  async (req, res) => {
  try {
    const bookingCreated = await booking.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Booking created successfully!",
      data: bookingCreated,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = bookingController;
