import { getAdminById } from "../db/index.js";

export function requireAuth(db) {
  return (req, res, next) => {
    if (!req.session.adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const admin = getAdminById(db, req.session.adminId);
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.admin = admin;
    return next();
  };
}

export function requireSuperAdmin(req, res, next) {
  if (req.admin.role !== "super") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
}