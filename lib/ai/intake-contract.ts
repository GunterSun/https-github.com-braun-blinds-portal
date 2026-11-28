/** AI intake contract. No quote issuance, payment, or supplier order side effects. */
export type IntakeSourceKind = 'image' | 'excel' | 'pdf' | 'text';
export type IntakeStatus = 'needs_review' | 'ready_for_review' | 'rejected';
export type IntakeField = 'customerId' | 'productCode' | 'fabricCode' | 'widthInches' | 'heightInches' | 'quantity' | 'color' | 'mount' | 'control' | 'notes';
export type Evidence = { sourceId: string; sheet?: string; row?: number; column?: number; header?: string; page?: number; excerpt?: string };
export type IntakeValue<T> = { value: T | null; evidence: Evidence[]; verifiedByHuman: boolean; rawValue?: string | null };
export type IntakeRevision = { field: IntakeField | 'sourceWindowId'; previous: string; next: string; recordedAt: string; editedByUserId: number; evidence?: Evidence[] };
export type IntakeLine = {
  originalCustomerText?: string; sourceRow?: number; sourceSheet?: string; sourceId?: string; revisions?: IntakeRevision[];
  sourceWindowId: string | null;
  productCode: IntakeValue<string>;
  fabricCode: IntakeValue<string>;
  widthInches: IntakeValue<number>;
  heightInches: IntakeValue<number>;
  quantity: IntakeValue<number>;
  color: IntakeValue<string>;
  mount: IntakeValue<string>;
  control: IntakeValue<string>;
  notes: string[];
};
export type IntakeDraft = {
  id: string; sourceKind: IntakeSourceKind; sourceHash: string;
  sourceName: string; customerId: number | null; lines: IntakeLine[]; originalCustomerText?: string; revisions?: IntakeRevision[];
  warnings: string[]; status: IntakeStatus; createdByUserId: number;
  createdAt: string; updatedAt: string;
};
export type IntakeReview = { ready: boolean; blocking: string[] };
export function reviewIntakeDraft(draft: IntakeDraft): IntakeReview {
  const blocking: string[] = [];
  if (!Number.isInteger(draft.customerId) || (draft.customerId ?? 0) <= 0) blocking.push('customerId');
  if (!draft.lines.length) blocking.push('lines');
  const seen = new Set<string>();
  for (const [index, line] of draft.lines.entries()) {
    const id = line.sourceWindowId?.trim();
    if (!id) blocking.push(`lines[${index}].sourceWindowId`);
    else { const canonical = id.toUpperCase(); if (seen.has(canonical)) blocking.push(`lines[${index}].sourceWindowId.duplicate`); seen.add(canonical); }
    for (const key of ['productCode','widthInches','heightInches','quantity'] as const) {
      const field = line[key];
      if (field.value === null || !field.verifiedByHuman) blocking.push(`lines[${index}].${key}`);
    }
    if (typeof line.productCode.value === 'string' && !line.productCode.value.trim()) blocking.push(`lines[${index}].productCode.invalid`);
    if (line.revisions?.some(revision => !revision.recordedAt || !Number.isSafeInteger(revision.editedByUserId) || revision.editedByUserId <= 0)) blocking.push(`lines[${index}].revisions.invalid`);
    for (const key of ['widthInches','heightInches','quantity'] as const) {
      const value = line[key].value;
      if (value !== null && (!Number.isFinite(value) || value <= 0 || (key === 'quantity' && !Number.isSafeInteger(value)))) {
        blocking.push(`lines[${index}].${key}.invalid`);
      }
    }
  }
  if (draft.warnings.length) blocking.push('unresolvedWarnings');
  return { ready: blocking.length === 0, blocking };
}
/** Approval is a separate server-side action. This function cannot issue quotes or orders. */
export function mayReviewIntake(role: string): boolean {
  return role === 'owner' || role === 'admin' || role === 'sales';
}
