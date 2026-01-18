export function listInfrastructure(db, filters) {
  const where = [];
  const params = {};
  if (filters.scope) {
    where.push("scope = @scope");
    params.scope = filters.scope;
  }
  if (filters.category) {
    where.push("category = @category");
    params.category = filters.category;
  }
  if (filters.department) {
    where.push("department = @department");
    params.department = filters.department;
  }
  if (filters.bookable !== undefined) {
    where.push("bookable = @bookable");
    params.bookable = filters.bookable ? 1 : 0;
  }
  if (filters.status) {
    where.push("status = @status");
    params.status = filters.status;
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return db.prepare(`SELECT * FROM infrastructure ${clause} ORDER BY id DESC`).all(params);
}

export function getInfrastructureById(db, id) {
  return db.prepare("SELECT * FROM infrastructure WHERE id = @id").get({ id });
}

export function insertInfrastructure(db, infra) {
  const timestamp = new Date().toISOString();
  const result = db.prepare(
    `INSERT INTO infrastructure (
      name, type, scope, department, category, bookable, status,
      used_by, from_time, to_time, open_time, close_time,
      created_at, updated_at
    ) VALUES (
      @name, @type, @scope, @department, @category, @bookable, @status,
      @used_by, @from_time, @to_time, @open_time, @close_time,
      @created_at, @updated_at
    )`
  ).run({
    name: infra.name,
    type: infra.type || null,
    scope: infra.scope,
    department: infra.department || null,
    category: infra.category || null,
    bookable: infra.bookable ? 1 : 0,
    status: infra.status,
    used_by: infra.used_by || null,
    from_time: infra.from_time || null,
    to_time: infra.to_time || null,
    open_time: infra.open_time || null,
    close_time: infra.close_time || null,
    created_at: timestamp,
    updated_at: timestamp
  });
  return result.lastInsertRowid;
}

export function updateInfrastructure(db, id, infra) {
  const timestamp = new Date().toISOString();
  db.prepare(
    `UPDATE infrastructure SET
      name = @name,
      type = @type,
      scope = @scope,
      department = @department,
      category = @category,
      bookable = @bookable,
      status = @status,
      used_by = @used_by,
      from_time = @from_time,
      to_time = @to_time,
      open_time = @open_time,
      close_time = @close_time,
      updated_at = @updated_at
    WHERE id = @id`
  ).run({
    id,
    name: infra.name,
    type: infra.type || null,
    scope: infra.scope,
    department: infra.department || null,
    category: infra.category || null,
    bookable: infra.bookable ? 1 : 0,
    status: infra.status,
    used_by: infra.used_by || null,
    from_time: infra.from_time || null,
    to_time: infra.to_time || null,
    open_time: infra.open_time || null,
    close_time: infra.close_time || null,
    updated_at: timestamp
  });
}

export function deleteInfrastructure(db, id) {
  db.prepare("DELETE FROM infrastructure WHERE id = @id").run({ id });
}