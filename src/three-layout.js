// Maps the 2D workshop layout (720×330 stage, 1 px = 1 mm) onto the 3D view.
// Models are exported in metres: bottom origin, except the ramp and the wheel (centre origin).
export const MODEL_DIR='/assets/models/';
export const deviceModels={plate:'device-cooling-plate.glb',ramp:'device-ramp.glb',funnel:'device-funnel.glb',tube:'device-tube.glb',bucket:'device-bucket.glb',core:'water-core.glb'};
export const islandModels={island:'island-diorama.glb',stand:'waterwheel-stand.glb',wheel:'waterwheel-wheel.glb'};
// The mill sits on a low stone foundation so its outlet is above the village channel.
export const MILL={x:.24,y:.012,z:.16,scale:1.15,yaw:-2.1,wheel:{x:0,y:.115,z:-.019}};
export const MILL_CUP={x:0,y:.047,z:.069,radius:.0185};
export function islandWaterwayLayout(mill=MILL){
 const c=Math.cos(mill.yaw),s=Math.sin(mill.yaw),cup={x:mill.x+(MILL_CUP.x*c+MILL_CUP.z*s)*mill.scale,y:mill.y+MILL_CUP.y*mill.scale,z:mill.z+(-MILL_CUP.x*s+MILL_CUP.z*c)*mill.scale};
 const outlet={x:cup.x-.023,y:cup.y-.001,z:cup.z};
 // Surveyed against island-diorama.glb: the last reach meets the stream below the greenhouse.
 const path=[outlet,{x:.131,y:.062,z:.133},{x:.119,y:.059,z:.143},{x:.105,y:.056,z:.143},{x:.1,y:.0535,z:.137}];
 return {cup,path,landing:{x:.1,y:.0508,z:.137},width:.014};
}
const heights={plate:.07,funnel:.075,tube:.07,bucket:.067};
const SCALE=.64,OFFSET=10,W=720,H=330;
// The 2D ramp sprite is 211 px wide, pivots 10% from its left end and its tray fills ~92% of the sprite.
export const RAMP={model:.14,length:.194,pivotToCentre:84.4,run:170};
const toWorld=(x,screenY)=>({x:(x-W/2)/1000,y:(H-screenY)/1000});

export function deviceLayout(design,withCore=false,coreInletY=272){
 const parts={},screen=key=>({x:design.parts[key].x,y:design.parts[key].y*SCALE+OFFSET});
 for(const key of ['plate','funnel','tube','bucket']){const c=toWorld(screen(key).x,screen(key).y);parts[key]={x:c.x,y:c.y-heights[key]/2,rotation:0,scale:1};}
 const theta=Math.atan((design.angle||0)*2/180),pivot=screen('ramp'),along=d=>toWorld(pivot.x+d*Math.cos(theta),pivot.y+d*Math.sin(theta));
 const mid=along(RAMP.pivotToCentre);parts.ramp={x:mid.x,y:mid.y,rotation:-theta,scale:RAMP.length/RAMP.model};
 const centre=key=>({x:parts[key].x,y:parts[key].y+heights[key]/2});
 const path=[centre('plate'),along(0),along(RAMP.run),centre('funnel'),centre('tube'),centre('bucket')];
 if(withCore){const bottom=toWorld(638,coreInletY+27);parts.core={x:bottom.x,y:bottom.y,rotation:0,scale:1};path.push(toWorld(598,coreInletY));}
 return {parts,path,cold:!!design.cold};
}

// Point at fraction t (0..1) along a polyline, used for the travelling water drops.
export function pointAlong(path,t){
 const lengths=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y)),total=lengths.reduce((a,b)=>a+b,0);
 let d=Math.max(0,Math.min(1,t))*total;
 for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1){const k=lengths[i]?Math.min(1,d/lengths[i]):0;return {x:path[i].x+(path[i+1].x-path[i].x)*k,y:path[i].y+(path[i+1].y-path[i].y)*k};}d-=lengths[i];}
 return path.at(-1);
}
