import Imap from "node-imap";
import { simpleParser, ParsedMail } from "mailparser";
import nodemailer from "nodemailer";
import { logAgent } from "../../db/init";
import type { AgentWorker } from "../manager";

interface FAQEntry {
  keywords: string[];
  answer: string;
}

const DEFAULT_FAQ: FAQEntry[] = [
  {
    keywords: ["pricing", "price", "cost", "how much", "plan"],
    answer:
      "Thanks for your interest in our pricing! You can find our current plans at our pricing page. We offer Starter ($29/mo), Pro ($79/mo), and Enterprise (custom) plans. Would you like me to connect you with someone to discuss which plan is right for you?",
  },
  {
    keywords: ["cancel", "cancellation", "refund", "unsubscribe"],
    answer:
      "I'm sorry to hear you'd like to cancel. You can cancel your subscription at any time from your dashboard settings. Refunds are available within 30 days of purchase. I've forwarded your request to our team who will follow up within 24 hours.",
  },
  {
    keywords: ["setup", "getting started", "how to start", "install", "integration"],
    answer:
      "Getting started is easy! 1) Log into your dashboard, 2) Go to Settings > Integrations, 3) Connect your email or calendar. If you need help, our setup guide is at docs.deskagents.com/setup. Want me to schedule a quick onboarding call?",
  },
  {
    keywords: ["bug", "error", "broken", "not working", "issue", "problem"],
    answer:
      "I'm sorry you're experiencing an issue! I've logged this and escalated it to our technical team. They'll investigate and get back to you within 24 hours. In the meantime, try refreshing your dashboard or clearing your browser cache.",
  },
  {
    keywords: ["password", "login", "can't access", "locked out", "reset"],
    answer:
      "If you're having trouble accessing your account, you can reset your password at deskagents.com/reset-password. If you're still locked out after that, I've flagged this for our support team who will reach out within a few hours.",
  },
];

export class SupportAgent implements AgentWorker {
  private agentId: string;
  private config: any;
  private integrations: any[];
  private imap: Imap | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private status: "running" | "stopped" | "error" = "stopped";
  private processedUids: Set<number> = new Set();
  private faq: FAQEntry[];
  private responseCount = 0;
  private escalationCount = 0;

  constructor(agentId: string, config: any, integrations: any[]) {
    this.agentId = agentId;
    this.config = config;
    this.integrations = integrations;
    this.faq = config.faq || DEFAULT_FAQ;
  }

