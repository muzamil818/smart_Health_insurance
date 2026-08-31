require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@insurecare.local";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = process.env.ADMIN_NAME || "System Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin user already exists:", email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin user created:", email);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
