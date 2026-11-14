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
