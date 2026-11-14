import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {extractInquiryDraft} from '../../lib/ai/extract-inquiry.ts';

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
