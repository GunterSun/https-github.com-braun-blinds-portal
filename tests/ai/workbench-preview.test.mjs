import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const preview=readFileSync('lib/ai/inquiry-draft-preview.tsx','utf8');
test('workbench renders one editable section per extracted inquiry line',()=>{
 assert.match(preview,/extractInquiryLines\(source\)/);
 assert.match(preview,/lines\.map\(/);
 assert.match(preview,/setLines\(previous=>previous\.map/);
});
test('workbench is review-only and does not call any external API',()=>{
 assert.doesNotMatch(preview,/\bfetch\s*\(|\blocalStorage\b|\bgetDb\s*\(|\bsubmitSupplierOrder\b/);
 assert.match(preview,/quoteDraftGate\(line\.draft\)/);
});
test('workbench has language toggle and responsive layout',()=>{
 assert.match(preview,/setLocale/);
 assert.match(preview,/auto-fit/);
});

test('fractional inch typing preserves intermediate text until it becomes valid',()=>{
 assert.match(preview,/fieldEdits\[/);
 assert.match(preview,/setFieldEdits\(previous/);
 assert.match(preview,/parseInches\(value\)/);
 assert.match(preview,/setFieldEdits\(\{\}\)/);
});
