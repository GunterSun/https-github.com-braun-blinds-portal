import type {InquiryDraft} from './extract-inquiry';
export type CatalogEvidence={catalogId:string;catalogVersion:string;fabricCode:string;productCode:string;currency:string};
export type CatalogMatch={status:'unverified'|'candidate';reason:string;catalog?:CatalogEvidence};
/** Matching is read-only and never computes or approves a customer price. */
export function matchCatalogCandidate(draft:InquiryDraft,items:readonly CatalogEvidence[]):CatalogMatch {
  if(!draft.productCode||!draft.fabricCode)return {status:'unverified',reason:'Product and fabric codes must both be verified'};
  if(/^(?:LF|BO|BK|WH)$/i.test(draft.fabricCode.trim()))return {status:'unverified',reason:'Opacity and hardware option tokens are not verified fabric codes'};
  const matches=items.filter(item=>item.productCode.toUpperCase()===draft.productCode?.toUpperCase()&&item.fabricCode.toUpperCase()===draft.fabricCode?.toUpperCase());
  if(matches.length!==1)return {status:'unverified',reason:matches.length?'Ambiguous catalog combination':'No verified catalog combination'};
  const item=matches[0];
  if(!item.catalogId||!item.catalogVersion||!/^[A-Z]{3}$/.test(item.currency))return {status:'unverified',reason:'Catalog version or currency missing'};
  return {status:'candidate',reason:'Candidate only: account pricing, measurements and owner review still required',catalog:item};
}
