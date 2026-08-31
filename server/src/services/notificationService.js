const Notification = require("../models/Notification");

const notifyUser = async ({ userId, claimId, message }) => {
  return Notification.create({
    userId,
    claimId,
    message,
    isRead: false,
  });
};

module.exports = { notifyUser };
