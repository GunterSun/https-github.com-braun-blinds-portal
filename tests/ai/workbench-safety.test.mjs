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

test('editing inquiry source clears stale drafts, field edits, warnings and prior status',()=>{
 assert.match(ui,/onChange=\{e=>\{setSource\(e\.target\.value\);setLines\(\[\]\);setFieldEdits\(\{\}\);setWarnings\(\[\]\);setNotice\(""\);\}\}/);
});

test('safety warnings are localized for Chinese-first owner review',()=>{
 assert.match(ui,/warningZh:Record<string,string>/);
 assert.match(ui,/发现重复窗位编号/);
 assert.match(ui,/内容已截断/);
 assert.match(ui,/en\?warning:\(warningZh\[warning\]\?\?warning\)/);
});

test('extraction safety warnings are exposed as accessible alerts',()=>{
 assert.match(ui,/warnings\.map\(\(warning,i\)=><p key=\{i\} role="alert"/);
});

test('English toggle also translates formal quote issuance safety gate',()=>{
 assert.match(ui,/Unresolved conflicting or ambiguous inquiry details require customer confirmation/);
 assert.match(ui,/Required inquiry details are missing/);
 assert.match(ui,/Customer pricing, product catalog, and quote version are not verified/);
 assert.match(ui,/quoteDraftGate\(line\.draft\)\.reason/);
});
