const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const serviceController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const service = require("../model/service.Schema");
const repair = require("../model/repair.Schema");
const installation = require("../model/installation.Schema");

serviceController.post("/create", async (req, res) => {
  try {
    const serviceCreated = await service.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Service created successfully!",
      data: serviceCreated,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

serviceController.post("/list", async (req, res) => {
  try {
    const { searchKey = "", status, pageNo = 1, pageCount = 10, sortByField, sortByOrder } = req.body;

    const query = {};
    if (status) query.status = status;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };

    // Construct sorting object
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };

    // Fetch the category list
    const serviceList = await service
      .find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));

    const totalCount = await service.countDocuments({});
    const activeCount = await service.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "Service list retrieved successfully!",
      documentCount: { totalCount, activeCount, inactiveCount: totalCount - activeCount },
      data: serviceList,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


serviceController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Find the category by ID
    const serviceItem = await service.findById(id);
    if (!serviceItem) {
      return sendResponse(res, 404, "Failed", {
        message: "Service not found",
      });
    }
    // Delete the category from the database
    await service.findByIdAndDelete(id);

    sendResponse(res, 200, "Success", {
      message: "Service deleted successfully",
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
serviceController.put("/update", upload.single("image"), async (req, res) => {
  try {
    const id = req.body.id;

    // Find the category by ID
    const subCategory = await subCategory.findById(id);
    if (!subCategory) {
      return sendResponse(res, 404, "Failed", {
        message: "Sub Category not found",
      });
    }

    let updatedData = { ...req.body };

    // If a new image is uploaded
    if (req.file) {
      // Delete the old image from Cloudinary
      if (subCategory.image) {
        const publicId = subCategory.image.split("/").pop().split(".")[0];
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
    const updatedSubCategory = await subCategory.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });

    sendResponse(res, 200, "Success", {
      message: "Sub Category updated successfully!",
      data: updatedSubCategory,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


serviceController.post("/details", async (req, res) => {
  try {
    const { id, serviceType } = req.body;
    if (!id || !serviceType) {
      sendResponse(res, 200, "Success", {
        message: "Id aur service type not provided",
        statusCode: 403,
      });
      return;
    }
    if (serviceType == "service") {
      let response = await service.findOne({ _id: id });
      sendResponse(res, 200, "Success", {
        message: "Service details fetched successfully",
        data: response,
        statusCode: 200,
      });
      return;
    }
    if (serviceType == "repair") {
      let response = await repair.findOne({ _id: id });
      sendResponse(res, 200, "Success", {
        message: "Service details fetched successfully",
        data: response,
        statusCode: 200,
      });
      return;
    }
    if (serviceType == "installation") {
      let response = await installation.findOne({ _id: id });
      sendResponse(res, 200, "Success", {
        message: "Service details fetched successfully",
        data: response,
        statusCode: 200,
      });
      return;
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = serviceController;
