import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data/deskagents.db");

let db: any = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveToDisk(): void {
  if (!db) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function scheduleSave(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveToDisk();
    saveTimer = null;
  }, 2000);
}

export async function initDb(): Promise<any> {
  if (db) return db;

  const SQL = await initSqlJs();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.run(schema);

  const result = db.exec("SELECT COUNT(*) as count FROM admin_users");
  const adminCount = result.length > 0 ? (result[0].values[0][0] as number) : 0;

  if (adminCount === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || "deskagents-admin-2024";
    const hash = bcrypt.hashSync(defaultPassword, 10);
    db.run("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)", [
      "admin@deskagents.com",
      hash,
    ]);
    console.log("[DB] Default admin created: admin@deskagents.com");
  }

  saveToDisk();
  console.log("[DB] Initialized at " + DB_PATH);
  return db;
}

export function getDb(): any {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export function dbRun(sql: string, params: any[] = []): void {
  const d = getDb();
  d.run(sql, params);
  scheduleSave();
}

export function dbAll(sql: string, params: any[] = []): any[] {
  const d = getDb();
  const stmt = d.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function dbGet(sql: string, params: any[] = []): any | null {
  const rows = dbAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function logAgent(agentId: string, type: string, message: string): void {
  dbRun("INSERT INTO agent_logs (agent_id, type, message) VALUES (?, ?, ?)", [
    agentId, type, message,
  ]);
}

export function updateAgentStatus(agentId: string, status: string, pid?: number): void {
  if (pid !== undefined) {
    dbRun("UPDATE agents SET status = ?, pid = ?, last_heartbeat = datetime('now') WHERE id = ?",
      [status, pid, agentId]);
  } else {
    dbRun("UPDATE agents SET status = ?, last_heartbeat = datetime('now') WHERE id = ?",
      [status, agentId]);
  }
}

export function updateAgentHeartbeat(agentId: string): void {
  dbRun("UPDATE agents SET last_heartbeat = datetime('now') WHERE id = ?", [agentId]);
}

process.on("exit", () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveToDisk();
});
