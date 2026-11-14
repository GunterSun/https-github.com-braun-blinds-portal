import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('../../lib/ai/inquiry-draft-preview.tsx',import.meta.url),'utf8');
test('mobile workbench captures customer and project before creating a copyable draft',()=>{
 assert.match(ui,/const \[customer,setCustomer\]=useState/);
 assert.match(ui,/const \[project,setProject\]=useState/);
 assert.match(ui,/Copy order draft/);
 assert.match(ui,/复制订单草稿/);
 assert.match(ui,/navigator.*clipboard.*writeText.*buildOrderDraft/);
});
test('copied order draft is explicitly review-only and preserves source warnings',()=>{
 assert.match(ui,/REVIEW-ONLY ORDER DRAFT/);
 assert.match(ui,/NOT A QUOTE OR FACTORY ORDER/);
 assert.match(ui,/Warnings \/ 警告/);
 assert.match(ui,/Source \/ 原始询价/);
});

test('mobile draft can be downloaded as a local text file without backend mutation',()=>{
 assert.match(ui,/Download text draft/);
 assert.match(ui,/下载文本草稿/);
 assert.match(ui,/new Blob\(\[buildOrderDraft\(\)\]/);
 assert.match(ui,/braun-inquiry-review-draft\.txt/);
 assert.match(ui,/URL\.revokeObjectURL\(url\)/);
});
