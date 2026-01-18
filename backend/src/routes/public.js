import { Router } from "express";
import { listInfrastructure } from "../db/index.js";
import { normalizeScope } from "../utils/infra.js";

export function createPublicRouter({ db }) {
  const router = Router();

  router.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  router.get("/infrastructure", (req, res) => {
    const filters = {
      scope: normalizeScope(req.query.scope),
      category: req.query.category || null,
      department: req.query.department || null,
      status: req.query.status || null,
      bookable: req.query.bookable === undefined ? undefined : req.query.bookable === "true"
    };
    const data = listInfrastructure(db, filters);
    res.json({ data });
  });

  return router;
}