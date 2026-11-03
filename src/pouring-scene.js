import {state,save} from './state.js';
import {vesselGeometry,waterHeight,pourInto,clampValue as clamp} from './scene-model.js';
import {addRecord} from './inquiry-model.js';
import {playCue} from './sound.js';

// Presentation may ease toward a recorded amount; the learner's measured amount is authoritative.
let displayed=null;
const glassFrames={
 tall:{empty:[122,24,276,571],body:[144,797,232,390],surface:[140,756,240,44]},
 wide:{empty:[559,23,621,574],body:[582,986,572,201],surface:[574,931,590,62]}
};
function drawGlass(ctx,photo,key,amount,wave,time,flow){
 const {x,width}=vesselGeometry[key],base=253,height=waterHeight(amount,width),inner=width*.93;
 const frame=glassFrames[key],left=x-inner/2,top=base-height;
 ctx.save();
 // A low, soft contact shadow anchors the vessel to the work surface.
 ctx.fillStyle='#3c706c22';ctx.beginPath();ctx.ellipse(x,base+4,width*.56,6,0,0,Math.PI*2);ctx.fill();
 if(height>.15){
  const sway=Math.sin(time/150)*wave,meniscus=5;
  ctx.save();
  ctx.beginPath();ctx.moveTo(left,top+sway);
  ctx.bezierCurveTo(x-inner*.2,top-sway,x+inner*.2,top+sway,left+inner,top-sway);
  ctx.lineTo(left+inner,base-8);ctx.quadraticCurveTo(left+inner,base+2,x,base+3);
  ctx.quadraticCurveTo(left,base+2,left,base-8);ctx.closePath();ctx.clip();
  ctx.drawImage(photo,...frame.body,left,top,inner,height+4);
  const tint=ctx.createLinearGradient(left,0,left+inner,0);
  tint.addColorStop(0,'#347e8b35');tint.addColorStop(.18,'#a2e1dc18');tint.addColorStop(.7,'#e0fcf212');tint.addColorStop(1,'#32778730');
  ctx.fillStyle=tint;ctx.fillRect(left,top,inner,height+4);
  ctx.restore();
  // The photographed surface keeps its shallow perspective as the water level changes.
  ctx.save();ctx.translate(x,top);ctx.rotate(sway/inner);
  ctx.globalAlpha=clamp(height/8,0,1)*.95;
  ctx.drawImage(photo,...frame.surface,-inner/2,-meniscus,inner,meniscus*2);
  ctx.strokeStyle='#dafdfa9c';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(0,0,inner*.485,meniscus*.75,0,0,Math.PI*2);ctx.stroke();
  if(flow&&!state.settings.reduced){
   for(let i=0;i<2;i++){
    const r=((time/600+i*.5)%1)*inner*.38;
    ctx.globalAlpha=(1-r/(inner*.38))*.65;ctx.beginPath();ctx.ellipse(-inner*.12,0,r,r*.13,0,0,Math.PI*2);ctx.stroke();
   }
  }
  ctx.restore();
 }
 ctx.globalAlpha=.82;
 ctx.drawImage(photo,...frame.empty,x-(width+12)/2,49,width+12,210);
 ctx.restore();
}

