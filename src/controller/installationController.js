const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const installation = require("../model/installation.Schema");
const installationController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

installationController.post("/create",  async (req, res) => {
  try {
    const repairCreated = await installation.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Installation record created successfully!",
      data: repairCreated,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

installationController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 0,
      pageCount = 10,
      sortBy = { field: "createdAt", order: "desc" },
    } = req.body;

    const query = {};
    if (status) query.status = status;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };

    // Construct sorting object
    const sortField = sortBy.field || "createdAt";
    const sortOrder = sortBy.order === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };

    // Fetch the category list
    const subCategoryList = await subCategory
      .find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo) * parseInt(pageCount));

    sendResponse(res, 200, "Success", {
      message: "Sub Category list retrieved successfully!",
      data: subCategoryList,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

installationController.put("/update", upload.single("image"), async (req, res) => {
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

installationController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    // Find the category by ID
    const subCategoryItem = await subCategory.findById(id);
    if (!subCategoryItem) {
      return sendResponse(res, 404, "Failed", {
        message: "Sub Category not found",
      });
    }

    // Extract the public ID from the Cloudinary image URL
    const imageUrl = subCategory.image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
        } else {
          console.log("Cloudinary image deletion result:", result);
        }
      });
    }

    // Delete the category from the database
    await subCategory.findByIdAndDelete(id);

    sendResponse(res, 200, "Success", {
      message: "Sub Category and associated image deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = installationController;
