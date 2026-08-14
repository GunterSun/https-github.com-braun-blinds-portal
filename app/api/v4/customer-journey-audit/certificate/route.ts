import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customerJourneyAcceptances } from "@/db/schema";
import { getCurrentAppUser, sha256, writeAuditLog } from "@/lib/v4-auth";

type Snapshot = {
  property: { id: number; name: string; address: string };
  checks: { labelZh: string; labelEn: string; pass: boolean; evidence: string }[];
  summary: Record<string, number>;
};

export async function GET(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const acceptanceId = Number(request.nextUrl.searchParams.get("acceptance"));
  const db = await getDb();
  const acceptance = (await db.select().from(customerJourneyAcceptances).where(eq(customerJourneyAcceptances.id, acceptanceId)).limit(1))[0];
  if (!acceptance) return NextResponse.json({ error: "Acceptance not found" }, { status: 404 });
  if (await sha256(acceptance.evidenceJson) !== acceptance.evidenceSha256) return NextResponse.json({ error: "Acceptance integrity check failed" }, { status: 409 });
  const snapshot = JSON.parse(acceptance.evidenceJson) as Snapshot;
  if (!snapshot.checks.length || snapshot.checks.some(check => !check.pass)) return NextResponse.json({ error: "Acceptance evidence is incomplete" }, { status: 409 });
  await writeAuditLog({ userId: user.id, action: "customer_journey_acceptance_certificate_viewed", entityType: "customer_journey_acceptance", entityId: String(acceptance.id), details: { propertyId: acceptance.propertyId, evidenceSha256: acceptance.evidenceSha256 } });
  return NextResponse.json({ certificate: { id: acceptance.id, propertyId: acceptance.propertyId, certifiedAt: acceptance.certifiedAt, evidenceSha256: acceptance.evidenceSha256, snapshot } }, { headers: { "Cache-Control": "private, no-store" } });
}
