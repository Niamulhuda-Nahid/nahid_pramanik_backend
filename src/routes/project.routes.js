const express = require("express");

const router = express.Router();

const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/verifyToken");
const parseFormData = require("../middlewares/parseFormData");
const validateProjectFiles = require("../middlewares/validateProjectFiles");
const validate = require("../middlewares/validate");

const {
  projectSchema,
  updateProjectSchema,
} = require("../validators/project.validator");

const {
  createProject,
  getAllProjects,
  getProjectBySlug,
  updateProjectById,
  deleteProjectById,
} = require("../controllers/project.controller");

router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  parseFormData,
  validateProjectFiles,
  validate(projectSchema),
  createProject
);

router.get("/", getAllProjects);

router.get("/:slug", getProjectBySlug);

router.patch(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  parseFormData,
  validate(updateProjectSchema),
  updateProjectById
);

router.delete("/:id", verifyToken, deleteProjectById);

module.exports = router;