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


test('duplicate IDs case-insensitive block review',()=>{
 const d=draft();d.lines.push({...line(),sourceWindowId:'w01'});
 assert.ok(reviewIntakeDraft(d).blocking.includes('lines[1].sourceWindowId.duplicate'));
});
test('missing original window ID blocks review',()=>{
 const d=draft();d.lines[0].sourceWindowId=null;
 assert.ok(reviewIntakeDraft(d).blocking.includes('lines[0].sourceWindowId'));
});
test('raw fractions and source evidence remain unchanged during review',()=>{
 const d=draft();d.lines[0].widthInches.rawValue='39 5/8';
 d.lines[0].widthInches.evidence=[{sourceId:'synthetic',row:2,column:3,excerpt:'39 5/8'}];
 d.lines[0].originalCustomerText='W01 39 5/8 x 40 5/8';
 assert.equal(reviewIntakeDraft(d).ready,true);
 assert.equal(d.lines[0].widthInches.rawValue,'39 5/8');
 assert.equal(d.lines[0].widthInches.evidence[0].column,3);
});
test('revision history preserved and invalid editor blocks review',()=>{
 const d=draft();d.lines[0].revisions=[{field:'widthInches',previous:'39 5/8',next:'39 1/2',recordedAt:'2026-11-24',editedByUserId:1}];
 assert.equal(reviewIntakeDraft(d).ready,true);
 assert.equal(d.lines[0].revisions[0].previous,'39 5/8');
 d.lines[0].revisions[0].editedByUserId=0;
 assert.ok(reviewIntakeDraft(d).blocking.includes('lines[0].revisions.invalid'));
});
