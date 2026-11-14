import assert from 'node:assert/strict';
import test from 'node:test';
import {extractInquiryDraft} from '../../lib/ai/extract-inquiry.ts';
import {matchCatalogCandidate} from '../../lib/ai/catalog-match.ts';
const catalog=[{catalogId:'z',catalogVersion:'2026-11',fabricCode:'LF',productCode:'JL3601',currency:'USD'}];
test('verified combination yields candidate only, never price',()=>{
 const d=extractInquiryDraft('JL3601 LF White 36 x 60 qty 1');
 const m=matchCatalogCandidate(d,catalog);
 assert.equal(m.status,'candidate');
 assert.equal(m.catalog?.catalogVersion,'2026-11');
 assert.equal('price' in m,false);
});
test('missing or ambiguous catalog blocks match',()=>{
 const d=extractInquiryDraft('JL3601 White 36 x 60 qty 1');
 assert.equal(matchCatalogCandidate(d,catalog).status,'unverified');
 const d2=extractInquiryDraft('JL3601 LF White 36 x 60 qty 1');
 assert.equal(matchCatalogCandidate(d2,[...catalog,...catalog]).status,'unverified');
 assert.equal(matchCatalogCandidate(d2,[]).status,'unverified');
});
