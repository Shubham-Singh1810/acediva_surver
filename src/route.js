const express = require("express");
const router = express.Router();
const userController = require("./controller/userController");
const categoryController = require("./controller/categoryController");
const subCategoryController = require("./controller/subCategoryController");


router.use("/user", userController);
router.use("/category", categoryController);
router.use("/sub-category", subCategoryController);

module.exports = router;