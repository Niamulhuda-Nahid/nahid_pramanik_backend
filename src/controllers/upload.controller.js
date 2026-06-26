const uploadToCloudinary = require("../utils/uploadToCloudinary");

const uploadImage =async (req, res) => {
  const singleImage = req.files?.image?.[0];
  const multipleImages = req.files?.images || [];

  try {
    if (!singleImage && multipleImages.length === 0) {
      return res.status(400).send({
        success: false,
        message: "No file uploaded",
      });
    }

    const folderMap = {
      project: "portfolio/projects",
      skill: "portfolio/skills",
      profile: "portfolio/profile",
    };

    const folder = folderMap[req.body.type];

    if (!folder) {
      return res.status(400).send({
        success: false,
        message: "Invalid upload type",
      });
    }

     // ===== Single Image Upload =====
    if (singleImage) {
      const image = await uploadToCloudinary(singleImage.buffer, folder);

      return res.send({
        success: true,
        message: "Image uploaded successfully",
        data: image,
      });
    }

    // ===== Multiple Image Upload =====
    const images = await Promise.all(
      multipleImages.map((file) =>
        uploadToCloudinary(file.buffer, folder)
      )
    );

        return res.send({
      success: true,
      message: "Images uploaded successfully",
      data: images,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "An error occurred while uploading the image",
    });
  }
};

module.exports = {
  uploadImage,
};
