const Hospital = require("../models/Hospital");
const { createAuditLog } = require("../services/auditService");

const createHospital = async (req, res) => {
  try {
    const { name, registrationNumber, address, contact, isEligible } = req.body;

    if (!name || !registrationNumber || !address || !contact) {
      return res.status(400).json({
        message: "Name, registration number, address and contact are required",
      });
    }

    const hospital = await Hospital.create({
      name,
      registrationNumber,
      address,
      contact,
      isEligible: isEligible !== undefined ? isEligible : true,
    });

    await createAuditLog({
      userId: req.user._id,
      action: `Hospital created: ${hospital.name}`,
    });

    res.status(201).json({ message: "Hospital created successfully", hospital });
  } catch (error) {
    res.status(500).json({ message: "Failed to create hospital", error: error.message });
  }
};

const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hospitals", error: error.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json({ hospital });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hospital", error: error.message });
  }
};

const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const { name, registrationNumber, address, contact, isEligible } = req.body;

    if (name) hospital.name = name;
    if (registrationNumber) hospital.registrationNumber = registrationNumber;
    if (address) hospital.address = address;
    if (contact) hospital.contact = contact;
    if (isEligible !== undefined) hospital.isEligible = isEligible;

    await hospital.save();

    res.json({ message: "Hospital updated successfully", hospital });
  } catch (error) {
    res.status(500).json({ message: "Failed to update hospital", error: error.message });
  }
};

module.exports = {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
};
