/** Draft-only extraction. Never creates a quote, order, payment or factory job. */
export type InquiryDraft = {
  sourceText: string;
  productCode: string | null;
  fabricCode: string | null;
  widthInches: number | null;
  heightInches: number | null;
  quantity: number | null;
  color: string | null;
  notes: string[];
  missing: string[];
  status: 'needs_review';
};
export function parseInches(input: string): number | null {
  const s = input.trim().replace(/[″”]/g, '"').replace(/[′’]/g, "'");
  const m = s.match(/^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if (m) {
    const whole = Number(m[1] ?? 0), numerator = Number(m[2]), denominator = Number(m[3]);
    if (!denominator || numerator >= denominator) return null;
    const value = whole + numerator / denominator;
    return value > 0 && value <= 1000 ? value : null;
  }
  if (!/^\d+(?:\.\d+)?$/.test(s)) return null;
  const value = Number(s);
  return value > 0 && value <= 1000 ? value : null;
}
export function extractInquiryDraft(sourceText: string): InquiryDraft {
  const text = sourceText.slice(0, 12000);
  const dimension = text.match(/(\d+(?:\.\d+)?(?:\s+\d+\s*\/\s*\d+)?|\d+\s*\/\s*\d+)\s*(?:inches|inch|in|["″])?\s*[x×X]\s*(\d+(?:\.\d+)?(?:\s+\d+\s*\/\s*\d+)?|\d+\s*\/\s*\d+)\s*(?:inches|inch|in|["″])?/i);
  const widthInches = dimension ? parseInches(dimension[1]) : null;
  const heightInches = dimension ? parseInches(dimension[2]) : null;
  const productCode = text.match(/\b(?:JL|ML|LJYM|BZM|DR)[- ]?\d{2,6}\b/i)?.[0].replace(/ /g,'').toUpperCase() ?? null;
  const fabricCode = text.match(/\b(?:LF|BO|BK|WH)\b/i)?.[0].toUpperCase() ?? null;
  const qty = text.match(/\b(?:qty|quantity|数量)\s*[:：]?\s*(\d+)\b/i);
  const quantity = qty ? Number(qty[1]) : null;
  const color = text.match(/\b(white|beige|black|gray|grey|ivory|cream)\b/i)?.[0] ?? null;
  const missing = [
    ...(!productCode ? ['productCode'] : []),
    ...(!widthInches ? ['widthInches'] : []),
    ...(!heightInches ? ['heightInches'] : []),
    ...(!quantity ? ['quantity'] : []),
  ];
  return {sourceText:text,productCode,fabricCode,widthInches,heightInches,quantity,color,
    notes:[],missing,status:'needs_review'};
}
