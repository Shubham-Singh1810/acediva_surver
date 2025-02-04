const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Booking = require("../model/booking.Schema");
const bookingController = express.Router();
require("dotenv").config();
const Repair = require("../model/repair.Schema");
const Installation = require("../model/installation.Schema");
const Service = require("../model/service.Schema");
const User = require("../model/user.Schema");

bookingController.post("/create", async (req, res) => {
  try {
    const bookingCreated = await Booking.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Booking created successfully!",
      data: bookingCreated,
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
bookingController.get("/my-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bookingList = await Booking.find({ userId: id });
    const updatedBookingList = await Promise.all(
      bookingList.map(async (v) => {
        let serviceDetails = null;
        let userDetails = null;
        if (v?.serviceType == "service") {
          serviceDetails = await Service.findOne({ _id: v?.serviceId });
        } else if (v?.serviceType == "repair") {
          serviceDetails = await Repair.findOne({ _id: v?.serviceId });
        } else if (v?.serviceType == "installation") {
          serviceDetails = await Installation.findOne({ _id: v?.serviceId });
        }
        userDetails = await User.findOne({ _id: v?.userId });
        return { ...v.toObject(), serviceDetails, userDetails };
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
bookingController.get("/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bookingData = await Booking.findOne({ _id: id });
    if (bookingData?.modeOfPayment == "cod") {
      // Update the category in the database
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { bookingStatus: "cancel" },
        {
          new: true, // Return the updated document
        }
      );
      sendResponse(res, 200, "Success", {
        message: "Booking cancel successfully!",
        data: updatedBooking,
        statusCode: 200,
      });
    }
    if (bookingData?.modeOfPayment == "online") {
      // Update the category in the database
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { bookingStatus: "cancel" },
        {
          new: true, // Return the updated document
        }
      );
      sendResponse(res, 200, "Success", {
        message: "Booking cancel successfully, you will get your refund within 24 hours!",
        data: updatedBooking,
        statusCode: 200,
      });
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});
module.exports = bookingController;
