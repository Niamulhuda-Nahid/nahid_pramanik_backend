require("dotenv").config();

const { connectDB, getAdminsCollection } = require("../config/db");
const bcrypt = require("bcrypt");

async function seedAdmin() {
  await connectDB();

  const admins = getAdminsCollection();

  const existingAdmin = await admins.findOne({
    email: "admin@admin.com",
  });

  if (existingAdmin) {
    console.log("Admin already exists");

    process.exit();
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  await admins.insertOne({
    name: "Admin",
    email: "admin@admin.com",
    password: hashedPassword,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin seeded successfully");
  process.exit();
}

seedAdmin();
