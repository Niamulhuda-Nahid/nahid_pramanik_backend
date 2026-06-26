const express = require("express");

const {
  createProject,
  getAllProjects,
  getProjectBySlug,
  updateProjectById,
  deleteProjectById,
} = require("../controllers/project.controller");
const validate = require("../middlewares/validate");
const {
  projectSchema,
  updateProjectSchema,
} = require("../validators/project.validator");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/", verifyToken, validate(projectSchema), createProject);
router.get("/", getAllProjects);
router.get("/:slug", getProjectBySlug);
router.patch("/:id", verifyToken, validate(updateProjectSchema), updateProjectById);
router.delete("/:id", verifyToken, deleteProjectById);

module.exports = router;
