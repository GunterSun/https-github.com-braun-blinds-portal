/** AI intake contract. No quote issuance, payment, or supplier order side effects. */
export type IntakeSourceKind = 'image' | 'excel' | 'pdf' | 'text';
export type IntakeStatus = 'needs_review' | 'ready_for_review' | 'rejected';
export type IntakeField = 'customerId' | 'productCode' | 'fabricCode' | 'widthInches' | 'heightInches' | 'quantity' | 'color' | 'mount' | 'control' | 'notes';
export type Evidence = { sourceId: string; sheet?: string; row?: number; page?: number; excerpt?: string };
export type IntakeValue<T> = { value: T | null; evidence: Evidence[]; verifiedByHuman: boolean };
export type IntakeLine = {
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
  sourceName: string; customerId: number | null; lines: IntakeLine[];
  warnings: string[]; status: IntakeStatus; createdByUserId: number;
  createdAt: string; updatedAt: string;
};
export type IntakeReview = { ready: boolean; blocking: string[] };
export function reviewIntakeDraft(draft: IntakeDraft): IntakeReview {
  const blocking: string[] = [];
  if (!Number.isInteger(draft.customerId) || (draft.customerId ?? 0) <= 0) blocking.push('customerId');
  if (!draft.lines.length) blocking.push('lines');
  for (const [index, line] of draft.lines.entries()) {
    for (const key of ['productCode','widthInches','heightInches','quantity'] as const) {
      const field = line[key];
      if (field.value === null || !field.verifiedByHuman) blocking.push(`lines[${index}].${key}`);
    }
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
