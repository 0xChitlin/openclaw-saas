import Imap from "node-imap";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import { logAgent } from "../../db/init";
import type { AgentWorker } from "../manager";

const FAQ = [
  { kw: ["pricing","price","cost"], ans: "Starter \/mo, Pro \/mo, Enterprise custom." },
  { kw: ["cancel","refund"], ans: "Cancel from dashboard. Refunds within 30 days." },
  { kw: ["setup","getting started"], ans: "Log in > Settings > Integrations." },
  { kw: ["bug","error","broken"], ans: "Escalated to engineering. ETA 24h." },
  { kw: ["password","login","reset"], ans: "Reset at deskagents.com/reset-password." },
];

export class SupportAgent implements AgentWorker {
  private agentId: string; private config: any; private integrations: any[];
  private imap: Imap | null = null;
  private poll: ReturnType<typeof setInterval> | null = null;
  private status: "running" | "stopped" | "error" = "stopped";
  private seen = new Set<number>();

  constructor(id: string, config: any, ints: any[]) { this.agentId = id; this.config = config; this.integrations = ints; }

  async start() {
    const ei = this.integrations.find((i: any) => i.type === "email");
    if (!ei) { this.status = "running"; return; }
    const ec = JSON.parse(ei.config || "{}");
    this.imap = new Imap({ user: ec.imap_user || ec.email, password: ec.imap_password || ec.password, host: ec.imap_host || "imap.gmail.com", port: ec.imap_port || 993, tls: true, tlsOptions: { rejectUnauthorized: false } });
    await new Promise<void>((ok, fail) => { this.imap!.once("ready", ok); this.imap!.once("error", fail); this.imap!.connect(); });
    this.poll = setInterval(() => this.pollEmails(ec).catch(() => {}), 120000);
    this.status = "running";
    logAgent(this.agentId, "info", "Support agent started");
  }

  async stop() { if (this.poll) clearInterval(this.poll); if (this.imap) try { this.imap.end(); } catch {} this.status = "stopped"; }
  getStatus(): "running" | "stopped" | "error" { return this.status; }

  private pollEmails(ec: any): Promise<void> {
    return new Promise((ok, fail) => {
      if (!this.imap) return ok();
      this.imap.openBox("INBOX", true, (err: any) => {
        if (err) return fail(err);
        this.imap!.search(["UNSEEN"], (err2: any, uids: number[]) => {
          if (err2) return fail(err2);
          const nu = (uids || []).filter((u: number) => !this.seen.has(u));
          if (!nu.length) return ok();
          const f = this.imap!.fetch(nu, { bodies: "", struct: true });
          f.on("message", (msg: any) => {
            msg.on("body", (stream: any) => {
              let b = ""; stream.on("data", (c: Buffer) => b += c.toString());
              stream.on("end", () => simpleParser(b).then((p: any) => {
                const from = p.from?.value?.[0]?.address || "";
                const subj = p.subject || "";
                const txt = (subj + " " + (p.text || "")).toLowerCase();
                let match: string | null = null;
                for (const faq of FAQ) { if (faq.kw.some((k: string) => txt.includes(k))) { match = faq.ans; break; } }
                const tp = nodemailer.createTransport({ host: ec.smtp_host || "smtp.gmail.com", port: ec.smtp_port || 587, secure: false, auth: { user: ec.smtp_user || ec.email, pass: ec.smtp_password || ec.password } });
                if (match) {
                  logAgent(this.agentId, "action", "Auto-reply to " + from);
                  tp.sendMail({ from: ec.email, to: from, subject: "Re: " + subj, text: match }).catch(() => {});
                } else {
                  logAgent(this.agentId, "action", "Escalating from " + from);
                  tp.sendMail({ from: ec.email, to: this.config.escalate_to || ec.email, subject: "[ESCALATED] " + subj, text: "From: " + from + "
" + (p.text || "") }).catch(() => {});
                }
              }).catch(() => {}));
            });
            msg.once("attributes", (a: any) => this.seen.add(a.uid));
          });
          f.once("error", fail);
          f.once("end", ok);
        });
      });
    });
  }
}
