/** Draft-only pricing evidence gate. No quote issuance or price calculation. */
export type PricingEvidence={
 customerId:number|null;
 catalogId:string;
 catalogVersion:string;
 catalogCurrency:string;
 discountProfileId:string|null;
 discountProfileVersion:string|null;
 discountCustomerId:number|null;
 exchangeRateSnapshotId:string|null;
 validUntil:string|null;
};
export type PricingEvidenceResult={readyForHumanReview:boolean;missing:string[];warnings:string[]};
export function checkPricingEvidence(e:PricingEvidence):PricingEvidenceResult {
 const missing:string[]=[];
 const warnings:string[]=[];
 if(!Number.isSafeInteger(e.customerId)||Number(e.customerId)<=0)missing.push('customerId');
 if(!e.catalogId.trim()||!e.catalogVersion.trim())missing.push('catalogSnapshot');
 if(!/^[A-Z]{3}$/.test(e.catalogCurrency))missing.push('catalogCurrency');
 if(!e.discountProfileId?.trim()||!e.discountProfileVersion?.trim())missing.push('customerDiscountSnapshot');
 if(!Number.isSafeInteger(e.discountCustomerId)||e.discountCustomerId!==e.customerId)missing.push('discountCustomerMatch');
 if(!e.exchangeRateSnapshotId?.trim())missing.push('exchangeRateSnapshot');
 if(!e.validUntil||!/^\d{4}-\d{2}-\d{2}$/.test(e.validUntil)||!Number.isFinite(Date.parse(e.validUntil+'T00:00:00Z'))||new Date(e.validUntil+'T00:00:00Z').toISOString().slice(0,10)!==e.validUntil)missing.push('validUntil');
 if(e.catalogCurrency==='RMB')warnings.push('RMB pricing requires approved USD conversion and rate snapshot');
 warnings.push('Human must verify measurements, surcharges, installation, tax and catalog applicability');
 return {readyForHumanReview:missing.length===0,missing,warnings};
}
