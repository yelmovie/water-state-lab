import {state} from './state.js';
import {observationTime,stop as stopClock} from './inquiry.js';
import {dryTrace} from './activity-model.js';
import {visibleDew,wipeDroplets} from './inquiry-model.js';
import {resetDrawingExperiment} from './drawing-records.js';
import {drawRealDrop,drawWaterStroke} from './study-materials.js';
import {compareStage,comparedPours,iceSeat,iceDropTarget} from './scene-model.js';
import {drawVessel,drawVesselFront,waterSurfaceY,dashedLine} from './pouring-scene.js';
const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastIce=false,iceRelease=null,lastWet=false;
export function createIceScene(scene){
 const o=state.activities.observe,moved=o.iceMoved,{water,ice:icePair,scale,floor}=compareStage;
 const keys=Object.keys(water),names={tall:'길쭉한 그릇',wide:'넓은 그릇'},pours=comparedPours(state.inquiry,o);
 const photo=scene.textures.get('pouring-glass').getSourceImage();
 const layer=(name,depth,paint)=>{
  const texture=scene.textures.createCanvas(name,1440,660);
  texture.context.setTransform(2,0,0,2,0,0);paint(texture.context);texture.refresh();
  scene.add.image(360,165,name).setDisplaySize(720,330).setDepth(depth);
 };
 scene.panel(22,8,310,314,0xeef9fd);scene.panel(366,8,328,314,0xfbf7ea);
 layer('compare-glasses',3,ctx=>{
  for(const key of keys){
   drawVessel(ctx,photo,key,{x:water[key],floor,scale,amount:pours[key]});
   drawVessel(ctx,photo,key,{x:icePair[key],floor,scale});
  }
 });
 layer('compare-front',5.5,ctx=>{for(const key of keys)drawVesselFront(ctx,photo,key,{x:icePair[key],floor,scale});});
 scene.text(177,30,'물 · 액체',22);scene.text(530,30,'얼음 · 고체',22);
 for(const key of keys){scene.text(water[key],264,names[key],18);scene.text(icePair[key],264,names[key],18);}
 scene.text(177,298,'그릇 따라 모양이 달라져',18);
 scene.text(530,298,moved?'그릇을 바꿔도 그대로야':'넓은 그릇으로 옮겨 봐',18);
 const marks=scene.add.graphics().setDepth(5);
 marks.lineStyle(2,0xb4701c,.9);
 for(const key of keys)dashedLine(marks,water.tall-44,water.wide+74,waterSurfaceY(key,pours[key],floor,scale));
 const home=iceSeat('tall'),seat=iceSeat(moved?'wide':'tall'),{size}=seat;
 const shadow=scene.add.ellipse(seat.x,floor+3,size*.86,10,0x24505c,.22).setDepth(4);
 const ice=scene.add.image(seat.x,seat.y,'real-ice','3').setDisplaySize(size,size).setDepth(5);
 if(moved){
  scene.add.image(home.x,home.y,'real-ice','3').setDisplaySize(size,size).setDepth(4).setAlpha(.24);
  // One frame around both blocks: the same size in a narrow and a wide vessel.
  marks.lineStyle(2,0xb4701c,.95);
  for(const {x,y} of [home,seat])marks.strokeRect(x-size*.46,y-size*.46,size*.92,size*.92);
 }else{
  scene.touchGrip(ice,256,340);
  ice.onMove=()=>shadow.setVisible(false);
 }
 ice.onRelease=()=>{
  if(iceDropTarget(ice)==='wide'){iceRelease={x:ice.x,y:ice.y};scene.action('act-drop-ice-dish');return;}
  scene.tweens.add({targets:ice,x:home.x,y:home.y,duration:reduced()?0:180,onComplete:()=>shadow.setVisible(true)});
 };
 if(moved&&!lastIce&&!reduced()){
  const start=iceRelease??home;ice.setPosition(start.x,start.y);shadow.setVisible(false);
  scene.tweens.add({targets:ice,x:seat.x,y:seat.y,duration:iceRelease?180:520,ease:'Sine.easeInOut',onComplete:()=>{shadow.setVisible(true);scene.reactAt(seat.x,seat.y,'grab');}});
 }
 lastIce=moved;iceRelease=null;
}
export function createClothScene(scene){
 const o=state.activities.observe;
 scene.add.image(360,166,'real-cloth','0').setDisplaySize(510,510);
 const wet=scene.add.image(360,166,'real-cloth','1').setDisplaySize(510,510).setAlpha(0);
 let appear=o.clothWet&&!lastWet&&!reduced()?0:1;
 lastWet=o.clothWet;
 scene.zone(360,160,465,270,()=>{if(!o.clothWet)scene.action('act-wet-cloth');});
 const label=scene.text(360,310,'',18);
 scene.tick=(_,dt)=>{
  appear=Math.min(1,appear+dt/320);
  const amount=o.clothWet?dryTrace('thin',observationTime(1)):0;
  wet.setAlpha(amount*appear);
  label.setText(!o.clothWet?'천을 누르거나 ‘천에 물 묻히기’를 눌러 봐.':amount>.08?'젖은 부분은 천의 색이 더 짙어 보여.':'천이 말랐어. 물은 눈에 보이지 않는 수증기가 되어 공기로 갔어.');
 };
}
export function createWaterDrawing(scene){
 const d=state.activities.draw,q=state.inquiry;
 for(const x of [185,535]){if(scene.textures.exists('drawing-board'))scene.add.image(x,166,'drawing-board').setDisplaySize(340,248);else scene.add.image(x,167,'real-painting','0').setDisplaySize(350,350);}
 scene.text(185,23,'A · 물을 조금 묻힌 붓',18);scene.text(535,23,'B · 물을 많이 묻힌 붓',18);
 const brushes=[scene.add.image(320,60,'real-painting','2'),scene.add.image(670,60,'real-painting','3')];
 brushes.forEach((b,i)=>b.setDisplaySize(i?74:50,65).setDepth(8));
 scene.text(360,314,'물감 없이 맑은 물로 그려. A에 그리면 B에도 같은 그림이 생겨.',16);
 const texture=scene.textures.createCanvas('water-painting',1440,660),g=texture.context;
 const grain=g.createPattern(scene.textures.get('water-material').getSourceImage(),'repeat');
 grain?.setTransform(new DOMMatrix().scale(.26));
 scene.add.image(360,165,'water-painting').setDisplaySize(720,330).setDepth(5);
 let stroke=null,lastDrawing='';
 const point=p=>{
  if(stroke&&stroke.length<400)stroke.push([Math.max(18,Math.min(482,(p.worldX-25)/320*500)),Math.max(20,Math.min(290,(p.worldY-50)/230*310))]); // keep the brush a stroke-width inside the frame
  if(stroke){brushes[0].setPosition(p.worldX-18,p.worldY+18);brushes[1].setPosition(p.worldX+332,p.worldY+18);}
 };
 scene.input.on('pointerdown',p=>{
  if(p.worldX<25||p.worldX>345||p.worldY<50||p.worldY>280||d.strokes.length>=35)return;
  stopClock();if(d.records.length||q.drawPredictionLocked)resetDrawingExperiment(q,d);
  d.time=0;stroke=[];d.strokes.push(stroke);point(p);
 });
 scene.input.on('pointermove',p=>{if(p.isDown)point(p);});
 scene.finishPointer=()=>{if(stroke){stroke=null;scene.commit();}};
 scene.tick=()=>{
  const time=observationTime(5),revision=[time,d.strokes.length,d.strokes.at(-1)?.length].join(':');
  if(lastDrawing===revision)return;lastDrawing=revision;
  g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,720,330);
  // Clip to the paper inside each wooden frame (board drawn at x±170, y 42–290) so a thick B stroke never crosses the frame.
  for(let i=0;i<2;i++){g.save();g.beginPath();g.rect(27+i*350,55,316,222);g.clip();drawWaterStroke(g,d.strokes,{left:25+i*350,top:50,width:320,height:230,amount:i+1,time,grain});g.restore();}
  texture.refresh();
 };
}
export function createDewScene(scene,wipe){
 const d=state.activities.dew,q=state.inquiry;
 scene.text(205,20,'A · 냉각팩을 붙인 컵',18);scene.text(510,20,'B · 실온 컵',18);
 scene.add.image(205,165,'real-dew',d.sealed?'2':'0').setDisplaySize(265,265);
 scene.add.image(510,165,'real-dew',d.sealed?'1':'0').setDisplaySize(265,265);
 if(!d.sealed)scene.add.image(282,175,'real-tools','1').setDisplaySize(75,105);
 const wetMask=scene.add.graphics().setVisible(false),wet=scene.add.image(205,165,'real-dew','3').setDisplaySize(265,265).setDepth(6);wet.setMask(wetMask.createGeometryMask());
 const texture=scene.textures.createCanvas('real-dew-drops',1440,660),g=texture.context;
 scene.add.image(360,165,'real-dew-drops').setDisplaySize(720,330).setDepth(7);
 let ids=[],kind=null;
 const touch=p=>{if(kind)ids=wipeDroplets(ids,{x:p.worldX-(kind==='cold'?205:510)+120,y:p.worldY+5},30);};
 scene.input.on('pointerdown',p=>{
  if(p.worldY<55||p.worldY>280)return;
  kind=Math.abs(p.worldX-205)<90?'cold':Math.abs(p.worldX-510)<90?'room':null;
  if(kind){stopClock();ids=[];touch(p);}
 });
 scene.input.on('pointermove',p=>{if(p.isDown)touch(p);});
 scene.finishPointer=()=>{if(kind){const k=kind,removed=ids;kind=null;ids=[];queueMicrotask(()=>wipe(k,removed));}};
 scene.tick=()=>{
  g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,720,330);
  // One path for every drop: the canvas renderer clips to the current path only, so separate fillCircle calls left one visible drop.
  wetMask.clear();wetMask.fillStyle(0xffffff);wetMask.beginPath();
  for(const [k,cx] of [['cold',205],['room',510]]){
   const drops=k==='room'?(!d.wiped.includes('room')?visibleDew(50,q.dewRoomRemoved):[]):!d.wiped.includes('cold')?visibleDew(50,q.dewRemoved):!d.rewiped?visibleDew(observationTime(7),q.dewRemoved):visibleDew(d.time,q.dewRemoved).concat(visibleDew(observationTime(7)).filter(p=>q.dewRegion.includes(p.id)));
   for(const p of drops)if(kind!==k||!ids.includes(p.id)){
    if(k==='cold'&&d.sealed){const time=d.rewiped&&q.dewRegion.includes(p.id)?observationTime(7):d.time,x=cx+p.x-120,y=p.y-5,r=Math.min(24,8+Math.max(0,time-p.id*5)/2);wetMask.moveTo(x+r,y);wetMask.arc(x,y,r,0,Math.PI*2);}
    else drawRealDrop(g,cx+p.x-120,p.y-5,2.5+p.id%2,.58);
   }
  }
  wetMask.fillPath();
  texture.refresh();
 };
 scene.text(360,310,d.sealed?'랩과 고무줄로 두 컵 입구를 막았어. 겉면을 닦고 비교해 봐.':'두 컵의 겉면을 문질러 닦고, 입구를 막아 봐.',16);
}

