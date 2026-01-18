import bcrypt from "bcryptjs";

export function getAdminByEmail(db, email) {
  return db.prepare("SELECT * FROM admins WHERE email = @email").get({ email });
}

export function getAdminById(db, id) {
  return db.prepare("SELECT * FROM admins WHERE id = @id").get({ id });
}

export function getAdmins(db) {
  return db.prepare("SELECT id, email, role, scope, department, created_at FROM admins ORDER BY id ASC").all();
}

export function createAdmin(db, admin) {
  const passwordHash = bcrypt.hashSync(admin.password, 10);
  const createdAt = new Date().toISOString();
  const result = db.prepare(
    "INSERT INTO admins (email, password_hash, role, scope, department, created_at) VALUES (@email, @password_hash, @role, @scope, @department, @created_at)"
  ).run({
    email: admin.email,
    password_hash: passwordHash,
    role: admin.role,
    scope: admin.scope,
    department: admin.department || null,
    created_at: createdAt
  });
  return result.lastInsertRowid;
}