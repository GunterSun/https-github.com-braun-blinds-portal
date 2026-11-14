import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const page=readFileSync('app/ai/page.tsx','utf8');
test('AI workbench uses existing server-side session and owner-only gate',()=>{
 assert.match(page,/getCurrentAppUser\(\)/);
 assert.match(page,/user\.role\s*!==\s*["']owner["']/);
 assert.match(page,/redirect\(["']\/login["']\)/);
 assert.match(page,/force-dynamic/);
});
test('AI route does not issue quotes, orders or write to D1',()=>{
 assert.doesNotMatch(page,/fetch\s*\(|getDb\s*\(|POST\s*\(|sendMail\s*\(/);
});
