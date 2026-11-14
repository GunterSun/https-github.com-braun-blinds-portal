import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const ui=readFileSync('lib/ai/inquiry-draft-preview.tsx','utf8');
const page=readFileSync('app/ai/page.tsx','utf8');

test('owner-only workbench remains behind server-side authentication',()=>{
 assert.match(page,/getCurrentAppUser\(\)/);
 assert.match(page,/redirect\(["']\/login["']\)/);
 assert.match(page,/user\.role\s*!==\s*["']owner["']/);
});

test('draft workbench keeps fractional-inch input buffer and explicit invalid-value alerts',()=>{
 assert.match(ui,/fieldEdits/);
 assert.match(ui,/parseInches\(value\)/);
 assert.match(ui,/role="alert"/);
 assert.match(ui,/inputMode=/);
});

test('draft preview is read-only: no network calls, persistence, formal quote or factory release',()=>{
 assert.doesNotMatch(ui,/\bfetch\s*\(|\bXMLHttpRequest\b|\blocalStorage\b|\bsessionStorage\b|\bgetDb\s*\(/);
 assert.doesNotMatch(ui,/\b(?:sendMail|createOrder|issueQuote|releaseProduction)\s*\(/);
 assert.match(ui,/quoteDraftGate\(line\.draft\)/);
 assert.match(ui,/fabricCode/);
});

test('Chinese-first and English switch are both present',()=>{
 assert.match(ui,/useState<"zh"\|"en">\("zh"\)/);
 assert.match(ui,/setLocale\(en\?"zh":"en"\)/);
 assert.match(ui,/AI 询价草稿工作台/);
});