export function createPouringScene(scene){
 const q=state.inquiry,o=state.activities.observe;
 const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 displayed??={...q.pours};
 for(const key of Object.keys(vesselGeometry))if(q.pours[key]<displayed[key])displayed[key]=q.pours[key];
 const host=scene.game.canvas.closest('.phaser-stage');
 host.setAttribute('aria-busy',String(Object.keys(vesselGeometry).some(key=>q.pours[key]-displayed[key]>.05)));
 const canvas=scene.textures.createCanvas('pouring-water',1440,660),ctx=canvas.context;
 const picture=scene.textures.get('pouring-glass').getSourceImage();
 const jugTexture=scene.textures.get('pouring-jug');
 jugTexture.add('full',0,14,26,779,841);jugTexture.add('empty',0,896,26,777,841);
 const jug=scene.add.image(100,150,'pouring-jug','full').setDisplaySize(134,145).setDepth(9).setInteractive({useHandCursor:true});
 scene.input.setDraggable(jug);
 const emptyJug=scene.add.image(100,150,'pouring-jug','empty').setDisplaySize(134,145).setDepth(9).setAlpha(0);
 const home={x:100,y:150};
 scene.add.image(360,165,'pouring-water').setDisplaySize(720,330).setDepth(4);
 const guides=scene.add.graphics().setDepth(5),motion={tall:0,wide:0};
 let drew=false,streamKey=null,streamUntil=0;
 Object.entries(vesselGeometry).forEach(([key,v])=>{
  scene.text(v.x,285,key==='tall'?'길쭉한 그릇':'넓은 그릇',20);
  scene.zone(v.x,158,v.width+28,224,()=>scene.action('ix-pour-target-'+key));
 });
 const instruction=scene.text(100,265,'그릇 위에 놓아 봐',17);
 const remaining=document.getElementById('jug-remaining');
 const receiving=()=>Object.keys(vesselGeometry).find(key=>Math.abs(jug.x-vesselGeometry[key].x)<vesselGeometry[key].width/2+35&&jug.y<220);
 const record=()=>{
  void playCue('pour');
  addRecord(q,1,0,{kind:'pour',pours:structuredClone(q.pours)},'같은 양을 담은 물');
  scene.cue(o.pours.length===2?'같은 양을 담았어! 두 그릇의 물높이를 비교해 봐.':'한 그릇에 다 담았어. 다른 그릇에도 같은 양을 부어 보자.');
 };
 jug.onRelease=()=>{
  const key=receiving();
  if(key&&q.pours[key]<100){pourInto(q,o,key,100);record();}
  save();scene.commit();
 };
 scene.tick=(time,dt)=>{
  const manual=scene.dragging===jug;
  const pendingKey=Object.keys(vesselGeometry).find(k=>q.pours[k]-displayed[k]>.05);
  if(pendingKey){streamKey=pendingKey;streamUntil=time+140;}
  const continuous=streamKey&&time<streamUntil&&q.pours[streamKey]<100;
  const key=manual?receiving():pendingKey??(continuous?streamKey:null);
  let changed=false,flow=false;
  if(manual&&key&&q.pours[key]<100){
   flow=true;
   const completed=pourInto(q,o,key,dt*.045);
   if(completed)record();
  }
  for(const name of Object.keys(vesselGeometry)){
   const target=q.pours[name],before=displayed[name];
   displayed[name]=reduced()||manual?target:Math.min(target,before+dt*.15);
   const rise=displayed[name]-before;
   if(rise>.001){changed=true;motion[name]=reduced()?0:Math.min(1.5,motion[name]+rise*.16);}
   else motion[name]*=Math.exp(-dt/260);
  }
  const going=key&&!manual;
  if(!manual){
   const target=going?{x:vesselGeometry[key].x-70,y:69}:home,rate=reduced()?1:1-Math.exp(-dt/75);
   jug.x+=(target.x-jug.x)*rate;jug.y+=(target.y-jug.y)*rate;
  }
  const active=!!key&&(flow||changed||continuous),angle=active?35:0;
  jug.angle=reduced()?0:jug.angle+(angle-jug.angle)*(1-Math.exp(-dt/70));
  const amount=key?displayed[key]:displayed[q.pourTarget],alpha=clamp(amount/100,0,1);
  // The empty and full photographs share a silhouette and cross-fade as the serving is poured.
  jug.setAlpha(1-alpha*.92);emptyJug.setPosition(jug.x,jug.y).setAngle(jug.angle).setAlpha(alpha);
  emptyJug.setDepth(jug.depth-1);
  const moving=Object.values(motion).some(v=>v>.02)||active;
  if(!drew||changed||moving){
   ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,720,330);
   for(const name of Object.keys(vesselGeometry))drawGlass(ctx,picture,name,displayed[name],reduced()?0:motion[name],time,key===name&&active);
   if(active&&!reduced()){
    const radians=jug.angle*Math.PI/180;
    const from={x:jug.x+61*Math.cos(radians)+54*Math.sin(radians),y:jug.y+61*Math.sin(radians)-54*Math.cos(radians)};
    const v=vesselGeometry[key],end={x:v.x-v.width*.10,y:253-waterHeight(displayed[key],v.width)};
    if(end.y>from.y+3){
     ctx.lineCap='round';
     const stream=ctx.createLinearGradient(from.x-3,0,from.x+4,0);stream.addColorStop(0,'#72c1ca80');stream.addColorStop(.6,'#d9ffffb8');stream.addColorStop(1,'#88c5d474');
     ctx.strokeStyle=stream;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.quadraticCurveTo(from.x+Math.sin(time/90)*1.5,end.y-12,end.x,end.y);ctx.stroke();
     ctx.strokeStyle='#f2ffffb3';ctx.lineWidth=1;ctx.stroke();
     for(let i=0;i<3;i++){const t=((time/410+i/3)%1),y=from.y+(end.y-from.y)*t;ctx.fillStyle='#daf5fbaa';ctx.beginPath();ctx.ellipse(from.x+(end.x-from.x)*t,y,1.3,2.3,0,0,Math.PI*2);ctx.fill();}
    }
   }
   canvas.refresh();drew=true;
  }
  guides.clear();
  if(!o.pours.includes(q.pourTarget)){
   const v=vesselGeometry[q.pourTarget];
   guides.lineStyle(1.5,0x54877f,.48).strokeRoundedRect(v.x-v.width/2-13,46,v.width+26,219,15);
  }
  const returning=!manual&&Math.hypot(jug.x-home.x,jug.y-home.y)>.5;
  host.setAttribute('aria-busy',String(active||returning));
  const complete=o.pours.length===2&&Object.values(displayed).every(v=>v>=99.95);
  instruction.setText(complete?'물높이를 비교해 봐':active?'같은 양을 붓는 중':o.pours.length?'다른 그릇에도 부어 봐':'그릇 위에 놓아 봐');
  if(remaining)remaining.textContent=String(Math.round(100-displayed[key??q.pourTarget]));
 };
}

