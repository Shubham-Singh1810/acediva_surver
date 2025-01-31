const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const repair = require("../model/repair.Schema");
const repairController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

repairController.post("/create",  async (req, res) => {
  try {
    const repairCreated = await repair.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Repair created successfully!",
      data: repairCreated,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

repairController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "", 
      status, 
      pageNo=1, 
      pageCount = 10,
      sortByField, 
      sortByOrder
    } = req.body;

    const query = {};
    if (status) query.status = status;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };

     // Construct sorting object
     const sortField = sortByField || "createdAt"; 
     const sortOrder = sortByOrder === "asc" ? 1 : -1; 
     const sortOption = { [sortField]: sortOrder };

    // Fetch the category list
    const serviceList = await repair
    .find(query)
    .sort(sortOption)
    .limit(parseInt(pageCount))
    .skip(parseInt(pageNo-1) * parseInt(pageCount))
     
    const totalCount = await repair.countDocuments({});
    const activeCount = await repair.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "Repair list retrieved successfully!",
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

repairController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    // Find the category by ID
    const repairItem = await repair.findById(id);
    if (!repairItem) {
      return sendResponse(res, 404, "Failed", {
        message: "Repair not found",
      });
    }

    

    // Delete the category from the database
    await repair.findByIdAndDelete(id);

    sendResponse(res, 200, "Success", {
      message: "Repair deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

repairController.put("/update", upload.single("image"), async (req, res) => {
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



module.exports = repairController;
