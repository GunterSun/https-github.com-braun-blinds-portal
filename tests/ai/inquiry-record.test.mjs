import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { captureInquiry, captureMeasurement, emptyMeasurement, measurementConflicts, recordRevision } from '../../lib/ai/inquiry-record.ts';

const cases = JSON.parse(readFileSync(new URL('./fixtures/inquiry-cases.json', import.meta.url), 'utf8'));
const time = '2026-11-14T00:00:00Z';
const capture = text => captureInquiry(text, time);
const read = (windowId, middleWidth, middleHeight) =>
  captureMeasurement({...emptyMeasurement, windowId, middleWidth, middleHeight}, time);

for (const scenario of cases) {
 test(scenario.id + ' captures evidence for human review', () => {
  const versions = scenario.messages.map(capture);
  assert.deepEqual(versions.map(entry => entry.text), scenario.messages);
  assert.ok(versions.every(entry => entry.status === 'needs_review'));
  assert.ok(versions.every(entry => !('price' in entry.lines[0].draft)));
  switch (scenario.id) {
   case 'B01': {
    const listing = capture(scenario.rows.map(([id,width]) => id+'. '+width+' x 99 qty 1').join('\n'));
    assert.deepEqual(listing.lines.map(line => line.originalWindowId), scenario.rows.map(([id]) => id));
    assert.ok(listing.warnings.some(warning => warning.includes('out of sequence')));
    break;
   }
   case 'B02':
    assert.equal(versions.length, scenario.expected.revisionCount);
    assert.ok(versions.at(-1).lines[0].draft.missing.includes('productCode'));
    break;
   case 'B03': {
    const rows = [read('LR-1','51 1/2','86'), read('LR-1','52','88')];
    assert.deepEqual(measurementConflicts(rows[1], rows, []), ['middleWidth','middleHeight']);
    assert.equal(rows[0].input.middleWidth,'51 1/2');
    break;
   }
   case 'B04': {
    const evidence = capture(scenario.rows.map(row => row.originalId+': '+row.measuredWidth+' x '+row.measuredHeight).join('\n'));
    const measured = read('K2','36','46 1/4');
    assert.deepEqual(measurementConflicts(measured,[measured],[evidence]),['middleWidth']);
    assert.equal(evidence.lines[1].draft.heightRaw,'46 1/4');
    break;
   }
   case 'B05': {
    const row = read('W01',scenario.sample.widthRaw,scenario.sample.heightRaw);
    assert.equal(row.dimensions.middleWidth.inches,scenario.expected.widthInches);
    assert.equal(row.dimensions.middleHeight.inches,scenario.expected.heightInches);
    assert.ok(row.issues.includes('top'));
    break;
   }
   case 'B06':
    assert.ok(versions[0].lines[0].draft.missing.includes('quantity'));
    assert.equal(versions[0].lines[0].draft.productCode,null);
    break;
   case 'B07': {
    const ids = Object.values(scenario.expected.children).flat();
    const listing = capture(ids.map(id => id+': motorized').join('\n'));
    assert.deepEqual(listing.lines.map(line => line.originalWindowId),ids);
    assert.ok(listing.lines.every(line=>line.draft.widthInches===null));
    assert.equal(versions[0].lines[0].draft.heightRaw,scenario.expected.heightRaw);
    break;
   }
  }
 });
}

test('editing a dimension records a revision without changing the source',()=>{
 const source=capture('  MB-1: JL3601 47 x 34 1/2 qty 2  ');
 const revision={windowId:'MB-1',lineIndex:1,sourceVersion:1,field:'heightInches',previous:'34 1/2',next:'34 5/8',recordedAt:time};
 const first=recordRevision([],revision);
 assert.deepEqual(recordRevision(first,{...revision,previous:revision.next}),first);
 assert.equal(source.lines[0].originalRow,source.text);
 assert.equal(source.lines[0].draft.heightRaw,'34 1/2');
 assert.equal(first[0].next,'34 5/8');
});

test('explicit Chinese spreadsheet labels preserve original window IDs and fractions',()=>{
 const record=capture('书房3-2SD: 41 × 88\n2卧2-1：52 1/4 × 88 1/2\n餐厅：70 × 90');
 assert.deepEqual(record.lines.map(line=>line.originalWindowId),['书房3-2SD','2卧2-1','餐厅']);
 assert.equal(record.lines[1].draft.widthRaw,'52 1/4');
 assert.equal(record.lines[1].draft.heightInches,88.5);
 assert.deepEqual(record.warnings,[]);
});

test('design, field and finished dimensions retain separate cited comparison values',async ()=>{
 const {measurementDifferences}=await import('../../lib/ai/inquiry-record.ts');
 const field={...emptyMeasurement,windowId:'W8',middleHeight:'89 1/2'};
 const original=captureMeasurement({...field,sourceRef:'Survey ref'},time);
 const finished=captureMeasurement({...field,kind:'finished',middleWidth:'42',middleHeight:'87 1/2',sourceRef:'Sheet row 6'},time);
 assert.deepEqual(finished.issues,[]);
 assert.deepEqual(measurementDifferences(finished,[original,finished],[]),[
  {field:'middleHeight',current:'87 1/2',other:'89 1/2',source:'Survey ref',kind:'field'},
 ]);
});
