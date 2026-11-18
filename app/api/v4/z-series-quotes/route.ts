import { and, desc, eq, inArray, max, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customerPropertyAccess, customerQuoteShipping, customerQuoteVersions, workflowArtifacts, workflowHandoffs, zSeriesQuoteIssuanceOperations } from "@/db/schema";
import { getCurrentAppUser, sha256, writeAuditLog } from "@/lib/v4-auth";
import {Z_SERIES_CATALOG} from "@/app/z-series-data";
import {buildZSeriesLines,lineHandoffIds,type ZLineInput} from "@/lib/z-series-formal";

type ZLine = ZLineInput;
const money = (v: unknown) => Math.round(Number(v) * 100) / 100;
const publicQuote = (q: typeof customerQuoteVersions.$inferSelect, shipping: number) => ({
  id: q.id, quoteNumber: q.quoteNumber, version: q.version, propertyId: q.propertyId, status: q.status,
  currency: q.currency, subtotal: q.subtotal, discountAmount: q.discountAmount, taxAmount: q.taxAmount,
  installationFee: q.installationFee, shippingFee: shipping, depositRequired: q.depositRequired,
  total: q.total, balance: q.total - q.depositRequired, terms: q.terms, validUntil: q.validUntil,
  source: JSON.parse(q.sourceSnapshotJson), documentSha256: q.documentSha256, createdAt: q.createdAt, signedAt: q.signedAt,
});

