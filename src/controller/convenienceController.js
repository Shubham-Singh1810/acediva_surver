const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const convenienceController  = express.Router();
require("dotenv").config();

convenienceController.get("/details", async (req, res) => {
  try {
    sendResponse(res, 200, "Success", {
      message: "convenience fee retrieved successfully!",
      data: {percentage:12},
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


module.exports = convenienceController;
