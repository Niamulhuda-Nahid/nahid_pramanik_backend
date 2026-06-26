const { getProjectsCollection } = require("../config/db");
const { ObjectId } = require("mongodb");
const generateSlug = require("../utils/generateSlug");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

// Post API to add a new project
const createProject = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();

    const slug = await generateSlug(
      projectsCollection,
      req.validatedBody.title,
    );

    const project = {
      ...req.validatedBody,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await projectsCollection.insertOne(project);

    res.status(201).send({
      success: true,
      message: "Project added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "An error occurred while adding the project",
    });
  }
};

// Get API to retrieve all projects
const getAllProjects = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();

    const result = await projectsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.send({
      success: true,
      message: "Projects retrieved successfully",
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message:
        error.message || "An error occurred while retrieving the projects",
    });
  }
};

// GET API to retrieve a single project by slug
const getProjectBySlug = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();
    const slug = req.params.slug;

    const result = await projectsCollection.findOne({ slug });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    res.send({
      success: true,
      message: "Project retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE API to update a project by id
const updateProjectById = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();
    const id = req.params.id;

    // find existing project first
    const existingProject = await projectsCollection.findOne({
      _id: new ObjectId(id),
    });

    // if the project doesn't exist, return 404
    if (!existingProject) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    const updatedProject = {
      ...req.validatedBody,
      updatedAt: new Date(),
    };

    // if the title is being updated, generate a new slug
    if (req.validatedBody.title) {
      updatedProject.slug = await generateSlug(
        projectsCollection,
        req.validatedBody.title,
      );
    }

    // Thumbnail Replace
    if (
      req.validatedBody.thumbnail &&
      existingProject.thumbnail?.public_id !==
        req.validatedBody.thumbnail.public_id
    ) {
      await deleteFromCloudinary(existingProject.thumbnail?.public_id);
    }

    // Banner Replace
    if (
      req.validatedBody.banner &&
      existingProject.banner?.public_id !== req.validatedBody.banner.public_id
    ) {
      await deleteFromCloudinary(existingProject.banner?.public_id);
    }

    // Gallery replace
    if (req.validatedBody.gallery) {
      const oldGallery = existingProject?.gallery || [];
      const newGallery = req.validatedBody.gallery || [];

      const oldIds = oldGallery.map((img) => img.public_id);
      const newIds = newGallery.map((img) => img.public_id);

      // find remove images
      const removedImages = oldGallery.filter(
        (img) => !newIds.includes(img.public_id),
      );

      await Promise.all(
        removedImages.map((img) => deleteFromCloudinary(img.public_id)),
      );
    }

    // MongoDB Update
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProject },
    );

    res.send({
      success: true,
      message: "Project updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "An error occurred while updating the project",
    });
  }
};

// DELETE API to delete a project by id
const deleteProjectById = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();
    const id = req.params.id;

    // find the project first
    const project = await projectsCollection.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    // Delete thumbnail
    if (project.thumbnail?.public_id) {
      await deleteFromCloudinary(project.thumbnail.public_id);
    }

    // Delete banner
    if (project.banner?.public_id) {
      await deleteFromCloudinary(project.banner.public_id);
    }

    // Delete gallery images
    if (project.gallery && project.gallery.length > 0) {
      await Promise.all(
        project.gallery.map((image) => deleteFromCloudinary(image.public_id)),
      );
    }

    // Delete the project from MongoDB
    const result = await projectsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send({
      success: true,
      message: "Project deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "An error occurred while deleting the project",
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectBySlug,
  updateProjectById,
  deleteProjectById,
};
