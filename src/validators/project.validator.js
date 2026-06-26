const { z } = require("zod");

const projectSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    category: z.string().min(1, "Category is required"),
    shortDescription: z
      .string()
      .min(10, "Short description must be at least 10 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    liveUrl: z.string().url("Live URL is invalid"),
    githubUrl: z.string().url("Github URL is invalid"),
    duration: z.string(),
    role: z.string(),
    client: z.string(),
    status: z.enum(["Completed", "In Progress", "Maintenance"]),
    featured: z.boolean(),
    technologies: z.array(z.string()),
    features: z.array(z.string()),
  })
  .strict();

const updateProjectSchema = projectSchema.partial().strict();

module.exports = {
  projectSchema,
  updateProjectSchema,
};
