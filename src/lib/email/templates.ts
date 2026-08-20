export type EmailTemplate =
  | "session_approved"
  | "session_rejected"
  | "forgot_password"
  | "support_ticket"
  | "contact_inquiry";

interface SessionApprovedData {
  firstName: string;
  topic: string;
}

interface SessionRejectedData {
  firstName: string;
  topic: string;
  reason?: string;
}

interface ForgotPasswordData {
  firstName: string;
  resetLink: string;
}

interface SupportTicketData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactInquiryData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

type TemplateDataMap = {
  session_approved: SessionApprovedData;
  session_rejected: SessionRejectedData;
  forgot_password: ForgotPasswordData;
  support_ticket: SupportTicketData;
  contact_inquiry: ContactInquiryData;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://learn.rahmlad.com";

function baseLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Learn With Rahmlad</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Empowering the next generation of engineers</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                &copy; ${new Date().getFullYear()} Learn With Rahmlad &middot; Rahmlad Solutions
              </p>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">
                Questions? Reply to this email or visit <a href="${APP_URL}" style="color:#2563eb;text-decoration:none;">${APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#ffffff;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.2px;">${label}</a>`;
}

export function renderEmailTemplate<T extends EmailTemplate>(
  template: T,
  data: TemplateDataMap[T],
): { subject: string; html: string } {
  switch (template) {
    case "session_approved": {
      const d = data as SessionApprovedData;
      const body = `
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">Session Approved! 🎉</h2>
        <p style="margin:0 0 20px;color:#64748b;font-size:15px;line-height:1.6;">Hi <strong>${d.firstName}</strong>,</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
          Great news! Your 1-on-1 session request for <strong style="color:#1d4ed8;">"${d.topic}"</strong> has been approved.
        </p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
          Log in to your account to see the session details and start preparing.
        </p>
        <div style="text-align:center;">
          ${ctaButton(`${APP_URL}/sessions`, "View My Sessions")}
        </div>
        <p style="margin:32px 0 0;color:#94a3b8;font-size:13px;">If you didn't expect this, you can safely ignore this email.</p>
      `;
      return {
        subject: "Your 1-on-1 Session Has Been Approved ✅",
        html: baseLayout("Session Approved", body),
      };
    }

    case "session_rejected": {
      const d = data as SessionRejectedData;
      const body = `
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">Session Request Update</h2>
        <p style="margin:0 0 20px;color:#64748b;font-size:15px;line-height:1.6;">Hi <strong>${d.firstName}</strong>,</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
          Your session request for <strong>"${d.topic}"</strong> could not be approved at this time.
        </p>
        ${
          d.reason
            ? `<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;margin:0 0 16px;">
          <p style="margin:0;color:#92400e;font-size:14px;"><strong>Reason:</strong> ${d.reason}</p>
        </div>`
            : ""
        }
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
          Feel free to submit a new request with a different topic or preferred time.
        </p>
        <div style="text-align:center;">
          ${ctaButton(`${APP_URL}/sessions`, "Request Another Session")}
        </div>
      `;
      return {
        subject: "Update on Your Session Request",
        html: baseLayout("Session Request Update", body),
      };
    }

    case "forgot_password": {
      const d = data as ForgotPasswordData;
      const body = `
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">Reset Your Password</h2>
        <p style="margin:0 0 20px;color:#64748b;font-size:15px;line-height:1.6;">Hi <strong>${d.firstName}</strong>,</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
          We received a request to reset the password for your Learn With Rahmlad account.
          Click the button below to choose a new password.
        </p>
        <div style="text-align:center;">
          ${ctaButton(d.resetLink, "Reset My Password")}
        </div>
        <div style="margin-top:32px;padding:16px;background:#f1f5f9;border-radius:8px;">
          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
            ⏱ This link expires in <strong>1 hour</strong>.<br />
            🔒 If you didn't request a password reset, you can safely ignore this email — your password won't change.
          </p>
        </div>
      `;
      return {
        subject: "Reset your Learn With Rahmlad password",
        html: baseLayout("Password Reset", body),
      };
    }

    case "support_ticket": {
      const d = data as SupportTicketData;
      const body = `
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">New Support Request 🎫</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">A user has submitted a support request on Learn With Rahmlad.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;width:120px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Name</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${d.name}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e2e8f0;">Email</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-top:1px solid #e2e8f0;"><a href="mailto:${d.email}" style="color:#2563eb;text-decoration:none;">${d.email}</a></td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e2e8f0;">Subject</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-top:1px solid #e2e8f0;">${d.subject}</td>
          </tr>
        </table>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${d.message}</p>
        </div>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">Reply directly to this email or contact <a href="mailto:${d.email}" style="color:#2563eb;text-decoration:none;">${d.email}</a> to respond.</p>
      `;
      return {
        subject: `New Support Request: ${d.subject}`,
        html: baseLayout("Support Request", body),
      };
    }

    case "contact_inquiry": {
      const d = data as ContactInquiryData;
      const body = `
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">New Contact Inquiry 📬</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">Someone has reached out via the Learn With Rahmlad landing page.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;width:120px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Name</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${d.name}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e2e8f0;">Email</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-top:1px solid #e2e8f0;"><a href="mailto:${d.email}" style="color:#2563eb;text-decoration:none;">${d.email}</a></td>
          </tr>
          ${
            d.subject
              ? `<tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e2e8f0;">Subject</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-top:1px solid #e2e8f0;">${d.subject}</td>
          </tr>`
              : ""
          }
        </table>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${d.message}</p>
        </div>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">Reply directly to this email or contact <a href="mailto:${d.email}" style="color:#2563eb;text-decoration:none;">${d.email}</a> to respond.</p>
      `;
      return {
        subject: `New Contact Inquiry from ${d.name}`,
        html: baseLayout("Contact Inquiry", body),
      };
    }

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}
