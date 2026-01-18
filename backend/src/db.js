import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import express from "express";
import session from "express-session";
import cors from "cors";
import { createPublicRouter } from "./routes/public.js";
import { createAdminRouter } from "./routes/admin.js";

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

export function seedAdmin(db) {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM admins").get();
  if (countRow.count > 0) {
    return null;
  }

  const email = process.env.ADMIN_SEED_EMAIL || "admin@college.local";
  const password = process.env.ADMIN_SEED_PASSWORD || "admin123";
  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO admins (email, password_hash, role, scope, department, created_at) VALUES (@email, @password_hash, @role, @scope, @department, @created_at)"
  ).run({
    email,
    password_hash: passwordHash,
    role: "super",
    scope: "GENERAL",
    department: null,
    created_at: createdAt
  });

  return { email, password };
}

export function seedInfrastructure(db) {
  const seedVersion = "csv_v2";
  const meta = db.prepare("SELECT value FROM meta WHERE key = 'seed_version'").get();
  if (meta?.value === seedVersion) {
    return 0;
  }

  db.prepare("DELETE FROM infrastructure").run();
  db.prepare("DELETE FROM departments").run();
  db.prepare("DELETE FROM pg_specializations").run();
  db.prepare("DELETE FROM clubs").run();

  const now = new Date().toISOString();

  const departments = [
    { department_id: "D01", name: "Computer Science & Engineering", has_ug: 1, has_pg: 1 },
    { department_id: "D02", name: "Information Science & Engineering", has_ug: 1, has_pg: 1 },
    { department_id: "D03", name: "Electronics & Communication Engineering", has_ug: 1, has_pg: 1 },
    { department_id: "D04", name: "Electrical & Electronics Engineering", has_ug: 1, has_pg: 1 },
    { department_id: "D05", name: "Mechanical Engineering", has_ug: 1, has_pg: 1 },
    { department_id: "D06", name: "Civil Engineering", has_ug: 1, has_pg: 1 },
    { department_id: "D07", name: "Chemical Engineering", has_ug: 1, has_pg: 1 },
    { department_id: "D08", name: "Biotechnology", has_ug: 1, has_pg: 1 },
    { department_id: "D09", name: "Aerospace Engineering", has_ug: 1, has_pg: 0 },
    { department_id: "D10", name: "Industrial Engineering & Management", has_ug: 1, has_pg: 0 },
    { department_id: "D11", name: "MCA Department", has_ug: 0, has_pg: 1 }
  ];

  const pgSpecializations = [
    { pg_id: "PG01", department_id: "D01", program_name: "M.Tech Computer Science & Engineering" },
    { pg_id: "PG02", department_id: "D01", program_name: "M.Tech Software Engineering" },
    { pg_id: "PG03", department_id: "D01", program_name: "M.Tech Data Science" },
    { pg_id: "PG04", department_id: "D01", program_name: "M.Tech Computer Network Engineering" },
    { pg_id: "PG05", department_id: "D02", program_name: "M.Tech Information Technology" },
    { pg_id: "PG06", department_id: "D03", program_name: "M.Tech VLSI Design & Embedded Systems" },
    { pg_id: "PG07", department_id: "D03", program_name: "M.Tech Digital Communication" },
    { pg_id: "PG08", department_id: "D03", program_name: "M.Tech Communication Systems" },
    { pg_id: "PG09", department_id: "D04", program_name: "M.Tech Power Electronics & Drives" },
    { pg_id: "PG10", department_id: "D05", program_name: "M.Tech Machine Design" },
    { pg_id: "PG11", department_id: "D05", program_name: "M.Tech Product Design & Manufacturing" },
    { pg_id: "PG12", department_id: "D06", program_name: "M.Tech Structural Engineering" },
    { pg_id: "PG13", department_id: "D07", program_name: "M.Tech Chemical Engineering" },
    { pg_id: "PG14", department_id: "D08", program_name: "M.Tech Biotechnology" },
    { pg_id: "PG15", department_id: "D11", program_name: "MCA" }
  ];

  const clubs = [
    { club_id: "C01", name: "Antariksh Space Technology Team", category: "Technical", associated_department: "Mechanical / Aerospace", base_room: "Mechanical Workshop", uses_shared_infra: 1 },
    { club_id: "C02", name: "StudSat Satellite Team", category: "Technical", associated_department: "ECE / EEE / CSE", base_room: "Satellite RnD Lab", uses_shared_infra: 1 },
    { club_id: "C03", name: "Ashwa Racing", category: "Technical", associated_department: "Mechanical", base_room: "Mechanical Workshop", uses_shared_infra: 1 },
    { club_id: "C04", name: "Solar Car Team", category: "Technical", associated_department: "Mechanical / EEE", base_room: "Automobile Workshop", uses_shared_infra: 1 },
    { club_id: "C05", name: "Vyoma UAV Team", category: "Technical", associated_department: "ECE / Aerospace", base_room: "UAV Lab", uses_shared_infra: 1 },
    { club_id: "C06", name: "Astra Robotics Club", category: "Technical", associated_department: "CSE / ECE", base_room: "Robotics Lab", uses_shared_infra: 1 },
    { club_id: "C07", name: "Garuda Super Mileage Team", category: "Technical", associated_department: "Mechanical", base_room: "Mechanical Workshop", uses_shared_infra: 1 },
    { club_id: "C08", name: "IEEE Student Chapter", category: "Technical", associated_department: "EEE / ECE", base_room: "EEE Seminar Room", uses_shared_infra: 1 },
    { club_id: "C09", name: "ACM Student Chapter", category: "Technical", associated_department: "CSE", base_room: "CS Seminar Hall", uses_shared_infra: 1 },
    { club_id: "C10", name: "Coding Club", category: "Technical", associated_department: "CSE / ISE", base_room: "CS Project Lab", uses_shared_infra: 1 },

    { club_id: "C20", name: "Dance Club", category: "Cultural", associated_department: null, base_room: "Student Activity Center", uses_shared_infra: 1 },
    { club_id: "C21", name: "Music Club", category: "Cultural", associated_department: null, base_room: "Music Practice Room", uses_shared_infra: 1 },
    { club_id: "C22", name: "Drama Club English", category: "Cultural", associated_department: null, base_room: "Auditorium Backstage", uses_shared_infra: 1 },
    { club_id: "C23", name: "Drama Club Kannada", category: "Cultural", associated_department: null, base_room: "Auditorium Backstage", uses_shared_infra: 1 },
    { club_id: "C24", name: "Photography Club", category: "Cultural", associated_department: null, base_room: "Media Room", uses_shared_infra: 1 },
    { club_id: "C25", name: "Film Making Club", category: "Cultural", associated_department: null, base_room: "Media Editing Lab", uses_shared_infra: 1 },
    { club_id: "C26", name: "Art and Sketching Club", category: "Cultural", associated_department: null, base_room: "Art Room", uses_shared_infra: 1 },
    { club_id: "C27", name: "TEDx College Team", category: "Cultural", associated_department: null, base_room: "Placement Conference Hall", uses_shared_infra: 1 },

    { club_id: "C40", name: "Cricket Team", category: "Sports", associated_department: null, base_room: "Sports Office", uses_shared_infra: 1 },
    { club_id: "C41", name: "Football Team", category: "Sports", associated_department: null, base_room: "Sports Office", uses_shared_infra: 1 },
    { club_id: "C42", name: "Basketball Team", category: "Sports", associated_department: null, base_room: "Indoor Stadium", uses_shared_infra: 1 },
    { club_id: "C43", name: "Volleyball Team", category: "Sports", associated_department: null, base_room: "Indoor Stadium", uses_shared_infra: 1 },
    { club_id: "C44", name: "Athletics Team", category: "Sports", associated_department: null, base_room: "Athletics Office", uses_shared_infra: 1 },
    { club_id: "C45", name: "Badminton Team", category: "Sports", associated_department: null, base_room: "Indoor Stadium", uses_shared_infra: 1 },

    { club_id: "C60", name: "NSS Unit", category: "Social Service", associated_department: null, base_room: "NSS Office", uses_shared_infra: 1 },
    { club_id: "C61", name: "NCC Unit", category: "Social Service", associated_department: null, base_room: "NCC Office", uses_shared_infra: 1 },
    { club_id: "C62", name: "Rotaract Club", category: "Social Service", associated_department: null, base_room: "Student Activity Center", uses_shared_infra: 1 },
    { club_id: "C63", name: "Entrepreneurship Development Cell", category: "Professional", associated_department: "IEM / MBA", base_room: "IEM Seminar Hall", uses_shared_infra: 1 },
    { club_id: "C64", name: "Placement Student Committee", category: "Professional", associated_department: null, base_room: "Placement Office", uses_shared_infra: 0 }
  ];

  const sharedCategoryMap = (type) => {
    const value = type.toLowerCase();
    if (value.includes("library") || value.includes("hostel") || value.includes("canteen") || value.includes("food") || value.includes("medical") || value.includes("student activity") || value.includes("counseling")) {
      return "Student Facilities";
    }
    if (value.includes("ground") || value.includes("sports") || value.includes("court") || value.includes("gym") || value.includes("stadium") || value.includes("track")) {
      return "Sports & Fitness";
    }
    if (value.includes("office") || value.includes("meeting") || value.includes("board")) {
      return "Administrative";
    }
    if (value.includes("power") || value.includes("transport") || value.includes("security") || value.includes("stores") || value.includes("maintenance")) {
      return "Campus Services";
    }
    return "Academic";
  };

  const defaultUsage = (status) => {
    if (status === "IN_USE") {
      return { used_by: "Scheduled Use", from_time: "10:00", to_time: "12:00" };
    }
    if (status === "RESERVED") {
      return { used_by: "Reserved", from_time: "14:00", to_time: "16:00" };
    }
    return {};
  };

  const deptCodeMap = {
    D01: "CS",
    D02: "IS",
    D03: "EC",
    D04: "EE",
    D05: "ME",
    D06: "CE",
    D07: "CH",
    D08: "BT",
    D09: "AE",
    D10: "IEM",
    D11: "MCA"
  };

  const seedItems = [];
  const addItem = (item) => seedItems.push(item);

  // CSV-based department infrastructure
  const departmentInfraCsv = [
    { name: "CS-CR-101", type: "Classroom", department: "D01", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" },
    { name: "CS-CR-102", type: "Classroom", department: "D01", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" },
    { name: "CS-LAB-01 Programming Lab", type: "Lab", department: "D01", bookable: 1, status: "IN_USE", ...defaultUsage("IN_USE") },
    { name: "CS-LAB-02 Data Structures Lab", type: "Lab", department: "D01", bookable: 1, status: "AVAILABLE" },
    { name: "CS-LAB-03 DB & Web Lab", type: "Lab", department: "D01", bookable: 1, status: "RESERVED", ...defaultUsage("RESERVED") },
    { name: "CS-LAB-04 AI ML Lab", type: "Lab", department: "D01", bookable: 1, status: "AVAILABLE" },
    { name: "CS-LAB-05 Project Lab", type: "Lab", department: "D01", bookable: 1, status: "AVAILABLE" },
    { name: "CS-SH-01 Seminar Hall", type: "Seminar Hall", department: "D01", bookable: 1, status: "AVAILABLE" },
    { name: "CS-FACULTY-ROOM", type: "Faculty Room", department: "D01", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "18:00" },
    { name: "CS-HOD", type: "HOD Cabin", department: "D01", bookable: 0, status: "OPEN", open_time: "10:00", close_time: "17:00" },

    { name: "EC-LAB-01 Basic Electronics Lab", type: "Lab", department: "D03", bookable: 1, status: "IN_USE", ...defaultUsage("IN_USE") },
    { name: "EC-LAB-02 Analog Digital Lab", type: "Lab", department: "D03", bookable: 1, status: "AVAILABLE" },
    { name: "EC-LAB-03 Microprocessor Lab", type: "Lab", department: "D03", bookable: 1, status: "RESERVED", ...defaultUsage("RESERVED") },
    { name: "EC-LAB-04 Communication Lab", type: "Lab", department: "D03", bookable: 1, status: "AVAILABLE" },
    { name: "EC-LAB-05 VLSI Lab", type: "Lab", department: "D03", bookable: 1, status: "AVAILABLE" },
    { name: "EC-SH-01 Seminar Hall", type: "Seminar Hall", department: "D03", bookable: 1, status: "AVAILABLE" },
    { name: "EC-FACULTY-ROOM", type: "Faculty Room", department: "D03", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "18:00" }
  ];

  for (const item of departmentInfraCsv) {
    addItem({ ...item, scope: "UG" });
  }

  // Generated UG infrastructure for all departments
  for (const dept of departments) {
    if (!dept.has_ug) continue;
    const code = deptCodeMap[dept.department_id] || dept.department_id;
    if (dept.department_id !== "D01" && dept.department_id !== "D03") {
      addItem({ name: `${code}-UG-CR-101`, type: "Classroom", scope: "UG", department: dept.department_id, bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" });
      addItem({ name: `${code}-UG-LAB-01`, type: "Lab", scope: "UG", department: dept.department_id, bookable: 1, status: "AVAILABLE" });
      addItem({ name: `${code}-UG-LAB-02`, type: "Lab", scope: "UG", department: dept.department_id, bookable: 1, status: "IN_USE", ...defaultUsage("IN_USE") });
      addItem({ name: `${code}-UG-SEMINAR-HALL`, type: "Seminar Hall", scope: "UG", department: dept.department_id, bookable: 1, status: "AVAILABLE" });
      addItem({ name: `${code}-UG-FACULTY-ROOM`, type: "Faculty Room", scope: "UG", department: dept.department_id, bookable: 0, status: "OPEN", open_time: "09:00", close_time: "18:00" });
    }
  }

  // Generated PG infrastructure for all PG departments
  for (const dept of departments) {
    if (!dept.has_pg) continue;
    const code = deptCodeMap[dept.department_id] || dept.department_id;
    addItem({ name: `${code}-PG-CR-501`, type: "Classroom", scope: "PG", department: dept.department_id, bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" });
    addItem({ name: `${code}-PG-LAB-01`, type: "Lab", scope: "PG", department: dept.department_id, bookable: 1, status: "AVAILABLE" });
    addItem({ name: `${code}-PG-RES-LAB`, type: "Research Lab", scope: "PG", department: dept.department_id, bookable: 1, status: "RESERVED", ...defaultUsage("RESERVED") });
    addItem({ name: `${code}-PG-SEMINAR-HALL`, type: "Seminar Hall", scope: "PG", department: dept.department_id, bookable: 1, status: "AVAILABLE" });
  }

  // Shared infrastructure (GENERAL)
  const sharedInfraCsv = [
    { name: "Main Auditorium", type: "Auditorium", bookable: 1, status: "RESERVED", ...defaultUsage("RESERVED") },
    { name: "Mini Auditorium", type: "Auditorium", bookable: 1, status: "AVAILABLE" },
    { name: "Central Seminar Hall 1", type: "Seminar Hall", bookable: 1, status: "IN_USE", ...defaultUsage("IN_USE") },
    { name: "Central Seminar Hall 2", type: "Seminar Hall", bookable: 1, status: "AVAILABLE" },
    { name: "Examination Hall", type: "Exam Hall", bookable: 1, status: "CLOSED" },
    { name: "Placement Conference Hall", type: "Conference Hall", bookable: 1, status: "RESERVED", ...defaultUsage("RESERVED") },
    { name: "Central Library", type: "Library", bookable: 0, status: "OPEN", open_time: "08:00", close_time: "22:00" },
    { name: "Digital Library", type: "Library", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "20:00" },

    { name: "Cricket Ground", type: "Ground", bookable: 1, status: "IN_USE", ...defaultUsage("IN_USE") },
    { name: "Football Ground", type: "Ground", bookable: 1, status: "AVAILABLE" },
    { name: "Athletics Track", type: "Track", bookable: 1, status: "AVAILABLE" },
    { name: "Indoor Stadium", type: "Sports Hall", bookable: 1, status: "RESERVED", ...defaultUsage("RESERVED") },
    { name: "Basketball Court", type: "Court", bookable: 1, status: "AVAILABLE" },
    { name: "Volleyball Court", type: "Court", bookable: 1, status: "IN_USE", ...defaultUsage("IN_USE") },
    { name: "Gym", type: "Gym", bookable: 0, status: "OPEN", open_time: "06:00", close_time: "21:00" },

    { name: "Boys Hostel", type: "Hostel", bookable: 0, status: "OPEN", open_time: "00:00", close_time: "23:59" },
    { name: "Girls Hostel", type: "Hostel", bookable: 0, status: "OPEN", open_time: "00:00", close_time: "23:59" },
    { name: "Food Court", type: "Food Court", bookable: 0, status: "OPEN", open_time: "08:00", close_time: "21:00" },
    { name: "Canteen", type: "Canteen", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "18:00" },
    { name: "Medical Room", type: "Medical", bookable: 0, status: "OPEN", open_time: "10:00", close_time: "17:00" },
    { name: "Counseling Room", type: "Counseling", bookable: 0, status: "OPEN", open_time: "10:00", close_time: "16:00" },
    { name: "Student Activity Center", type: "Student Activity Center", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "20:00" },

    { name: "Admin Block", type: "Office", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" },
    { name: "Principal Office", type: "Office", bookable: 0, status: "OPEN", open_time: "10:00", close_time: "16:00" },
    { name: "Accounts Office", type: "Office", bookable: 0, status: "OPEN", open_time: "10:00", close_time: "16:00" },
    { name: "Admission Office", type: "Office", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" },
    { name: "Registrar Office", type: "Office", bookable: 0, status: "OPEN", open_time: "10:00", close_time: "16:00" },
    { name: "Board Room", type: "Meeting Room", bookable: 1, status: "CLOSED" },

    { name: "Power House", type: "Utility", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "18:00" },
    { name: "Transport Office", type: "Transport", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" },
    { name: "Security Control Room", type: "Security", bookable: 0, status: "OPEN", open_time: "00:00", close_time: "23:59" },
    { name: "Central Stores", type: "Stores", bookable: 0, status: "OPEN", open_time: "09:00", close_time: "17:00" }
  ];

  for (const item of sharedInfraCsv) {
    addItem({
      ...item,
      scope: "GENERAL",
      category: sharedCategoryMap(item.type)
    });
  }

  const deptStmt = db.prepare("INSERT INTO departments (department_id, name, has_ug, has_pg) VALUES (@department_id, @name, @has_ug, @has_pg)");
  const pgStmt = db.prepare("INSERT INTO pg_specializations (pg_id, department_id, program_name) VALUES (@pg_id, @department_id, @program_name)");
  const clubStmt = db.prepare("INSERT INTO clubs (club_id, name, category, associated_department, base_room, uses_shared_infra) VALUES (@club_id, @name, @category, @associated_department, @base_room, @uses_shared_infra)");

  const stmt = db.prepare(
    `INSERT INTO infrastructure (
      name, type, scope, department, category, bookable, status,
      used_by, from_time, to_time, open_time, close_time,
      created_at, updated_at
    ) VALUES (
      @name, @type, @scope, @department, @category, @bookable, @status,
      @used_by, @from_time, @to_time, @open_time, @close_time,
      @created_at, @updated_at
    )`
  );

  const insertMany = db.transaction((items) => {
    for (const dept of departments) {
      deptStmt.run(dept);
    }
    for (const pg of pgSpecializations) {
      pgStmt.run(pg);
    }
    for (const club of clubs) {
      clubStmt.run(club);
    }
    for (const item of items) {
      stmt.run({
        name: item.name,
        type: item.type || null,
        scope: item.scope,
        department: item.department || null,
        category: item.category || null,
        bookable: item.bookable,
        status: item.status,
        used_by: item.used_by || null,
        from_time: item.from_time || null,
        to_time: item.to_time || null,
        open_time: item.open_time || null,
        close_time: item.close_time || null,
        created_at: now,
        updated_at: now
      });
    }
    db.prepare("INSERT INTO meta (key, value) VALUES ('seed_version', @value) ON CONFLICT(key) DO UPDATE SET value = @value").run({ value: seedVersion });
  });

  insertMany(seedItems);
  return seedItems.length;
}

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

export function createApp({ db }) {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length ? allowedOrigins : true,
      credentials: true
    })
  );

  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev_session_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      }
    })
  );

  app.use("/api/public", createPublicRouter({ db }));
  app.use("/api/admin", createAdminRouter({ db }));

  return app;
}
