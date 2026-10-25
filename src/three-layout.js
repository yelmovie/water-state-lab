// Maps the 2D workshop layout (720×330 stage, 1 px = 1 mm) onto the 3D view.
// Models are exported in metres: bottom origin, except the ramp and the wheel (centre origin).
export const MODEL_DIR='/assets/models/';
export const deviceModels={plate:'device-cooling-plate.glb',ramp:'device-ramp.glb',funnel:'device-funnel.glb',tube:'device-tube.glb',bucket:'device-bucket.glb',core:'water-core.glb'};
export const islandModels={island:'island-diorama.glb',stand:'waterwheel-stand.glb',wheel:'waterwheel-wheel.glb'};
const heights={plate:.07,funnel:.075,tube:.07,bucket:.067};
const SCALE=.64,OFFSET=10,W=720,H=330;
// The 2D ramp sprite is 211 px wide, pivots 10% from its left end and its tray fills ~92% of the sprite.
export const RAMP={model:.14,length:.194,pivotToCentre:84.4,run:170};
const toWorld=(x,screenY)=>({x:(x-W/2)/1000,y:(H-screenY)/1000});

export function deviceLayout(design,withCore=false){
 const parts={},screen=key=>({x:design.parts[key].x,y:design.parts[key].y*SCALE+OFFSET});
 for(const key of ['plate','funnel','tube','bucket']){const c=toWorld(screen(key).x,screen(key).y);parts[key]={x:c.x,y:c.y-heights[key]/2,rotation:0,scale:1};}
 const theta=Math.atan((design.angle||0)*2/180),pivot=screen('ramp'),along=d=>toWorld(pivot.x+d*Math.cos(theta),pivot.y+d*Math.sin(theta));
 const mid=along(RAMP.pivotToCentre);parts.ramp={x:mid.x,y:mid.y,rotation:-theta,scale:RAMP.length/RAMP.model};
 const centre=key=>({x:parts[key].x,y:parts[key].y+heights[key]/2});
 const path=[centre('plate'),along(0),along(RAMP.run),centre('funnel'),centre('tube'),centre('bucket')];
 if(withCore){const bottom=toWorld(638,299);parts.core={x:bottom.x,y:bottom.y,rotation:0,scale:1};path.push(toWorld(598,272));}
 return {parts,path,cold:!!design.cold};
}

// Point at fraction t (0..1) along a polyline, used for the travelling water drops.
export function pointAlong(path,t){
 const lengths=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y)),total=lengths.reduce((a,b)=>a+b,0);
 let d=Math.max(0,Math.min(1,t))*total;
 for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1){const k=lengths[i]?Math.min(1,d/lengths[i]):0;return {x:path[i].x+(path[i+1].x-path[i].x)*k,y:path[i].y+(path[i+1].y-path[i].y)*k};}d-=lengths[i];}
 return path.at(-1);
}
