export type MeasurementUnit = "in" | "cm";
export type ParsedMeasurement = { sixteenths:number; display:string; decimalInches:string; sourceValue:string; sourceUnit:MeasurementUnit; rounding:"exact"|"nearest" };
const MAX_SIXTEENTHS=10_000*16;
function gcd(a:number,b:number){while(b)[a,b]=[b,a%b];return a}

export function formatSixteenths(value:number,includeUnit=true){
  if(!Number.isInteger(value)||value<0)throw new Error("尺寸必须是非负的 1/16 英寸整数");
  const whole=Math.floor(value/16),remainder=value%16;
  if(!remainder)return `${whole}${includeUnit?" in":""}`;
  const divisor=gcd(remainder,16);
  return `${whole?`${whole} `:""}${remainder/divisor}/${16/divisor}${includeUnit?" in":""}`;
}

function inchesFromString(source:string){
  const normalized=source.trim().replace(/["″]/g,"").replace(/\s+/g," ");
  const mixed=normalized.match(/^(\d+)(?:\s+|-)([0-9]+)\/([0-9]+)$/),fraction=normalized.match(/^([0-9]+)\/([0-9]+)$/);
  if(mixed||fraction){const match=(mixed||fraction)!;const whole=mixed?Number(match[1]):0,numerator=Number(match[mixed?2:1]),denominator=Number(match[mixed?3:2]);if(!denominator||numerator>=denominator||16%denominator!==0)return null;return whole+numerator/denominator}
  if(!/^\d+(?:\.\d+)?$/.test(normalized))return null;
  return Number(normalized);
}

export function parseMeasurement(value:unknown,unit:MeasurementUnit="in"):ParsedMeasurement|null{
  if(value===null||value===undefined||String(value).trim()==="")return null;
  const sourceValue=String(value).trim(),numeric=typeof value==="number"?value:inchesFromString(sourceValue);
  if(numeric===null||!Number.isFinite(numeric)||numeric<0)throw new Error("无法识别尺寸，请使用英寸、分数或小数格式");
  const rawSixteenths=unit==="cm"?numeric/2.54*16:numeric*16,sixteenths=Math.round(rawSixteenths);
  if(sixteenths>MAX_SIXTEENTHS)throw new Error("尺寸超出允许范围");
  const exact=Math.abs(rawSixteenths-sixteenths)<1e-8;
  if(unit==="in"&&!exact)throw new Error("英寸尺寸必须精确到 1/16 英寸");
  return {sixteenths,display:formatSixteenths(sixteenths),decimalInches:(sixteenths/16).toFixed(4),sourceValue,sourceUnit:unit,rounding:exact?"exact":"nearest"};
}
