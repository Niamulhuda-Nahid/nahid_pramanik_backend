const { getProjectsCollection } = require("../config/db");
const { ObjectId } = require("mongodb");
const generateSlug = require("../utils/generateSlug");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// Post API to add a new project
const createProject = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();

    const thumbnailFile = req.files?.thumbnail?.[0];
    const bannerFile = req.files?.banner?.[0];
    const galleryFiles = req.files?.gallery || [];

    const thumbnail = await uploadToCloudinary(
      thumbnailFile.buffer,
      "portfolio/projects",
    );
    const banner = await uploadToCloudinary(
      bannerFile.buffer,
      "portfolio/projects",
    );
    const gallery = await Promise.all(
      galleryFiles.map((file) =>
        uploadToCloudinary(file.buffer, "portfolio/projects"),
      ),
    );

    const slug = await generateSlug(
      projectsCollection,
      req.validatedBody.title,
    );

    const project = {
      ...req.validatedBody,
      slug,
      thumbnail,
      banner,
      gallery,
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

// Get API to retrive only featured projects
const getFeaturedProjects = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();

    const result = await projectsCollection
      .find({ featured: true })
      .sort({ createdAt: -1 })
      .toArray();
    console.log(result);

    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    res.send({
      success: true,
      message: "Featured projects retrieved successfully",
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message:
        error.message ||
        "An error occurred while retrieving the featured projects",
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

    // -----------------------------
    // Thumbnail Replace
    //  -----------------------------
    if (req.files?.thumbnail?.length) {
      if (existingProject.thumbnail?.public_id) {
        await deleteFromCloudinary(existingProject.thumbnail?.public_id);
      }
      const thumbnail = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        "portfolio/projects",
      );
      updatedProject.thumbnail = thumbnail;
    }
    // -----------------------------
    // Banner Replace
    //  -----------------------------
    if (req.files?.banner?.length) {
      if (existingProject.banner?.public_id) {
        await deleteFromCloudinary(existingProject.banner?.public_id);
      }
      const banner = await uploadToCloudinary(
        req.files.banner[0].buffer,
        "portfolio/projects",
      );
      updatedProject.banner = banner;
    }

    // -----------------------------
    // Gallery replace
    //  -----------------------------
    if (req.files?.gallery?.length) {
      if (existingProject.gallery?.length) {
        await Promise.all(
          existingProject.gallery.map((image) =>
            deleteFromCloudinary(image.public_id),
          ),
        );
      }

      const gallery = await Promise.all(
        req.files.gallery.map((file) =>
          uploadToCloudinary(file.buffer, "portfolio/projects"),
        ),
      );
      updatedProject.gallery = gallery;
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

// ------------------------------------------
// DELETE API to delete a project by id
// ------------------------------------------
const deleteProjectById = async (req, res) => {
  try {
    const projectsCollection = getProjectsCollection();
    const id = req.params.id;

    // find the project first
    const existingProject = await projectsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingProject) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    // Delete thumbnail
    if (existingProject.thumbnail?.public_id) {
      await deleteFromCloudinary(existingProject.thumbnail.public_id);
    }

    // Delete banner
    if (existingProject.banner?.public_id) {
      await deleteFromCloudinary(existingProject.banner.public_id);
    }

    // Delete gallery images
    if (existingProject.gallery?.length > 0) {
      await Promise.all(
        existingProject.gallery.map((image) =>
          deleteFromCloudinary(image.public_id),
        ),
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
  getFeaturedProjects,
};
