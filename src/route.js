const express = require("express");
const router = express.Router();
const userController = require("./controller/userController");


router.use("/user", userController);

module.exports = router;