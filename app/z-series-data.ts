export type ZSeriesCatalogItem = {
  id: string;
  fabricCode: string;
  productCode: string;
  system: string;
  style: string;
  structure: string;
  construction: string;
  sizeLimits: string;
  retail: number;
  wholesale: number;
};

export const Z_SERIES_SOURCE = "Z_Series_Customer_Price_List_CN_EN.xlsx";
export const Z_SERIES_CURRENCY = "USD";

// Generated catalog is populated from the owner-approved workbook. Unknown
// fabric/product combinations must be rejected rather than estimated.
export const Z_SERIES_CATALOG: readonly ZSeriesCatalogItem[] = [];

export function validateZSeriesSize(sizeLimits: string, width: number, height: number, depth: number) {
  const w = sizeLimits.match(/([\d.]+)\s*in-([\d.]+)\s*inW/i);
  const h = sizeLimits.match(/([\d.]+)\s*in-([\d.]+)\s*in\s*H/i);
  const d = sizeLimits.match(/Depth\s*>\s*([\d.]+)\s*in/i);
  const errors: string[] = [];
  if (w && (width < +w[1] || width > +w[2])) errors.push(`Width must be ${w[1]}-${w[2]} in`);
  if (h && (height < +h[1] || height > +h[2])) errors.push(`Height must be ${h[1]}-${h[2]} in`);
  if (d && !(depth > +d[1])) errors.push(`Depth must be greater than ${d[1]} in`);
  return { valid: errors.length === 0, errors };
}
