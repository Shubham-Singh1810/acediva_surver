const express = require("express");
const router = express.Router();
const userController = require("./controller/userController");
const categoryController = require("./controller/categoryController");
const subCategoryController = require("./controller/subCategoryController");
const serviceController = require("./controller/serviceController");
const repairController = require("./controller/repairController");


router.use("/user", userController);
router.use("/category", categoryController);
router.use("/sub-category", subCategoryController);
router.use("/service", serviceController);
router.use("/repair", repairController);

module.exports = router;