export type EmailTemplate = "session_approved" | "session_rejected";

interface SessionApprovedData {
  firstName: string;
  topic: string;
}

interface SessionRejectedData {
  firstName: string;
  topic: string;
  reason?: string;
}

type TemplateDataMap = {
  session_approved: SessionApprovedData;
  session_rejected: SessionRejectedData;
};

export function renderEmailTemplate<T extends EmailTemplate>(
  template: T,
  data: TemplateDataMap[T],
): { subject: string; html: string } {
  switch (template) {
    case "session_approved": {
      const d = data as SessionApprovedData;
      return {
        subject: "Your 1-on-1 Session Has Been Approved",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
            <h2 style="color:#1d4ed8">Session Approved!</h2>
            <p>Hi ${d.firstName},</p>
            <p>Your 1-on-1 session request <strong>"${d.topic}"</strong> has been approved.</p>
            <p>Log in to your Learn With Rahmlad account to see the session details and prepare.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://learnwithrahmlad.com"}/sessions"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none">
              View My Sessions
            </a>
            <p style="margin-top:32px;color:#6b7280;font-size:14px">Learn With Rahmlad</p>
          </div>
        `,
      };
    }
    case "session_rejected": {
      const d = data as SessionRejectedData;
      return {
        subject: "Update on Your Session Request",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
            <h2 style="color:#1d4ed8">Session Request Update</h2>
            <p>Hi ${d.firstName},</p>
            <p>Your session request <strong>"${d.topic}"</strong> could not be approved at this time.</p>
            ${d.reason ? `<p><strong>Reason:</strong> ${d.reason}</p>` : ""}
            <p>Feel free to submit a new request with a different topic or time.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://learnwithrahmlad.com"}/sessions"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none">
              Request Another Session
            </a>
            <p style="margin-top:32px;color:#6b7280;font-size:14px">Learn With Rahmlad</p>
          </div>
        `,
      };
    }
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}
