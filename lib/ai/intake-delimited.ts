/** Local CSV/TSV intake: preserve source and fail closed on ambiguous rows. */
export type TableCell={column:number;header:string;raw:string};
export type TableRow={sourceRow:number;sourceWindowId:string;originalRow:string;cells:TableCell[];widthRaw:string;heightRaw:string;quantityRaw:string;issues:string[]};
export type TableIntake={text:string;warnings:string[];rows:number;sourceText:string;records:TableRow[];headers:string[]};
export class IntakeTableError extends Error {
 readonly issues:string[];readonly records:TableRow[];
 constructor(message:string,issues:string[],records:TableRow[]){super(message);this.name='IntakeTableError';this.issues=issues;this.records=records;}
}
const aliases={
 window:['window','window id','windowid','line','窗位','窗号','编号'],
 model:['model','product code','product','sku','型号','产品型号'],
 width:['width','width (in)','width inches','w','宽','宽度'],
 height:['height','height (in)','height inches','h','高','高度'],
 qty:['qty','quantity','数量'],color:['color','colour','颜色'],
 notes:['notes','remark','remarks','备注']
} as const;
function parseRows(source:string,delimiter:','|'\t'){
 const rows:{values:string[];line:number;original:string}[]=[];
 let values:string[]=[],value='',quoted=false,closed=false,line=1,rowLine=1,rowStart=0;
 const push=(end:number)=>{values.push(value);if(values.some(x=>x.trim()))rows.push({values,line:rowLine,original:source.slice(rowStart,end)});values=[];value='';closed=false;};
 for(let i=0;i<source.length;i++){
  const c=source[i];
  if(quoted){
   if(c==='"'&&source[i+1]==='"'){value+='"';i++;}
   else if(c==='"'){quoted=false;closed=true;}
   else{value+=c;if(c==='\n')line++;}
  }else if(c==='"'&&value==='')quoted=true;
  else if(c===delimiter){values.push(value);value='';closed=false;}
  else if(c==='\n'||c==='\r'){
   const end=i;if(c==='\r'&&source[i+1]==='\n')i++;
   push(end);line++;rowLine=line;rowStart=i+1;
  }else if(closed&&c!==' ')throw Error('Invalid characters after quoted cell at row '+rowLine);
  else value+=c;
 }
 if(quoted)throw Error('Unclosed quoted cell');
 push(source.length);return rows;
}
export function parseDelimitedInquiry(source:string,delimiter:','|'\t'):TableIntake{
 if(typeof source!=='string'||!source.trim())throw Error('Empty table');
 const data=parseRows(source.replace(/^\uFEFF/,''),delimiter);
 if(!data.length)throw Error('Empty table');
 if(data.length===1)throw Error('No data rows');
 if(data.length>101)throw Error('More than 100 data rows; split file before intake');
 const headers=data[0].values.map(x=>x.trim());
 const normalized=headers.map(x=>x.toLowerCase());
 const match=(names:readonly string[])=>normalized.findIndex(h=>names.includes(h));
 const positions=Object.fromEntries(Object.entries(aliases).map(([key,names])=>[key,match(names)])) as Record<keyof typeof aliases,number>;
 if(positions.model<0||positions.width<0||positions.height<0)throw Error('Required headers: model, width, height');
 const warnings:string[]=[],seen=new Set<string>();
 const records=data.slice(1).map((record,index)=>{
  const at=(key:keyof typeof aliases)=>positions[key]<0?'':(record.values[positions[key]]??'').trim();
  const id=at('window')||String(index+1),issues:string[]=[];
  if(positions.window>=0&&!at('window'))issues.push('Missing window ID');
  if(record.values.length!==headers.length)issues.push('Column count differs from header');
  if(!at('model')||!at('width')||!at('height'))issues.push('Missing model or dimensions');
  if(positions.qty>=0&&(!/^[1-9]\d*$/.test(at('qty'))||!Number.isSafeInteger(Number(at('qty')))))issues.push('Invalid quantity');
  const canonical=id.trim().toUpperCase();
  if(seen.has(canonical))issues.push('Duplicate window ID');seen.add(canonical);
  for(const issue of issues)warnings.push('Row '+record.line+' ('+id+'): '+issue);
  return {sourceRow:record.line,sourceWindowId:id,originalRow:record.original,
   cells:record.values.map((raw,column)=>({column:column+1,header:headers[column]??'',raw})),
   widthRaw:at('width'),heightRaw:at('height'),quantityRaw:at('qty'),issues};
 });
 if(warnings.length)throw new IntakeTableError('Table requires correction before extraction',warnings,records);
 const text=records.map((record,i)=>{
  const values=data[i+1].values;
  const at=(key:keyof typeof aliases)=>positions[key]<0?'':(values[positions[key]]??'').trim();
  return record.sourceWindowId+': '+[at('model'),record.widthRaw+' x '+record.heightRaw,positions.qty>=0?'qty '+record.quantityRaw:'',at('color'),at('notes')].filter(Boolean).join(' ');
 }).join('\n');
 if(text.length>12000)throw Error('Converted inquiry exceeds 12,000 characters');
 return {text,warnings,rows:records.length,sourceText:source,records,headers};
}
