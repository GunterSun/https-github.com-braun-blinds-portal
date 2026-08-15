import { and, desc, eq, inArray, max } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customerPropertyAccess, customerQuoteVersions, workflowArtifacts, workflowHandoffs } from "@/db/schema";
import { customerQuoteShipping } from "@/db/quote-shipping";
import { getCurrentAppUser, sha256, writeAuditLog } from "@/lib/v4-auth";
import { findZSeriesItem, validateZSeriesDimensions, zSeriesWholesalePrice } from "@/app/z-series-data";

type ZLine = { room?: string; windowCode?: string; fabricCode?: string; productCode?: string; width?: number; height?: number; depth?: number; quantity?: number };
const money = (v: unknown) => Math.round(Number(v) * 100) / 100;
const publicQuote = (q: typeof customerQuoteVersions.$inferSelect, shipping: number) => ({
  id: q.id, quoteNumber: q.quoteNumber, version: q.version, propertyId: q.propertyId, status: q.status,
  currency: q.currency, subtotal: q.subtotal, discountAmount: q.discountAmount, taxAmount: q.taxAmount,
  installationFee: q.installationFee, shippingFee: shipping, depositRequired: q.depositRequired,
  total: q.total, balance: q.total - q.depositRequired, terms: q.terms, validUntil: q.validUntil,
  source: JSON.parse(q.sourceSnapshotJson), documentSha256: q.documentSha256, createdAt: q.createdAt, signedAt: q.signedAt,
});

