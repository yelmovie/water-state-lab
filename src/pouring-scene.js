import {state,save} from './state.js';
import {vesselGeometry,pourServing,servingVolume,jugRemaining,pourWaterHeight,pourInto,pourComparison,beakerInner,clampValue as clamp} from './scene-model.js';
import {addRecord} from './inquiry-model.js';
import {playCue} from './sound.js';

// Presentation may ease toward a recorded amount; the learner's measured amount is authoritative.
let displayed=null;
const base=264;
const glassFrames={
 tall:{empty:[122,24,276,571],body:[144,797,232,390],tilt:.16},
 wide:{empty:[559,23,621,574],body:[582,986,572,201],tilt:.1}
};
const surfaceDrop=(key,height)=>3-vesselGeometry[key].width/2*glassFrames[key].tilt-height;
export const waterSurfaceY=(key,amount,floor=base,scale=1)=>floor+scale*surfaceDrop(key,pourWaterHeight(amount,vesselGeometry[key].width));
function shellPlacer(ctx,photo,key){
 const {width,height}=vesselGeometry[key],frame=glassFrames[key],shellWidth=width*frame.empty[2]/frame.body[2];
 return ()=>ctx.drawImage(photo,...frame.empty,-shellWidth/2,-height*.91,shellWidth,height);
}
// Water seen through curved glass. Every vessel in the game uses this, so water always looks like the same substance.
export function paintWaterColumn(ctx,{half,ry,top,floor,sway=0,time=0,flow=false,glass}){
 const width=half*2,height=floor-top,tilt=-sway/half;
 ctx.save();
 ctx.beginPath();ctx.moveTo(-half,top+sway);ctx.lineTo(-half,floor);
 ctx.ellipse(0,floor,half,ry,0,Math.PI,0,true);ctx.lineTo(half,top-sway);
 ctx.ellipse(0,top,half,ry,tilt,0,Math.PI,true);ctx.closePath();ctx.clip();
 const depth=ctx.createLinearGradient(0,top,0,floor+ry);
 depth.addColorStop(0,'#c2e2e3b8');depth.addColorStop(.4,'#a4ced3c4');depth.addColorStop(1,'#86b6c0d4');
 ctx.fillStyle=depth;ctx.fillRect(-half,top-ry,width,height+ry*2);
 // Light bends at the curved wall: darker edges, a clear centre.
 const lens=ctx.createLinearGradient(-half,0,half,0);
 lens.addColorStop(0,'#41758254');lens.addColorStop(.13,'#41758216');lens.addColorStop(.32,'#ffffff30');
 lens.addColorStop(.6,'#ffffff08');lens.addColorStop(.88,'#4175821a');lens.addColorStop(1,'#41758260');
 ctx.fillStyle=lens;ctx.fillRect(-half,top-ry,width,height+ry*2);
 glass?.();
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 if(flow){
  ctx.fillStyle='#ffffffb0';
  for(let i=0;i<6;i++){
   const rise=(time/900+i*.17)%1;
   ctx.beginPath();ctx.arc(Math.sin(i*2.4)*half*.5+Math.sin(time/240+i)*2,floor-rise*height,1+i%3*.6,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
 ctx.save();ctx.translate(0,top);ctx.rotate(tilt);ctx.globalAlpha=clamp(height/8,0,1);
 const skin=ctx.createLinearGradient(-half,0,half,0);
 skin.addColorStop(0,'#b9dfe1');skin.addColorStop(.3,'#e9f6f5');skin.addColorStop(.7,'#cce8e7');skin.addColorStop(1,'#a9d1d5');
 ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(0,0,half,ry,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,half,ry,0,0,Math.PI);ctx.stroke();
 ctx.strokeStyle='#6d9eaa99';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,half,ry,0,Math.PI,Math.PI*2);ctx.stroke();
 if(flow){
  ctx.strokeStyle='#ffffffd8';
  for(let i=0;i<2;i++){
   const r=((time/600+i*.5)%1)*half*.76;
   ctx.globalAlpha=1-r/(half*.76);ctx.beginPath();ctx.ellipse(-half*.24,0,r,r*ry/half,0,0,Math.PI*2);ctx.stroke();
  }
 }
 ctx.restore();
}
// The photographed shell is milky, so it stays behind the water and only its highlights return in front.
function paintWater(ctx,photo,key,height,wave,time,flow,shell){
 const {width}=vesselGeometry[key],frame=glassFrames[key],half=width/2,ry=half*frame.tilt,top=surfaceDrop(key,height);
 paintWaterColumn(ctx,{half,ry,top,floor:top+height,sway:Math.sin(time/150)*wave,time,flow,glass(){
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.86;
  ctx.drawImage(photo,...frame.body,-half,top,width,height+ry);
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=.6;shell();
 }});
}
/** Water in the atlas beaker. `shell` is the rectangle the beaker art is drawn in. */
export function drawBeakerWater(ctx,atlas,shell,{top,wave=0,time=0}){
 const {cx,half,ry,floor}=beakerInner(shell),sw=atlas.width/3,sh=atlas.height/3;
 ctx.save();ctx.translate(cx,0);
 paintWaterColumn(ctx,{half,ry,top,floor,sway:Math.sin(time/150)*wave,glass(){
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=.3;
  ctx.drawImage(atlas,sw*.12,sh*.07,sw*.76,sh*.86,shell.left-cx,shell.top,shell.width,shell.height);
 }});
 ctx.restore();
}
export function drawVessel(ctx,photo,key,{x,floor=base,scale=1,amount=0,wave=0,time=0,flow=false}){
 const {width}=vesselGeometry[key],height=pourWaterHeight(amount,width),shell=shellPlacer(ctx,photo,key);
 ctx.save();ctx.translate(x,floor);ctx.scale(scale,scale);
 // A low, soft contact shadow anchors the vessel to the work surface.
 ctx.fillStyle='#3c706c33';ctx.beginPath();ctx.ellipse(0,15,width*.62,6,0,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=.82;shell();ctx.globalAlpha=1;
 if(height>.15)paintWater(ctx,photo,key,height,wave,time,flow,shell);
 ctx.restore();
}
/** The near wall of the glass, drawn over whatever stands inside. */
export function drawVesselFront(ctx,photo,key,{x,floor=base,scale=1}){
 ctx.save();ctx.translate(x,floor);ctx.scale(scale,scale);ctx.globalAlpha=.5;shellPlacer(ctx,photo,key)();ctx.restore();
}
export function dashedLine(g,from,to,y){for(let x=from;x<to;x+=13)g.lineBetween(x,y,Math.min(x+7,to),y);}

const home={x:117,y:162},jugWidth=216,jugHeight=234,jugScale=.78;
const jugFrame=[896,26,777,841],tilt=.52;
const spout={x:jugWidth*.475*jugScale,y:-jugHeight*.42*jugScale};
// Trace the inside of the glass, excluding its handle and thick bottom.
const jugProfile=[[.13,.36,.85],[.40,.36,.85],[.49,.335,.88],[.57,.31,.912],[.64,.30,.927],[.73,.316,.911],[.81,.348,.88],[.87,.389,.837]];
const crossSection=([y,left,right])=>({y:y*jugHeight,left:left*jugWidth,right:right*jugWidth});
const jugSections=jugProfile.map(crossSection);
const jugBands=[];
let volumeBelow=0;
for(let i=jugSections.length-1;i>0;i--){
 const bottom=jugSections[i],top=jugSections[i-1],a=bottom.right-bottom.left,b=top.right-top.left;
 // Common π/4 factor cancels when comparing the jug and the cylindrical glasses.
 const volume=(bottom.y-top.y)*(a*a+a*b+b*b)/3;
 jugBands.push({bottom,top,volumeBelow,volume});
 volumeBelow+=volume;
}
function jugSurface(amount){
 const volume=amount/pourServing*servingVolume;
 const band=jugBands.find(b=>volume<=b.volumeBelow+b.volume)??jugBands.at(-1);
 const {bottom,top,volumeBelow,volume:bandVolume}=band;
 const ratio=clamp((volume-volumeBelow)/bandVolume,0,1);
 return {y:bottom.y+(top.y-bottom.y)*ratio,left:bottom.left+(top.left-bottom.left)*ratio,right:bottom.right+(top.right-bottom.right)*ratio};
}
function drawJug(ctx,photo,amount,angle){
 ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,jugWidth,jugHeight);
 ctx.drawImage(photo,...jugFrame,0,0,jugWidth,jugHeight);
 if(amount>.1){
  const {y,left,right}=jugSurface(amount),center=(left+right)/2,radius=(right-left)/2,depth=Math.min(radius*.16,3+amount*.07);
  ctx.save();
  ctx.beginPath();
  jugSections.forEach(({y,left},i)=>i?ctx.lineTo(left,y):ctx.moveTo(left,y));
  const bottom=jugSections.at(-1);
  ctx.quadraticCurveTo(jugWidth*.612,bottom.y+18,bottom.right,bottom.y);
  for(let i=jugSections.length-2;i>=0;i--)ctx.lineTo(jugSections[i].right,jugSections[i].y);
  ctx.closePath();ctx.clip();
  ctx.save();ctx.translate(center,y);ctx.rotate(-angle);
  const water=ctx.createLinearGradient(-radius,0,radius,0);
  water.addColorStop(0,'#1582c4c8');water.addColorStop(.2,'#4fc4eebc');
  water.addColorStop(.56,'#3bb4e6c0');water.addColorStop(.85,'#5ccbefc0');water.addColorStop(1,'#1582c4d0');
  ctx.fillStyle=water;ctx.fillRect(-jugWidth,0,jugWidth*2,jugHeight);
  const surface=ctx.createLinearGradient(-radius,0,radius,0);
  surface.addColorStop(0,'#b9dfe1');surface.addColorStop(.35,'#e9f6f5');surface.addColorStop(1,'#a9d1d5');
  ctx.beginPath();ctx.ellipse(0,0,radius,depth,0,0,Math.PI*2);ctx.fillStyle=surface;ctx.fill();
  ctx.strokeStyle='#6d9eaa99';ctx.lineWidth=1;ctx.stroke();
  ctx.restore();
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=.55;
  ctx.drawImage(photo,...jugFrame,0,0,jugWidth,jugHeight);
  ctx.restore();
 }
}
const rotate=({x,y},angle)=>({x:x*Math.cos(angle)-y*Math.sin(angle),y:x*Math.sin(angle)+y*Math.cos(angle)});
export function createPourJug(scene,x,y,scale=jugScale){
 const canvas=scene.textures.createCanvas('pouring-jug-live',jugWidth*2,jugHeight*2);
 const photo=scene.textures.get('pouring-jug').getSourceImage();
 const image=scene.add.image(x,y,'pouring-jug-live').setDisplaySize(jugWidth*scale,jugHeight*scale).setDepth(9);
 return {
  image,
  paint(amount){drawJug(canvas.context,photo,amount,image.rotation);canvas.refresh();},
  mouth(){
   const tip=rotate(spout,image.rotation);
   return {x:image.x+tip.x*scale/jugScale,y:image.y+tip.y*scale/jugScale};
  }
 };
}
export function drawWaterStream(ctx,from,to,time,head=1,tail=0){
 const bend={x:from.x+Math.sin(time/90)*1.5,y:to.y-12};
 const point=t=>({x:(1-t)**2*from.x+2*t*(1-t)*bend.x+t*t*to.x,y:(1-t)**2*from.y+2*t*(1-t)*bend.y+t*t*to.y});
 const start=point(tail),end=point(head),span=head-tail;
 const stream=ctx.createLinearGradient(from.x-3,0,from.x+4,0);
 stream.addColorStop(0,'#2ba6dcb0');stream.addColorStop(.6,'#c8f4ffe8');stream.addColorStop(1,'#2ba6dca8');
 ctx.lineCap='round';ctx.strokeStyle=stream;ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(start.x,start.y);
 ctx.quadraticCurveTo(start.x+span*((1-tail)*(bend.x-from.x)+tail*(to.x-bend.x)),start.y+span*((1-tail)*(bend.y-from.y)+tail*(to.y-bend.y)),end.x,end.y);ctx.stroke();
 ctx.strokeStyle='#f2ffffd0';ctx.lineWidth=1;ctx.stroke();
}
function glassLip({x,width,height}){return {x:x-width*.08,y:base-height*.91+2};}

export function createPouringScene(scene){
 const q=state.inquiry,o=state.activities.observe;
 const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const names=Object.keys(vesselGeometry);
 displayed??={...q.pours};
 for(const key of names)if(q.pours[key]<displayed[key])displayed[key]=q.pours[key];
 const host=scene.game.canvas.closest('.phaser-stage');
 host.setAttribute('aria-busy',String(names.some(key=>q.pours[key]-displayed[key]>.05)));
 const canvas=scene.textures.createCanvas('pouring-water',1440,660),ctx=canvas.context;
 const picture=scene.textures.get('pouring-glass').getSourceImage();
 const jugArt=createPourJug(scene,home.x,home.y);
 const jug=jugArt.image.setInteractive({useHandCursor:true});
 scene.input.setDraggable(jug);
 scene.add.image(360,165,'pouring-water').setDisplaySize(720,330).setDepth(4);
 const guides=scene.add.graphics().setDepth(5),motion={tall:0,wide:0};
 let drew=false,hadStream=false,lastAmount=-1,lastAngle=0,dragPoint=null,shown={...home,angle:0};
 Object.entries(vesselGeometry).forEach(([key,v])=>{
  scene.text(v.x,302,key==='tall'?'길쭉한 그릇':'넓은 그릇',20);
  scene.zone(v.x,158,v.width+28,224,()=>scene.action('ix-pour-target-'+key));
 });
 const instruction=scene.text(home.x,302,'그릇 위에 놓아 봐',17);
 const amounts=Object.fromEntries(names.map(key=>[key,scene.text(vesselGeometry[key].x,base-vesselGeometry[key].height*.91-16,'',18).setDepth(21).setVisible(false)]));
 const shownAmounts={};
 const gapX=(vesselGeometry.tall.x+vesselGeometry.tall.width*.6+vesselGeometry.wide.x-vesselGeometry.wide.width*.55)/2;
 const gapLabel=scene.text(gapX,0,'',18).setVisible(false);
 const remaining=document.getElementById('jug-remaining');
 const receiving=({x,y})=>names.find(key=>Math.abs(x-vesselGeometry[key].x)<vesselGeometry[key].width/2+35&&y<220);
 const record=()=>{
  void playCue('pour');
  addRecord(q,1,0,{kind:'pour',pours:structuredClone(q.pours)},'같은 양을 담은 물');
  scene.cue(o.pours.length===2?'같은 양을 담았어! 두 그릇의 물높이를 비교해 봐.':'남은 반을 다른 그릇에도 부어 보자.');
 };
 jug.onMove=()=>{dragPoint={x:jug.x,y:jug.y};};
 jug.onRelease=()=>{
  const key=dragPoint&&receiving(dragPoint);
  dragPoint=null;
  if(key&&q.pours[key]<pourServing){pourInto(q,o,key,pourServing);record();}
  save();scene.commit();
 };
 scene.tick=(time,dt)=>{
  const manual=scene.dragging===jug,still=reduced();
  if(!manual)dragPoint=null;
  const pendingKey=names.find(k=>q.pours[k]-displayed[k]>.05);
  const key=(dragPoint&&receiving(dragPoint))||pendingKey;
  const lip=key?glassLip(vesselGeometry[key]):null;
  const pouring=key&&(manual||pendingKey);
  const angle=pouring&&!still?tilt:0;
  const tip=rotate(spout,angle);
  const target=lip?{x:lip.x-tip.x,y:lip.y-16-tip.y}:dragPoint??home;
  const rate=still||!lip&&manual?1:1-Math.exp(-dt/55);
  shown.x+=(target.x-shown.x)*rate;shown.y+=(target.y-shown.y)*rate;
  shown.angle+=(angle-shown.angle)*rate;
  if(Math.abs(shown.angle-angle)<.001)shown.angle=angle;
  jug.setPosition(shown.x,shown.y).setRotation(shown.angle);
  const from=jugArt.mouth();
  const aligned=lip&&(still||Math.hypot(from.x-lip.x,from.y-lip.y+16)<12);
  let changed=false,flow=false;
  if(manual&&key&&aligned&&q.pours[key]<pourServing){
   flow=true;
   if(pourInto(q,o,key,dt*.045))record();
  }
  for(const name of names){
   const targetAmount=q.pours[name],before=displayed[name];
   if(still||flow&&name===key||targetAmount-before<=.05)displayed[name]=targetAmount;
   else if(aligned||name!==key)displayed[name]=Math.min(targetAmount,before+dt*.15);
   const rise=displayed[name]-before;
   if(rise>.001){changed=true;motion[name]=still?0:Math.min(1.5,motion[name]+rise*.16);}
   else motion[name]*=Math.exp(-dt/260);
  }
  const amount=jugRemaining(displayed);
  if(Math.abs(lastAmount-amount)>.08||Math.abs(lastAngle-shown.angle)>.004||amount===0&&lastAmount!==0){
   jugArt.paint(amount);lastAmount=amount;lastAngle=shown.angle;
  }
  const streaming=!!(aligned&&(flow||pendingKey)&&!still);
  const moving=streaming||Object.values(motion).some(v=>v>.02);
  if(!drew||changed||moving||hadStream){
   ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,720,330);
   for(const name of names)drawVessel(ctx,picture,name,{x:vesselGeometry[name].x,amount:displayed[name],wave:still?0:motion[name],time,flow:key===name&&streaming&&!still});
   if(streaming)drawWaterStream(ctx,from,{x:lip.x,y:waterSurfaceY(key,displayed[key])},time);
   canvas.refresh();drew=true;
  }
  hadStream=streaming;
  guides.clear();
  if(!o.pours.includes(q.pourTarget)){
   const v=vesselGeometry[q.pourTarget],top=glassLip(v).y-6;
   guides.lineStyle(1.5,0x54877f,.48).strokeRoundedRect(v.x-v.width/2-13,top,v.width+26,base+19-top,15);
  }
  for(const name of names)if(displayed[name]<pourServing-.05){
   const v=vesselGeometry[name];
   guides.lineStyle(2,0x9c691f,.93);
   dashedLine(guides,v.x-v.width*.48,v.x+v.width*.48,waterSurfaceY(name,pourServing));
  }
  const returning=!manual&&Math.hypot(shown.x-home.x,shown.y-home.y)>.5;
  host.setAttribute('aria-busy',String(!!pendingKey||flow||returning));
  const complete=o.pours.length===2&&names.every(v=>displayed[v]>=pourServing-.05);
  if(complete){
   // Each level carries across to the other vessel, so the two heights can be read against one line.
   const {ratio}=pourComparison(displayed),high=waterSurfaceY('tall',pourServing),low=waterSurfaceY('wide',pourServing);
   const wall=name=>vesselGeometry[name].width*.6;
   guides.lineStyle(2,0xb4701c,.9);
   dashedLine(guides,vesselGeometry.tall.x-wall('tall'),vesselGeometry.wide.x+wall('wide'),high);
   dashedLine(guides,vesselGeometry.tall.x-wall('tall'),vesselGeometry.wide.x+wall('wide'),low);
   guides.lineBetween(gapX,high+4,gapX,low-4);
   guides.fillStyle(0xb4701c,.95).fillTriangle(gapX,high,gapX-5,high+9,gapX+5,high+9).fillTriangle(gapX,low,gapX-5,low-9,gapX+5,low-9);
   if(!gapLabel.visible)gapLabel.setText(`약 ${ratio}배\n높아`).setPosition(gapX,(high+low)/2).setVisible(true);
  }else if(gapLabel.visible)gapLabel.setVisible(false);
  for(const name of names){
   const mL=Math.round(displayed[name]);
   if(mL===shownAmounts[name])continue;
   shownAmounts[name]=mL;amounts[name].setText(mL===pourServing?`물 ${mL}mL`:`${mL} / ${pourServing}mL`).setVisible(true);
  }
  instruction.setText(complete?'물높이를 비교해 봐':streaming||flow?'같은 양을 붓는 중':o.pours.length?'다른 그릇에도 부어 봐':'그릇 위에 놓아 봐');
  if(remaining)remaining.textContent=String(Math.round(amount));
 };
}
