import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCompanyIdOrNull } from "@/lib/kx";
import { shareInvoiceUrl } from "@/lib/share";
import { sendAppEmail } from "@/lib/automation/mailer";
import { logEmailEvent } from "@/lib/automation/log";

export const runtime = "nodejs";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function esc(input: string) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(input: string) {
  return esc(input).replace(/\n/g, "<br />");
}

const GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64"
);

async function buildInvoiceEmail(payload: {
  invoiceId: string;
  companyId: string;
  to?: string;
  subject?: string;
  message?: string;
}) {
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "id,company_id,public_token,number,issue_date,due_date,status,total,balance_due,notes,terms, clients(name,email,phone)"
    )
    .eq("id", payload.invoiceId)
    .eq("company_id", payload.companyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!invoice) throw new Error("Invoice not found");

  const client = (invoice as any)?.clients ?? null;
  const recipient = String(payload.to || client?.email || "").trim();
  if (!recipient) throw new Error("Client email is missing for this invoice.");

  const subject = String(payload.subject || `Invoice ${invoice.number || ""} from Kryvexis`).trim();
  const clientName = String(client?.name || "Client");
  const invoiceNumber = String(invoice.number || "");
  const total = Number(invoice.total || 0).toFixed(2);
  const balance = Number(invoice.balance_due || 0).toFixed(2);
  const viewUrl = invoice.public_token ? shareInvoiceUrl(invoice.public_token) : "";
  const customMessage = String(payload.message || "").trim();

  const html = `
    <div style="background:#0B0F17;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;">
      <div style="max-width:720px;margin:0 auto;background:#0F172A;border:1px solid #1F2937;border-radius:16px;overflow:hidden;">
        <div style="padding:18px 20px;border-bottom:1px solid #1F2937;">
          <div style="font-size:14px;color:#9CA3AF;">Kryvexis OS</div>
          <div style="font-size:20px;color:#E5E7EB;font-weight:700;margin-top:4px;">Invoice ${esc(invoiceNumber)}</div>
          <div style="font-size:13px;color:#9CA3AF;margin-top:4px;">Prepared for ${esc(clientName)}</div>
        </div>

        <div style="padding:20px;">
          <p style="color:#E5E7EB;font-size:14px;line-height:1.6;margin:0 0 14px 0;">
            Hello ${esc(clientName)},
          </p>

          <p style="color:#CBD5E1;font-size:14px;line-height:1.6;margin:0 0 14px 0;">
            Please find your invoice details below.
          </p>

          ${
            customMessage
              ? `<div style="margin:0 0 16px 0;padding:12px 14px;background:#0B1220;border:1px solid #1F2937;border-radius:12px;color:#E5E7EB;font-size:14px;line-height:1.6;">${nl2br(
                  customMessage
                )}</div>`
              : ""
          }

          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
            <div style="background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
              <div style="color:#9CA3AF;font-size:12px;">Invoice number</div>
              <div style="color:#E5E7EB;font-size:16px;font-weight:700;margin-top:6px;">${esc(invoiceNumber)}</div>
            </div>
            <div style="background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
              <div style="color:#9CA3AF;font-size:12px;">Status</div>
              <div style="color:#E5E7EB;font-size:16px;font-weight:700;margin-top:6px;">${esc(String(invoice.status || "Draft"))}</div>
            </div>
            <div style="background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
              <div style="color:#9CA3AF;font-size:12px;">Issue date</div>
              <div style="color:#E5E7EB;font-size:16px;font-weight:700;margin-top:6px;">${esc(String(invoice.issue_date || "—"))}</div>
            </div>
            <div style="background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
              <div style="color:#9CA3AF;font-size:12px;">Due date</div>
              <div style="color:#E5E7EB;font-size:16px;font-weight:700;margin-top:6px;">${esc(String(invoice.due_date || "—"))}</div>
            </div>
            <div style="background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
              <div style="color:#9CA3AF;font-size:12px;">Total</div>
              <div style="color:#E5E7EB;font-size:16px;font-weight:700;margin-top:6px;">R ${esc(total)}</div>
            </div>
            <div style="background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
              <div style="color:#9CA3AF;font-size:12px;">Balance due</div>
              <div style="color:#E5E7EB;font-size:16px;font-weight:700;margin-top:6px;">R ${esc(balance)}</div>
            </div>
          </div>

          ${
            viewUrl
              ? `<div style="margin-top:18px;">
                  <a href="${esc(viewUrl)}" style="display:inline-block;background:#2563EB;color:white;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;">
                    View invoice
                  </a>
                </div>`
              : ""
          }

          <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:18px 0 0 0;">
            Sent by Kryvexis • Support: kryvexissolutions@gmail.com • WhatsApp: +27686282874
          </p>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Invoice ${invoiceNumber}`,
    `Client: ${clientName}`,
    `Status: ${invoice.status || "Draft"}`,
    `Issue date: ${invoice.issue_date || "—"}`,
    `Due date: ${invoice.due_date || "—"}`,
    `Total: R ${total}`,
    `Balance due: R ${balance}`,
    customMessage ? `Message: ${customMessage}` : "",
    viewUrl ? `View invoice: ${viewUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    invoice,
    recipient,
    subject,
    html,
    text,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const companyId = await getCompanyIdOrNull();
    if (!companyId) {
      return NextResponse.json({ ok: false, error: "No active company" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const invoiceId = String(body?.invoiceId || "").trim();
    if (!invoiceId) {
      return NextResponse.json({ ok: false, error: "invoiceId is required" }, { status: 400 });
    }

    const built = await buildInvoiceEmail({
      invoiceId,
      companyId,
      to: body?.to,
      subject: body?.subject,
      message: body?.message,
    });

    await sendAppEmail({
      to: built.recipient,
      subject: built.subject,
      html: built.html,
      text: built.text,
    });

    await logEmailEvent({
      companyId,
      eventType: "sent",
      recipient: built.recipient,
      entityType: "invoice",
      entityId: built.invoice.id,
      meta: {
        subject: built.subject,
        via: process.env.EMAIL_SMTP_HOST ? "smtp" : process.env.BREVO_API_KEY ? "brevo" : "unknown",
      },
    });

    try {
      const service = createServiceClient(
        env("NEXT_PUBLIC_SUPABASE_URL"),
        env("SUPABASE_SERVICE_ROLE_KEY")
      );

      const currentStatus = String(built.invoice?.status || "Draft");
      if (currentStatus === "Draft") {
        await service.from("invoices").update({ status: "Sent" }).eq("id", built.invoice.id);
      }

      await service.from("activity_logs").insert({
        company_id: companyId,
        user_id: auth.user.id,
        entity_type: "invoice",
        entity_id: built.invoice.id,
        action: "sent_email",
      });
    } catch {
      // keep send non-blocking if activity log / service role setup is incomplete
    }

    return NextResponse.json({
      ok: true,
      recipient: built.recipient,
      subject: built.subject,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const mode = url.searchParams.get("mode") || "daily";
    const day = url.searchParams.get("day") || "";

    if (!companyId) {
      return new NextResponse(GIF, {
        headers: { "content-type": "image/gif", "cache-control": "no-store" },
      });
    }

    const supabase = createServiceClient(
      env("NEXT_PUBLIC_SUPABASE_URL"),
      env("SUPABASE_SERVICE_ROLE_KEY")
    );

    await supabase.from("email_events").insert({
      company_id: companyId,
      event_type: "open",
      meta: { mode, day, ua: req.headers.get("user-agent") ?? "" },
    });

    return new NextResponse(GIF, {
      headers: { "content-type": "image/gif", "cache-control": "no-store" },
    });
  } catch {
    return new NextResponse(GIF, {
      headers: { "content-type": "image/gif", "cache-control": "no-store" },
    });
  }
}
