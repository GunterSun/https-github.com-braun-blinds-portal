export type ImportCurrency = "USD" | "CNY";

export type ImportWarningCode =
  | "MISSING_ORDER_NUMBER"
  | "MISSING_AMOUNT"
  | "AMBIGUOUS_AMOUNT"
  | "MERGED_REMITTANCE"
  | "DUPLICATE_PO_PRODUCT_LINE"
  | "SUSPICIOUS_LONG_NUMBER"
  | "EXCEL_SERIAL_DATE"
  | "MANUAL_REVIEW_REQUIRED";

export type ImportWarning = {
  code: ImportWarningCode;
  messageZh: string;
  messageEn: string;
};

export type NormalizedMoney = {
  amount: number;
  currency: ImportCurrency;
  sourceColumn: string;
};

export function normalizePoNumber(value: unknown) {
  const raw = String(value ?? "").trim().toUpperCase();
  if (!raw) return "";
  const digits = raw.replace(/^CWF\s*/i, "").replace(/[^0-9]/g, "");
  return digits ? `CWF ${digits}` : raw;
}

export function normalizeOrderNumber(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.replace(/\.0$/, "");
}

export function detectExcelSerialDate(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 30000 && number <= 60000;
}

export function excelSerialToIso(value: number) {
  const utcDays = Math.floor(value - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  return date.toISOString().slice(0, 10);
}

export function detectSuspiciousLongNumber(value: unknown) {
  if (typeof value !== "number") return false;
  return Math.abs(value) >= 1_000_000_000;
}

export function parseUsdCny(input: {
  usd?: unknown;
  cny?: unknown;
  fallback?: unknown;
  fallbackCurrency?: ImportCurrency;
}): { money: NormalizedMoney[]; warnings: ImportWarning[] } {
  const money: NormalizedMoney[] = [];
  const warnings: ImportWarning[] = [];
  const usd = Number(input.usd);
  const cny = Number(input.cny);
  const fallback = Number(input.fallback);

  if (Number.isFinite(usd) && usd !== 0) money.push({ amount: usd, currency: "USD", sourceColumn: "USD" });
  if (Number.isFinite(cny) && cny !== 0) money.push({ amount: cny, currency: "CNY", sourceColumn: "CNY" });
  if (money.length === 0 && Number.isFinite(fallback) && fallback !== 0 && input.fallbackCurrency) {
    money.push({ amount: fallback, currency: input.fallbackCurrency, sourceColumn: "fallback" });
  }
  if (money.length === 0) {
    warnings.push({
      code: "MISSING_AMOUNT",
      messageZh: "没有识别到金额，必须人工确认。",
      messageEn: "No amount was detected; manual confirmation is required.",
    });
  }
  return { money, warnings };
}

export const REAL_WORKBOOK_RULES = {
  wholesaleSales: {
    workbookNames: ["批发销售"],
    sheets: {
      summary: "汇总",
      paul: "Paul",
      lin: "林",
      peng: "彭",
    },
    rules: [
      "汇总表没有固定列头，必须按行识别客户、日期、订单号、应收和分散支出。",
      "Paul、林、彭分表是对账/支出来源，不可与客户订单明细简单逐行合并。",
      "彭表 USD 与 RMB 为独立币种，禁止自动换算或把人民币写成美元。",
      "Excel 日期序号（如 46225、46230）必须转换为真实日期。",
      "备注、安装状态、Tracking 和分散费用必须保留原文。",
    ],
  },
  jinSummary: {
    workbookNames: ["jin汇总", "jin汇总1"],
    sheet: "Commerce订单汇总",
    rules: [
      "PO 号统一格式为 CWF + 数字，但同一 PO 可有多条产品明细。",
      "同一 PO 的 Roman 与 Drapery 行不能去重删除，应作为订单项目保留。",
      "已到账金额可能对应多张 PO，必须保存原始合并汇款说明，不得全部计入单张 PO。",
      "以前发邮件金额、结算金额和已到账金额含义不同，不能互相覆盖。",
      "差额允许正负值并保留两位小数。",
      "异常长数字（例如拼接的多张 PO）必须标记人工审核，不能作为金额入账。",
      "空结算金额必须保留并标记待核对，不能自动填 0。",
    ],
  },
} as const;
