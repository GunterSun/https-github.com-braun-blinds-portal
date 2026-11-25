import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectIntakeFile,signatureMatches,MAX_INTAKE_BYTES} from '../../lib/ai/intake-file.ts';
test('accepts supported upload metadata',()=>{
 assert.equal(inspectIntakeFile('measurements.xlsx',1200,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').kind,'excel');
 assert.equal(inspectIntakeFile('scan.pdf',1200,'application/pdf').ok,true);
});
test('rejects oversized and unsupported files',()=>{
 assert.equal(inspectIntakeFile('a.pdf',MAX_INTAKE_BYTES+1,'application/pdf').ok,false);
 assert.equal(inspectIntakeFile('a.exe',100,'').ok,false);
});
test('rejects mismatched mime',()=>assert.equal(inspectIntakeFile('a.pdf',100,'image/jpeg').ok,false));
test('checks PDF and XLSX magic bytes',()=>{
 assert.equal(signatureMatches('pdf',new Uint8Array([37,80,68,70,45])),true);
 assert.equal(signatureMatches('pdf',new Uint8Array([80,75,3,4])),false);
 assert.equal(signatureMatches('excel',new Uint8Array([80,75,3,4])),true);
});
