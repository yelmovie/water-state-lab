import {addStudyFrames,studySheets} from './study-materials.js';
import {createIceScene,createClothScene,createWaterDrawing,createDewScene} from './study-scenes.js';
import {createPouringScene} from './pouring-scene.js';
import {partPosition} from './workshop-controls.js';
import {resetDrawingExperiment} from './drawing-records.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';
import {sortCards,nextSortCard,hiddenScenes,activityReady,dryTrace,heatingTrial} from './activity-model.js';
import {visibleDew,wipeDroplets} from './inquiry-model.js';
import {stop as stopClock,observationTime} from './inquiry.js';
import {finalContext} from './workshop.js';
import {testCollector} from './domain.js';
import {clampValue as clamp,waterHeight,islandStops,islandTrails,pointOnRoute,freezeLevel,lensRegion,rampEndpoint} from './scene-model.js';

let game=null,activeScene=null,generation=0;
// Visual continuity survives a DOM redraw; learner records remain in the state model.
const visual={freeze:{phase:'water',level:60},lens:{x:650,y:150},pipe:''};
const a=()=>state.activities,q=()=>state.inquiry;
const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const later=fn=>queueMicrotask(fn);
// Transparent window in the generated tank frame; water keeps its original geometry.
const tankWindow={left:.095,top:.065,width:.81,height:.842};
export function cleanupPhaser(){generation++;if(game){game.destroy(true);game=null;}activeScene=null;}
export function focusExperiment(){activeScene?.focusObjects?.();}

