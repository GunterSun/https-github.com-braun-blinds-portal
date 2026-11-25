/** RFC-4180 style CSV/TSV parser for local, human-reviewed inquiry intake. */
export type TableIntake = { text: string; warnings: string[]; rows: number };
const LIMIT=100;
export function parseDelimitedInquiry(source:string,delimiter:','|'\t'):TableIntake {
 const cells:string[][]=[];let row:string[]=[];let value='';let quoted=false;
 for(let i=0;i<source.length;i++){
  const c=source[i];
  if(quoted){
   if(c==='"'&&source[i+1]==='"'){value+='"';i++;}
   else if(c==='"')quoted=false;
   else value+=c;
  }else if(c==='"'&&value==='')quoted=true;
  else if(c===delimiter){row.push(value);value='';}
  else if(c==='\n'||c==='\r'){
   if(c==='\r'&&source[i+1]==='\n')i++;
   row.push(value);if(row.some(cell=>cell.trim()))cells.push(row);
   row=[];value='';
  }else value+=c;
 }
 if(quoted)throw Error('Unclosed quoted cell');
 row.push(value);if(row.some(cell=>cell.trim()))cells.push(row);
 if(!cells.length)throw Error('Empty table');
 if(cells.length>LIMIT+1)throw Error('More than 100 data rows; split file before intake');
 const headers=cells[0].map(x=>x.trim().toLowerCase());
 const match=(names:string[])=>headers.findIndex(h=>names.includes(h));
 const columns={
  window:match(['window','window id','windowid','line','窗位','窗号','编号']),
  model:match(['model','product code','product','sku','型号','产品型号']),
  width:match(['width','width (in)','width inches','w','宽','宽度']),
  height:match(['height','height (in)','height inches','h','高','高度']),
  qty:match(['qty','quantity','数量']),
  color:match(['color','colour','颜色']),
  notes:match(['notes','remark','remarks','备注']),
 };
 if(columns.model<0||columns.width<0||columns.height<0)throw Error('Required headers: model, width, height');
 const warnings:string[]=[];
 const text=cells.slice(1).map((cells,i)=>{
  const at=(index:number)=>index<0?'':(cells[index]??'').trim();
  const id=at(columns.window)||String(i+1);
  if(!at(columns.model)||!at(columns.width)||!at(columns.height))
   warnings.push('Row '+(i+2)+' has missing model or dimensions');
  const detail=[at(columns.model),at(columns.width)+' x '+at(columns.height),
   at(columns.qty)?'qty '+at(columns.qty):'',at(columns.color),at(columns.notes)].filter(Boolean).join(' ');
  return id+': '+detail;
 }).join('\n');
 if(text.length>12000)throw Error('Converted inquiry exceeds 12,000 characters');
 return {text,warnings,rows:cells.length-1};
}
