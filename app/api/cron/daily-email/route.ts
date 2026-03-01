import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function todayISO(timeZone = "Africa/Johannesburg") {
  // YYYY-MM-DD in the chosen timezone
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function money(n: number) {
  // simple, safe formatting
  const v = Number.isFinite(n) ? n : 0;
  return v.toFixed(2);
}

async function sendBrevoEmail(opts: { to: string; subject: string; html: string }) {
  const apiKey = env("BREVO_API_KEY");
  const fromEmail = env("EMAIL_FROM");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: "Kryvexis" },
      to: [{ email: opts.to }],
      subject: opts.subject,
      htmlContent: opts.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo send failed (${res.status}): ${text || res.statusText}`);
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    const dryRun = url.searchParams.get("dryRun") === "1";

    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
    const tz = process.env.KX_TIMEZONE || "Africa/Johannesburg";
    const today = todayISO(tz);

    const { data: companies, error: companiesErr } = await supabase
      .from("companies")
      .select("id,name,email")
      .not("email", "is", null);

    if (companiesErr) {
      return NextResponse.json({ ok: false, error: companiesErr.message }, { status: 500 });
    }

    let sent = 0;
    let failed = 0;
    const failures: Array<{ companyId: string; email: string; error: string }> = [];

    for (const c of companies ?? []) {
      const companyId = c.id as string;
      const companyName = (c.name as string) || "Your Company";
      const toEmail = c.email as string;

      // SALES + PROFIT (from transactions)
      const { data: txs, error: txErr } = await supabase
        .from("transactions")
        .select("kind,amount,tx_date")
        .eq("company_id", companyId)
        .eq("tx_date", today);

      if (txErr) {
        failed++;
        failures.push({ companyId, email: toEmail, error: `transactions: ${txErr.message}` });
        continue;
      }

      let income = 0;
      let expense = 0;
      for (const t of txs ?? []) {
        const amt = Number((t as any).amount ?? 0);
        if ((t as any).kind === "income") income += amt;
        if ((t as any).kind === "expense") expense += amt;
      }
      const profit = income - expense;

      // OVERDUE invoices
      const { data: overdue, error: invErr } = await supabase
        .from("invoices")
        .select("id,number,status,due_date,total,balance_due")
        .eq("company_id", companyId)
        .or(`status.eq.Overdue,and(due_date.lt.${today},status.in.(Sent,"Partially Paid"))`);

      if (invErr) {
        failed++;
        failures.push({ companyId, email: toEmail, error: `invoices: ${invErr.message}` });
        continue;
      }

      const overdueCount = (overdue ?? []).length;
      const overdueBalance = (overdue ?? []).reduce((sum, r: any) => sum + Number(r.balance_due ?? 0), 0);

      // LOW STOCK
      // We fetch a reasonable batch and filter in code (avoids complex SQL / column-to-column comparisons).
      const { data: products, error: prodErr } = await supabase
        .from("products")
        .select("name,sku,stock_on_hand,low_stock_threshold")
        .eq("company_id", companyId)
        .not("stock_on_hand", "is", null)
        .not("low_stock_threshold", "is", null)
        .order("stock_on_hand", { ascending: true })
        .limit(500);

      let lowStockRows: any[] = [];
      if (!prodErr) {
        lowStockRows = (products ?? []).filter((p: any) => Number(p.stock_on_hand) <= Number(p.low_stock_threshold));
        lowStockRows = lowStockRows.slice(0, 10);
      }

      const lowStockHtml =
        lowStockRows.length === 0
          ? `<div style="color:#9CA3AF;font-size:13px;">No low-stock items today.</div>`
          : `<table style="width:100%;border-collapse:collapse;margin-top:8px;">
              <thead>
                <tr>
                  <th align="left" style="padding:8px;border-bottom:1px solid #222;color:#9CA3AF;font-size:12px;">Product</th>
                  <th align="right" style="padding:8px;border-bottom:1px solid #222;color:#9CA3AF;font-size:12px;">Stock</th>
                  <th align="right" style="padding:8px;border-bottom:1px solid #222;color:#9CA3AF;font-size:12px;">Threshold</th>
                </tr>
              </thead>
              <tbody>
                ${lowStockRows
                  .map(
                    (p: any) => `
                    <tr>
                      <td style="padding:8px;border-bottom:1px solid #151515;color:#E5E7EB;font-size:13px;">
                        ${String(p.name ?? "Item")}
                        <span style="color:#6B7280;font-size:12px;">${p.sku ? ` • ${String(p.sku)}` : ""}</span>
                      </td>
                      <td align="right" style="padding:8px;border-bottom:1px solid #151515;color:#E5E7EB;font-size:13px;">${Number(
                        p.stock_on_hand ?? 0
                      )}</td>
                      <td align="right" style="padding:8px;border-bottom:1px solid #151515;color:#9CA3AF;font-size:13px;">${Number(
                        p.low_stock_threshold ?? 0
                      )}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>`;

      const subject = `Kryvexis Daily Summary — ${companyName} — ${today}`;
      const html = `
        <div style="background:#0B0F17;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;">
          <div style="max-width:720px;margin:0 auto;background:#0F172A;border:1px solid #1F2937;border-radius:16px;overflow:hidden;">
            <div style="padding:18px 20px;border-bottom:1px solid #1F2937;">
              <div style="font-size:14px;color:#9CA3AF;">Kryvexis OS</div>
              <div style="font-size:20px;color:#E5E7EB;font-weight:700;margin-top:4px;">Daily Summary</div>
              <div style="font-size:13px;color:#9CA3AF;margin-top:4px;">${companyName} • ${today}</div>
            </div>

            <div style="padding:20px;display:block;">
              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <div style="flex:1;min-width:210px;background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
                  <div style="color:#9CA3AF;font-size:12px;">Sales (Income)</div>
                  <div style="color:#E5E7EB;font-size:22px;font-weight:800;margin-top:6px;">R ${money(income)}</div>
                </div>
                <div style="flex:1;min-width:210px;background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
                  <div style="color:#9CA3AF;font-size:12px;">Profit (Income − Expenses)</div>
                  <div style="color:#E5E7EB;font-size:22px;font-weight:800;margin-top:6px;">R ${money(profit)}</div>
                </div>
                <div style="flex:1;min-width:210px;background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
                  <div style="color:#9CA3AF;font-size:12px;">Overdue Invoices</div>
                  <div style="color:#E5E7EB;font-size:22px;font-weight:800;margin-top:6px;">${overdueCount}</div>
                  <div style="color:#9CA3AF;font-size:12px;margin-top:4px;">Balance due: R ${money(overdueBalance)}</div>
                </div>
              </div>

              <div style="margin-top:18px;background:#0B1220;border:1px solid #1F2937;border-radius:12px;padding:14px;">
                <div style="color:#E5E7EB;font-weight:700;">Low stock</div>
                ${lowStockHtml}
              </div>

              <div style="margin-top:18px;color:#9CA3AF;font-size:12px;line-height:1.5;">
                Tip: Use the Import Station to keep your stock & clients updated. This email is automated per company.
              </div>
            </div>

            <div style="padding:14px 20px;border-top:1px solid #1F2937;color:#6B7280;font-size:12px;">
              Sent by Kryvexis • Support: kryvexissolutions@gmail.com • WhatsApp: +27686282874
            </div>
          </div>
        </div>
      `;

      try {
        if (!dryRun) await sendBrevoEmail({ to: toEmail, subject, html });
        sent++;
      } catch (e: any) {
        failed++;
        failures.push({ companyId, email: toEmail, error: e?.message ?? "send failed" });
      }
    }

    return NextResponse.json({ ok: true, today, dryRun, sent, failed, failures });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
