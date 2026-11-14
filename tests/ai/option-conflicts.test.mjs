import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {extractInquiryDraft} from '../../lib/ai/extract-inquiry.ts';
import {quoteDraftGate} from '../../lib/ai/quote-adapter.ts';

const ui=readFileSync(new URL('../../lib/ai/inquiry-draft-preview.tsx',import.meta.url),'utf8');
test('contradictory opacity, hardware and operation options need review',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 1 LF BO WH BK motorized cordless');
 assert.equal(draft.status,'needs_review');
 assert.equal(draft.notes.length,3);
 assert.ok(draft.notes.some(n=>n.includes('LF and BO')));
 assert.ok(draft.notes.some(n=>n.includes('WH and BK')));
 assert.ok(draft.notes.some(n=>n.includes('Motorized and cordless')));
});
test('nonconflicting options do not create false conflict warnings',()=>{
 const draft=extractInquiryDraft('JL3601 White LF WH 36 x 60 qty 1 motorized remote');
 assert.deepEqual(draft.notes,[]);
});
test('owner workbench renders bilingual accessible conflict warnings',()=>{
 assert.match(ui,/noteZh:Record<string,string>/);
 assert.match(ui,/line\.draft\.notes\.map/);
 assert.match(ui,/role="alert"/);
});

test('quote gate explicitly rejects contradictory options',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 1 LF BO');
 const gate=quoteDraftGate(draft);
 assert.equal(gate.allowed,false);
 assert.equal(gate.requiresOwnerReview,true);
 assert.match(gate.reason,/配置冲突或多个型号/);
});

test('two distinct product models in one window cannot silently become one quote',()=>{
 const draft=extractInquiryDraft('JL3601 and ML-1801 36 x 60 qty 1 LF WH');
 assert.equal(draft.productCode,'JL3601');
 assert.ok(draft.notes.some(n=>/Multiple product models/i.test(n)));
 assert.equal(quoteDraftGate(draft).allowed,false);
 assert.match(quoteDraftGate(draft).reason,/配置冲突或多个型号/);
});
test('repeated identical model is not a multiple-model conflict',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 1 repeat JL3601');
 assert.ok(!draft.notes.some(n=>/Multiple product models/i.test(n)));
});

test('two dimension pairs in one window require human review',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 or 40 x 70 qty 1');
 assert.equal(draft.widthInches,36);
 assert.equal(draft.heightInches,60);
 assert.ok(draft.notes.some(n=>/Multiple dimension pairs/i.test(n)));
 assert.equal(quoteDraftGate(draft).allowed,false);
});
test('one fractional dimension pair does not falsely trigger multiple-size warning',()=>{
 const draft=extractInquiryDraft('JL3601 39 5/8 x 40 5/8 qty 1');
 assert.ok(!draft.notes.some(n=>/Multiple dimension pairs/i.test(n)));
});

test('contradictory quantity statements require owner review',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 1 quantity 2');
 assert.equal(draft.quantity,1);
 assert.ok(draft.notes.some(n=>/Conflicting quantities/i.test(n)));
 assert.equal(quoteDraftGate(draft).allowed,false);
});
test('repeated identical quantities do not create a false warning',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 2 quantity 2');
 assert.ok(!draft.notes.some(n=>/Conflicting quantities/i.test(n)));
});

test('hyphen and whitespace variants of same model do not falsely conflict',()=>{
 const draft=extractInquiryDraft('ML-1801 36 x 60 qty 1, also noted ML1801 and ML 1801');
 assert.ok(!draft.notes.some(n=>/Multiple product models/i.test(n)));
});

test('equivalent quantity values with leading zeroes do not falsely conflict',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 02 quantity 2');
 assert.equal(draft.quantity,2);
 assert.ok(!draft.notes.some(n=>/Conflicting quantities/i.test(n)));
});

