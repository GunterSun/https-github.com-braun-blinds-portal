export type CurrencyCode = "USD" | "RMB";

export type ImportSource = {
  fileName: string;
  sheetName: string;
  rowNumber: number;
};

export type NormalizedImportRow = {
  source: ImportSource;
  recordType: "order" | "expense" | "payment" | "settlement" | "unknown";
  orderNumber: string;
  customer: string;
  project: string;
  product: string;
  quantity: number | null;
  amount: number | null;
  currency: CurrencyCode | null;
  status: string;
  notes: string;
  warnings: string[];
  raw: unknown[];
};

export function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function toAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Math.abs(value) > 10_000_000) return null;
    return Math.round(value * 100) / 100;
  }
  const text = cleanText(value).replace(/[$¥,]/g, "");
  if (!/^[-+]?\d+(?:\.\d+)?$/.test(text)) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || Math.abs(number) > 10_000_000) return null;
  return Math.round(number * 100) / 100;
}

export function normalizeOrderNumber(value: unknown) {
  const text = cleanText(value).toUpperCase();
  if (!text) return "";
  const cwf = text.match(/CWF\s*[-#:]?\s*(\d{5})/i);
  if (cwf) return `CWF ${cwf[1]}`;
  const five = text.match(/(?:^|\D)(\d{5})(?:\D|$)/);
  return five ? five[1] : text;
}

export function excelSerialToIso(value: unknown) {
  if (typeof value !== "number" || value < 20_000 || value > 80_000) return "";
  const utc = Date.UTC(1899, 11, 30) + Math.round(value) * 86_400_000;
  return new Date(utc).toISOString().slice(0, 10);
}

export function detectWorkbookType(sheetNames: string[]) {
  if (sheetNames.includes("Commerce订单汇总")) return "jin-commerce" as const;
  if (sheetNames.includes("汇总") && sheetNames.some((name) => ["Paul", "林", "彭"].includes(name))) {
    return "wholesale-sales" as const;
  }
  return "unknown" as const;
}

export function parseCommerceRows(fileName: string, sheetName: string, rows: unknown[][]): NormalizedImportRow[] {
  return rows.slice(4).map((row, index) => {
    const orderNumber = normalizeOrderNumber(row[1]);
    const amount = toAmount(row[9]);
    const warnings: string[] = [];
    if (!orderNumber) warnings.push("缺少订单号");
    if (amount === null) warnings.push("结算金额为空或无效");
    if (typeof row[3] === "number" && Math.abs(row[3]) > 10_000_000) warnings.push("发现异常长数字，未作为金额导入");
    return {
      source: { fileName, sheetName, rowNumber: index + 5 },
      recordType: "order",
      orderNumber,
      customer: cleanText(row[5]),
      project: cleanText(row[6]),
      product: cleanText(row[7]),
      quantity: toAmount(row[8]),
      amount,
      currency: amount === null ? null : "USD",
      status: cleanText(row[11]),
      notes: [cleanText(row[2]), cleanText(row[3]), cleanText(row[12])].filter(Boolean).join(" | "),
      warnings,
      raw: row,
    };
  }).filter((row) => row.orderNumber || row.customer || row.amount !== null);
}

export function parseExpenseSheet(fileName: string, sheetName: string, rows: unknown[][]): NormalizedImportRow[] {
  const result: NormalizedImportRow[] = [];
  rows.forEach((row, index) => {
    const usd = toAmount(row[5]);
    const rmb = toAmount(row[6]);
    const payee = cleanText(row[3]);
    const description = cleanText(row[4]);
    if (!payee && usd === null && rmb === null) return;
    const base = {
      source: { fileName, sheetName, rowNumber: index + 1 },
      recordType: "expense" as const,
      orderNumber: normalizeOrderNumber(`${description} ${cleanText(row[7])}`),
      customer: payee,
      project: "",
      product: description,
      quantity: null,
      status: "",
      notes: cleanText(row[7]),
      warnings: [] as string[],
      raw: row,
    };
    if (usd !== null) result.push({ ...base, amount: usd, currency: "USD" });
    if (rmb !== null) result.push({ ...base, amount: rmb, currency: "RMB" });
  });
  return result;
}

export function findDuplicates(rows: NormalizedImportRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = [row.recordType, row.orderNumber, row.customer.toLowerCase(), row.product.toLowerCase(), row.amount, row.currency].join("|");
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return rows.map((row) => {
    const key = [row.recordType, row.orderNumber, row.customer.toLowerCase(), row.product.toLowerCase(), row.amount, row.currency].join("|");
    return counts.get(key)! > 1 ? { ...row, warnings: [...row.warnings, "疑似重复记录"] } : row;
  });
}
