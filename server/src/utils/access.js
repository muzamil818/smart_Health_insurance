/**
 * Shared ownership checks for claims.
 *
 * These have to cope with refs that may or may not be populated: `getClaimById`
 * populates policyholderId/hospitalId into full documents, while other handlers
 * load the raw claim. Comparing a populated document with String() yields the
 * document's string form rather than its id, so every comparison silently
 * failed and legitimate owners were rejected with 403.
 */

/** Normalises an ObjectId, an id string, or a populated document to an id string. */
const idOf = (ref) => {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  if (ref._id) return String(ref._id);
  return String(ref);
};

/**
 * Who may read a given claim:
 *  - admins and officers: any claim
 *  - policyholders: only claims filed against their own account
 *  - hospital staff: only claims filed by their own facility
 */
const canAccessClaim = (user, claim) => {
  if (!user || !claim) return false;
  if (user.role === "admin" || user.role === "officer") return true;
  if (user.role === "policyholder") {
    return idOf(claim.policyholderId) === idOf(user._id);
  }
  if (user.role === "hospital") {
    return Boolean(user.hospitalId) && idOf(claim.hospitalId) === idOf(user.hospitalId);
  }
  return false;
};

module.exports = { idOf, canAccessClaim };
