import {state} from './state.js';
import {observationTime,stop as stopClock} from './inquiry.js';
import {dryTrace} from './activity-model.js';
import {visibleDew,wipeDroplets} from './inquiry-model.js';
import {drawRealDrop,drawWaterStroke} from './study-materials.js';
import {compareStage,comparedPours,iceSeat,iceDropTarget} from './scene-model.js';
import {drawVessel,drawVesselFront,waterSurfaceY,dashedLine,createPourJug,drawWaterStream} from './pouring-scene.js';
import {playCue} from './sound.js';
const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastIce=false,iceRelease=null;
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
 const label=scene.text(360,307,'',19).setWordWrapWidth(680);
 const home={x:77,y:162},seat={x:273,y:94},landing={x:360,y:155};
 const center=landing.x,size=464;
 scene.add.image(center,153,'real-cloth','0').setDisplaySize(size,size);
 if(o.clothWet){
  const wet=scene.add.image(center,153,'real-cloth','1').setDisplaySize(size,size);
  let previous;
  scene.tick=()=>{
   const time=observationTime(1);if(time===previous)return;previous=time;
   const amount=dryTrace('thin',time);wet.setAlpha(amount);
   label.setText(amount>.08?'젖은 부분은 천의 색이 더 짙어 보여.':'천이 말랐어. 물은 수증기가 되어 공기로 갔어.');
  };
  return;
 }
 const host=scene.game.canvas.closest('.phaser-stage'),stage=host.closest('.workspace-stage');
 const wet=scene.add.image(center,153,'real-cloth','1').setDisplaySize(size,size).setAlpha(0);
 const jugArt=createPourJug(scene,home.x,home.y,.58),jug=jugArt.image;
 const full=85,tilt=.66,approach=280,fall=140,cutoff=870,settled=1190;
 jugArt.paint(full);label.setText('주전자를 천 위로 끌거나 눌러 봐.');
 let finish=null,elapsed=0,from,still=false,returning=null;
 const pour=()=>scene.action('act-wet-cloth');
 scene.zone(landing.x,153,422,252,pour);
 jug.setInteractive({useHandCursor:true});scene.input.setDraggable(jug);
 jug.on('pointerup',pointer=>{if(pointer.getDistance()<6)pour();});
 jug.onMove=()=>returning?.stop();
 jug.onRelease=()=>{
  if(Math.abs(jug.x-landing.x)<205&&Math.abs(jug.y-153)<125){pour();return;}
  returning=scene.tweens.add({targets:jug,...home,duration:reduced()?0:180,ease:'Sine.easeOut'});
 };
 const flow=scene.textures.createCanvas('cloth-pour-flow',1440,660),g=flow.context;
 g.setTransform(2,0,0,2,0,0);
 scene.add.image(360,165,'cloth-pour-flow').setDisplaySize(720,330).setDepth(7);
 const stain=scene.textures.createCanvas('cloth-wet-spread',512,512),ink=stain.context;
 const spread=scene.add.image(center,153,'cloth-wet-spread').setDisplaySize(size,size);
 const clothPhoto=scene.textures.get('real-cloth').getSourceImage();
 const request=event=>{
  event.preventDefault();if(finish)return;
  finish=event.detail;from={x:jug.x,y:jug.y};still=reduced();
  returning?.stop();jug.disableInteractive();host.setAttribute('aria-busy','true');
  label.setText('물이 천에 닿으면 어떻게 될까?');
  stage?.querySelector('[data-action="act-wet-cloth"]')?.setAttribute('aria-disabled','true');
 };
 host.addEventListener('cloth-pour',request);
 const removePour=()=>host.removeEventListener('cloth-pour',request);
 scene.events.once('shutdown',removePour);scene.events.once('destroy',removePour);
 const unit=value=>Math.max(0,Math.min(1,value));
 const ease=value=>(1-Math.cos(Math.PI*unit(value)))/2;
 scene.tick=(time,dt)=>{
  if(!finish)return;
  const prev=elapsed;elapsed+=Math.min(dt,60)*(still?2.4:1);
  const rise=still?1:ease(elapsed/approach),back=still?0:ease((elapsed-cutoff-fall)/(settled-cutoff-fall));
  jug.setPosition(from.x+(seat.x-from.x)*rise+(home.x-seat.x)*back,from.y+(seat.y-from.y)*rise+(home.y-seat.y)*back).setRotation(tilt*(rise-back));
  const sent=unit((elapsed-approach)/(cutoff-approach));
  jugArt.paint(full-34*sent);
  g.clearRect(0,0,720,330);
  const head=unit((elapsed-approach)/fall),tail=unit((elapsed-cutoff)/fall);
  if(head>tail)drawWaterStream(g,jugArt.mouth(),landing,still?0:time,head,tail);
  const impact=approach+fall;
  if(elapsed>=impact){
   if(prev<impact){void playCue('pour');label.setText('물이 닿은 자리부터 천이 젖어.');}
   const soak=ease((elapsed-impact)/600);
   if(soak<1){
    ink.clearRect(0,0,512,512);ink.drawImage(clothPhoto,512,0,512,512,0,0,512,512);
    const radius=14+260*soak,edge=ink.createRadialGradient(256,258,Math.max(0,radius-52),256,258,radius);
    edge.addColorStop(0,'#000');edge.addColorStop(1,'#0000');
    ink.globalCompositeOperation='destination-in';ink.fillStyle=edge;ink.fillRect(0,0,512,512);ink.globalCompositeOperation='source-over';
    spread.setAlpha(unit((elapsed-impact)/85));stain.refresh();
   }else{spread.setVisible(false);wet.setAlpha(1);}
   if(!still&&elapsed<cutoff+fall){
    for(let i=0;i<4;i++){
     const p=((elapsed-impact)/190+i*.27)%1;
     drawRealDrop(g,landing.x+(-1)**i*p*(11+i*3),landing.y-30*p*(1-p)+i*.8,2-i*.2,(1-p)*.65);
    }
   }
  }
  flow.refresh();
  if(elapsed>=settled){
   const done=finish;finish=null;host.setAttribute('aria-busy','false');
   queueMicrotask(()=>{if(host.isConnected)done();});
  }
 };
}
export function createWaterDrawing(scene){
 const d=state.activities.draw;
 for(const x of [160,560]){if(scene.textures.exists('drawing-board'))scene.add.image(x,166,'drawing-board').setDisplaySize(290,248);else scene.add.image(x,167,'real-painting','0').setDisplaySize(300,350);}
 scene.text(160,23,'A · 물을 조금 묻힌 붓',18);scene.text(560,23,'B · 물을 많이 묻힌 붓',18);
 scene.text(360,314,'같은 그림에 물의 양만 달라. 어느 쪽이 먼저 마르는지 비교해 봐.',16);
 const texture=scene.textures.createCanvas('water-painting',1440,660),g=texture.context;
 const grain=g.createPattern(scene.textures.get('water-material').getSourceImage(),'repeat');
 grain?.setTransform(new DOMMatrix().scale(.26));
 scene.add.image(360,165,'water-painting').setDisplaySize(720,330).setDepth(5);
 let lastDrawing='';
 scene.tick=()=>{
  const time=observationTime(5),revision=[time,d.strokes.length,d.strokes.at(-1)?.length].join(':');
  if(lastDrawing===revision)return;lastDrawing=revision;
  g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,720,330);
  // Leave the middle clear for the shared time control.
  for(let i=0;i<2;i++){g.save();g.beginPath();g.rect(27+i*400,55,266,222);g.clip();drawWaterStroke(g,d.strokes,{left:25+i*400,top:50,width:270,height:230,amount:i+1,time,grain});g.restore();}
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
 // Isolate the light and shadow of the photographed beads from the wet/dry pair.
 // The same transparent detail can sit on either glass without bringing over the wrap or cooling pack.
 const photo=scene.textures.get('real-dew').getSourceImage();
 const detail=document.createElement('canvas');detail.width=detail.height=512;
 const detailCtx=detail.getContext('2d',{willReadFrequently:true});
 detailCtx.drawImage(photo,0,512,512,512,0,0,512,512);
 const dry=detailCtx.getImageData(0,0,512,512).data;
 detailCtx.clearRect(0,0,512,512);detailCtx.drawImage(photo,512,512,512,512,0,0,512,512);
 const wet=detailCtx.getImageData(0,0,512,512),pixels=wet.data;
 for(let i=0;i<pixels.length;i+=4){
  const x=i/4%512,y=Math.floor(i/2048),delta=(pixels[i]+pixels[i+1]+pixels[i+2]-dry[i]-dry[i+1]-dry[i+2])/3;
  const edge=Math.max(0,Math.min(1,(x-86)/20,(389-x)/18,(y-142)/14,(440-y)/17));
  pixels[i]=pixels[i+1]=pixels[i+2]=delta>0?255:55;
  pixels[i+3]=Math.min(175,Math.max(0,Math.abs(delta)-6)*(delta>0?4:2.7))*edge;
 }
 detailCtx.putImageData(wet,0,0);
 const patch=document.createElement('canvas');patch.width=patch.height=144;
 const patchCtx=patch.getContext('2d');
 const feather=patchCtx.createRadialGradient(72,72,39,72,72,72);feather.addColorStop(0,'#000');feather.addColorStop(1,'#0000');
 const host=scene.game.canvas.closest('.phaser-stage');
 const clothTexture=scene.textures.get('real-cloth');
 clothTexture.add('wipe-cloth',0,16,108,480,300);
 const cloth=scene.add.image(360,263,'real-cloth','wipe-cloth').setDisplaySize(100,63).setRotation(-.14).setDepth(30).setName('cup-wiping-cloth');
 let ids=[],kind=null,previous='',wiping=null;
 const touch=p=>{
  if(!kind)return;
  cloth.setPosition(p.worldX,p.worldY);
  ids=wipeDroplets(ids,{x:p.worldX-(kind==='cold'?205:510)+120,y:(p.worldY-38)/.82},36);
 };
 const cancelWipe=()=>{wiping?.stop();wiping=null;kind=null;ids=[];host.removeAttribute('aria-busy');cloth.setPosition(360,263);};
 const autoWipe=event=>{
  event.preventDefault();if(wiping)return;
  kind=event.detail.kind;ids=[];stopClock();host.setAttribute('aria-busy','true');
  const both=kind==='both',still=reduced();
  const cx=kind==='cold'||both?205:510;
  cloth.setPosition(cx,165);
  wiping=scene.tweens.addCounter({from:0,to:1,duration:still?350:both?1400:900,onUpdate:tween=>{
   const progress=tween.getValue();
   const part=both?Math.min(1,progress*2%1):progress;
   if(both){const next=progress<.5?'cold':'room';if(kind!==next)ids=[];kind=next;}
   const center=both?(progress<.5?205:510):cx;
   touch({worldX:center+(still?0:Math.sin(part*Math.PI*4)*66),worldY:still?165:85+part*170});
  },onComplete:()=>{wiping=null;kind=null;ids=[];host.removeAttribute('aria-busy');queueMicrotask(()=>{if(host.isConnected)event.detail.finish();});}});
 };
 host.addEventListener('cup-wipe',autoWipe);
 document.addEventListener('observation-stop',cancelWipe);
 const removeWipe=()=>{host.removeEventListener('cup-wipe',autoWipe);document.removeEventListener('observation-stop',cancelWipe);};
 scene.events.once('shutdown',removeWipe);scene.events.once('destroy',removeWipe);
 scene.input.on('pointerdown',p=>{
  if(wiping||p.worldY<55||p.worldY>280)return;
  kind=Math.abs(p.worldX-205)<90?'cold':Math.abs(p.worldX-510)<90?'room':null;
  if(kind){stopClock();ids=[];touch(p);}
 });
 scene.input.on('pointermove',p=>{if(p.isDown&&!wiping)touch(p);});
 scene.finishPointer=()=>{if(kind&&!wiping){const k=kind,removed=ids;kind=null;ids=[];cloth.setPosition(360,263);queueMicrotask(()=>wipe(k,removed));}};
 scene.tick=()=>{
  const time=observationTime(7),revision=[time,kind,ids.join(','),d.wiped.join(','),d.rewiped,q.dewRemoved.join(','),(q.dewRoomRemoved??[]).join(',')].join('|');
  if(revision===previous)return;previous=revision;
  g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,720,330);
  for(const [k,cx] of [['cold',205],['room',510]]){
   const drops=k==='room'?(!d.wiped.includes('room')?visibleDew(50,q.dewRoomRemoved):[]):!d.wiped.includes('cold')?visibleDew(50,q.dewRemoved):!d.rewiped?visibleDew(time,q.dewRemoved):visibleDew(d.time,q.dewRemoved).concat(visibleDew(time).filter(p=>q.dewRegion.includes(p.id)));
   for(const p of drops)if(kind!==k||!ids.includes(p.id)){
    const age=d.wiped.includes(k)?Math.max(0,time-p.id*5):60;
    const r=Math.min(24,8+age*.3),x=cx+p.x-120,y=p.y*.82+38,s=512/265;
    patchCtx.clearRect(0,0,144,144);
    patchCtx.drawImage(detail,(x-cx+132.5-r)*s,(y-32.5-r)*s,r*2*s,r*2*s,0,0,144,144);
    patchCtx.globalCompositeOperation='destination-in';patchCtx.fillStyle=feather;patchCtx.fillRect(0,0,144,144);patchCtx.globalCompositeOperation='source-over';
    g.drawImage(patch,x-r,y-r,r*2,r*2);
   }
  }
  texture.refresh();
 };
 scene.text(360,310,d.sealed?'랩과 고무줄로 두 컵 입구를 막았어. 겉면을 닦고 비교해 봐.':'수건으로 두 컵의 겉면을 닦고, 입구를 막아 봐.',16);
}

