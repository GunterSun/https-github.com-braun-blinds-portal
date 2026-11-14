import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
const compiled=await build({entryPoints:['lib/ai/extract-inquiry.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {extractInquiryDraft,parseInches}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
test('mixed fractions and inch validation',()=>{
  assert.equal(parseInches('39 5/8'),39.625);
  assert.equal(parseInches('40 5/8"'),40.625);
  assert.equal(parseInches('3/0'),null);
  assert.equal(parseInches('0'),null);
});
test('realistic customer inquiry is a draft',()=>{
  const d=extractInquiryDraft('JL3601 White LF 39 5/8 x 40 5/8 qty 1 Square Valance');
  assert.equal(d.productCode,'JL3601');
  assert.equal(d.widthInches,39.625);
  assert.equal(d.heightInches,40.625);
  assert.equal(d.quantity,1);
  assert.deepEqual(d.options,['square_valance']);
  assert.equal(d.status,'needs_review');
});
test('motorized request flags options without quoting',()=>{
  const d=extractInquiryDraft('ML-1801 36 x 60 quantity 2 motorized with remote');
  assert.equal(d.productCode,'ML-1801');
  assert.deepEqual(d.options,['motorized','remote']);
  assert.equal(d.status,'needs_review');
});
test('incomplete request remains blocked',()=>{
  const d=extractInquiryDraft('JL3601 White');
  assert.ok(d.missing.includes('widthInches'));
  assert.ok(d.missing.includes('heightInches'));
  assert.ok(d.missing.includes('quantity'));
  assert.equal(d.status,'needs_review');
});
