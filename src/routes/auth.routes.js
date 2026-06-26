const express = require("express");

const { login } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { loginSchema } = require("../validators/auth.validator");
const router = express.Router();

router.post("/login", validate(loginSchema), login);

module.exports = router;
