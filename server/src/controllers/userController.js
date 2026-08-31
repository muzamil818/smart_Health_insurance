const bcrypt = require("bcryptjs");
const User = require("../models/User");

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  hospitalId: user.hospitalId || null,
  createdAt: user.createdAt,
});

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users: users.map(sanitize) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: sanitize(user) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const allowedRoles = ["admin", "hospital", "policyholder", "officer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "hospital" && !hospitalId) {
      return res.status(400).json({
        message: "hospitalId is required for hospital users",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      hospitalId: role === "hospital" ? hospitalId : null,
    });

    res.status(201).json({
      message: "User created successfully",
      user: sanitize(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, role, hospitalId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (role === "hospital" || hospitalId) {
      user.hospitalId = hospitalId || user.hospitalId;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: sanitize(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