test('same dimensions repeated in decimal and fraction formats do not falsely conflict',()=>{
 const draft=extractInquiryDraft('JL3601 39 5/8 x 40 5/8 qty 1; confirmed 39.625 x 40.625');
 assert.ok(!draft.notes.some(n=>/Multiple dimension pairs/i.test(n)));
});

test('invalid quantity mention cannot be hidden by another valid quantity',()=>{
 for(const source of ['JL3601 36 x 60 qty 0 quantity 2','JL3601 36 x 60 qty -1 quantity 2','JL3601 36 x 60 qty 1.5 quantity 2']){
  const draft=extractInquiryDraft(source);
  assert.ok(draft.notes.some(n=>/Invalid quantity statement/i.test(n)),source);
  assert.equal(quoteDraftGate(draft).allowed,false);
 }
});

test('leading-zero positive quantities remain valid source statements',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 002 quantity 2');
 assert.equal(draft.quantity,2);
 assert.ok(!draft.notes.some(n=>/Invalid quantity statement/i.test(n)));
});

test('unsafe integer quantity is flagged even alongside valid quantity',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 9007199254740993 quantity 2');
 assert.ok(draft.notes.some(n=>/Invalid quantity statement/i.test(n)));
 assert.equal(quoteDraftGate(draft).allowed,false);
});

test('out-of-range dimensions cannot hide behind another valid size',()=>{
 const draft=extractInquiryDraft('JL3601 1200 x 60 or 36 x 60 qty 1');
 assert.ok(draft.notes.some(n=>/Invalid dimension pair/i.test(n)));
 assert.equal(quoteDraftGate(draft).allowed,false);
});

test('zero dimensions are explicitly flagged even when a valid pair follows',()=>{
 for(const source of ['JL3601 0 x 60 or 36 x 60 qty 1','JL3601 36 x 0 or 36 x 60 qty 1']){
  const draft=extractInquiryDraft(source);
  assert.ok(draft.notes.some(n=>/Invalid dimension pair/i.test(n)),source);
  assert.equal(quoteDraftGate(draft).allowed,false);
 }
});

test('unknown or TBD quantity cannot be hidden by another valid count',()=>{
 for(const marker of ['TBD','unknown','pending','n/a','待定','未定']){
  const draft=extractInquiryDraft(`JL3601 36 x 60 qty ${marker} quantity 2`);
  assert.ok(draft.notes.some(n=>/Unresolved quantity statement/i.test(n)),marker);
  assert.equal(quoteDraftGate(draft).allowed,false);
 }
});
test('ordinary valid quantity does not trigger unresolved quantity warning',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 2 quantity 02');
 assert.ok(!draft.notes.some(n=>/Unresolved quantity statement/i.test(n)));
});

test('explicitly pending measurements require review even if valid size appears',()=>{
 for(const marker of ['width TBD','height unknown','size pending','dimensions n/a','宽度待定','高度未定','尺寸待定']){
  const draft=extractInquiryDraft(`JL3601 36 x 60 qty 1 ${marker}`);
  assert.ok(draft.notes.some(n=>/Unresolved dimension statement/i.test(n)),marker);
  assert.equal(quoteDraftGate(draft).allowed,false);
 }
});
test('valid dimensions do not create a pending-measurement warning',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 1 width 36 height 60');
 assert.ok(!draft.notes.some(n=>/Unresolved dimension statement/i.test(n)));
});

test('explicitly pending product model requires review despite another valid model',()=>{
 for(const marker of ['model TBD','product unknown','product code pending','型号待定','产品型号未定']){
  const draft=extractInquiryDraft(`JL3601 36 x 60 qty 1 ${marker}`);
  assert.ok(draft.notes.some(n=>/Unresolved product model statement/i.test(n)),marker);
  assert.equal(quoteDraftGate(draft).allowed,false);
 }
});
test('ordinary product code does not trigger pending-model warning',()=>{
 const draft=extractInquiryDraft('JL3601 36 x 60 qty 1 model JL3601');
 assert.ok(!draft.notes.some(n=>/Unresolved product model statement/i.test(n)));
});