export async function GET(request:Request) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "需要登录 / Authentication required" }, { status: 401 });
  const db = await getDb();
  if (new URL(request.url).searchParams.get('setup')==='1') {
    if(user.role!=="owner")return NextResponse.json({error:"Owner only"},{status:403});
    const handoffs=await db.select().from(workflowHandoffs).orderBy(desc(workflowHandoffs.createdAt)).limit(500);
    return NextResponse.json({items:Z_SERIES_CATALOG,handoffs:handoffs.map(h=>({id:h.id,revision:h.revision,source:JSON.parse(h.sourceSnapshotJson)}))},{headers:{'Cache-Control':'no-store'}});
  }
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
  const idempotencyKey = String(request.headers.get("idempotency-key") ?? "").trim();
  if (idempotencyKey.length < 16 || idempotencyKey.length > 200) return NextResponse.json({ error: "需要有效 Idempotency-Key / Valid Idempotency-Key required" }, { status: 400 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "请求格式错误 / Invalid request" }, { status: 400 }); }
  const handoffId = Number(body.handoffId);
  const lines = Array.isArray(body.lines) ? body.lines as ZLine[] : [];
  const priceMode = body.priceMode === "wholesale" ? "wholesale" : "retail";
  const discountPercent = Number(body.discountPercent ?? 0);
  const tax = money(body.taxAmount ?? 0), installation = money(body.installationFee ?? 0), shipping = money(body.shippingFee ?? 0), deposit = money(body.depositRequired ?? 0);
  const validUntil = String(body.validUntil ?? ""), terms = String(body.terms ?? "").slice(0, 4000);
  if (!handoffId || (lines.length < 1 || lines.length > 100) || !Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100 || ![tax, installation, shipping, deposit].every(v => Number.isFinite(v) && v >= 0) || !/^\d{4}-\d{2}-\d{2}/.test(validUntil))
    return NextResponse.json({ error: "请填写有效报价资料 / Valid quote data required" }, { status: 400 });

  const db = await getDb();
  const requestSha256 = await sha256(JSON.stringify(body));
  const replay = (await db.select().from(zSeriesQuoteIssuanceOperations).where(eq(zSeriesQuoteIssuanceOperations.idempotencyKey, idempotencyKey)).limit(1))[0];
  if (replay) {
    if (replay.requestSha256 !== requestSha256) return NextResponse.json({ error: "Idempotency-Key 已用于不同请求 / Idempotency-Key was already used for a different request" }, { status: 409 });
    if (!replay.quoteVersionId) return NextResponse.json({ error: "该签发请求仍在处理或需要老板复核 / Issuance is pending or requires Owner review" }, { status: 409 });
    const quote = (await db.select().from(customerQuoteVersions).where(eq(customerQuoteVersions.id, replay.quoteVersionId)).limit(1))[0];
    if (!quote) return NextResponse.json({ error: "签发记录需要老板复核 / Issuance record requires Owner review" }, { status: 409 });
    const shippingRow = (await db.select().from(customerQuoteShipping).where(eq(customerQuoteShipping.quoteVersionId, quote.id)).limit(1))[0];
    return NextResponse.json({ quote: publicQuote(quote, shippingRow?.amount ?? 0), reused: true });
  }

  let prepared: ReturnType<typeof buildZSeriesLines>;
  try {
    const ids=lineHandoffIds(lines,handoffId);
    const handoffs=await db.select().from(workflowHandoffs).where(inArray(workflowHandoffs.id,ids));
    prepared=buildZSeriesLines(lines,handoffId,handoffs,priceMode,discountPercent);
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Invalid quote lines"},{status:400}); }
  const {base:baseSource,customerId,propertyId,pricedLines,subtotal,handoffIds,sources}=prepared;
  const discountAmount=0;
  const total=money(subtotal+tax+installation+shipping);
  if(deposit>total)return NextResponse.json({error:"定金不能超过总额 / Deposit cannot exceed total"},{status:400});
  const handoff={id:handoffId,sourceHash:await sha256(JSON.stringify(sources.map(x=>({handoffId:x.handoffId,sourceHash:x.sourceHash}))))};
  const quoteNumber = `Q-${String(handoff.id).padStart(5, "0")}`;
  const latest = await db.select({ v: max(customerQuoteVersions.version) }).from(customerQuoteVersions).where(eq(customerQuoteVersions.quoteNumber, quoteNumber));
  const version = Number(latest[0]?.v ?? 0) + 1;
  const source = { ...baseSource, zSeries: { source: "Z_Series_Customer_Price_List_CN_EN.xlsx", currency: "USD", priceMode, discountPercent: priceMode === "wholesale" ? discountPercent : 0, installationIncluded: false, shippingIncluded: false, lines: pricedLines, handoffs: sources } };
  const document = { quoteNumber, version, sourceHash: handoff.sourceHash, source, customerVisible: { currency: "USD", subtotal, discountAmount, taxAmount: tax, installationFee: installation, shippingFee: shipping, depositRequired: deposit, total, terms, validUntil } };
  const documentSha256 = await sha256(JSON.stringify(document));
  // One D1 transaction: failures never leave a partial Quote or a stuck retry key.
  const quoteId=sql<number>`(SELECT id FROM customer_quote_versions WHERE quote_number=${quoteNumber} AND version=${version})`;
  try {
    await db.batch([
      db.insert(zSeriesQuoteIssuanceOperations).values({idempotencyKey,requestSha256}),
      db.insert(customerQuoteVersions).values({quoteNumber,version,customerId,propertyId,handoffId,currency:"USD",subtotal,discountAmount,
        taxAmount:tax,installationFee:installation,shippingFee:shipping,depositRequired:deposit,total,terms,validUntil,
        renderingUrlsJson:"[]",optionsJson:"[]",selectedOptionIdsJson:"[]",sourceSnapshotJson:JSON.stringify(source),documentSha256,createdBy:user.id}),
      db.insert(customerQuoteShipping).values({quoteVersionId:quoteId,amount:shipping,currency:"USD",createdAt:new Date().toISOString()}),
      db.update(zSeriesQuoteIssuanceOperations).set({quoteVersionId:quoteId}).where(eq(zSeriesQuoteIssuanceOperations.idempotencyKey,idempotencyKey)),
      db.update(workflowArtifacts).set({status:"issued",externalRecordId:sql`CAST(${quoteId} AS TEXT)`})
        .where(and(inArray(workflowArtifacts.handoffId,handoffIds),eq(workflowArtifacts.artifactType,"quote")))
    ]);
  } catch {
    const completed=(await db.select().from(zSeriesQuoteIssuanceOperations).where(eq(zSeriesQuoteIssuanceOperations.idempotencyKey,idempotencyKey)).limit(1))[0];
    if(completed?.quoteVersionId&&completed.requestSha256===requestSha256){
      const existing=(await db.select().from(customerQuoteVersions).where(eq(customerQuoteVersions.id,completed.quoteVersionId)).limit(1))[0];
      if(existing)return NextResponse.json({quote:publicQuote(existing,existing.shippingFee),reused:true});
    }
    return NextResponse.json({error:"报价签发未完成，请保留当前内容重试 / Quote was not issued; retry with the current form"},{status:409});
  }
  const created=(await db.select().from(customerQuoteVersions).where(and(eq(customerQuoteVersions.quoteNumber,quoteNumber),eq(customerQuoteVersions.version,version))).limit(1))[0];
  await writeAuditLog({ userId: user.id, action: "z_series_quote_issued", entityType: "customer_quote_version", entityId: String(created.id), details: { quoteNumber, version, handoffId, handoffIds, lineCount:pricedLines.length, shipping, documentSha256 } });
  return NextResponse.json({ quote: publicQuote(created, shipping) }, { status: 201 });
}
