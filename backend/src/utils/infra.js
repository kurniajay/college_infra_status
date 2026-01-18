const BOOKABLE_STATUSES = ["AVAILABLE", "RESERVED", "IN_USE", "CLOSED"];
const NON_BOOKABLE_STATUSES = ["OPEN", "CLOSED"];

export function normalizeScope(scope) {
  if (!scope) return null;
  return scope.toUpperCase();
}

export function validateInfrastructure(payload) {
  const errors = [];
  const scope = normalizeScope(payload.scope);
  const bookable = Boolean(payload.bookable);

  if (!payload.name || payload.name.trim().length < 2) {
    errors.push("Name is required");
  }
  if (!scope || !["GENERAL", "UG", "PG"].includes(scope)) {
    errors.push("Scope must be GENERAL, UG, or PG");
  }
  if (scope === "GENERAL" && !payload.category) {
    errors.push("Category is required for GENERAL scope");
  }
  if ((scope === "UG" || scope === "PG") && !payload.department) {
    errors.push("Department is required for UG/PG scope");
  }

  if (bookable) {
    if (!BOOKABLE_STATUSES.includes(payload.status)) {
      errors.push("Invalid status for bookable infrastructure");
    }
    if (["RESERVED", "IN_USE"].includes(payload.status)) {
      if (!payload.used_by) {
        errors.push("Used by is required when RESERVED or IN_USE");
      }
      if (!payload.from_time || !payload.to_time) {
        errors.push("From/To time required when RESERVED or IN_USE");
      }
    }
  } else {
    if (!NON_BOOKABLE_STATUSES.includes(payload.status)) {
      errors.push("Invalid status for non-bookable infrastructure");
    }
    if (!payload.open_time || !payload.close_time) {
      errors.push("Open/Close time required for non-bookable infrastructure");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function enforceAdminScope(admin, infra) {
  if (admin.role === "super") return true;
  if (admin.role === "general") {
    return infra.scope === "GENERAL";
  }
  if (admin.role === "dept") {
    return infra.scope === admin.scope && infra.department === admin.department;
  }
  return false;
}

export function addAdminFilters(admin, filters) {
  if (admin.role === "super") return filters;
  if (admin.role === "general") {
    return { ...filters, scope: "GENERAL" };
  }
  if (admin.role === "dept") {
    return { ...filters, scope: admin.scope, department: admin.department };
  }
  return filters;
}