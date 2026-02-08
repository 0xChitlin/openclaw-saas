import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data/deskagents.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Run schema
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    db.exec(schema);

    // Create default admin if none exists
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM admin_users").get() as { count: number };
    if (adminCount.count === 0) {
      const defaultPassword = process.env.ADMIN_PASSWORD || "deskagents-admin-2024";
      const hash = bcrypt.hashSync(defaultPassword, 10);
      db.prepare("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)").run(
        "admin@deskagents.com",
        hash
      );
      console.log("[DB] Default admin created: admin@deskagents.com");
    }

    console.log(`[DB] Initialized at ${DB_PATH}`);
  }
  return db;
}

// Helper functions for common queries
export function logAgent(agentId: string, type: string, message: string): void {
  const d = getDb();
  d.prepare("INSERT INTO agent_logs (agent_id, type, message) VALUES (?, ?, ?)").run(
    agentId,
    type,
    message
  );
}

export function updateAgentStatus(agentId: string, status: string, pid?: number): void {
  const d = getDb();
  if (pid !== undefined) {
    d.prepare("UPDATE agents SET status = ?, pid = ?, last_heartbeat = datetime('now') WHERE id = ?").run(
      status,
      pid,
      agentId
    );
  } else {
    d.prepare("UPDATE agents SET status = ?, last_heartbeat = datetime('now') WHERE id = ?").run(
      status,
      agentId
    );
  }
}

export function updateAgentHeartbeat(agentId: string): void {
  const d = getDb();
  d.prepare("UPDATE agents SET last_heartbeat = datetime('now') WHERE id = ?").run(agentId);
}
