/** Client-side preflight only; the future upload API MUST repeat all checks server-side. */
export type IntakeFileKind = 'image' | 'excel' | 'pdf' | 'text';
export type IntakeFileInfo = { ok: boolean; kind: IntakeFileKind | null; reason: string };
export const MAX_INTAKE_BYTES = 15 * 1024 * 1024;
const types: Record<string,{kind:IntakeFileKind; mime:string[]}> = {
 '.jpg':{kind:'image',mime:['image/jpeg']}, '.jpeg':{kind:'image',mime:['image/jpeg']},
 '.png':{kind:'image',mime:['image/png']}, '.heic':{kind:'image',mime:['image/heic','image/heif']},
 '.pdf':{kind:'pdf',mime:['application/pdf']},
 '.xlsx':{kind:'excel',mime:['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']},
 '.xls':{kind:'excel',mime:['application/vnd.ms-excel']},
 '.txt':{kind:'text',mime:['text/plain']},
};
export function inspectIntakeFile(name:string,size:number,mime:string):IntakeFileInfo {
 const ext=Object.keys(types).find(extension=>name.toLowerCase().endsWith(extension));
 if(!ext)return {ok:false,kind:null,reason:'Unsupported file extension'};
 if(!Number.isSafeInteger(size)||size<=0||size>MAX_INTAKE_BYTES)
  return {ok:false,kind:null,reason:'File must be between 1 byte and 15 MB'};
 const type=types[ext];
 // Some browsers do not report MIME; empty MIME is allowed only at preflight.
 if(mime && !type.mime.includes(mime.toLowerCase()))
  return {ok:false,kind:null,reason:'File extension and reported MIME disagree'};
 return {ok:true,kind:type.kind,reason:'Client preflight only; content not yet verified'};
}
/** Detect simple signatures before parsing; not a replacement for server validation. */
export function signatureMatches(kind:IntakeFileKind,bytes:Uint8Array):boolean {
 if(kind==='text')return true;
 if(kind==='pdf')return bytes.length>=5 && String.fromCharCode(...bytes.slice(0,5))==='%PDF-';
 if(kind==='excel')return bytes.length>=4 && (
  (bytes[0]===0x50&&bytes[1]===0x4b&&bytes[2]===0x03&&bytes[3]===0x04) ||
  (bytes.length>=8&&[0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1].every((v,i)=>bytes[i]===v))
 );
 if(kind==='image')return bytes.length>=8 && (
  (bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff) ||
  [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v,i)=>bytes[i]===v) ||
  (bytes.length>=12&&String.fromCharCode(...bytes.slice(4,8))==='ftyp')
 );
 return false;
}
