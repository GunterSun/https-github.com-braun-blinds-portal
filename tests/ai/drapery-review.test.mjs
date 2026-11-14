import assert from 'node:assert/strict';
import test from 'node:test';
import {captureInquiry} from '../../lib/ai/inquiry-record.ts';
import {isDrapery, reviewDrapery} from '../../lib/ai/drapery-review.ts';

test('Chinese drapery inquiry exposes six explicit selections and retains fractions', () => {
 const text = '布艺帘，轨道宽 95 1/4 英寸，成品高度 88 1/2 英寸，口外，对开，透光衬，双韩褶，黑杆';
 assert.equal(isDrapery(text), true);
 const result = reviewDrapery(text);
 assert.equal(result.length, 6);
 assert.ok(result.every(item => item.status === 'present'));
 assert.deepEqual(result[0].evidence, ['W: 95 1/4', 'H: 88 1/2']);
});

test('English fixture treats unlined as an explicit lining choice', () => {
 const result = reviewDrapery('Drapery; actual rod width: 96 in; finished height: 88 in; IM; one-way draw; unlined; ripplefold; gold rod');
 assert.ok(result.every(item => item.status === 'present'));
});

test('opening size cannot satisfy finished height or rod width', () => {
 const result = reviewDrapery('布帘，窗洞 90 × 100 英寸，黑杆');
 assert.deepEqual(result.map(item=>item.status), ['missing','missing','missing','missing','missing','present']);
});

test('competing dimensions and options are flagged and evidence retained', () => {
 const result = reviewDrapery('Drapery; track width: 90; track width: 92; finished height: 88; IM or OM; black rod or gold rod');
 for (const field of ['dimensions','mount','hardware']) {
  const item = result.find(item=>item.field===field);
  assert.equal(item.status,'conflict');
  assert.ok(item.evidence.length >= 2);
 }
});

test('question, negation, and unsupported unit do not become provided dimensions or choices', () => {
 assert.equal(reviewDrapery('布帘，轨道宽 90，成品高 200 cm')[0].status,'missing');
 assert.equal(reviewDrapery('Drapery, maybe gold rod?').at(-1).status,'missing');
 assert.equal(reviewDrapery('布帘，不要金杆').at(-1).status,'missing');
});

test('separate windows cannot inherit a neighboring window checklist value', () => {
 const record = captureInquiry('W1: 布帘，黑杆\nW2: 布帘，口外\nW3: JL3601 30 × 40 qty 1','2026-11-14T00:00:00Z');
 assert.deepEqual(record.lines.map(line=>line.originalWindowId),['W1','W2','W3']);
 assert.equal(reviewDrapery(record.lines[0].source).at(-1).status,'present');
 assert.equal(reviewDrapery(record.lines[1].source).at(-1).status,'missing');
 assert.equal(isDrapery(record.lines[2].source),false);
});
