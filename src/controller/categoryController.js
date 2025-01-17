const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Category = require("../model/category.Schema");
const categoryController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const subCategory = require("../model/subCategory.Schema");

categoryController.post("/create", upload.single("image"), async (req, res) => {
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
    const CategoryCreated = await Category.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Category created successfully!",
      data: CategoryCreated,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

categoryController.post("/list", async (req, res) => {
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
    const categoryList = await Category.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo) * parseInt(pageCount)); 

    sendResponse(res, 200, "Success", {
      message: "Category list retrieved successfully!",
      data: categoryList,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

categoryController.put("/update", upload.single("image"), async (req, res) => {
    try {
      const  id  = req.body.id;
  
      // Find the category by ID
      const category = await Category.findById(id);
      if (!category) {
        return sendResponse(res, 404, "Failed", {
          message: "Category not found",
        });
      }
  
      let updatedData = { ...req.body };
  
      // If a new image is uploaded
      if (req.file) {
        // Delete the old image from Cloudinary
        if (category.image) {
          const publicId = category.image.split("/").pop().split(".")[0];
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
      const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, {
        new: true, // Return the updated document
      });
  
      sendResponse(res, 200, "Success", {
        message: "Category updated successfully!",
        data: updatedCategory,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
});

categoryController.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the category by ID
      const category = await Category.findById(id);
      if (!category) {
        return sendResponse(res, 404, "Failed", {
          message: "Category not found",
        });
      }
  
      // Extract the public ID from the Cloudinary image URL
      const imageUrl = category.image;
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
      await Category.findByIdAndDelete(id);
  
      sendResponse(res, 200, "Success", {
        message: "Category and associated image deleted successfully!",
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
});

categoryController.get("/details/:id",  async (req, res) => {
  try {
    const { id } = req.params
    const CategoryDetails = await Category.findOne({_id:id});
    const SubCategoryList = await subCategory.find({categoryId:id});
    sendResponse(res, 200, "Success", {
      message: "Category with sub category retrived successfully!",
      data:{CategoryDetails, SubCategoryList},
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = categoryController;
