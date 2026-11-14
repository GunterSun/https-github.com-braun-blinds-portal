import assert from 'node:assert/strict';
import test from 'node:test';
import {extractInquiryDraft} from '../../lib/ai/extract-inquiry.ts';
import {matchCatalogCandidate} from '../../lib/ai/catalog-match.ts';
// Synthetic catalog fixture; not an actual Braun price list or verified JL product.
const catalog=[{catalogId:'test-only',catalogVersion:'v1',fabricCode:'FABRIC-001',productCode:'TEST-001',currency:'USD'}];
test('explicitly verified catalog combination yields candidate only, never price',()=>{
 const extracted=extractInquiryDraft('JL3601 LF White 36 x 60 qty 1');
 assert.equal(extracted.fabricCode,null);
 assert.equal(matchCatalogCandidate(extracted,catalog).status,'unverified');
 const manuallyVerified={...extracted,productCode:'TEST-001',fabricCode:'FABRIC-001'};
 const m=matchCatalogCandidate(manuallyVerified,catalog);
 assert.equal(m.status,'candidate');
 assert.equal(m.catalog?.catalogVersion,'v1');
 assert.equal('price' in m,false);
});
test('missing or ambiguous catalog blocks match',()=>{
 const extracted=extractInquiryDraft('JL3601 White 36 x 60 qty 1');
 assert.equal(matchCatalogCandidate(extracted,catalog).status,'unverified');
 const verified={...extracted,productCode:'TEST-001',fabricCode:'FABRIC-001'};
 assert.equal(matchCatalogCandidate(verified,[...catalog,...catalog]).status,'unverified');
 assert.equal(matchCatalogCandidate(verified,[]).status,'unverified');
});

test('option token cannot become fabric even if supplied by caller and catalog',()=>{
 const extracted=extractInquiryDraft('JL3601 LF WH 36 x 60 qty 1');
 for(const token of ['LF','BO','BK','WH']){
  const spoofed={...extracted,fabricCode:token};
  const fakeCatalog=[{catalogId:'z',catalogVersion:'fake',fabricCode:token,productCode:'JL3601',currency:'USD'}];
  assert.equal(matchCatalogCandidate(spoofed,fakeCatalog).status,'unverified');
 }
});