export async function GET() {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "需要登录 / Authentication required" }, { status: 401 });
  const db = await getDb();
  let quotes: typeof customerQuoteVersions.$inferSelect[] = [];
  if (user.role === "owner") {
    quotes = await db.select().from(customerQuoteVersions).orderBy(desc(customerQuoteVersions.createdAt)).limit(300);
  } else if (user.role === "customer") {
    const grants = await db.select({ propertyId: customerPropertyAccess.propertyId }).from(customerPropertyAccess)
      .where(and(eq(customerPropertyAccess.userId, user.id), eq(customerPropertyAccess.status, "active")));
    const ids = grants.map(x => x.propertyId);
    if (!ids.length) return NextResponse.json({ quotes: [] });
    quotes = await db.select().from(customerQuoteVersions)
      .where(and(inArray(customerQuoteVersions.propertyId, ids), inArray(customerQuoteVersions.status, ["issued", "option_selected", "signed", "declined"])))
      .orderBy(desc(customerQuoteVersions.createdAt));
  } else return NextResponse.json({ error: "无权限 / Permission denied" }, { status: 403 });
  const ids = quotes.map(q => q.id);
  const shippingRows = ids.length ? await db.select().from(customerQuoteShipping).where(inArray(customerQuoteShipping.quoteVersionId, ids)) : [];
  const shipping = new Map(shippingRows.map(x => [x.quoteVersionId, x.amount]));
  const zQuotes = quotes.filter(q => {
    try { return JSON.parse(q.sourceSnapshotJson)?.zSeries?.source === "Z_Series_Customer_Price_List_CN_EN.xlsx"; } catch { return false; }
  });
  return NextResponse.json({ quotes: zQuotes.map(q => publicQuote(q, shipping.get(q.id) ?? 0)) });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "owner") return NextResponse.json({ error: "仅管理员可签发 / Owner only" }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "请求格式错误 / Invalid request" }, { status: 400 }); }
  const handoffId = Number(body.handoffId);
  const lines = Array.isArray(body.lines) ? body.lines as ZLine[] : [];
  const priceMode = body.priceMode === "wholesale" ? "wholesale" : "retail";
  const discountPercent = Math.max(0, Math.min(100, Number(body.discountPercent ?? 0)));
  const tax = money(body.taxAmount ?? 0), installation = money(body.installationFee ?? 0), shipping = money(body.shippingFee ?? 0), deposit = money(body.depositRequired ?? 0);
  const validUntil = String(body.validUntil ?? ""), terms = String(body.terms ?? "").slice(0, 4000);
  if (!handoffId || !lines.length || ![tax, installation, shipping, deposit].every(v => Number.isFinite(v) && v >= 0) || !/^\d{4}-\d{2}-\d{2}/.test(validUntil))
    return NextResponse.json({ error: "请填写有效报价资料 / Valid quote data required" }, { status: 400 });

  const pricedLines = [] as Array<Record<string, unknown>>;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const item = findZSeriesItem(String(line.fabricCode ?? ""), String(line.productCode ?? ""));
    if (!item) return NextResponse.json({ error: `第 ${i + 1} 行产品组合无效 / Invalid product combination on line ${i + 1}` }, { status: 400 });
    const width = Number(line.width), height = Number(line.height), depth = Number(line.depth), quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const dimensionErrors = validateZSeriesDimensions(item, width, height, depth);
    if (dimensionErrors.length) return NextResponse.json({ error: `第 ${i + 1} 行尺寸超出限制 / Dimension limits failed on line ${i + 1}`, dimensionErrors }, { status: 400 });
    const unitPrice = priceMode === "wholesale" ? zSeriesWholesalePrice(item.retail, discountPercent) : item.retail;
    pricedLines.push({ room: String(line.room ?? ""), windowCode: String(line.windowCode ?? ""), fabricCode: item.fabricCode, productCode: item.productCode,
      descriptionZh: item.descriptionZh, descriptionEn: item.descriptionEn, systemZh: item.systemZh, systemEn: item.systemEn, styleZh: item.styleZh, styleEn: item.styleEn,
      structureZh: item.structureZh, structureEn: item.structureEn, constructionZh: item.constructionZh, constructionEn: item.constructionEn,
      width, height, depth, quantity, unitPrice, lineTotal: money(unitPrice * quantity), currency: "USD" });
  }
  const subtotal = money(pricedLines.reduce((s, x) => s + Number(x.lineTotal), 0));
  const discountAmount = 0; // Wholesale mode already applies the approved account discount to each unit price.
  const total = money(subtotal - discountAmount + tax + installation + shipping);
  if (deposit > total) return NextResponse.json({ error: "定金不能超过总额 / Deposit cannot exceed total" }, { status: 400 });

  const db = await getDb();
  const handoff = (await db.select().from(workflowHandoffs).where(eq(workflowHandoffs.id, handoffId)).limit(1))[0];
  if (!handoff) return NextResponse.json({ error: "未找到报价交接记录 / Handoff not found" }, { status: 404 });
  const baseSource = JSON.parse(handoff.sourceSnapshotJson), customerId = Number(baseSource.property?.customerId), propertyId = Number(baseSource.property?.id);
  if (!customerId || !propertyId) return NextResponse.json({ error: "项目必须关联客户和房屋 / Property must be linked to Customer" }, { status: 409 });
  const quoteNumber = `Q-${String(handoff.id).padStart(5, "0")}`;
  const latest = await db.select({ v: max(customerQuoteVersions.version) }).from(customerQuoteVersions).where(eq(customerQuoteVersions.quoteNumber, quoteNumber));
  const version = Number(latest[0]?.v ?? 0) + 1;
  const source = { ...baseSource, zSeries: { source: "Z_Series_Customer_Price_List_CN_EN.xlsx", currency: "USD", priceMode, discountPercent: priceMode === "wholesale" ? discountPercent : 0, installationIncluded: false, shippingIncluded: false, lines: pricedLines } };
  const document = { quoteNumber, version, sourceHash: handoff.sourceHash, source, customerVisible: { currency: "USD", subtotal, discountAmount, taxAmount: tax, installationFee: installation, shippingFee: shipping, depositRequired: deposit, total, terms, validUntil } };
  const documentSha256 = await sha256(JSON.stringify(document));
  const created = (await db.insert(customerQuoteVersions).values({ quoteNumber, version, customerId, propertyId, handoffId, currency: "USD", subtotal, discountAmount,
    taxAmount: tax, installationFee: installation, depositRequired: deposit, total, terms, validUntil, renderingUrlsJson: "[]", optionsJson: "[]", selectedOptionIdsJson: "[]",
    sourceSnapshotJson: JSON.stringify(source), documentSha256, createdBy: user.id }).returning())[0];
  await db.insert(customerQuoteShipping).values({ quoteVersionId: created.id, amount: shipping, currency: "USD", createdAt: new Date().toISOString() });
  await db.update(workflowArtifacts).set({ status: "issued", externalRecordId: String(created.id) })
    .where(and(eq(workflowArtifacts.handoffId, handoffId), eq(workflowArtifacts.artifactType, "quote")));
  await writeAuditLog({ userId: user.id, action: "z_series_quote_issued", entityType: "customer_quote_version", entityId: String(created.id), details: { quoteNumber, version, handoffId, shipping, documentSha256 } });
  return NextResponse.json({ quote: publicQuote(created, shipping) }, { status: 201 });
}
