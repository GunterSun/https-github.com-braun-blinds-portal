import assert from 'node:assert/strict';
import test from 'node:test';
import {extractInquiryLines} from '../../lib/ai/extract-lines.ts';
test('two numbered windows remain separate review drafts',()=>{
 const result=extractInquiryLines('1. JL3601 39 5/8 x 40 5/8 qty 1\n2. ML-1801 36 x 60 qty 2 motorized');
 assert.equal(result.lines.length,2);
 assert.equal(result.lines[0].draft.productCode,'JL3601');
 assert.equal(result.lines[1].draft.productCode,'ML-1801');
 assert.equal(result.lines[1].draft.quantity,2);
 assert.equal(result.status,'needs_review');
});
test('ambiguous message remains one draft with warning',()=>{
 const result=extractInquiryLines('JL3601 36 x 60\nML-1801 40 x 70');
 assert.equal(result.lines.length,1);
 assert.ok(result.warnings.length);
});
test('unnumbered context is never silently assigned to a window',()=>{
 const result=extractInquiryLines('Customer wants installation\n1. JL3601 36 x 60 qty 1');
 assert.equal(result.lines.length,1);
 assert.ok(result.warnings.some(w=>w.includes('Unnumbered')));
});

test('duplicate numbered windows are preserved and explicitly flagged',()=>{
 const result=extractInquiryLines('1. JL3601 36 x 60 qty 1\n1. ML-1801 40 x 70 qty 2');
 assert.equal(result.lines.length,2);
 assert.ok(result.warnings.some(w=>/Duplicate/i.test(w)));
});
test('skipped or out-of-order window numbers require manual review',()=>{
 const skipped=extractInquiryLines('1. JL3601 36 x 60 qty 1\n3. ML-1801 40 x 70 qty 2');
 assert.equal(skipped.lines.length,2);
 assert.ok(skipped.warnings.some(w=>/out of sequence/i.test(w)));
 const reversed=extractInquiryLines('2. JL3601 36 x 60 qty 1\n1. ML-1801 40 x 70 qty 2');
 assert.ok(reversed.warnings.some(w=>/out of sequence/i.test(w)));
});

test('correctly sequenced windows do not get false numbering warnings',()=>{
 const result=extractInquiryLines('1. JL3601 36 x 60 qty 1\n2. ML-1801 40 x 70 qty 2');
 assert.deepEqual(result.warnings,[]);
});
test('first listed window starts after 1 and must be reviewed',()=>{
 const result=extractInquiryLines('2. JL3601 36 x 60 qty 1\n3. ML-1801 40 x 70 qty 2');
 assert.ok(result.warnings.some(w=>/does not start at 1/i.test(w)));
});

test('more than 100 windows are capped with explicit review warning',()=>{
 const source=Array.from({length:101},(_,i)=>(i+1)+'. JL3601 36 x 60 qty 1').join('\n');
 const result=extractInquiryLines(source);
 assert.equal(result.lines.length,100);
 assert.ok(result.warnings.some(w=>/More than 100 lines/i.test(w)));
 assert.equal(result.status,'needs_review');
});
test('window 0 is not silently accepted as first window',()=>{
 const result=extractInquiryLines('0. JL3601 36 x 60 qty 1\n1. ML-1801 40 x 70 qty 2');
 assert.equal(result.lines.length,2);
 assert.ok(result.warnings.some(w=>/does not start at 1/i.test(w)));
});
