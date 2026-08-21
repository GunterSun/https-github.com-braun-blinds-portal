import { Z_SERIES_CONFIGS, Z_SERIES_FABRICS, Z_SERIES_PRICE_TIERS } from "@/data/z-series/catalog-source";

export type ZSeriesCatalogItem = {
  id: string; fabricCode: string; fabricSeriesZh: string; fabricSeriesEn: string;
  descriptionZh: string; descriptionEn: string; productCode: string; system: string;
  systemZh: string; systemEn: string; style: string; styleZh: string; styleEn: string;
  structure: string; structureZh: string; structureEn: string; construction: string;
  constructionZh: string; constructionEn: string; minWidth: number; maxWidth: number;
  minHeight: number; maxHeight: number; minDepthExclusive: number; retail: number; currency: "USD";
};

export const Z_SERIES_SOURCE = { workbook: "Z_Series_Customer_Price_List_CN_EN.xlsx", currency: "USD" as const, installationIncluded: false, shippingIncluded: false, expectedRows: 800 };

export const Z_SERIES_CATALOG: readonly ZSeriesCatalogItem[] = Z_SERIES_FABRICS.flatMap((fabric) => {
  const [fabricCode, fabricSeriesZh, fabricSeriesEn, descriptionZh, descriptionEn, tierIndex] = fabric;
  const prices = Z_SERIES_PRICE_TIERS[tierIndex];
  return Z_SERIES_CONFIGS.flatMap((config, configIndex) => {
    const retail = prices[configIndex]; if (retail == null) return [];
    const [productCode, systemZh, systemEn, styleZh, styleEn, structureZh, structureEn, constructionZh, constructionEn, minWidth, maxWidth, minHeight, maxHeight, minDepthExclusive] = config;
    return [{ id: `${fabricCode}-${productCode}`, fabricCode, fabricSeriesZh, fabricSeriesEn, descriptionZh, descriptionEn, productCode,
      system: `${systemZh} / ${systemEn}`, systemZh, systemEn, style: `${styleZh} / ${styleEn}`, styleZh, styleEn,
      structure: `${structureZh} / ${structureEn}`, structureZh, structureEn, construction: `${constructionZh} / ${constructionEn}`,
      constructionZh, constructionEn, minWidth, maxWidth, minHeight, maxHeight, minDepthExclusive, retail, currency: "USD" as const }];
  });
});

if (Z_SERIES_CATALOG.length !== Z_SERIES_SOURCE.expectedRows) throw new Error(`Z-Series catalog integrity error: expected ${Z_SERIES_SOURCE.expectedRows}, got ${Z_SERIES_CATALOG.length}`);
export function findZSeriesItem(fabricCode: string, productCode: string) { const f=fabricCode.trim().toUpperCase(), p=productCode.trim().toUpperCase(); return Z_SERIES_CATALOG.find(i=>i.fabricCode===f&&i.productCode===p)??null; }
export function zSeriesWholesalePrice(retail:number, discountPercent:number) { if(!Number.isFinite(retail)||retail<0) throw new Error("Invalid Z-Series retail price"); if(!Number.isFinite(discountPercent)||discountPercent<0||discountPercent>100) throw new Error("Invalid customer discount percent"); return Math.round(retail*(1-discountPercent/100)*100)/100; }
export function isSixteenthInch(value:number) { return Number.isFinite(value)&&Math.abs(value*16-Math.round(value*16))<1e-9; }
export type ZSeriesDimensionError = "width_not_sixteenth"|"height_not_sixteenth"|"depth_not_sixteenth"|"width_too_small"|"width_too_large"|"height_too_small"|"height_too_large"|"depth_required"|"depth_too_small";
export function validateZSeriesDimensions(item:ZSeriesCatalogItem,width:number,height:number,depth?:number) { const errors:ZSeriesDimensionError[]=[]; if(!isSixteenthInch(width))errors.push("width_not_sixteenth"); if(!isSixteenthInch(height))errors.push("height_not_sixteenth"); if(depth!=null&&Number.isFinite(depth)&&!isSixteenthInch(depth))errors.push("depth_not_sixteenth"); if(width<item.minWidth)errors.push("width_too_small"); if(width>item.maxWidth)errors.push("width_too_large"); if(height<item.minHeight)errors.push("height_too_small"); if(height>item.maxHeight)errors.push("height_too_large"); if(depth==null||!Number.isFinite(depth))errors.push("depth_required"); else if(depth<=item.minDepthExclusive)errors.push("depth_too_small"); return errors; }
