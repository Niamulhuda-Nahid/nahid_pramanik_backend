const express = require("express");

const { login, logout } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { loginSchema } = require("../validators/auth.validator");
const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

module.exports = router;
