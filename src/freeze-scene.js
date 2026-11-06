import {activityReady} from './activity-model.js';
import {state} from './state.js';
import {startLevel,iceLevel,freezeLevelText} from './freeze-talk.js';
import {beakerShell,beakerInner} from './scene-model.js';
import {drawBeakerWater} from './pouring-scene.js';

// Beaker art geometry, measured from the shell image. One ruler unit is 1.6 scene pixels.
const X=330,BASE=250,WIDTH=135,HEIGHT=220;
const shell=beakerShell(X,BASE,WIDTH,HEIGHT),{cx,half:rx,ry,floor}=beakerInner(shell);
const inner={left:cx-rx,right:cx+rx,floor};
const levelY=level=>inner.floor-level*1.6;
const ruler={left:408,right:444};
// The magnifier window enlarges the ruler between 56 and 70.
const lens={x:18,y:48,w:152,h:150,low:56,high:70};
const lensY=level=>lens.y+lens.h-(level-lens.low)*lens.h/(lens.high-lens.low);
const RED=0xd9483b,BLUE=0x1f7fb3,INK='#23505a';
// Carries the picture across redraws. A fresh page load starts settled, with nothing to animate.
const shown={phase:null,level:startLevel,ice:0,talk:0};

// Fixed fractions of the ice block, so the texture holds still while the level moves.
const crystals=[[-.6,.2,7],[-.2,.5,9],[.3,.25,6],[.55,.62,8],[-.5,.78,6],[.1,.85,7]];
const cracks=[[-.7,.15,-.25,.4],[-.25,.4,-.45,.8],[-.25,.4,.2,.55],[.2,.55,.65,.3],[.2,.55,.35,.92]];
function outline(top){
 const arc=(y,from,to)=>Array.from({length:17},(_,i)=>{const a=from+(to-from)*i/16;return {x:cx+rx*Math.cos(a),y:y+ry*Math.sin(a)};});
 return [...arc(top,Math.PI,Math.PI*2),...arc(inner.floor,0,Math.PI)];
}
// Ice grows in from the glass, so the learner sees water turn into the thing that takes more room.
function iceBand(g,top,from,to,amount){
 const pts=[],step=8;
 for(let y=top;y<=inner.floor;y+=step){const edge=Math.sin(y*.21)*3;pts.push({x:to+edge*(to>from?1:-1),y});}
 const bottom=x=>inner.floor+ry*Math.sqrt(Math.max(0,1-((x-cx)/rx)**2));
 pts.push({x:to,y:bottom(to)},{x:from,y:bottom(from)},{x:from,y:top});
 g.fillStyle(0xcfeff7,.96*Math.min(1,amount*3)).fillPoints(pts,true);
}
function drawWater(scene,g,level,ice){
 const top=levelY(level),shape=outline(top);
 scene.paintWater(level,(ctx,atlas)=>drawBeakerWater(ctx,atlas,shell,{top}));
 if(ice>0){
  iceBand(g,top,inner.left,inner.left+rx*ice,ice);iceBand(g,top,inner.right,inner.right-rx*ice,ice);
  g.fillStyle(0xe9fafd,.8*Math.min(1,ice*3)).fillEllipse(cx,top,rx*2,ry*2);
 }
 if(ice>.9){
  const solid=(ice-.9)/.1;
  g.fillStyle(0xdaf4fb,solid).fillPoints(shape,true);
  g.fillStyle(0xffffff,.5*solid);for(const [x,y,r] of crystals)g.fillEllipse(cx+x*rx,top+ry+y*(inner.floor-top),r*2.4,r);
  g.lineStyle(2,0xffffff,.95*solid);for(const [a,b,c,d] of cracks)g.lineBetween(cx+a*rx,top+ry+b*(inner.floor-top),cx+c*rx,top+ry+d*(inner.floor-top));
  g.lineStyle(2,0x8fc9dc,.8*solid);g.strokePoints(shape,true);
 }
}
function drawRuler(scene){
 const g=scene.add.graphics().setDepth(5);
 g.fillStyle(0xfffdf3,.96).fillRoundedRect(ruler.left,levelY(100)-8,ruler.right-ruler.left,inner.floor-levelY(100)+16,6);
 g.lineStyle(2,0x7f9a8f,.9).strokeRoundedRect(ruler.left,levelY(100)-8,ruler.right-ruler.left,inner.floor-levelY(100)+16,6);
 for(let level=0;level<=100;level+=5){const major=level%10===0;g.lineStyle(major?2:1,0x3d6b70).lineBetween(ruler.left,levelY(level),ruler.left+(major?12:7),levelY(level));}
 for(const level of [0,20,40,60,80,100])scene.text(ruler.left+25,levelY(level),String(level),14,INK).setDepth(6);
}
function drawLensFrame(scene){
 const g=scene.add.graphics().setDepth(4);
 g.fillStyle(0xf7fdff,.98).fillRoundedRect(lens.x,lens.y,lens.w,lens.h,10);
 scene.text(lens.x+lens.w/2,32,'돋보기로 본 눈금',17,INK);
 const ticks=scene.add.graphics().setDepth(5);
 for(let level=lens.low+1;level<lens.high;level++){const major=level%5===0;ticks.lineStyle(major?2:1,0x3d6b70).lineBetween(lens.x+lens.w-(major?30:18),lensY(level),lens.x+lens.w,lensY(level));}
 ticks.lineStyle(3,0x7f9a8f).strokeRoundedRect(lens.x,lens.y,lens.w,lens.h,10);
 // Show which part of the beaker the window enlarges.
 ticks.lineStyle(2,0x7f9a8f,.55).strokeRoundedRect(inner.left-8,levelY(lens.high),inner.right-inner.left+16,(lens.high-lens.low)*1.6,5);
 ticks.lineStyle(1.5,0x7f9a8f,.4).lineBetween(lens.x+lens.w,lens.y,inner.left-8,levelY(lens.high)).lineBetween(lens.x+lens.w,lens.y+lens.h,inner.left-8,levelY(lens.low));
 for(const level of [60,65])scene.text(lens.x+lens.w-46,lensY(level),String(level),15,INK).setDepth(6);
}
function drawLensView(g,level,ice,s){
 const surface=lensY(level),inside=lens.y+lens.h-surface;
 g.fillStyle(ice>.5?0xcfeff7:0x4fc4ee,.95).fillRoundedRect(lens.x+2,surface,lens.w-4,inside-2,{tl:0,tr:0,bl:8,br:8});
 g.lineStyle(4,BLUE).lineBetween(lens.x+2,surface,lens.x+lens.w-2,surface);
 g.lineStyle(4,RED).lineBetween(lens.x+2,lensY(startLevel),lens.x+lens.w-2,lensY(startLevel));
 if(s.predicted&&s.prediction!==startLevel&&!s.records.some(r=>r.kind==='ice')){g.lineStyle(2,0x6b7b80);for(let x=lens.x+6;x<lens.x+lens.w-34;x+=14)g.lineBetween(x,lensY(s.prediction),x+8,lensY(s.prediction));}
 const gap=level-startLevel;
 if(gap>.3){
  const x=lens.x+30,y0=lensY(startLevel),y1=surface;
  g.lineStyle(3,0x14506e).lineBetween(x,y0-3,x,y1+3);
  g.fillStyle(0x14506e).fillTriangle(x,y1+1,x-7,y1+12,x+7,y1+12);
 }
}
function freezeBeaker(scene,s,reduced){
 scene.panel(180,20,322,295);
 const scale=scene.learningSprite('learning-scale',330,278,260,84);
 if(!scale)scene.g.fillStyle(0x4d777b).fillRoundedRect(240,260,180,45,12);
 scene.text(330,scale?291:283,s.onScale?'100.0 g':'0.0 g',20,scale?'#254d54':'#fffbea').setStroke('#fffdf3',0);
 const cup=scene.prop(s.onScale?330:95,s.onScale?155:150,0,165,'equipment',!s.onScale);
 if(s.onScale)cup.setVisible(false);
 cup.onRelease=()=>{if(cup.x>210&&cup.x<460){scene.reactAt(330,250);scene.action('act-drop-measure-cup-scale');}else{cup.setPosition(95,150);scene.cue('물통을 저울 한가운데 올려 줘.');}};
 const ice=scene.prop(580,95,5,105,'equipment',true),warm=scene.prop(580,245,6,105,'equipment',true);
 scene.text(580,166,'차갑게',19);scene.text(580,314,'따뜻하게',19);
 ice.onRelease=()=>{if(ice.x>210&&ice.x<500)scene.action('act-drop-icepack-freeze-cup');else{ice.setPosition(580,95);scene.cue('냉각팩을 물통 가까이 가져가 봐.');}};
 warm.onRelease=()=>{if(warm.x>210&&warm.x<500)scene.action('act-drop-warm-freeze-cup');else warm.setPosition(580,245);};
 if(!s.onScale)return;
 scene.add.image(X,BASE-HEIGHT*.49,'equipment','beaker-shell').setDisplaySize(shell.width,shell.height).setDepth(3);
 drawRuler(scene);drawLensFrame(scene);
 const marks=scene.add.graphics().setDepth(5),lensView=scene.add.graphics().setDepth(4);
 const tag=scene.text(228,levelY(startLevel),'처음 선',15,'#b5352a').setDepth(7);
 const now=scene.text(476,levelY(startLevel),String(startLevel),17,'#14506e').setDepth(7);
 const before=scene.text(95,220,`처음 눈금 ${startLevel}`,18,'#b5352a');
 const after=scene.text(95,248,`지금 눈금 ${startLevel}`,18,'#14506e');
 const compare=scene.text(95,282,freezeLevelText(startLevel),17,INK);
 const gapLabel=scene.text(lens.x+64,lensY(62.7),'',17,'#14506e').setDepth(7);
 const predicted=scene.text(lens.x+44,lensY(s.prediction)-11,'내 예상',15,'#4f6168').setDepth(7).setVisible(s.predicted&&s.prediction!==startLevel&&!s.records.some(r=>r.kind==='ice'));
 const target=s.phase==='ice'?iceLevel:startLevel,targetIce=s.phase==='ice'?1:0,changed=shown.phase!==null&&shown.phase!==s.phase;
 const m={level:changed?shown.level:target,ice:changed?shown.ice:targetIce};
 const words={ice:'얼음 · 빨간 선보다 높아졌어',melt:'다시 물 · 빨간 선으로 돌아왔어',water:'처음 물 · 빨간 선이 물 윗면이야'};
 const title=scene.text(X,37,changed?(s.phase==='ice'?'물은 더 넣지 않고 얼리는 중':'녹는 중 · 물 윗면을 봐'):words[s.phase],19).setBackgroundColor('#fffdf3').setPadding(10,2,10,2).setDepth(8);
 shown.phase=s.phase;
 if(changed&&!reduced()){
  const helper=scene.prop(232,196,s.phase==='ice'?5:6,66,'equipment').setDepth(6);
  scene.tweens.add({targets:m,ice:targetIce,level:target,delay:700,duration:s.phase==='ice'?3000:2400,ease:'Sine.easeInOut',onUpdate:()=>{shown.level=m.level;shown.ice=m.ice;},onComplete:()=>{
   title.setText(words[s.phase]);helper.destroy();scene.reactAt(cx,levelY(target));
   scene.cue(s.phase==='ice'?'물을 더 넣지 않았는데, 원래 있던 물이 얼면서 빨간 선보다 5.4 올라갔어. 저울은 그대로야!':'녹으니 물 윗면이 빨간 선으로 돌아왔어. 무게는 내내 그대로야!');
  }});
 }else{m.level=target;m.ice=targetIce;shown.level=target;shown.ice=targetIce;}
 let lastLabel='';
 scene.tick=()=>{
  scene.dynamic.clear();marks.clear();lensView.clear();
  drawWater(scene,scene.dynamic,m.level,m.ice);drawLensView(lensView,m.level,m.ice,s);
  const startY=levelY(startLevel),surface=levelY(m.level);
  marks.lineStyle(3,RED).lineBetween(inner.left-12,startY,ruler.left+12,startY);
  marks.lineStyle(2,BLUE,.9);for(let x=inner.right+2;x<ruler.left;x+=9)marks.lineBetween(x,surface,x+5,surface);
  marks.fillStyle(BLUE).fillTriangle(ruler.right+2,surface,ruler.right+13,surface-7,ruler.right+13,surface+7);
  tag.setY(startY);now.setY(surface);
  const value=Math.round(m.level*10)/10,label=String(value);
  if(label!==lastLabel){
   lastLabel=label;now.setText(label);after.setText(`지금 눈금 ${label}`);compare.setText(freezeLevelText(value));
   const gap=Math.round((value-startLevel)*10)/10;gapLabel.setText(gap>.3?`+${gap}`:'').setY((lensY(startLevel)+lensY(m.level))/2);
  }
 };
}
function lifeScene(scene,s,reduced){
 scene.panel(40,14,640,304);
 const key=s.talk===3?'pipe':'pop',changed=shown.phase!==null&&shown.talk!==s.talk;
 shown.talk=s.talk;shown.phase=s.phase;
 const grow=(obj,alpha=1,duration=1600)=>{if(changed&&!reduced()){obj.setAlpha(0);scene.tweens.add({targets:obj,alpha,duration,delay:350,ease:'Sine.easeInOut'});}};
 if(key==='pop'){
  scene.text(190,36,'얼리기 전',20);scene.text(520,36,'냉동실에서 꺼낸 뒤',20);
  scene.learningSprite('ice-pop-soft',190,172,118,236,3);
  const box=scene.add.graphics().setDepth(2);box.fillStyle(0xdff2f8,.95).fillRoundedRect(405,56,230,238,14);box.lineStyle(3,0x8cb8c6).strokeRoundedRect(405,56,230,238,14);
  if(s.talk<2){scene.text(520,172,'아직 안 넣었어',18,'#4f6168');return;}
  const soft=scene.learningSprite('ice-pop-soft',520,172,118,236,3),frozen=scene.learningSprite('ice-pop-frozen',520,172,118,236,4);
  if(changed&&!reduced()){scene.tweens.add({targets:soft,alpha:0,delay:900,duration:1500});frozen.setAlpha(0);scene.tweens.add({targets:frozen,alpha:1,delay:900,duration:1500});frozen.setScale(frozen.scaleX*.86,frozen.scaleY);scene.tweens.add({targets:frozen,scaleX:frozen.scaleX/.86,delay:900,duration:1700,ease:'Back.easeOut'});}else soft.setVisible(false);
  const arrows=scene.add.graphics().setDepth(5);arrows.fillStyle(0xc2581c);
  for(const [x,dir] of [[446,-1],[594,1]])for(const y of [130,210]){arrows.fillRect(dir<0?x-20:x,y-3,20,6);arrows.fillTriangle(x+dir*32,y,x+dir*18,y-10,x+dir*18,y+10);}
  grow(arrows,1,900);
  return;
 }
 scene.text(360,34,'얼기 전 · 물이 꽉 찬 배관',19);
 scene.learningSprite('pipe-water',360,92,290,106,3);
 scene.text(360,160,'얼은 뒤 · 얼음이 커질 자리가 없어',19);
 const burst=scene.learningSprite('pipe-burst',360,232,290,106,3);
 const arrows=scene.add.graphics().setDepth(5);arrows.fillStyle(0xc2581c);
 for(const x of [260,460]){arrows.fillRect(x-3,190,6,14);arrows.fillTriangle(x,178,x-10,192,x+10,192);arrows.fillRect(x-3,258,6,14);arrows.fillTriangle(x,284,x-10,270,x+10,270);}
 grow(burst);grow(arrows,1,1200);
}
export function createFreezeScene(scene,reduced){
 const s=state.activities.freeze;
 if(activityReady(3,state.activities)&&s.talk>0)return lifeScene(scene,s,reduced);
 shown.talk=0;
 freezeBeaker(scene,s,reduced);
}
