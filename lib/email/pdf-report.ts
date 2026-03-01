import { PDFDocument, StandardFonts } from "pdf-lib";

export async function makeSummaryPdf(opts: {
  companyName: string;
  title: string;
  range: string;
  income: number;
  profit: number;
  overdueCount: number;
  overdueBalance: number;
  lowStock: Array<{ name: string; sku?: string; stock: number; threshold: number }>;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const line = (t: string, b = false, size = 12) => {
    page.drawText(t, { x: 50, y, size, font: b ? bold : font });
    y -= size + 10;
  };

  line("Kryvexis OS", true, 18);
  line(opts.title, true, 14);
  line(`${opts.companyName}`, false, 12);
  line(`Range: ${opts.range}`, false, 12);
  y -= 10;

  line(`Sales (Income): R ${opts.income.toFixed(2)}`, true);
  line(`Profit: R ${opts.profit.toFixed(2)}`, true);
  line(`Overdue invoices: ${opts.overdueCount} (Balance due R ${opts.overdueBalance.toFixed(2)})`, true);

  y -= 10;
  line("Low stock:", true);
  if (opts.lowStock.length === 0) line("None", false);
  for (const p of opts.lowStock.slice(0, 10)) {
    line(`- ${p.name}${p.sku ? ` (${p.sku})` : ""} — ${p.stock}/${p.threshold}`, false, 11);
    if (y < 80) break;
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}