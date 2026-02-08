import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { getDb } from "./db/init";
import { getAgentManager } from "./agents/manager";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import customerRoutes from "./routes/customer";
import provisionRoutes from "./routes/provision";
import healthRoutes from "./routes/health";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} — ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/provision", provisionRoutes);
app.use("/api/health", healthRoutes);

// Root
app.get("/", (_req, res) => {
  res.json({
    name: "DeskAgents Runtime Server",
    version: "1.0.0",
    endpoints: [
      "GET  /api/health",
      "POST /api/auth/login",
      "POST /api/provision",
      "GET  /api/admin/customers",
      "GET  /api/admin/agents",
      "POST /api/admin/agents/:id/start",
      "POST /api/admin/agents/:id/stop",
      "POST /api/admin/agents/:id/restart",
      "GET  /api/admin/agents/:id/logs",
      "GET  /api/admin/stats",
      "GET  /api/customer/agent",
      "GET  /api/customer/logs",
      "PATCH /api/customer/agent",
      "POST /api/customer/integrations",
    ],
  });
});

// Initialize database
getDb();

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 DeskAgents Server running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Admin API: http://localhost:${PORT}/api/admin`);
  console.log("");
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n[Server] ${signal} received, shutting down...`);
  const manager = getAgentManager();
  await manager.shutdown();
  server.close(() => {
    console.log("[Server] Closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
