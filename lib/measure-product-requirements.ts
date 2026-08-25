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
