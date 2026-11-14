import {parseInches} from "./extract-inquiry.ts";

const sizeLabel = {
 trackWidth: /(?:轨道宽度|轨道宽|杆宽|(?:actual\s+)?(?:track|rod)\s+width)/gi,
 finishedHeight: /(?:成品高度|成品高|finished\s+height)/gi,
};
const dimension = /^\s*[:：=]?\s*(\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?)(?:\s*(?:inches\b|inch\b|in\b|英寸|["″]))?(?=\s*(?:$|[,，;；。|\n]))/i;

const options = {
 mount: [
  ["inside", /口内|框内|\b(?:inside mount|IM)\b/i],
  ["outside", /口外|框外|\b(?:outside mount|OM)\b/i],
 ],
 draw: [
  ["center split", /对开|双开|\b(?:center split|two[- ]way draw)\b/i],
  ["one-way", /单开|\bone[- ]way draw\b/i],
 ],
 lining: [
  ["unlined", /不加衬|无衬|\b(?:unlined|no liner)\b/i],
  ["light-filtering", /透光衬|\blight[- ]filtering liner\b/i],
  ["blackout", /遮光衬|\bblackout liner\b/i],
 ],
 pleat: [
  ["double pinch", /双韩褶|双捏褶|\bdouble pinch pleat(?:ed|s)?\b/i],
  ["triple pinch", /三韩褶|三捏褶|\btriple pinch pleat(?:ed|s)?\b/i],
  ["ripplefold", /蛇形帘|蛇形褶|\bripplefold\b/i],
 ],
 hardware: [
  ["black", /黑(?:色)?(?:杆|轨道)|\bblack (?:rod|track)\b/i],
  ["gold", /金(?:色)?(?:杆|轨道)|\bgold (?:rod|track)\b/i],
  ["white", /白(?:色)?(?:杆|轨道)|\bwhite (?:rod|track)\b/i],
  ["silver", /银(?:色)?(?:杆|轨道)|\bsilver (?:rod|track)\b/i],
 ],
} as const;

type OptionField = keyof typeof options;
type SizeField = keyof typeof sizeLabel;

export function isDrapery(source: string) {
 return /布艺帘|布艺窗帘|布帘|纱帘|\b(?:drapery|drapes|curtains?)\b/i.test(source);
}

function sizes(source: string, field: SizeField) {
 return [...source.matchAll(sizeLabel[field])].map(match => {
  const raw = source.slice(match.index + match[0].length).match(dimension)?.[1] ?? null;
  return {raw, inches: raw === null ? null : parseInches(raw)};
 });
}

function choices(source: string, field: OptionField) {
 return options[field].flatMap(([value, pattern]) => {
  const match = source.match(pattern);
  return match ? [{value, raw: match[0]}] : [];
 });
}

function optionStatus(values: {value:string}[], uncertain: boolean) {
 if (values.length > 1) return "conflict";
 return values.length === 1 && !uncertain ? "present" : "missing";
}

export function reviewDrapery(source: string) {
 const trackWidth = sizes(source, "trackWidth");
 const finishedHeight = sizes(source, "finishedHeight");
 const dimensions = [trackWidth, finishedHeight];
 const sizeConflict = dimensions.some(values => new Set(values.flatMap(value => value.inches ?? [])).size > 1);
 // Uncertainty is conservative. An unassigned question or negation must
 // never turn a single candidate into a confirmed selection.
 const uncertain = /[?？]|待定|待确认|未确认|不要|不考虑|不确定|还是|\b(?:maybe|TBD|not|instead of|either|or)\b/i.test(source);
 const sizeStatus = sizeConflict ? "conflict" : !uncertain && dimensions.every(values => values.length && values.every(value => value.inches !== null)) ? "present" : "missing";
 const optionReview = (field: OptionField) => {
  const values = choices(source, field);
  return {field, status:optionStatus(values, uncertain), evidence:values.map(value => value.raw)};
 };
 return [
  {field:"dimensions",status:sizeStatus,evidence:[...trackWidth.map(value=>value.raw && "W: "+value.raw),...finishedHeight.map(value=>value.raw && "H: "+value.raw)].filter((value): value is string=>value!==null)},
  optionReview("mount"),
  optionReview("draw"),
  optionReview("lining"),
  optionReview("pleat"),
  optionReview("hardware"),
 ] as const;
}
