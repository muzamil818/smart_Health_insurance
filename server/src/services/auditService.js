const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({ userId, action, claimId }) => {
  return AuditLog.create({
    userId: userId || null,
    action,
    claimId: claimId || null,
  });
};

module.exports = { createAuditLog };
