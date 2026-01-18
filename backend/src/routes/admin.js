import { Router } from "express";
import bcrypt from "bcryptjs";
import {
  getAdminByEmail,
  getAdmins,
  createAdmin,
  listInfrastructure,
  insertInfrastructure,
  getInfrastructureById,
  updateInfrastructure,
  deleteInfrastructure
} from "../db/index.js";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";
import {
  normalizeScope,
  validateInfrastructure,
  enforceAdminScope,
  addAdminFilters
} from "../utils/infra.js";

export function createAdminRouter({ db }) {
  const router = Router();

  router.post("/login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const admin = getAdminByEmail(db, email);
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    req.session.adminId = admin.id;
    return res.json({ id: admin.id, email: admin.email, role: admin.role, scope: admin.scope, department: admin.department });
  });

  router.post("/logout", requireAuth(db), (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  router.get("/me", requireAuth(db), (req, res) => {
    const { id, email, role, scope, department } = req.admin;
    res.json({ id, email, role, scope, department });
  });

  router.get("/infrastructure", requireAuth(db), (req, res) => {
    const filters = addAdminFilters(req.admin, {
      scope: normalizeScope(req.query.scope),
      category: req.query.category || null,
      department: req.query.department || null,
      status: req.query.status || null,
      bookable: req.query.bookable === undefined ? undefined : req.query.bookable === "true"
    });
    const data = listInfrastructure(db, filters);
    res.json({ data });
  });

  router.post("/infrastructure", requireAuth(db), (req, res) => {
    const payload = { ...req.body, scope: normalizeScope(req.body?.scope) };
    const validation = validateInfrastructure(payload);
    if (!validation.valid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    if (!enforceAdminScope(req.admin, payload)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const id = insertInfrastructure(db, payload);
    res.status(201).json({ id });
  });

  router.put("/infrastructure/:id", requireAuth(db), (req, res) => {
    const payload = { ...req.body, scope: normalizeScope(req.body?.scope) };
    const validation = validateInfrastructure(payload);
    if (!validation.valid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    const existing = getInfrastructureById(db, Number(req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }
    if (!enforceAdminScope(req.admin, existing) || !enforceAdminScope(req.admin, payload)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    updateInfrastructure(db, Number(req.params.id), payload);
    res.json({ ok: true });
  });

  router.delete("/infrastructure/:id", requireAuth(db), (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const existing = getInfrastructureById(db, id);
    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }
    if (!enforceAdminScope(req.admin, existing)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    deleteInfrastructure(db, id);
    res.json({ ok: true });
  });

  router.get("/admins", requireAuth(db), requireSuperAdmin, (req, res) => {
    res.json({ data: getAdmins(db) });
  });

  router.post("/admins", requireAuth(db), requireSuperAdmin, (req, res) => {
    const { email, password, role, scope, department } = req.body || {};
    if (!email || !password || !role || !scope) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const normalizedScope = normalizeScope(scope);
    if (!normalizedScope || !["GENERAL", "UG", "PG"].includes(normalizedScope)) {
      return res.status(400).json({ error: "Invalid scope" });
    }
    if (role === "general" && normalizedScope !== "GENERAL") {
      return res.status(400).json({ error: "General admin must use GENERAL scope" });
    }
    if (role === "dept") {
      if (!department || !(normalizedScope === "UG" || normalizedScope === "PG")) {
        return res.status(400).json({ error: "Department admin must use UG/PG with department" });
      }
    }
    const id = createAdmin(db, { email, password, role, scope: normalizedScope, department });
    res.status(201).json({ id });
  });

  return router;
}