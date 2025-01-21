const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Banner = require("../model/banner.Schema");
const bannerController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");


bannerController.post("/create", upload.single("image"), async (req, res) => {
  try {
    let obj;
    if (req.file) {
      let image = await cloudinary.uploader.upload(req.file.path, function (err, result) {
        if (err) {
          return err;
        } else {
          return result;
        }
      });
      obj = { ...req.body, image: image.url };
    }
    const BannerCreated = await Banner.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Banner created successfully!",
      data: BannerCreated,
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

bannerController.post("/list",  async (req, res) => {
    try {
      const BannerList = await Banner.find(req.body);
      sendResponse(res, 200, "Success", {
        message: "Banner list retrived successfully!",
        data: BannerList,
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


module.exports = bannerController;
