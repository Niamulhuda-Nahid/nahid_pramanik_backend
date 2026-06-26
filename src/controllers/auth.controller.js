const bcrpypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getAdminsCollection } = require("../config/db");
const { success } = require("zod");

const login = async (req, res) => {
  try {
    const adminsCollection = getAdminsCollection();

    const { email, password } = req.validatedBody;
    const admin = await adminsCollection.findOne({ email });

    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const matched = await bcrpypt.compare(password, admin.password);

    if (!matched) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    res.send({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      }
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "An error occurred while logging in",
    });
  }
};

module.exports = {
  login,
};
