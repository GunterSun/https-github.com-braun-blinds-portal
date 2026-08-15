export const THREE_POINT=["width_left","width_center","width_right","height_left","height_center","height_right"] as const;

const PRODUCT_REQUIRED:Record<string,readonly string[]>={
 roller:THREE_POINT,roman:THREE_POINT,zebra:THREE_POINT,honeycomb:THREE_POINT,shutter:[...THREE_POINT,"handle_projection"],blind:THREE_POINT,motorized:THREE_POINT,
 drapery:["width_center","height_center","return_left","return_right","overlap_left","overlap_right","stack_back_left","stack_back_right"],
 track_rod:["width_center","height_center","return_left","return_right","stack_back_left","stack_back_right"],
 cornice_valance:["width_center","height_center","return_left","return_right"]
};

export function requiredMeasureFields(productType:string,mountType:string){
 const required=[...(PRODUCT_REQUIRED[productType]||THREE_POINT)];
 if(mountType==="inside"&&!required.includes("depth"))required.push("depth");
 return required;
}

export function requiresPowerConfirmation(productType:string){return productType==="motorized"}

const THREE_POINT_GROUPS=[["width_left","width_center","width_right"],["height_left","height_center","height_right"]];
export const THREE_POINT_TOLERANCE_SIXTEENTHS=8;
export function measureThreePointSpread(values:{fieldKey:string;totalSixteenths:number}[]){
 const map=new Map(values.map(value=>[value.fieldKey,value.totalSixteenths]));
 return THREE_POINT_GROUPS.reduce((largest,group)=>{const points=group.map(key=>map.get(key)).filter((value):value is number=>value!==undefined);return points.length===3?Math.max(largest,Math.max(...points)-Math.min(...points)):largest},0);
}
