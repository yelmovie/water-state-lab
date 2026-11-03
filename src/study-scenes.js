import {state} from './state.js';
import {observationTime,stop as stopClock} from './inquiry.js';
import {dryTrace} from './activity-model.js';
import {visibleDew,wipeDroplets} from './inquiry-model.js';
import {resetDrawingExperiment} from './drawing-records.js';
import {drawRealDrop,drawWaterStroke} from './study-materials.js';
const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastIce=false,iceRelease=null,lastWet=false;
export function createIceScene(scene){
 const moved=state.activities.observe.iceMoved;
 scene.add.image(195,187,'real-ice','0').setDisplaySize(245,245);
 scene.add.image(520,187,'real-ice','1').setDisplaySize(265,265);
 scene.text(195,282,'처음 접시',20);scene.text(520,282,'옮길 그릇',20);
 const end={x:moved?520:195,y:162};
 const ice=scene.add.image(end.x,end.y,'real-ice','2').setDisplaySize(104,104).setDepth(5);
 if(moved)scene.add.image(195,162,'real-ice','2').setDisplaySize(104,104).setAlpha(.16);
 else{ice.setInteractive({useHandCursor:true});scene.input.setDraggable(ice);}
 ice.onRelease=()=>{
  if(ice.x>400){iceRelease={x:ice.x,y:ice.y};scene.action('act-drop-ice-dish');}
  else scene.tweens.add({targets:ice,x:195,y:162,duration:reduced()?0:180});
 };
 if(moved&&!lastIce&&!reduced()){
  const start=iceRelease??{x:195,y:162};ice.setPosition(start.x,start.y);
  scene.tweens.add({targets:ice,...end,duration:iceRelease?180:520,ease:'Sine.easeInOut',onComplete:()=>scene.reactAt(520,182,'grab')});
 }
 lastIce=moved;iceRelease=null;
 scene.text(360,315,moved?'그릇을 바꿔도 얼음의 모양은 같아.':'얼음을 잡아 오른쪽 그릇으로 옮겨 봐.',17);
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
 for(const x of [185,535])scene.add.image(x,167,'real-painting','0').setDisplaySize(335,335);
 scene.text(185,23,'A · 물을 조금 묻힌 붓',18);scene.text(535,23,'B · 물을 많이 묻힌 붓',18);
 const brushes=[scene.add.image(320,60,'real-painting','2'),scene.add.image(670,60,'real-painting','3')];
 brushes.forEach(b=>b.setDisplaySize(65,65).setDepth(8));
 scene.text(360,314,'물감 없이 맑은 물로 그려. A에 그리면 B에도 같은 그림이 생겨.',16);
 const texture=scene.textures.createCanvas('water-painting',1440,660),g=texture.context;
 scene.add.image(360,165,'water-painting').setDisplaySize(720,330).setDepth(5);
 let stroke=null;
 const point=p=>{
  if(stroke&&stroke.length<400)stroke.push([Math.max(0,Math.min(500,(p.worldX-25)/320*500)),Math.max(0,Math.min(310,(p.worldY-50)/230*310))]);
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
  g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,720,330);
  for(let i=0;i<2;i++)drawWaterStroke(g,d.strokes,{left:25+i*350,top:50,width:320,height:230,amount:i+1,time:observationTime(5)});
  texture.refresh();
 };
}
export function createDewScene(scene,wipe){
 const d=state.activities.dew,q=state.inquiry;
 scene.text(205,20,'A · 냉각팩을 붙인 컵',18);scene.text(510,20,'B · 실온 컵',18);
 scene.add.image(205,165,'real-dew',d.sealed?'2':'0').setDisplaySize(265,265);
 scene.add.image(510,165,'real-dew',d.sealed?'1':'0').setDisplaySize(265,265);
 if(!d.sealed)scene.add.image(282,175,'real-tools','1').setDisplaySize(75,105);
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
  for(const [k,cx] of [['cold',205],['room',510]]){
   const drops=k==='room'?(!d.wiped.includes('room')?visibleDew(50,q.dewRoomRemoved):[]):!d.wiped.includes('cold')?visibleDew(50,q.dewRemoved):!d.rewiped?visibleDew(observationTime(7),q.dewRemoved):visibleDew(d.time,q.dewRemoved).concat(visibleDew(observationTime(7)).filter(p=>q.dewRegion.includes(p.id)));
   for(const p of drops)if(kind!==k||!ids.includes(p.id))drawRealDrop(g,cx+p.x-120,p.y-5,4+p.id%3);
  }
  texture.refresh();
 };
 scene.text(360,310,d.sealed?'랩과 고무줄로 두 컵 입구를 막았어. 겉면을 닦고 비교해 봐.':'두 컵의 겉면을 문질러 닦고, 입구를 막아 봐.',16);
}

