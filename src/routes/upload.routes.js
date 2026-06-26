const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { uploadImage } = require("../controllers/upload.controller");
const verifyToken = require("../middlewares/verifyToken");

router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  uploadImage,
);

module.exports = router;
