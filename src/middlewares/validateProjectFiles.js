const validateProjectFiles = (req, res, next) => {
  const thumbnail = req.files?.thumbnail?.[0];
  const banner = req.files?.banner?.[0];
  const gallery = req.files?.gallery || [];

  if (!thumbnail) {
    return res.status(400).send({
      success: false,
      message: "Thumbnail is required",
    });
  }

  if (!banner) {
    return res.status(400).send({
      success: false,
      message: "Banner is required",
    });
  }

  if (gallery.length === 0) {
    return res.status(400).send({
      success: false,
      message: "At least one gallery image is required",
    });
  }

  next();
};

module.exports = validateProjectFiles;