function makeScene(P,route,ctx,host,hidden){
 const W=route==='map'?1000:720,H=route==='map'?563:330;
 return class ResearchScene extends P.Scene {
  preload(){
   this.assetLoadFailed=false;
   this.load.on('loaderror',()=>{this.assetLoadFailed=true;});
   this.load.image('buddy','/assets/v2/buddy-poses-clean.webp');
   if(route!=='map'){
    const materials=route===1?['cloth','ice']:route===5?['painting']:route===7?['dew','tools']:[9,10].includes(route)?['tools']:[];
    for(const key of materials)this.load.image('real-'+key,'/assets/learning/'+studySheets[key].file);
    this.load.image('equipment','/assets/v2/equipment-atlas.webp');
    this.load.image('workshop','/assets/v2/workshop-atlas.webp');
    if(route===1){this.load.image('pouring-glass','/assets/v2/pouring-glass.webp');this.load.image('pouring-jug','/assets/v2/pouring-jug.webp');}
    if(route===3)this.load.image('learning-scale','/assets/learning/scale.webp');
    if(route===4)this.load.image('learning-tank','/assets/learning/tank-frame.webp');
    if(route===2)this.load.image('water-search','/assets/stages/water-search.webp');
    if(route===8)this.load.image('drink-bottle','/assets/stages/drink-bottle.webp');
    if(route===5)this.load.image('drawing-board','/assets/learning/drawing-board.webp');
    if(route===6)this.load.image('hotplate','/assets/learning/hotplate.webp');
    if(route===10)this.load.image('water-core','/assets/learning/water-core.webp');
   }
  }
  create(){
   if(!host.isConnected)return;
   // Keep the DOM experiment visible when an image request fails. Phaser's
   // missing-texture square must never replace the learner's actual tools.
   if(this.assetLoadFailed){host.remove();this.scene.stop();return;}
   activeScene=this;
   if(route!=='map')this.cameras.main.setZoom(4).centerOn(360,165);
   for(const event of ['pointerdown','pointermove','pointerup']){
    this.input.on(event,p=>{
     const point=this.cameras.main.getWorldPoint(p.x,p.y);
     p.worldX=point.x;p.worldY=point.y;
    });
   }
   for(const [name,cols,rows] of [['equipment',3,3],['buddy',4,4],['workshop',3,2]]){
    if(!this.textures.exists(name))continue;
    const texture=this.textures.get(name),source=texture.getSourceImage();
    for(let i=0;i<cols*rows;i++)texture.add(String(i),0,i%cols*source.width/cols,Math.floor(i/cols)*source.height/rows,source.width/cols,source.height/rows);
   }
   if(this.textures.exists('equipment')){const texture=this.textures.get('equipment'),source=texture.getSourceImage(),sw=source.width/3,sh=source.height/3;texture.add('beaker-shell',0,sw*.12,sh*.07,sw*.76,sh*.86);}
   addStudyFrames(this);
   hidden.forEach(el=>el.classList.add('phaser-replaced'));
   host.classList.add('ready');host.dataset.ready='true';
   const sizing=new ResizeObserver(()=>{if(host.isConnected)this.scale.setParentSize(host.clientWidth,host.clientHeight);});
   sizing.observe(host);this.events.once('shutdown',()=>sizing.disconnect());
   this.g=this.add.graphics();this.dynamic=this.add.graphics().setDepth(4);this.labels=[];this.dragging=null;this.cupShells=new Map();
   this.input.on('dragstart',(pointer,obj)=>{this.dragging=obj;obj.restoreDepth=obj.depth;obj.setDepth(20);this.home={x:obj.x,y:obj.y};stopClock();this.reactAt(obj.x,obj.y,'grab');this.buddyApproach(obj);});
   this.input.on('drag',(pointer,obj,x,y)=>{obj.x=clamp(x,35,W-35);obj.y=clamp(y,40,H-20);obj.onMove?.(pointer);});
   this.input.on('dragend',(pointer,obj)=>{this.dragging=null;obj.setDepth(obj.restoreDepth??2);obj.onRelease?.(pointer);});
   this.input.on('pointerup',p=>this.finishPointer?.(p));
   this.input.on('pointerupoutside',p=>this.finishPointer?.(p));
   this.game.events.on('blur',this.blur=()=>{this.dragging=null;this.finishPointer?.();save();});
   this.events.once('shutdown',()=>this.game.events.off('blur',this.blur));
   if(route==='map')this.mapScene();
   else if(route===1)this.observeScene();
   else if(route===2)this.sortScene();
   else if(route===3)this.freezeScene();
   else if(route===4)this.pipeScene();
   else if(route===5)this.drawingScene();
   else if(route===6)this.heatScene();
   else if(route===7)this.dewScene();
   else if(route===8)this.explainScene();
   else this.workshopScene();
   if(route!=='map')this.events.emit('learner-ready');
  }
  text(x,y,text,size=20,color='#244c57'){const scale=Math.min(host.clientWidth/W,host.clientHeight/H);if(route!=='map')size=Math.max(size,Math.min(28,18/Math.max(.5,scale)));return this.add.text(x,y,text,{fontFamily:'Jua, Pretendard, system-ui, sans-serif',fontSize:size+'px',fontStyle:'normal',color,align:'center',strokeThickness:0,resolution:4}).setOrigin(.5).setDepth(6);}
  prop(x,y,index,size=110,type='equipment',drag=false){const obj=this.add.image(x,y,type,String(index)).setDisplaySize(size,size).setDepth(2);if(drag){obj.setInteractive({useHandCursor:true});this.input.setDraggable(obj);}return obj;}
  learningSprite(key,x,y,width,height,depth=3){return this.textures.exists(key)?this.add.image(x,y,key).setDisplaySize(width,height).setDepth(depth):null;}
  tankFrame(x,y,width,height){
   const w=width/tankWindow.width,h=height/tankWindow.height;
   return this.learningSprite('learning-tank',x-tankWindow.left*w+w/2,y-tankWindow.top*h+h/2,w,h);
  }
  zone(x,y,w,h,handler){const z=this.add.zone(x,y,w,h).setInteractive({useHandCursor:true});z.on('pointerdown',handler);return z;}
  action(name){later(()=>ctx.action(name));}
  commit(){save();later(()=>ctx.render());}
  cue(text){ctx.say?.(text);}
  reactAt(x,y,kind='good'){
   void playCue(kind==='grab'?'click':kind==='warn'?'error':'drop');
   const ring=this.add.circle(x,y,kind==='grab'?28:20,0xefffff,.08).setStrokeStyle(3,kind==='warn'?0xe3a353:0x60d7cf,.85).setDepth(24);
   if(reduced()){this.time.delayedCall(280,()=>ring.destroy());return;}
   this.tweens.add({targets:ring,scale:kind==='grab'?1.3:1.8,alpha:0,duration:380,onComplete:()=>ring.destroy()});
  }
  grip(x,y){
   const g=this.add.graphics().setDepth(8);g.fillStyle(0xffe39c).fillCircle(x,y,22);g.lineStyle(3,0x617e76).strokeCircle(x,y,22);
   for(const dx of [-6,0,6]){g.fillStyle(0x617e76).fillCircle(x+dx,y-5,1.6).fillCircle(x+dx,y+5,1.6);}return g;
  }
  createBuddy(){
   // These experiments use the Bangul guide outside the observation surface.
   if([4,8,10].includes(route))return;
   const seats={1:[55,312],2:[655,165],3:[80,313],4:[650,314],5:[674,326],6:[54,318],7:[670,318],8:[47,318],9:[660,126],10:[657,120]},[x,y]=seats[route];
   this.buddyHome={x,y};this.buddyShadow=this.add.ellipse(x,y-3,43,12,0x39616b,.16).setDepth(10);
   this.buddy=this.prop(x,y,0,96,'buddy').setOrigin(.5,1).setDepth(11).setInteractive({useHandCursor:true});
   const hints={1:'도구를 잡고 옮겨 봐. 달라진 모습을 함께 찾자!',2:'그림을 아래 칸으로 옮겨 줘. 관찰한 성질이 단서야.',3:'같은 물을 얼리고 녹여 보자. 높이와 무게를 비교해!',4:'노란 손잡이로 물높이를 바꿔. 얼음이 자랄 자리가 있을까?',5:'왼쪽 판에 네 그림을 그려 봐. 내가 옆에도 똑같이 그릴게!',6:'돋보기를 물 위로 옮겨 봐. 물속과 처음 눈금도 살펴보자.',7:'물방울을 손가락으로 문질러 봐. 닦은 자리에 다시 생길까?',8:'직접 모은 증거로 물방울이 온 길을 이어 줘.',9:'부품을 옮겨 물길을 만들자. 경사판 손잡이도 움직여 봐!',10:'고친 물길에서 코어까지 물을 보내 줘!'};
   this.buddyHint=hints[route];this.buddy.on('pointerdown',()=>{this.buddySpeak(this.buddyHint);this.reactAt(this.buddy.x,this.buddy.y-30);});
   if(!reduced())this.buddyIdle=this.tweens.add({targets:this.buddy,y:y-4,duration:1700,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  }
  buddyApproach(obj){
   if(!this.buddy)return;const home=this.buddyHome,target={x:clamp(obj.x+(obj.x<360?-78:78),42,678),y:home.y};
   // The helper stays on the edge of the work surface, clear of the learner's pointer.
   this.buddyIdle?.stop();this.tweens.killTweensOf(this.buddy);const from=this.buddy.x;
   this.buddy.setFlipX(target.x<from);this.buddy.setFrame('10');
   if(reduced()){this.buddy.setPosition(target.x,target.y);this.buddyShadow.setPosition(target.x,target.y-3);this.buddy.setFrame('2');return;}
   const cursor={t:0};this.tweens.add({targets:cursor,t:1,duration:clamp(Math.abs(from-target.x)*2,180,600),onUpdate:()=>{const x=from+(target.x-from)*cursor.t;this.buddy.setPosition(x,target.y-Math.abs(Math.sin(cursor.t*Math.PI*4))*4);this.buddyShadow.setPosition(x,target.y-3);},onComplete:()=>this.buddy.setFrame('2')});
  }
  buddySpeak(message){
   if(!this.buddy||!message)return;this.speechTimer?.remove();this.speech?.destroy(true);
   const x=clamp(this.buddy.x<360?this.buddy.x+97:this.buddy.x-97,119,W-119),y=clamp(this.buddy.y-105,48,H-48);
   const bg=this.add.graphics();bg.fillStyle(0xfffdf0,.98).fillRoundedRect(-111,-35,222,70,15);bg.lineStyle(2,0x80a99b).strokeRoundedRect(-111,-35,222,70,15);
   const tail=clamp(this.buddy.x-x,-94,94);bg.fillStyle(0xfffdf0).fillTriangle(tail-6,34,tail+6,34,tail,44);
   const words=this.text(0,0,message,17);words.setStroke('#fffdf0',0).setWordWrapWidth(198,true);this.speech=this.add.container(x,y,[bg,words]).setDepth(25);
   this.buddy.setFrame('2');this.speechTimer=this.time.delayedCall(3600,()=>{this.speech?.destroy(true);this.speech=null;});
  }
  panel(x,y,w,h,color=0xfaf5e2){this.g.fillStyle(color,.85).fillRoundedRect(x,y,w,h,22);this.g.lineStyle(2,0xb3cabb,.8).strokeRoundedRect(x,y,w,h,22);}
  cup(g,x,base,width,height,amount,frozen=false){
   const h=waterHeight(amount,width);
   const key=[x,base,width,height].join(':');
   if(this.textures.exists('equipment')){
    if(!this.cupShells.has(key))this.cupShells.set(key,this.add.image(x,base-height*.49,'equipment','beaker-shell').setDisplaySize(width*1.5,height*1.1).setDepth(3));
   }else g.fillStyle(0xeffbff,.65).fillRoundedRect(x-width/2,base-height,width,height,10);
   const ice=typeof frozen==='number'?clamp(frozen,0,1):frozen?1:0;
   const water=()=>{if(h<=4)return;if(this.textures.exists('equipment')){const top=base-h,turn=Math.max(top,base-24);g.fillPoints([{x:x-width/2+4,y:top},{x:x+width/2-4,y:top},{x:x+width/2-4,y:turn},{x:x+width*.4,y:Math.max(top,base-10)},{x:x+width*.28,y:base-4},{x:x-width*.28,y:base-4},{x:x-width*.4,y:Math.max(top,base-10)},{x:x-width/2+4,y:turn}],true);}else g.fillRect(x-width/2+4,base-h,width-8,Math.max(0,h-4));};
   g.fillStyle(0x4ebbd1,.8);water();
   if(ice){g.fillStyle(0xb6e9ee,ice*.95);water();}
   if(!this.textures.exists('equipment')){g.lineStyle(4,0x729aa5).beginPath().moveTo(x-width/2,base-height).lineTo(x-width/2,base).lineTo(x+width/2,base).lineTo(x+width/2,base-height).strokePath();g.lineStyle(3,0xffffff,.8).lineBetween(x+width/2-12,base-height+14,x+width/2-12,base-14);}
   if(ice){g.lineStyle(2,0xffffff,.8*ice);for(let i=0;i<4;i++)g.lineBetween(x-width/3+i*22,base-h+10,x-width/4+i*15,base-10);}
  }
  update(time,delta){if(!host.isConnected)return;this.tick?.(time,Math.min(delta,50));this.tickPack?.();}
  focusObjects(){this.cameras.main.zoomTo(this.cameras.main.zoom>4?4:4.8,200);}
  mapScene(){
   // The game is drawn at twice the map size so the zoomed-in island stays sharp; camera zoom keeps map coordinates.
   this.cameras.main.setZoom(2).centerOn(500,281.5);
   islandTrails.forEach((points,i)=>{
    const complete=state.completed.includes(i+1);
    if(!complete)return;
    this.g.lineStyle(6,0x327c79,.25);
    this.g.beginPath();points.forEach(([x,y],j)=>j?this.g.lineTo(x,y):this.g.moveTo(x,y));this.g.strokePath();
    this.g.lineStyle(2,0x8edbd0,.72);
    this.g.beginPath();points.forEach(([x,y],j)=>j?this.g.lineTo(x,y):this.g.moveTo(x,y));this.g.strokePath();
    for(let j=0;j<3;j++){
     const dot=this.add.circle(...pointOnRoute(points,j/3),3,0xf9ffe9),cursor={t:0};
     if(!reduced())this.tweens.add({targets:cursor,t:1,duration:2500,delay:j*650,repeat:-1,onUpdate:()=>{const [x,y]=pointOnRoute(points,(cursor.t+j/3)%1);dot.setPosition(x,y);}});
    }
   });
   const panning=()=>{const view=host.closest('.map-viewport');return !!view&&(!!view.dataset.drag||view.classList.contains('hand-on')||performance.now()-(+view.dataset.dragEnd||0)<350);};
   this.input.on('pointerup',p=>{if(p.event?.target!==this.game.canvas||panning())return;const idx=islandStops.map(([x,y],i)=>({i,d:Math.hypot(x-p.worldX,y-p.worldY)})).sort((a,b)=>a.d-b.d)[0];if(idx.d<32)ctx.enterMission?.(idx.i+1);});
  }
  observeScene(){
   const o=a().observe;
   if(o.step===0){
    createPouringScene(this);
   }else if(o.step===1){
    createIceScene(this);
   }else createClothScene(this);
  }
  sortScene(){
   const card=q().hiddenProof?null:(sortCards.find(c=>c.id===q().sortProof)||(sortCards.some(c=>!a().sort.placed[c.id])?nextSortCard(a().sort):null));
   const bonus=activityReady(2,a()),hidden=a().sort.hidden;
   const hiddenActive=bonus&&hiddenScenes.find(c=>c.id===q().hiddenProof&&!hidden.placed[c.id]);
   const texture=this.textures.get('water-search'),photo=texture.getSourceImage();
   const width=148,height=114,caption=33;
   sortCards.forEach((c,i)=>{
    const col=i%3,row=Math.floor(i/3),x=12+col*155,y=4+row*151;
    // Include the waterfall next to the dry cloth in the right-hand photograph.
    const left=Math.round(photo.width*(col/3-(c.id==='vapor'?.032:0))),top=Math.round(photo.height*row/2);
    texture.add(c.id,0,left,top,Math.floor(photo.width/3),Math.floor(photo.height/2));
    const extra=bonus&&hiddenScenes.find(s=>s.card===c.id);
    const done=!!a().sort.placed[c.id],selected=card?.id===c.id||!!extra&&extra===hiddenActive;
    this.g.fillStyle(selected?0xffe2a1:done?0xe2f0e2:0xfff9e9).fillRoundedRect(x-2,y-2,width+4,height+caption+4,6);
    this.g.lineStyle(selected?3:1,selected?0x9a6a21:0x779485).strokeRoundedRect(x-2,y-2,width+4,height+caption+4,6);
    this.add.image(x,y,'water-search',c.id).setOrigin(0).setDisplaySize(width,height);
    const labelY=y+height+caption/2;
    this.text(x+(width-(extra?36:0))/2,labelY,`${i+1}  ${c.label??c.name}${done?' ✓':''}`,14).setFontSize(14).setWordWrapWidth(width-(extra?38:8),true);
    this.zone(x+width/2,y+(height+caption)/2,width,height+caption,()=>this.action('ix-sort-card-'+c.id));
    if(extra){
     const found=!!hidden.placed[extra.id],buttonX=x+width-17;
     this.g.fillStyle(found?0xc9e4cb:0xffdf90).fillRoundedRect(buttonX-16,y+height+1,32,caption-2,5);
     this.text(buttonX,labelY,found?'✓':'?',17).setFontSize(17);
     if(!found){
      const select=()=>this.action('ix-hidden-card-'+extra.id);
      this.zone(buttonX,labelY,36,caption+2,select).setDepth(7);
      this.zone(x+width*extra.spot[0],y+height*extra.spot[1],42,44,select).setDepth(7);
     }
    }
   });
   ['solid','liquid','gas'].forEach((key,i)=>{const y=65+i*84;this.panel(490,y-30,215,72);this.text(600,y-8,['고체','액체','기체'][i],23);this.text(600,y+19,`${sortCards.filter(c=>a().sort.placed[c.id]===key).length+hiddenScenes.filter(c=>hidden.placed[c.id]===key).length}개 확인`,16);const bin=this.add.rectangle(600,y+5,210,68,0xffffff,0).setInteractive({useHandCursor:true});bin.on('pointerdown',()=>this.action((hiddenActive?'ix-hidden-place-':'ix-sort-answer-')+key));});
   if(!card){const left=hiddenScenes.filter(c=>!hidden.placed[c.id]).length;this.text(243,317,!bonus?'여섯 장면의 물을 모두 찾았어!':hiddenActive?`${hiddenActive.name} · 오른쪽 상태를 눌러 봐`:left?`숨은 물 ${left}곳 · ? 표시를 눌러 찾아봐`:'숨은 물까지 모두 찾았어!',hiddenActive?18:20);return;}
   const idx=['beaker','jug','ice','cloth','can','icepack','thermometer','magnifier','seedling'].indexOf(card.art);
   const obj=this.prop(530,298,idx,48,'equipment',true);this.text(628,298,'칸으로 끌기',16);
   this.text(243,317,card.name+' · 어떤 상태인지 눌러 봐',17);
   obj.onRelease=()=>{if(obj.x<490||obj.y<29||obj.y>269){obj.setPosition(530,298);return;}const key=['solid','liquid','gas'][clamp(Math.round((obj.y-65)/84),0,2)];q().sortProof=card.id;this.action('ix-sort-answer-'+key);};
  }

  freezeScene(){
   const s=a().freeze;
   this.panel(180,20,300,295);
   const scale=this.learningSprite('learning-scale',330,278,260,84);if(!scale)this.g.fillStyle(0x4d777b).fillRoundedRect(240,260,180,45,12);
   this.text(330,scale?291:283,s.onScale?'100.0 g':'0.0 g',20,scale?'#254d54':'#fffbea').setStroke('#fffdf3',0);
   const cup=this.prop(s.onScale?330:95,s.onScale?155:150,0,165,'equipment',!s.onScale);if(s.onScale)cup.setVisible(false);
   cup.onRelease=()=>{if(cup.x>210&&cup.x<460){this.reactAt(330,250);this.action('act-drop-measure-cup-scale');}else{cup.setPosition(95,150);this.cue('물통을 저울 한가운데 올려 줘.');}};
   const ice=this.prop(580,95,5,105,'equipment',true),warm=this.prop(580,245,6,105,'equipment',true);
   this.text(580,160,'차갑게',19);this.text(580,305,'따뜻하게',19);
   ice.onRelease=()=>{if(ice.x>210&&ice.x<460)this.action('act-drop-icepack-freeze-cup');else{ice.setPosition(580,95);this.cue('냉각팩을 물통 가까이 가져가 봐.');}};
   warm.onRelease=()=>{if(warm.x>210&&warm.x<460)this.action('act-drop-warm-freeze-cup');else warm.setPosition(580,245);};
   const phaseChanged=visual.freeze.phase!==s.phase,target=freezeLevel(s.phase),morph={level:phaseChanged?visual.freeze.level:target,ice:visual.freeze.phase==='ice'?1:0};
   visual.freeze.phase=s.phase;
   const phaseLabel=this.text(330,48,s.phase==='ice'?'얼린 물':s.phase==='melt'?'다시 녹인 물':'처음 물',20);
    if(phaseChanged&&!reduced())this.tweens.add({targets:morph,level:target,ice:s.phase==='ice'?1:0,duration:280,ease:'Sine.easeInOut',onUpdate:()=>{visual.freeze.level=morph.level;},onComplete:()=>{phaseLabel.setText(s.phase==='ice'?'얼음 · 높이를 비교해 봐':'다시 녹은 물 · 처음과 비교해 봐');this.cue(s.phase==='ice'?'높이는 올라갔어. 저울의 무게도 달라졌을까?':'다시 녹으니 처음 높이야. 세 장의 기록을 비교해 봐.');}});
   else{morph.level=target;morph.ice=s.phase==='ice'?1:0;visual.freeze.level=target;}
   const lineLabel=this.text(455,250-s.prediction*1.6,'예상',16,'#9a602b');
   const marker=this.add.circle(410,250-s.prediction*1.6,20,0xffd97c).setStrokeStyle(3,0x9a602b).setDepth(9);
   if(s.onScale&&!s.predicted){marker.setInteractive({useHandCursor:true});this.input.setDraggable(marker);marker.onMove=()=>{marker.x=410;marker.y=clamp(marker.y,122,170);s.prediction=Math.round((250-marker.y)/1.6*2)/2;lineLabel.setPosition(455,marker.y);};marker.onRelease=()=>{this.reactAt(410,marker.y);this.commit();};}
   marker.setVisible(s.onScale&&!s.predicted);lineLabel.setVisible(s.onScale);
   this.zone(330,140,170,220,p=>{if(!s.onScale||s.predicted)return;s.prediction=Math.round(clamp((250-p.worldY)/1.6,50,80)*2)/2;this.commit();});
   this.tick=()=>{this.dynamic.clear();if(!s.onScale)return;this.cup(this.dynamic,330,250,135,220,morph.level*1.35,morph.ice);this.dynamic.lineStyle(3,0xb97835).lineBetween(255,250-s.prediction*1.6,405,250-s.prediction*1.6);if(q().freezeOverlay){this.dynamic.lineStyle(2,0x387c9f).lineBetween(252,154,408,154);this.dynamic.fillStyle(0x387c9f).fillCircle(255,154,4);}};
  }
  pipeScene(){
   const s=a().pipe,t=s.trials.at(-1),signature=t?JSON.stringify(t):'',fresh=signature!==visual.pipe;visual.pipe=signature;
   this.text(205,28,'처음 채운 물');this.text(515,28,t?'같은 물을 얼린 뒤':'얼리면 어떻게 될까?');
   if(!this.tankFrame(120,70,170,210))this.panel(110,52,190,245);
   if(!this.tankFrame(430,70,170,210))this.panel(420,52,190,245);
   this.g.lineStyle(2,0xa2b9ae,.6);for(let i=1;i<=4;i++){this.g.lineBetween(112,280-i*42,128,280-i*42);this.g.lineBetween(422,280-i*42,438,280-i*42);}
   const handle=this.add.circle(302,280-s.fill*2.1,24,0xf6cb63).setStrokeStyle(4,0xffffff).setDepth(9).setInteractive({useHandCursor:true});this.input.setDraggable(handle);
   const arrows=this.text(302,handle.y,'↕',24,'#705921').setDepth(10);arrows.setStroke('#ffe7a2',0);
   const setFill=y=>{s.fill=Math.round(clamp((280-y)/2.1,40,100)/5)*5;handle.setPosition(302,280-s.fill*2.1);arrows.y=handle.y;};
   handle.onMove=()=>setFill(handle.y);handle.onRelease=()=>{this.reactAt(handle.x,handle.y);this.cue('물높이를 바꿨어. 같은 조건으로 얼려 보고 앞 기록과 비교해 봐.');this.commit();};
   const waterControl=this.add.zone(205,178,170,220).setDepth(7).setInteractive({useHandCursor:true});let filling=false;
   waterControl.on('pointerdown',p=>{filling=true;stopClock();setFill(p.worldY);});this.input.on('pointermove',p=>{if(filling&&p.isDown)setFill(p.worldY);});
   this.finishPointer=()=>{if(filling){filling=false;this.commit();}};
   const value=this.text(205,310,'',18),spaceLabel=this.text(515,310,t?(s.marked?'남는 공간을 찾았어':'얼음 위 빈 곳을 짚어 봐'):'먼저 물높이를 정해 봐',18);
   this.zone(515,169,170,220,p=>{if(!t)return;const top=280-Math.min(100,t.expanded)*2.1;if(t.space>0&&p.worldY<top+9){this.reactAt(p.worldX,p.worldY);this.action('act-mark-space');}else this.cue(t.space>0?'얼음이 차지한 곳 위에 비어 있는 공간을 찾아봐.':'얼음이 자랄 공간이 부족해. 처음 물높이를 바꿔 보자.');});
    const expansion={level:t?(fresh&&!reduced()?t.fill:t.expanded):0};if(t&&fresh&&!reduced())this.tweens.add({targets:expansion,level:t.expanded,duration:280,ease:'Sine.easeInOut'});
   this.tick=()=>{this.dynamic.clear();this.dynamic.fillStyle(0x59c5dc,.8).fillRect(120,280-s.fill*2.1,170,s.fill*2.1);this.dynamic.lineStyle(3,0xf8fffc).lineBetween(120,280-s.fill*2.1,290,280-s.fill*2.1);value.setText(`물높이 ${s.fill} · 손잡이로 조절`);if(t){const top=280-Math.min(100,expansion.level)*2.1;this.dynamic.fillStyle(0xa3dce9,.96).fillRect(430,top,170,280-top);this.dynamic.lineStyle(2,0x8d6e37,.8).lineBetween(430,280-t.fill*2.1,600,280-t.fill*2.1);if(t.space>0){this.dynamic.lineStyle(s.marked?4:2,s.marked?0x289e7e:0xc28d27).strokeRect(432,60,166,Math.max(4,top-60));if(s.marked)spaceLabel.setText('빈 공간이 얼음 위에 남았어');}else{this.dynamic.lineStyle(4,0xd58045).lineBetween(492,60,507,80).lineBetween(507,80,522,64).lineBetween(522,64,538,85);}}};
  }
  drawingScene(){createWaterDrawing(this);}
  heatScene(){
   const s=a().compare;this.text(220,23,'A · 가열하지 않음');this.text(490,23,'B · 가열 조절');
   this.panel(135,45,170,235);this.panel(405,45,170,235);
   if(!q().lens)visual.lens={x:650,y:150};
    const lens=this.prop(visual.lens.x,visual.lens.y,7,100,'equipment',true).setDepth(12);this.text(643,245,'돋보기',22);
   const glass=this.add.graphics().setDepth(15),mask=this.add.graphics().setVisible(false),magnified=this.add.graphics().setDepth(16);magnified.setMask(mask.createGeometryMask());
    // A real hot plate replaces the flat heater bar; its glow follows the heat setting under cup B.
    const plate=this.textures.exists('hotplate')?this.add.image(490,267,'hotplate').setOrigin(.5,.395).setDisplaySize(168,65).setDepth(1):null,plateGlow=plate?this.add.graphics().setDepth(2):null;
    const lensLabel=this.text(360,plate?316:302,'A 표면 · B 물속 · 수위 비교',22);
   lens.onMove=()=>{visual.lens={x:lens.x,y:lens.y};const site=lensRegion(lens.x,lens.y);lensLabel.setText(({surface:'A 표면 · 물은 눈에 보이지 않는 수증기로 변해',inside:'B 물속 · 기포가 생기는지 관찰해',level:'금색 선 = 처음 높이 · 지금 높이와 비교해'})[site]);};
   const inspect=()=>{const site=lensRegion(lens.x,lens.y);q().lens=site;visual.lens={x:lens.x,y:lens.y};this.reactAt(lens.x,lens.y);this.action('ix-lens-'+site);};lens.onRelease=()=>{if(lens.x<585)inspect();else{lens.setPosition(650,150);visual.lens={x:650,y:150};}};
   this.tick=t=>{const h=heatingTrial(s.heat,observationTime(6));this.dynamic.clear();this.cup(this.dynamic,220,267,125,205,h.room);this.cup(this.dynamic,490,267,125,205,h.heated);
    // A fixed initial line makes a falling water level comparable in both vessels.
    this.dynamic.lineStyle(2,0xa78037,.9).lineBetween(157,267-waterHeight(70,125),282,267-waterHeight(70,125)).lineBetween(427,267-waterHeight(70,125),552,267-waterHeight(70,125));
    if(h.boiling)for(let i=0;i<9;i++){const depth=Math.max(1,waterHeight(h.heated,125)-18),y=259-(((reduced()?0:t/30)+i*19)%depth);this.dynamic.lineStyle(2,0xc3f9ff,.9).strokeCircle(460+i%4*19,y,4+i%3);}
    if(plate){plateGlow.clear();if(s.heat)plateGlow.fillStyle(0xff8a3d,.18+s.heat/100*.5).fillEllipse(490,264,132,34);}else this.dynamic.fillStyle(s.heat?0xe8a257:0x94a5a1).fillRoundedRect(421,277,138,18,8);
    glass.clear();mask.clear();magnified.clear();if(lens.x>585)return;
    const site=lensRegion(lens.x,lens.y),x=clamp(lens.x+(lens.x<360?100:-100),66,654),y=clamp(lens.y-45,78,213),r=56;
    mask.fillStyle(0xffffff).fillCircle(x,y,r);glass.fillStyle(0xfffef2).fillCircle(x,y,r+6);glass.lineStyle(4,0x4b8991).strokeCircle(x,y,r+5);glass.lineStyle(2,0x7caaac,.6).lineBetween(lens.x,lens.y,x,y);
    magnified.fillStyle(0xf1fbf5).fillCircle(x,y,r);
    if(site==='level'){
     for(const [i,amount] of [h.room,h.heated].entries()){const cx=x-28+i*55,base=y+45,level=waterHeight(amount,125)*.65; magnified.fillStyle(0x51b6d1,.8).fillRect(cx-19,base-level,38,level);magnified.lineStyle(3,0x9d7c36).lineBetween(cx-21,base-waterHeight(70,125)*.65,cx+21,base-waterHeight(70,125)*.65);magnified.lineStyle(2,0x8eacb2).strokeRect(cx-21,y-47,42,92);}
    }else if(site==='surface'){
     magnified.fillStyle(0x59bfd5,.85).fillRect(x-r,y+5,r*2,r);magnified.lineStyle(3,0xb7f4fc).lineBetween(x-r,y+5,x+r,y+5);
     // Water vapour is invisible: no decorative cloud or visible gas particles.
    }else{
     magnified.fillStyle(0x63c4dd,.85).fillRect(x-r,y-r,r*2,r*2);if(h.boiling)for(let i=0;i<7;i++){const by=y+r-((reduced()?i*17:t/15+i*17)%(r*2));magnified.lineStyle(3,0xe5ffff).strokeCircle(x-33+(i%4)*22,by,7+i%3);}
    }
   };
    // The shared guide carries the instruction; keep the canvas for objects and labels.
  }
  dewScene(){createDewScene(this,(kind,ids)=>ctx.wipe(kind,ids));}
  explainScene(){
   const s=a().explain;
   if(s.chain.length===3){
    this.text(205,22,'차가운 음료병');this.text(510,22,'실온 음료병');this.learningSprite('drink-bottle',205,166,185,278);this.learningSprite('drink-bottle',510,166,185,278);
    const rubbed={cold:0,room:0};let last=null,starting=false;
    this.input.on('pointerdown',()=>{last=null;});this.finishPointer=()=>{last=null;};
    this.input.on('pointermove',p=>{if(!p.isDown||p.worldY<50||p.worldY>280||s.bottleWiped||starting){last=null;return;}if(!q().transferPrediction){this.cue('어느 병에 물방울이 생길지 예상부터 해 보자.');return;}const key=Math.abs(p.worldX-205)<95?'cold':Math.abs(p.worldX-510)<95?'room':null;if(key&&last?.key===key)rubbed[key]+=Math.hypot(p.worldX-last.x,p.worldY-last.y);last={key,x:p.worldX,y:p.worldY};if(rubbed.cold>85&&rubbed.room>85){starting=true;this.action('ix-bottle-start');}else if(rubbed[key]>85)this.cue('이 병은 닦았어. 다른 병도 문질러 줘.');});
    this.tick=()=>{this.dynamic.clear();for(const p of visibleDew(s.bottleWiped?observationTime(8):0))this.dynamic.fillStyle(0x66c9e3,.95).fillEllipse(205+p.x-120,p.y-5,9,13);};
    this.text(360,310,s.bottleWiped?'시간 손잡이를 움직여 두 병을 비교해 봐':'예상한 뒤 두 병의 겉면을 문질러 봐',20);return;
   }
   if(s.evidence.length>=2){
    const keys=['drops','air','cold'],labels={air:'공기 중 수증기',cold:'차가운 표면',drops:'물방울'};
    for(let i=0;i<3;i++){this.panel(30+i*235,205,190,105);this.text(125+i*235,260,s.chain[i]?labels[s.chain[i]]:['어디에서?','무엇을 만나?','어떤 모습으로?'][i],20);}
    keys.filter(k=>!s.chain.includes(k)).forEach((k,i)=>{const x=130+i*230;const obj=k==='cold'?this.prop(x,85,5,100,'equipment',true):this.add.container(x,85,[this.add.circle(0,0,42,k==='air'?0xeaf2e9:0xa3e1ee,.9).setStrokeStyle(3,0x8cb8ad),this.text(0,0,k==='air'?'공기':'물',25)]).setSize(105,105).setInteractive({useHandCursor:true});
     if(k!=='cold')this.input.setDraggable(obj);this.text(x,150,labels[k],19);let tapStart;obj.on('pointerdown',p=>{tapStart={x:p.worldX,y:p.worldY};});obj.on('pointerup',p=>{if(tapStart&&Math.hypot(p.worldX-tapStart.x,p.worldY-tapStart.y)<12)this.action('ix-chain-'+k);tapStart=null;});obj.onRelease=()=>{const slot=clamp(Math.round((obj.x-125)/235),0,2);if(obj.y>200&&slot===s.chain.length)this.action('ix-chain-'+k);else{obj.setPosition(x,85);this.cue('왼쪽부터, 물이 어디에서 와서 어떻게 바뀌었는지 이어 봐.');}};});
    this.text(360,25,'설명 그림 · 수증기는 눈에 보이지 않아',16);return;
   }
   const proofs=[['sealed','입구를 막았어',4],['contrast','차가운 컵에 생겼어',5],['again','닦아도 다시 생겼어',3]];
   this.panel(180,195,360,110);this.text(360,248,'내 설명에 쓸 증거 놓는 곳',20);
   proofs.forEach(([key,label,index],i)=>{const x=130+i*230,obj=this.prop(x,85,index,100,'equipment',true);this.text(x,153,label,17);if(s.evidence.includes(key)){obj.setTint(0xa9e9cf);this.text(x,27,'✓ 연결한 증거',17,'#21785d');}let tapStart;obj.on('pointerdown',p=>{tapStart={x:p.worldX,y:p.worldY};});obj.on('pointerup',p=>{if(tapStart&&Math.hypot(p.worldX-tapStart.x,p.worldY-tapStart.y)<12)this.action('ix-evidence-'+key);tapStart=null;});obj.onRelease=()=>{if(obj.y>190&&!s.evidence.includes(key))this.action('ix-evidence-'+key);else obj.setPosition(x,85);};});
  }
  workshopScene(){
   const final=route===10,context=final?finalContext():null,s=final?context.progress.diagnosis.working:state.lab.workshop;
   const names=['plate','ramp','funnel','tube','bucket'];const scale=.64,offset=10;
   const result=final?context.progress.diagnosis.tests.at(-1):s.trials.at(-1);
   const valid=()=>!this.dragging&&result?.signature===testCollector(s.parts,s.cold,s.angle).signature;
   const firstBreak=result?.steps?.find(step=>!step.ok);const breakLabel=firstBreak?this.text(clamp(firstBreak.point.x,100,620),Math.min(290,firstBreak.point.y*scale+offset+30),'처음 멈춘 곳',17,'#9a3629').setDepth(12):null;
   const labelPosition=(obj,key)=>key==='plate'?[obj.x,obj.y-44]:key==='ramp'?[obj.x+65,obj.y-44]:[obj.x+(obj.x>570?-68:68),obj.y];
   this.parts={};names.forEach((key,i)=>{
    const p=s.parts[key],obj=this.prop(p.x,p.y*scale+offset,i,key==='plate'?120:key==='ramp'?150:85,'workshop',!final||key==='funnel');this.parts[key]=obj;
    if(!final||key==='funnel')obj.setInteractive({pixelPerfect:true,alphaTolerance:96,useHandCursor:true});
    obj.setDepth(s.selected===key?8:2);
    obj.on('pointerdown',()=>{if(final)return;s.selected=key;Object.entries(this.parts).forEach(([k,part])=>part.setDepth(k===key?8:2));const select=document.querySelector('#selected-part');if(select)select.value=key;});
    const label=this.text(...labelPosition(obj,key),['냉각판','경사판','깔때기','연결관','물통'][i],17);
    if(key==='ramp'){obj.setDisplaySize(211,58);obj.setOrigin(.1,.5).setAngle(Math.atan(s.angle*2/180)*180/Math.PI);}
    obj.onMove=()=>{const next=partPosition(key,obj.x,(obj.y-offset)/scale);obj.x=next.x;obj.y=final?p.y*scale+offset:next.y*scale+offset;label.setPosition(...labelPosition(obj,key));if(!final&&key==='ramp'){const endpoint=rampEndpoint({x:obj.x,y:(obj.y-offset)/scale},s.angle);angleHandle.setPosition(endpoint.x-65,endpoint.y-45);angleLabel.setPosition(endpoint.x-65,endpoint.y-45);}};
    obj.onRelease=()=>{p.x=obj.x;p.y=Math.round((obj.y-offset)/scale);s.selected=key;this.reactAt(obj.x,obj.y);if(final){context.progress.diagnosis.resolved=false;context.progress.tested=false;context.progress.lever=0;if(!context.preview)save();later(()=>ctx.render());}else{s.compare=false;this.commit();}};
   });
   const coldPack=this.add.image(0,0,'real-tools','1').setDisplaySize(50,68).setDepth(10).setVisible(s.cold);
   this.tickPack=()=>{const plate=this.parts.plate;coldPack.setPosition(plate.x+42,plate.y-10).setVisible(s.cold);};
   let angleHandle,angleLabel,moveHandle;
   if(!final){
    const selected=this.parts[s.selected]||this.parts.plate;
    moveHandle=this.add.circle(selected.x-47,selected.y-25,26,0xd1e8de).setStrokeStyle(3,0x315f59).setDepth(21).setInteractive({useHandCursor:true});this.input.setDraggable(moveHandle);
    const moveLabel=this.text(moveHandle.x,moveHandle.y,'✥',26).setDepth(22);
    moveHandle.on('pointerdown',()=>{moveHandle.partKey=s.selected||'plate';});
    moveHandle.onMove=()=>{const obj=this.parts[moveHandle.partKey];obj.x=moveHandle.x+47;obj.y=moveHandle.y+25;obj.onMove();moveHandle.setPosition(obj.x-47,obj.y-25);moveLabel.setPosition(moveHandle.x,moveHandle.y);};
    moveHandle.onRelease=()=>this.parts[moveHandle.partKey].onRelease();
    this.moveSelectionLabel=moveLabel;
    const followPack=this.tickPack;
    this.tickPack=()=>{
     followPack();
     if(this.dragging===moveHandle)return;
     const part=this.parts[s.selected]||this.parts.plate;
     moveHandle.setPosition(part.x-47,part.y-25);moveLabel.setPosition(moveHandle.x,moveHandle.y);
    };
   }
   if(!final){
    const end=rampEndpoint(s.parts.ramp,s.angle);angleHandle=this.add.circle(end.x-65,end.y-45,26,0xffdf91).setStrokeStyle(3,0x608a81).setDepth(9).setInteractive({useHandCursor:true});this.input.setDraggable(angleHandle);
    angleLabel=this.text(end.x-65,end.y-45,'↕',25,'#536e61').setDepth(10);angleLabel.setStroke('#ffedbd',0);
    angleHandle.on('pointerdown',()=>{
     s.selected='ramp';
     const picker=document.getElementById('selected-part');if(picker)picker.value='ramp';
    });
    angleHandle.onMove=()=>{s.angle=Math.round(clamp(((angleHandle.y+45-offset)/scale-s.parts.ramp.y)/2,-20,40)/5)*5;const end=rampEndpoint(s.parts.ramp,s.angle);angleHandle.setPosition(end.x-65,end.y-45);angleLabel.setPosition(end.x-65,end.y-45);this.parts.ramp.setAngle(Math.atan(s.angle*2/180)*180/Math.PI);};
    angleHandle.onRelease=()=>{s.compare=false;this.reactAt(angleHandle.x,angleHandle.y);this.commit();};
    this.text(358,315,'부품 그림을 끌어 옮겨. 노란 ↕ 손잡이로 경사판 끝을 아래로 기울여 봐.',16);
   }
   let core,coreLabel,valve,valveText;
   if(final){
    // The core art keeps its inlet at the lower left; pipe and glow coordinates follow that image.
    const f=context.progress,coreArt=this.textures.exists('water-core');core=(coreArt?this.add.image(638,214,'water-core').setDisplaySize(84,170):this.prop(638,245,5,119,'workshop')).setDepth(6).setInteractive({useHandCursor:true});if(coreArt&&!f.tested)core.setTint(0xc4d2d6);else core.setAlpha(f.tested?1:.65);
    this.coreInlet=coreArt?{x:598,y:272}:{x:596,y:245};this.coreGlow=coreArt?{x:642,y:188,r:30}:{x:638,y:240,r:46};
    coreLabel=this.text(600,coreArt?316:310,f.tested?'코어에 물 도착!':f.connected?'코어로 물 보내기':'코어 연결이 필요해',17);
    core.on('pointerdown',()=>{if(f.tested)this.cue('물이 도착했어! 마지막 레버를 당겨 줘.');else if(!f.connected)this.cue('장치가 모은 물을 코어로 보낼 수 있게 먼저 연결해 줘.');else this.action('test-core');});
    if(f.connected&&!f.tested){
     valve=this.add.circle(549,270-f.valve*.35,23,0xffdf91).setStrokeStyle(4,0x6b8e7f).setDepth(10).setInteractive({useHandCursor:true,hitArea:new P.Geom.Circle(23,23,40),hitAreaCallback:P.Geom.Circle.Contains});this.input.setDraggable(valve);
     valveText=this.text(549,297,`밸브 ${f.valve}%`,17);this.text(549,192,'위로 열기',16);
     valve.onMove=()=>{valve.x=549;valve.y=clamp(valve.y,235,270);f.valve=Math.round((270-valve.y)/.35/10)*10;valveText.setText(`밸브 ${f.valve}%`);};
     valve.onRelease=()=>{f.tested=false;f.lever=0;if(!context.preview)save();later(()=>ctx.render());};
    }
   }
   this.tick=t=>{
    this.dynamic.clear();const isValid=valid(),progress=1,bucket=s.parts.bucket,bx=bucket.x,by=bucket.y*scale+offset;
    if(breakLabel)breakLabel.setVisible(isValid);
    if(moveHandle&&!this.dragging){const selected=this.parts[s.selected]||this.parts.plate;moveHandle.setPosition(selected.x-47,selected.y-25);this.moveSelectionLabel.setPosition(moveHandle.x,moveHandle.y);}
    if(angleHandle){angleHandle.setVisible(true);angleLabel.setVisible(true);const ramp=this.parts.ramp,end=rampEndpoint({x:ramp.x,y:(ramp.y-offset)/scale},s.angle);this.dynamic.lineStyle(2,0x6b8e7f,.8).lineBetween(angleHandle.x,angleHandle.y,end.x,end.y);this.dynamic.fillStyle(0x6b8e7f,.9).fillCircle(end.x,end.y,4);}
    const selected=this.parts[s.selected];if(selected&&!final){this.dynamic.lineStyle(3,0xbf8828,.95).strokeRoundedRect(selected.x-42,selected.y-26,84,52,12);}
    // Connection entrances are visual model points, not auto-placement targets.
    for(const key of names){const obj=this.parts[key];this.dynamic.lineStyle(2,0x245f72,.95).strokeCircle(obj.x,obj.y,7);}
    if(isValid){const broken=result.steps.find(step=>!step.ok);if(broken)this.dynamic.lineStyle(5,0xc44d39,.95).strokeCircle(broken.point.x,broken.point.y*scale+offset,18);}
    // The cold surface and the downhill end remain visible while the design is edited.
    if(s.cold){const plate=this.parts.plate;this.dynamic.lineStyle(3,0x94e4ef,.8).lineBetween(plate.x-35,plate.y+19,plate.x+35,plate.y+19);}
    if(this.dragging||!isValid){if(final&&context.progress.connected){this.dynamic.lineStyle(6,0x839a94,.65).lineBetween(bx+30,by,596,245);}return;}
    for(const [index,l] of (result.links||[]).entries()){
     if(!l.incoming)continue;const start={x:l.from.x,y:l.from.y*scale+offset},end={x:l.to.x,y:l.to.y*scale+offset};
     if(l.outgoing>0){this.dynamic.lineStyle(Math.max(2,l.outgoing/22),0x58c5dc,.5).lineBetween(start.x,start.y,end.x,end.y);for(let i=0;i<4;i++){const k=reduced()?i/4:(t/1250+i/4-index*.08)%1;if(k<0)continue;this.dynamic.fillStyle(0x64daeb,.98).fillCircle(start.x+(end.x-start.x)*k,start.y+(end.y-start.y)*k,Math.max(2,l.outgoing/28));}}
     if(l.lost>0){const split=l.outgoing?{x:(start.x+end.x)/2,y:(start.y+end.y)/2}:start;this.dynamic.lineStyle(Math.max(2,l.lost/24),0xe9a55b,.35).lineBetween(split.x,split.y,split.x+30,304);for(let i=0;i<3;i++){const k=reduced()?(i+1)/4:(t/1500+i/3)%1;this.dynamic.fillStyle(0xe6a04b,.88).fillCircle(split.x+30*k,split.y+(304-split.y)*k,3.5);}}
    }
    if(result.retained>0){const ramp=s.parts.ramp;this.dynamic.fillStyle(0x6bd8ec,.8).fillRoundedRect(ramp.x+15,ramp.y*scale+offset-3,138,8,4);}
    if(result.collected>0){const height=result.collected*.27*progress;this.dynamic.fillStyle(0x55c6df,.8).fillRoundedRect(bx-24,by+21-height,48,height,4);this.dynamic.lineStyle(2,0xc2f9ff,.9).lineBetween(bx-24,by+21-height,bx+24,by+21-height);}
    if(final&&context.progress.connected){
     const f=context.progress;this.dynamic.lineStyle(9,f.tested?0x65bcb9:0x839a94,.75).lineBetween(bx+30,by,596,245);
     if(f.tested){const {x:ix,y:iy}=this.coreInlet,{x:gx,y:gy,r:gr}=this.coreGlow;this.dynamic.lineStyle(4,0xa3fcf1,.95).lineBetween(bx+30,by,ix,iy);for(let i=0;i<5;i++){const k=reduced()?(i+1)/6:(t/1400+i/5)%1;this.dynamic.fillStyle(0xe5fff5,.95).fillCircle(bx+30+(ix-bx-30)*k,by+(iy-by)*k,4);}this.dynamic.fillStyle(0x9ff7ff,.3*progress).fillCircle(gx,gy,gr+progress*10);this.dynamic.lineStyle(3,0x8af3db,.8).strokeCircle(gx,gy,gr+progress*6);core.setAlpha(.7+progress*.3);coreLabel.setText(progress<1?'코어로 흐르는 중…':'물 도착! 레버를 당겨');}
    }
   };
  }
 };
}

export function mountPhaser(route,ctx){
 const P=window.Phaser;if(!P)return;
 let hidden=[],anchor,mode=route;
 if(route==='home')return;// The title screen is plain DOM art; only the map gets the island canvas.
 if(route==='map'){
  mode='map';anchor=document.querySelector('.journey-world');hidden=[...anchor.querySelectorAll('.journey-paths')];
 }else{
  const selectors={1:a().observe.step===0?'.pour-workspace':a().observe.step===1?'.activity-ice-play':'.activity-cloth',2:'.inquiry-cardbank,.sort-observation,.sort-choices',3:'.activity-freeze-rig',4:'.activity-pipe-test',5:'.activity-drawing-pair',6:'.activity-heating-pair',7:'.activity-dew-pair',8:'.evidence-pictures,.bottle-observation',9:'#workbench',10:'#workbench'};
  if(route===5&&q().drawMode==='record'||route===9&&state.lab.workshop.compare)return;
  hidden=[...document.querySelectorAll(selectors[route]||'__none')];if(!hidden.length)return;
  anchor=hidden[0].parentElement;
 }
 if(!anchor)return;
 const host=document.createElement('div');host.className='phaser-stage '+(mode==='map'?'phaser-island':'');host.setAttribute('role','img');host.setAttribute('aria-label',mode==='map'?'방울이가 길을 따라 걷는 연구섬 지도':'그림 속 도구를 직접 움직이는 실험 무대');
 if(mode==='map')anchor.insertBefore(host,anchor.firstChild.nextSibling);else anchor.insertBefore(host,hidden[0]);
 const token=generation;
 const start=()=>{if(token!==generation||!host.isConnected)return;game=new P.Game({type:P.CANVAS,parent:host,width:mode==='map'?2000:2880,height:mode==='map'?1126:1320,transparent:true,resolution:1,scale:{mode:P.Scale.FIT,autoCenter:P.Scale.CENTER_BOTH},input:{activePointers:1},loader:{imageLoadType:'HTMLImageElement'},audio:{noAudio:true},banner:false,fps:{target:30,forceSetTimeOut:true},scene:makeScene(P,mode,ctx,host,hidden)});};
 // Canvas text is rasterised once, so wait briefly for the local display font.
 // Keep the existing DOM experiment usable if a font fails to arrive.
 const fontReady=document.fonts?.load('20px Jua').catch(()=>{});
 Promise.race([fontReady||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,1500))]).then(()=>requestAnimationFrame(start));
}
