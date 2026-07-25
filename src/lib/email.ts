import nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || "Hyreli";
  const fromEmail = process.env.SMTP_FROM_EMAIL;

  if (!host || !port || !user || !pass || !fromEmail) return null;

  return {
    host,
    port: parseInt(port, 10),
    secure: port === "465",
    user,
    pass,
    fromName,
    fromEmail,
  };
}

function getTransporter() {
  const config = getSmtpConfig();
  if (!config) return null;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const defaultTemplates: Record<string, (vars: Record<string, string>) => EmailTemplate> = {
  PENDING: (vars) => ({
    subject: `Application Received - ${vars.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Application Received</h2>
        <p>Hi ${vars.applicantName},</p>
        <p>Thank you for applying for <strong>${vars.jobTitle}</strong>. We've received your application and will review it shortly.</p>
        <p>We'll keep you updated on the status of your application.</p>
        <br/>
        <p>Best regards,<br/><strong>${vars.companyName}</strong></p>
      </div>
    `,
    text: `Hi ${vars.applicantName},\n\nThank you for applying for ${vars.jobTitle}. We've received your application and will review it shortly.\n\nBest regards,\n${vars.companyName}`,
  }),
  REVIEWING: (vars) => ({
    subject: `Application Under Review - ${vars.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Application Under Review</h2>
        <p>Hi ${vars.applicantName},</p>
        <p>Your application for <strong>${vars.jobTitle}</strong> is now being reviewed by our team.</p>
        <p>We'll get back to you soon with next steps.</p>
        <br/>
        <p>Best regards,<br/><strong>${vars.companyName}</strong></p>
      </div>
    `,
    text: `Hi ${vars.applicantName},\n\nYour application for ${vars.jobTitle} is now being reviewed by our team.\n\nBest regards,\n${vars.companyName}`,
  }),
  INTERVIEW: (vars) => ({
    subject: `Interview Invitation - ${vars.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Interview Invitation</h2>
        <p>Hi ${vars.applicantName},</p>
        <p>Great news! We'd like to invite you for an interview for <strong>${vars.jobTitle}</strong>.</p>
        <p>We'll be in touch shortly to schedule the details.</p>
        <br/>
        <p>Best regards,<br/><strong>${vars.companyName}</strong></p>
      </div>
    `,
    text: `Hi ${vars.applicantName},\n\nGreat news! We'd like to invite you for an interview for ${vars.jobTitle}.\n\nBest regards,\n${vars.companyName}`,
  }),
  ACCEPTED: (vars) => ({
    subject: `Application Accepted - ${vars.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #22c55e;">Congratulations!</h2>
        <p>Hi ${vars.applicantName},</p>
        <p>We're pleased to inform you that your application for <strong>${vars.jobTitle}</strong> has been accepted!</p>
        <p>We'll be in touch with the next steps soon.</p>
        <br/>
        <p>Best regards,<br/><strong>${vars.companyName}</strong></p>
      </div>
    `,
    text: `Hi ${vars.applicantName},\n\nCongratulations! Your application for ${vars.jobTitle} has been accepted!\n\nBest regards,\n${vars.companyName}`,
  }),
  REJECTED: (vars) => ({
    subject: `Application Update - ${vars.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Application Update</h2>
        <p>Hi ${vars.applicantName},</p>
        <p>Thank you for your interest in <strong>${vars.jobTitle}</strong>. After careful consideration, we've decided to move forward with other candidates.</p>
        <p>We encourage you to apply for future openings.</p>
        <br/>
        <p>Best regards,<br/><strong>${vars.companyName}</strong></p>
      </div>
    `,
    text: `Hi ${vars.applicantName},\n\nThank you for your interest in ${vars.jobTitle}. After careful consideration, we've decided to move forward with other candidates.\n\nBest regards,\n${vars.companyName}`,
  }),
};

export async function sendStatusEmail(params: {
  to: string;
  applicantName: string;
  jobTitle: string;
  status: string;
  customSubject?: string;
  customBody?: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return false;

  const config = getSmtpConfig()!;
  const vars: Record<string, string> = {
    applicantName: params.applicantName,
    jobTitle: params.jobTitle,
    companyName: config.fromName,
    email: params.to,
  };

  let template: EmailTemplate;

  if (params.customSubject || params.customBody) {
    let subject = params.customSubject || `Application Update - ${params.jobTitle}`;
    let body = params.customBody || "";

    for (const [key, value] of Object.entries(vars)) {
      subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }

    template = {
      subject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${body.replace(/\n/g, "<br/>")}</div>`,
      text: body,
    };
  } else {
    const templateFn = defaultTemplates[params.status];
    if (!templateFn) return false;
    template = templateFn(vars);
  }

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    console.log(`[Email] Sent to ${params.to} with status ${params.status}`);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return false;
  }
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfig() !== null;
}
