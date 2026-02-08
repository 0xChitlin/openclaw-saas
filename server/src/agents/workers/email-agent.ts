import Imap from "node-imap";
import { simpleParser, ParsedMail } from "mailparser";
import nodemailer from "nodemailer";
import { logAgent } from "../../db/init";
import type { AgentWorker } from "../manager";

interface EmailCategory {
  category: "urgent" | "follow-up" | "newsletter" | "spam" | "general";
  reason: string;
}

const URGENT_KEYWORDS = [
  "urgent", "asap", "emergency", "critical", "immediately",
  "deadline", "important", "action required", "time sensitive",
];

const NEWSLETTER_KEYWORDS = [
  "unsubscribe", "newsletter", "weekly digest", "monthly update",
  "mailing list", "email preferences", "opt out",
];

const SPAM_KEYWORDS = [
  "winner", "congratulations", "lottery", "free money",
  "act now", "limited time", "click here", "buy now",
];

export class EmailAgent implements AgentWorker {
  private agentId: string;
  private config: any;
  private integrations: any[];
  private imap: Imap | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private digestInterval: ReturnType<typeof setInterval> | null = null;
  private status: "running" | "stopped" | "error" = "stopped";
  private processedUids: Set<number> = new Set();
  private todayEmails: Array<{ from: string; subject: string; category: string; time: string }> = [];

  constructor(agentId: string, config: any, integrations: any[]) {
    this.agentId = agentId;
    this.config = config;
    this.integrations = integrations;
  }

  async start(): Promise<void> {
    const emailIntegration = this.integrations.find((i) => i.type === "email");
    if (!emailIntegration) {
      logAgent(this.agentId, "info", "No email integration configured, running in monitor-only mode");
      this.status = "running";
      return;
    }

    const emailConfig = JSON.parse(emailIntegration.config || "{}");

    try {
      // Set up IMAP connection
      this.imap = new Imap({
        user: emailConfig.imap_user || emailConfig.email,
        password: emailConfig.imap_password || emailConfig.password,
        host: emailConfig.imap_host || "imap.gmail.com",
        port: emailConfig.imap_port || 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000,
      });

      await this.connectImap();

      // Poll every 5 minutes
      this.pollInterval = setInterval(() => {
        this.pollEmails().catch((err) => {
          logAgent(this.agentId, "error", `Poll error: ${err.message}`);
        });
      }, 5 * 60 * 1000);

      // Schedule daily digest at 6 PM
      this.digestInterval = setInterval(() => {
        const now = new Date();
        if (now.getHours() === 18 && now.getMinutes() < 5) {
          this.sendDailyDigest(emailConfig).catch((err) => {
            logAgent(this.agentId, "error", `Digest error: ${err.message}`);
          });
        }
      }, 5 * 60 * 1000);

      this.status = "running";
      logAgent(this.agentId, "info", "Email agent started, monitoring inbox");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logAgent(this.agentId, "error", `Failed to start email agent: ${message}`);
      this.status = "error";
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.digestInterval) {
      clearInterval(this.digestInterval);
      this.digestInterval = null;
    }
    if (this.imap) {
      try {
        this.imap.end();
      } catch {
        // ignore
      }
      this.imap = null;
    }
    this.status = "stopped";
    logAgent(this.agentId, "info", "Email agent stopped");
  }

  getStatus(): "running" | "stopped" | "error" {
    return this.status;
  }

  private connectImap(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.imap) return reject(new Error("IMAP not initialized"));

      this.imap.once("ready", () => {
        logAgent(this.agentId, "info", "IMAP connected");
        resolve();
      });

      this.imap.once("error", (err: Error) => {
        logAgent(this.agentId, "error", `IMAP error: ${err.message}`);
        this.status = "error";
        reject(err);
      });

      this.imap.once("end", () => {
        logAgent(this.agentId, "info", "IMAP connection ended");
      });

