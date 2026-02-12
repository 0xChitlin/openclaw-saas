import Imap from "node-imap";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import { logAgent } from "../../db/init";
import type { AgentWorker } from "../manager";

export class EmailAgent implements AgentWorker {
  private agentId: string; private config: any; private integrations: any[];
  private imap: Imap | null = null;
  private poll: ReturnType<typeof setInterval> | null = null;
  private status: "running" | "stopped" | "error" = "stopped";
  private seen = new Set<number>();
  private today: Array<{ from: string; subject: string; category: string }> = [];

  constructor(id: string, config: any, ints: any[]) { this.agentId = id; this.config = config; this.integrations = ints; }

  async start() {
    const ei = this.integrations.find((i: any) => i.type === "email");
    if (!ei) { this.status = "running"; return; }
    const ec = JSON.parse(ei.config || "{}");
    this.imap = new Imap({ user: ec.imap_user || ec.email, password: ec.imap_password || ec.password, host: ec.imap_host || "imap.gmail.com", port: ec.imap_port || 993, tls: true, tlsOptions: { rejectUnauthorized: false } });
    await new Promise<void>((ok, fail) => { this.imap!.once("ready", ok); this.imap!.once("error", fail); this.imap!.connect(); });
    this.poll = setInterval(() => this.pollEmails().catch(() => {}), 300000);
    this.status = "running";
    logAgent(this.agentId, "info", "Email agent started");
  }

  async stop() { if (this.poll) clearInterval(this.poll); if (this.imap) try { this.imap.end(); } catch {} this.status = "stopped"; }
  getStatus(): "running" | "stopped" | "error" { return this.status; }

  private pollEmails(): Promise<void> {
    return new Promise((ok, fail) => {
      if (!this.imap) return ok();
      this.imap.openBox("INBOX", true, (err: any) => {
        if (err) return fail(err);
        this.imap!.search(["UNSEEN"], (err2: any, uids: number[]) => {
          if (err2) return fail(err2);
          const nu = (uids || []).filter((u: number) => !this.seen.has(u));
          if (!nu.length) return ok();
          const f = this.imap!.fetch(nu, { bodies: "", struct: true });
          f.on("message", (msg: any, seqno: number) => {
            msg.on("body", (stream: any) => {
              let b = ""; stream.on("data", (c: Buffer) => b += c.toString());
              stream.on("end", () => simpleParser(b).then((p: any) => {
                const from = p.from?.text || "?"; const subj = p.subject || "";
                const txt = (subj + " " + (p.text || "")).toLowerCase();
                let cat = "general";
                if (["urgent","asap","emergency","critical"].some((k: string) => txt.includes(k))) cat = "urgent";
                else if (["unsubscribe","newsletter"].some((k: string) => txt.includes(k))) cat = "newsletter";
                else if (["winner","lottery","free money"].some((k: string) => txt.includes(k))) cat = "spam";
                else if (txt.includes("re:") || txt.includes("follow up")) cat = "follow-up";
                logAgent(this.agentId, "action", "Email #" + seqno + " from " + from + " -> " + cat);
                this.today.push({ from, subject: subj, category: cat });
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
