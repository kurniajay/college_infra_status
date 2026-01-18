import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "app.db");

function ensureDbDir(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function initDb() {
  const dbPath = process.env.DB_PATH || DEFAULT_DB_PATH;
  ensureDbDir(dbPath);
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      scope TEXT NOT NULL,
      department TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS infrastructure (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      scope TEXT NOT NULL,
      department TEXT,
      category TEXT,
      bookable INTEGER NOT NULL,
      status TEXT NOT NULL,
      used_by TEXT,
      from_time TEXT,
      to_time TEXT,
      open_time TEXT,
      close_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      department_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      has_ug INTEGER NOT NULL,
      has_pg INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pg_specializations (
      pg_id TEXT PRIMARY KEY,
      department_id TEXT NOT NULL,
      program_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clubs (
      club_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      associated_department TEXT,
      base_room TEXT,
      uses_shared_infra INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_infra_scope ON infrastructure(scope);
    CREATE INDEX IF NOT EXISTS idx_infra_department ON infrastructure(department);
    CREATE INDEX IF NOT EXISTS idx_infra_category ON infrastructure(category);
  `);

  const columns = db.prepare("PRAGMA table_info(infrastructure)").all();
  const hasTypeColumn = columns.some((col) => col.name === "type");
  if (!hasTypeColumn) {
    db.exec("ALTER TABLE infrastructure ADD COLUMN type TEXT");
  }

  return db;
}