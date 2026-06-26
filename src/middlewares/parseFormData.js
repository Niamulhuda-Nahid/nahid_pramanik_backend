const parseFormData = (req, res, next) => {
  try {
    // boolean
    if (req.body.featured !== undefined) {
      req.body.featured = req.body.featured === "true";
    }

    // arrays
    ["technologies", "features"].forEach((field) => {
      if (req.body[field]) {
        req.body[field] = JSON.parse(req.body[field]);
      }
    });

    next();
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Invalid form data",
    });
  }
};

module.exports = parseFormData;