  async start(): Promise<void> {
    const emailIntegration = this.integrations.find((i) => i.type === "email");
    if (!emailIntegration) {
      logAgent(this.agentId, "info", "No email integration, running in monitor-only mode");
      this.status = "running";
      return;
    }

    const emailConfig = JSON.parse(emailIntegration.config || "{}");

    try {
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

      // Poll every 2 minutes for support
      this.pollInterval = setInterval(() => {
        this.pollEmails(emailConfig).catch((err) => {
          logAgent(this.agentId, "error", `Support poll error: ${err.message}`);
        });
      }, 2 * 60 * 1000);

      this.status = "running";
      logAgent(this.agentId, "info", "Support agent started, monitoring for support emails");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logAgent(this.agentId, "error", `Failed to start support agent: ${message}`);
      this.status = "error";
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
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
    logAgent(this.agentId, "info", `Support agent stopped. Responses: ${this.responseCount}, Escalations: ${this.escalationCount}`);
  }

  getStatus(): "running" | "stopped" | "error" {
    return this.status;
  }

  private connectImap(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.imap) return reject(new Error("IMAP not initialized"));

      this.imap.once("ready", () => {
        logAgent(this.agentId, "info", "Support IMAP connected");
        resolve();
      });

      this.imap.once("error", (err: Error) => {
        logAgent(this.agentId, "error", `Support IMAP error: ${err.message}`);
        this.status = "error";
        reject(err);
      });

      this.imap.connect();
    });
  }

  private async pollEmails(emailConfig: any): Promise<void> {
    if (!this.imap || this.status !== "running") return;

    return new Promise((resolve, reject) => {
      this.imap!.openBox("INBOX", true, (err) => {
        if (err) return reject(err);

        this.imap!.search(["UNSEEN"], (err, uids) => {
          if (err) return reject(err);

          if (!uids || uids.length === 0) {
            resolve();
            return;
          }

          const newUids = uids.filter((uid) => !this.processedUids.has(uid));
          if (newUids.length === 0) {
            resolve();
            return;
          }

          logAgent(this.agentId, "info", `Found ${newUids.length} support emails`);

          const fetch = this.imap!.fetch(newUids, { bodies: "", struct: true });

          fetch.on("message", (msg) => {
            msg.on("body", (stream) => {
              let buffer = "";
              stream.on("data", (chunk: Buffer) => {
                buffer += chunk.toString("utf8");
              });
              stream.on("end", () => {
                simpleParser(buffer)
                  .then((parsed: ParsedMail) => {
                    this.handleSupportEmail(parsed, emailConfig);
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

          fetch.once("error", (err: Error) => reject(err));
          fetch.once("end", () => resolve());
        });
      });
    });
  }

  private async handleSupportEmail(parsed: ParsedMail, emailConfig: any): Promise<void> {
    const from = parsed.from?.value?.[0]?.address || "";
    const subject = parsed.subject || "";
    const text = (parsed.text || "").toLowerCase();
    const fullText = `${subject} ${text}`.toLowerCase();

    // Try to match FAQ
    const match = this.findFAQMatch(fullText);

    if (match) {
      logAgent(
        this.agentId,
        "action",
        `Auto-reply to ${from}: "${subject}" — matched FAQ`
      );

      await this.sendReply(emailConfig, from, subject, match.answer);
      this.responseCount++;
    } else {
      // Escalate
      logAgent(
        this.agentId,
        "action",
        `Escalating from ${from}: "${subject}" — no FAQ match`
      );

      const escalateTo = this.config.escalate_to || emailConfig.email;
      await this.escalate(emailConfig, escalateTo, from, subject, parsed.text || "");
      this.escalationCount++;
    }
  }

  private findFAQMatch(text: string): FAQEntry | null {
    let bestMatch: FAQEntry | null = null;
    let bestScore = 0;

    for (const entry of this.faq) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  private async sendReply(
    emailConfig: any,
    to: string,
    originalSubject: string,
    body: string
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtp_host || "smtp.gmail.com",
      port: emailConfig.smtp_port || 587,
      secure: false,
      auth: {
        user: emailConfig.smtp_user || emailConfig.email,
        pass: emailConfig.smtp_password || emailConfig.password,
      },
    });

    try {
      await transporter.sendMail({
        from: emailConfig.email,
        to,
        subject: `Re: ${originalSubject}`,
        text: `Hi there!\n\n${body}\n\nBest regards,\nDeskAgents Support`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logAgent(this.agentId, "error", `Failed to send reply to ${to}: ${message}`);
    }
  }

  private async escalate(
    emailConfig: any,
    escalateTo: string,
    from: string,
    subject: string,
    body: string
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtp_host || "smtp.gmail.com",
      port: emailConfig.smtp_port || 587,
      secure: false,
      auth: {
        user: emailConfig.smtp_user || emailConfig.email,
        pass: emailConfig.smtp_password || emailConfig.password,
      },
    });

    try {
      await transporter.sendMail({
        from: emailConfig.email,
        to: escalateTo,
        subject: `[ESCALATED] ${subject} — from ${from}`,
        text: `This support email couldn't be auto-resolved.\n\nFrom: ${from}\nSubject: ${subject}\n\n---\n${body}\n---\n\nPlease respond directly to ${from}.`,
      });

      // Also send acknowledgment to the customer
      await transporter.sendMail({
        from: emailConfig.email,
        to: from,
        subject: `Re: ${subject}`,
        text: `Hi there!\n\nThank you for reaching out. I've forwarded your question to our team and someone will get back to you within 24 hours.\n\nBest regards,\nDeskAgents Support`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logAgent(this.agentId, "error", `Failed to escalate: ${message}`);
    }
  }
}
