import { and, eq, gt, isNull, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { appSessions, appUsers, auditLogs } from "@/db/schema";

export const V4_SESSION_COOKIE = "braun_v4_session";
const SESSION_DAYS = 14;
// Cloudflare Workers Web Crypto currently rejects PBKDF2 counts above 100,000.
// Keep this at the runtime maximum so hashing works identically during setup and login.
const PBKDF2_ITERATIONS = 100_000;

export type AppRole = "owner" | "sales" | "factory" | "installer" | "customer";

function hex(bytes: Uint8Array) {
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) return new Uint8Array();
  return new Uint8Array(value.match(/.{2}/g)?.map((part) => Number.parseInt(part, 16)) || []);
}

export async function sha256(value: string) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

export async function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return { hash: hex(new Uint8Array(derived)), salt: hex(salt) };
}

export async function verifyPassword(password: string, expectedHash: string, salt: string) {
  const actual = await hashPassword(password, salt);
  if (actual.hash.length !== expectedHash.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.hash.length; index += 1) {
    difference |= actual.hash.charCodeAt(index) ^ expectedHash.charCodeAt(index);
  }
  return difference === 0;
}

export function normalizeRole(value: string): AppRole | null {
  return ["owner", "sales", "factory", "installer", "customer"].includes(value)
    ? (value as AppRole)
    : null;
}

export async function createAppSession(userId: number) {
  const db = await getDb();
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  await db.insert(appSessions).values({ userId, tokenHash, expiresAt });
  return { token, expiresAt };
}

export async function getCurrentAppUser() {
  const token = (await cookies()).get(V4_SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const tokenHash = await sha256(token);
  const rows = await db
    .select({
      id: appUsers.id,
      email: appUsers.email,
      username: appUsers.username,
      displayName: appUsers.displayName,
      phone: appUsers.phone,
      role: appUsers.role,
      status: appUsers.status,
      customerId: appUsers.customerId,
      sessionId: appSessions.id,
    })
    .from(appSessions)
    .innerJoin(appUsers, eq(appSessions.userId, appUsers.id))
    .where(and(eq(appSessions.tokenHash, tokenHash), isNull(appSessions.revokedAt), gt(appSessions.expiresAt, new Date().toISOString())))
    .limit(1);
  const user = rows[0];
  if (!user || user.status !== "active" || !normalizeRole(user.role)) return null;
  return { ...user, role: user.role as AppRole };
}

export async function revokeCurrentAppSession() {
  const token = (await cookies()).get(V4_SESSION_COOKIE)?.value;
  if (!token) return;
  const db = await getDb();
  await db.update(appSessions).set({ revokedAt: new Date().toISOString() }).where(eq(appSessions.tokenHash, await sha256(token)));
}

export async function findLoginUser(login: string) {
  const normalized = login.trim().toLowerCase();
  const db = await getDb();
  const rows = await db
    .select()
    .from(appUsers)
    .where(or(eq(appUsers.email, normalized), eq(appUsers.username, normalized)))
    .limit(1);
  return rows[0] || null;
}

export async function writeAuditLog(input: {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const db = await getDb();
  await db.insert(auditLogs).values({
    userId: input.userId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId || "",
    detailsJson: JSON.stringify(input.details || {}),
    ipAddress: input.ipAddress || "",
  });
}
