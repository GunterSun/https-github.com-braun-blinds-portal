import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewIntakeDraft, mayReviewIntake } from '../../lib/ai/intake-contract.ts';
const field = (value, verifiedByHuman = true) => ({ value, evidence: [], verifiedByHuman });
const line = () => ({
  sourceWindowId: 'W01', productCode: field('JL3601'),
  fabricCode: field(null, false), widthInches: field(39.625),
  heightInches: field(40.625), quantity: field(1),
  color: field(null, false), mount: field(null, false),
  control: field(null, false), notes: [],
});
const draft = () => ({
  id: 'sample', sourceKind: 'text', sourceHash: 'samplehash',
  sourceName: 'example.txt', customerId: 1, lines: [line()],
  warnings: [], status: 'needs_review', createdByUserId: 1,
  createdAt: '2026-11-24T00:00:00Z', updatedAt: '2026-11-24T00:00:00Z',
});
test('verified mandatory fields allow review readiness', () => assert.equal(reviewIntakeDraft(draft()).ready, true));
test('missing customer blocks readiness', () => {
  const d = draft(); d.customerId = null;
  assert.ok(reviewIntakeDraft(d).blocking.includes('customerId'));
});
test('unverified AI dimension blocks readiness', () => {
  const d = draft(); d.lines[0].widthInches.verifiedByHuman = false;
  assert.ok(reviewIntakeDraft(d).blocking.includes('lines[0].widthInches'));
});
test('conflicts block readiness', () => {
  const d = draft(); d.warnings.push('conflicting measurements');
  assert.ok(reviewIntakeDraft(d).blocking.includes('unresolvedWarnings'));
});
test('invalid quantities block readiness', () => {
  const d = draft(); d.lines[0].quantity.value = 1.5;
  assert.ok(reviewIntakeDraft(d).blocking.includes('lines[0].quantity.invalid'));
});
test('customer and supplier cannot review intake', () => {
  assert.equal(mayReviewIntake('customer'), false);
  assert.equal(mayReviewIntake('supplier'), false);
  assert.equal(mayReviewIntake('owner'), true);
});