      this.imap.connect();
    });
  }

  private async pollEmails(): Promise<void> {
    if (!this.imap || this.status !== "running") return;

    return new Promise((resolve, reject) => {
      this.imap!.openBox("INBOX", true, (err, box) => {
        if (err) return reject(err);

        // Search for unseen emails
        this.imap!.search(["UNSEEN"], (err, uids) => {
          if (err) return reject(err);

          if (!uids || uids.length === 0) {
            resolve();
            return;
          }

          // Filter out already processed
          const newUids = uids.filter((uid) => !this.processedUids.has(uid));
          if (newUids.length === 0) {
            resolve();
            return;
          }

          logAgent(this.agentId, "info", `Found ${newUids.length} new emails`);

          const fetch = this.imap!.fetch(newUids, { bodies: "", struct: true });

          fetch.on("message", (msg, seqno) => {
            msg.on("body", (stream) => {
              let buffer = "";
              stream.on("data", (chunk: Buffer) => {
                buffer += chunk.toString("utf8");
              });
              stream.on("end", () => {
                simpleParser(buffer)
                  .then((parsed: ParsedMail) => {
                    this.processEmail(parsed, seqno);
                  })
                  .catch((e) => {
                    logAgent(this.agentId, "error", `Parse error: ${e.message}`);
                  });
              });
            });

            msg.once("attributes", (attrs) => {
              this.processedUids.add(attrs.uid);
            });
          });

          fetch.once("error", (err: Error) => {
            logAgent(this.agentId, "error", `Fetch error: ${err.message}`);
            reject(err);
          });

          fetch.once("end", () => {
            resolve();
          });
        });
      });
    });
  }

  private processEmail(parsed: ParsedMail, seqno: number): void {
    const from = parsed.from?.text || "unknown";
    const subject = parsed.subject || "(no subject)";
    const text = (parsed.text || "").toLowerCase();
    const fullText = `${subject} ${text}`.toLowerCase();

    const category = this.categorize(fullText);

    logAgent(
      this.agentId,
      "action",
      `Email #${seqno} from "${from}" — "${subject}" → ${category.category} (${category.reason})`
    );

    this.todayEmails.push({
      from,
      subject,
      category: category.category,
      time: new Date().toISOString(),
    });
  }

  private categorize(text: string): EmailCategory {
    // Check urgent
    for (const kw of URGENT_KEYWORDS) {
      if (text.includes(kw)) {
        return { category: "urgent", reason: `Contains "${kw}"` };
      }
    }

    // Check spam
    for (const kw of SPAM_KEYWORDS) {
      if (text.includes(kw)) {
        return { category: "spam", reason: `Contains "${kw}"` };
      }
    }

    // Check newsletter
    for (const kw of NEWSLETTER_KEYWORDS) {
      if (text.includes(kw)) {
        return { category: "newsletter", reason: `Contains "${kw}"` };
      }
    }

    // Check follow-up (reply patterns)
    if (text.includes("re:") || text.includes("follow up") || text.includes("following up")) {
      return { category: "follow-up", reason: "Reply or follow-up pattern" };
    }

    return { category: "general", reason: "No specific pattern matched" };
  }

  private async sendDailyDigest(emailConfig: any): Promise<void> {
    if (this.todayEmails.length === 0) return;

    const smtpConfig = {
      host: emailConfig.smtp_host || "smtp.gmail.com",
      port: emailConfig.smtp_port || 587,
      secure: false,
      auth: {
        user: emailConfig.smtp_user || emailConfig.email,
        pass: emailConfig.smtp_password || emailConfig.password,
      },
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    const urgent = this.todayEmails.filter((e) => e.category === "urgent");
    const followUp = this.todayEmails.filter((e) => e.category === "follow-up");
    const general = this.todayEmails.filter((e) => e.category === "general");
    const newsletter = this.todayEmails.filter((e) => e.category === "newsletter");
    const spam = this.todayEmails.filter((e) => e.category === "spam");

    const formatList = (emails: typeof this.todayEmails) =>
      emails.map((e) => `  • ${e.from}: ${e.subject}`).join("\n") || "  (none)";

    const body = `
📧 Daily Email Digest — ${new Date().toLocaleDateString()}

Total emails processed: ${this.todayEmails.length}

🔴 URGENT (${urgent.length}):
${formatList(urgent)}

📎 FOLLOW-UP (${followUp.length}):
${formatList(followUp)}

📬 GENERAL (${general.length}):
${formatList(general)}

📰 NEWSLETTERS (${newsletter.length}):
${formatList(newsletter)}

🗑️ SPAM (${spam.length}):
${formatList(spam)}

— Your DeskAgent
`.trim();

    try {
      await transporter.sendMail({
        from: emailConfig.email,
        to: emailConfig.digest_to || emailConfig.email,
        subject: `📧 Email Digest — ${new Date().toLocaleDateString()}`,
        text: body,
      });

      logAgent(this.agentId, "action", `Daily digest sent (${this.todayEmails.length} emails)`);
      this.todayEmails = []; // Reset for next day
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logAgent(this.agentId, "error", `Failed to send digest: ${message}`);
    }
  }
}
