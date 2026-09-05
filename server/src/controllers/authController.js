const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const Hospital = require("../models/Hospital");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const validRoles = ["policyholder", "hospital", "officer", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "policyholder";

    const hashedPassword = await bcrypt.hash(password, 10);

    let hospitalId = null;

    if (userRole === "hospital") {
      const regNumber = "HOSP-" + Math.floor(100000 + Math.random() * 900000);
      const hospital = await Hospital.create({
        name: name || "Care Hospital Facility",
        registrationNumber: regNumber,
        address: "100 Healthcare Boulevard, Suite 400",
        contact: email,
        isEligible: true,
      });
      hospitalId = hospital._id;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      hospitalId,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      hospitalId: req.user.hospitalId || null,
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
};