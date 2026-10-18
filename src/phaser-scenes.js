import {state,save} from './state.js';
import {sortCards,dryTrace,heatingTrial} from './activity-model.js';
import {visibleDew,wipeDroplets,addRecord} from './inquiry-model.js';
import {stop as stopClock} from './inquiry.js';
import {finalContext} from './workshop.js';
import {testCollector} from './domain.js';
import {clampValue as clamp,pourInto,waterHeight,vesselGeometry,islandStops,islandTrails,islandRoute,pointOnRoute} from './scene-model.js';

let game=null,activeScene=null,generation=0;
const a=()=>state.activities,q=()=>state.inquiry;
const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const later=fn=>queueMicrotask(fn);
export function cleanupPhaser(){generation++;if(game){game.destroy(true);game=null;}activeScene=null;}
export function travelIsland(to,onArrive){if(!activeScene?.walk)return false;activeScene.walk(to,onArrive);return true;}
export function focusExperiment(){activeScene?.focusObjects?.();}

function makeScene(P,route,ctx,host,hidden){
 const W=route==='map'?1000:720,H=route==='map'?563:330;
 return class ResearchScene extends P.Scene {
  preload(){
   this.load.image('equipment','/assets/v2/equipment-atlas.webp');
   this.load.image('buddy','/assets/v2/buddy-poses.webp');
   this.load.image('workshop','/assets/v2/workshop-atlas.webp');
  }
  create(){
   if(!host.isConnected)return;
   activeScene=this;
   for(const [name,cols,rows] of [['equipment',3,3],['buddy',4,4],['workshop',3,2]]){
    const texture=this.textures.get(name),source=texture.getSourceImage();
    for(let i=0;i<cols*rows;i++)texture.add(String(i),0,i%cols*source.width/cols,Math.floor(i/cols)*source.height/rows,source.width/cols,source.height/rows);
   }
   hidden.forEach(el=>el.classList.add('phaser-replaced'));
   host.classList.add('ready');host.dataset.ready='true';
   const sizing=new ResizeObserver(()=>{if(host.isConnected)this.scale.setParentSize(host.clientWidth,host.clientHeight);});
   sizing.observe(host);this.events.once('shutdown',()=>sizing.disconnect());
   this.g=this.add.graphics();this.dynamic=this.add.graphics().setDepth(4);this.labels=[];this.dragging=null;
   this.input.on('dragstart',(pointer,obj)=>{this.dragging=obj;obj.setDepth(20);this.home={x:obj.x,y:obj.y};stopClock();});
   this.input.on('drag',(pointer,obj,x,y)=>{obj.x=clamp(x,35,W-35);obj.y=clamp(y,40,H-20);obj.onMove?.(pointer);});
   this.input.on('dragend',(pointer,obj)=>{this.dragging=null;obj.setDepth(2);obj.onRelease?.(pointer);});
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
  text(x,y,text,size=20,color='#244c57'){return this.add.text(x,y,text,{fontFamily:'system-ui, sans-serif',fontSize:size+'px',fontStyle:'bold',color,align:'center',stroke:'#fffdf3',strokeThickness:3}).setOrigin(.5).setDepth(6);}
  prop(x,y,index,size=110,type='equipment',drag=false){const obj=this.add.image(x,y,type,String(index)).setDisplaySize(size,size).setDepth(2);if(drag){obj.setInteractive({useHandCursor:true});this.input.setDraggable(obj);}return obj;}
  zone(x,y,w,h,handler){const z=this.add.zone(x,y,w,h).setInteractive({useHandCursor:true});z.on('pointerdown',handler);return z;}
  action(name){later(()=>ctx.action(name));}
  commit(){save();later(()=>ctx.render());}
  cue(text){ctx.say?.(text);}
  panel(x,y,w,h,color=0xfaf5e2){this.g.fillStyle(color,.85).fillRoundedRect(x,y,w,h,22);this.g.lineStyle(2,0xb3cabb,.8).strokeRoundedRect(x,y,w,h,22);}
  cup(g,x,base,width,height,amount,frozen=false){
   const h=waterHeight(amount,width);
   g.fillStyle(0xeffbff,.65).fillRoundedRect(x-width/2,base-height,width,height,10);
   g.fillStyle(frozen?0xa6dce8:0x4ebbd1,.8).fillRect(x-width/2+4,base-h,width-8,Math.max(0,h-4));
   g.lineStyle(4,0x729aa5).beginPath().moveTo(x-width/2,base-height).lineTo(x-width/2,base).lineTo(x+width/2,base).lineTo(x+width/2,base-height).strokePath();
   g.lineStyle(3,0xffffff,.8).lineBetween(x+width/2-12,base-height+14,x+width/2-12,base-14);
   if(frozen){g.lineStyle(2,0xffffff,.8);for(let i=0;i<4;i++)g.lineBetween(x-width/3+i*22,base-h+10,x-width/4+i*15,base-10);}
  }
  update(time,delta){if(!host.isConnected)return;this.tick?.(time,Math.min(delta,50));}
  focusObjects(){this.cameras.main.zoomTo(this.cameras.main.zoom>1?1:1.2,200);}
  mapScene(){
   const done=state.completed.length;
   islandTrails.forEach((points,i)=>{
    this.g.lineStyle(state.completed.includes(i+1)?8:5,state.completed.includes(i+1)?0x62e4d4:0xe8d6a7,.9);
    this.g.beginPath();points.forEach(([x,y],j)=>j?this.g.lineTo(x,y):this.g.moveTo(x,y));this.g.strokePath();
    if(state.completed.includes(i+1)&&!reduced())for(let j=0;j<3;j++){
     const dot=this.add.circle(...points[0],3,0xf9ffe9),cursor={t:j/3};
     this.tweens.add({targets:cursor,t:1,duration:2500,delay:j*650,repeat:-1,onUpdate:()=>{const [x,y]=pointOnRoute(points,cursor.t);dot.setPosition(x,y);}});
    }
   });
   this.stop=Math.max(0,Math.min(done-1,4));
   this.firstVisit=!state.pages.length&&!done;
   const [x,y]=this.firstVisit?[450,490]:islandStops[this.stop];this.traveler=this.prop(x,y-22,10,76,'buddy');
   this.traveler.setDepth(3);
   this.walk=(to,arrive)=>{
    if(this.moving)return;const points=this.firstVisit?[[450,490],[408,461],[350,450],[279,420],[230,400],islandStops[0],...islandRoute(0,to)]:islandRoute(this.stop,to);this.firstVisit=false;this.moving=true;
    if(!points.length||reduced()){this.stop=to;this.moving=false;arrive();return;}
    const cursor={t:0};this.tweens.add({targets:cursor,t:1,duration:Math.max(900,points.length*100),ease:'Linear',onUpdate:()=>{const [px,py]=pointOnRoute(points,cursor.t);this.traveler.setPosition(px,py-22+Math.sin(cursor.t*40)*3);},onComplete:()=>{this.stop=to;this.moving=false;arrive();}});
   };
   this.input.on('pointerdown',p=>{if(this.moving)return;const idx=islandStops.map(([x,y],i)=>({i,d:Math.hypot(x-p.x,y-p.y)})).sort((a,b)=>a.d-b.d)[0];if(idx.d<100)ctx.enterMission?.(idx.i+1);});
  }
  observeScene(){
   const o=a().observe;
   if(o.step===0){
    Object.entries(vesselGeometry).forEach(([key,v])=>{this.panel(v.x-v.width/2-25,45,v.width+50,250);this.text(v.x,276,key==='tall'?'길쭉한 그릇':'넓은 그릇',20);this.zone(v.x,160,v.width+45,230,()=>{q().pourTarget=key;this.cue('주전자를 이 그릇 위로 옮겨서 기다려 봐.');});});
    const jug=this.prop(100,150,1,145,'equipment',true);this.text(100,265,'잡고 옮겨 봐',18);
    const left=this.text(100,300,'남은 물 100',18);
    jug.onRelease=()=>{jug.setPosition(100,150);jug.angle=0;this.commit();};
    this.tick=(t,dt)=>{
     this.dynamic.clear();let flowing=false;
     if(this.dragging===jug){const key=Object.keys(vesselGeometry).find(k=>Math.abs(jug.x-vesselGeometry[k].x)<vesselGeometry[k].width/2+35&&jug.y<220);if(key&&q().pours[key]<100){flowing=true;pourInto(q(),o,key,dt*.045);jug.angle=25;this.dynamic.lineStyle(9,0x53bcd8,.8).lineBetween(jug.x+40,jug.y+20,vesselGeometry[key].x,245-waterHeight(q().pours[key],vesselGeometry[key].width));}else jug.angle=0;}
     for(const [key,v] of Object.entries(vesselGeometry)){this.cup(this.dynamic,v.x,245,v.width,185,q().pours[key]);if(q().pourTarget===key){this.dynamic.lineStyle(3,0x239b9b).strokeRoundedRect(v.x-v.width/2-20,48,v.width+40,211,16);}}
     left.setText('남은 물 '+Math.round(100-q().pours[q().pourTarget]));
     if(flowing&&q().pours[q().pourTarget]>=100){addRecord(q(),1,0,{kind:'pour',pours:q().pours},'같은 양을 담은 물');this.cue(o.pours.length===2?'같은 양을 담았어! 두 그릇의 모양과 높이를 봐.':'한 그릇에 다 담았어. 다른 그릇에도 같은 양을 부어 보자.');}
    };
   }else if(o.step===1){
    this.panel(90,50,210,240);this.panel(415,50,210,240);this.text(195,270,'처음 자리');this.text(520,270,'옮길 접시');
    this.g.fillStyle(0xcbdfe0).fillEllipse(520,214,160,48);
    const ice=this.prop(o.iceMoved?520:195,150,2,140,'equipment',!o.iceMoved);
    if(o.iceMoved)this.prop(195,150,2,140).setAlpha(.35);
    ice.onRelease=()=>{if(ice.x>400)this.action('act-drop-ice-dish');else ice.setPosition(195,150);};
   }else{
    this.prop(360,155,3,285);this.text(360,300,'천에 묻은 물을 관찰해 봐',20);
    this.zone(360,150,340,245,()=>{if(!o.clothWet)this.action('act-wet-cloth');});
    this.tick=()=>{this.dynamic.clear();if(o.clothWet)this.dynamic.fillStyle(0x3793b4,dryTrace('thin',o.time)*.6).fillEllipse(360,160,170,95);};
   }
  }
  sortScene(){
   const card=sortCards.find(c=>!a().sort.placed[c.id]);
   ['solid','liquid','gas'].forEach((key,i)=>{const x=130+i*230;this.panel(x-100,175,200,135);this.text(x,202,['고체','액체','기체'][i],24);this.text(x,275,sortCards.filter(c=>a().sort.placed[c.id]===key).map(c=>c.id==='vapor'?'천에서 공기로 간 물':c.id==='laundry'?'빨래에서 공기로 간 물':c.name).join('\n'),14);});
   if(!card){this.text(360,90,'관찰한 물의 모습을 모두 연결했어!',26);this.prop(360,100,14,90,'buddy');return;}
   const idx=['beaker','jug','ice','cloth','can','icepack','thermometer','magnifier','seedling'].indexOf(card.art);
   const obj=this.prop(360,74,idx,100,'equipment',true);this.text(360,139,card.name,23);
   if(['vapor','laundry'].includes(card.id))this.text(360,28,'천이 아니라, 마르면서 공기로 간 물이야',17);
   obj.onRelease=()=>{if(obj.y<175){obj.setPosition(360,74);return;}const key=['solid','liquid','gas'][clamp(Math.round((obj.x-130)/230),0,2)];q().sortProof=card.id;q().sortDraft[card.id]=key;this.action('ix-sort-check');};
  }
  freezeScene(){
   const s=a().freeze;
   this.panel(180,20,300,295);this.g.fillStyle(0x4d777b).fillRoundedRect(240,260,180,45,12);this.text(330,283,s.onScale?'100.0 g':'0.0 g',24,'#fffbea');
   const cup=this.prop(s.onScale?330:95,s.onScale?155:150,0,165,'equipment',!s.onScale);if(s.onScale)cup.setVisible(false);
   cup.onRelease=()=>{if(cup.x>210&&cup.x<460)this.action('act-drop-measure-cup-scale');else cup.setPosition(95,150);};
   const ice=this.prop(580,95,5,105,'equipment',true),warm=this.prop(580,245,6,105,'equipment',true);
   this.text(580,160,'차갑게',19);this.text(580,305,'따뜻하게',19);
   ice.onRelease=()=>{if(ice.x>210&&ice.x<460)this.action('act-drop-icepack-freeze-cup');else ice.setPosition(580,95);};
   warm.onRelease=()=>{if(warm.x>210&&warm.x<460)this.action('act-drop-warm-freeze-cup');else warm.setPosition(580,245);};
   this.zone(330,140,190,220,p=>{if(!s.onScale||s.predicted)return;s.prediction=Math.round(clamp((250-p.y)/1.6,50,80)*2)/2;this.commit();});
   this.tick=()=>{this.dynamic.clear();if(!s.onScale)return;this.cup(this.dynamic,330,250,135,220,(s.phase==='ice'?65.4:60)*1.35,s.phase==='ice');this.dynamic.lineStyle(3,0xb97835).lineBetween(255,250-s.prediction*1.6,405,250-s.prediction*1.6);if(q().freezeOverlay)this.dynamic.lineStyle(2,0x387c9f).lineBetween(252,154,408,154);};
  }
  pipeScene(){
   const s=a().pipe;this.text(205,28,'얼리기 전');this.text(515,28,'얼린 뒤');
   this.panel(110,52,190,245);this.panel(420,52,190,245);
   const handle=this.add.circle(295,280-s.fill*2.1,22,0xf6cb63).setStrokeStyle(4,0xffffff).setInteractive({useHandCursor:true});this.input.setDraggable(handle);
   handle.onMove=()=>{handle.x=295;handle.y=clamp(handle.y,70,196);s.fill=Math.round((280-handle.y)/2.1/5)*5;};handle.onRelease=()=>this.commit();
   const value=this.text(205,310,'',18);this.zone(515,80,170,70,()=>this.action('act-mark-space'));
   this.tick=()=>{this.dynamic.clear();this.dynamic.fillStyle(0x59c5dc,.8).fillRect(120,280-s.fill*2.1,170,s.fill*2.1);value.setText(`물 ${s.fill}% · 손잡이를 위아래로`);const t=s.trials.at(-1);if(t){this.dynamic.fillStyle(0xa3dce9).fillRect(430,280-Math.min(100,t.expanded)*2.1,170,Math.min(100,t.expanded)*2.1);if(t.space>0){this.dynamic.lineStyle(3,s.marked?0x289e7e:0xc28d27).strokeRect(432,59,166,Math.max(12,t.space*2.1));}else this.dynamic.lineStyle(4,0xd58045).lineBetween(440,60,590,280);}};
   this.text(515,310,'남는 공간을 짚어 봐',18);
  }
  drawingScene(){
   const d=a().draw;this.panel(20,45,330,245,0xe4d7b8);this.panel(370,45,330,245,0xe4d7b8);
   this.text(185,23,'A · 물을 조금');this.text(535,23,'B · 물을 많이');this.text(360,314,'A에 그리면 방울이가 B에 같은 그림을 그려 줘',18);
   let stroke=null;
   const point=p=>{if(stroke&&stroke.length<400)stroke.push([clamp((p.x-25)/320*500,0,500),clamp((p.y-50)/230*310,0,310)]);};
   this.input.on('pointerdown',p=>{if(p.x<20||p.x>350||p.y<45||p.y>290||d.strokes.length>=35)return;stopClock();if(d.records.length){q().drawArchive.push({strokes:structuredClone(d.strokes),records:structuredClone(d.records)});q().drawArchive=q().drawArchive.slice(-6);d.records=[];d.faster='';d.destination='';q().drawCompared=false;}d.time=0;stroke=[];d.strokes.push(stroke);point(p);});
   this.input.on('pointermove',p=>{if(p.isDown)point(p);});this.finishPointer=()=>{if(stroke){stroke=null;this.commit();}};
   this.tick=()=>{this.dynamic.clear();for(const [i,key] of ['thin','thick'].entries()){this.dynamic.lineStyle(12,0x278ba6,dryTrace(key,d.time));for(const line of d.strokes){if(line.length<2)continue;this.dynamic.beginPath();line.forEach(([x,y],j)=>{x=x/500*320+25+i*350;y=y/310*230+50;j?this.dynamic.lineTo(x,y):this.dynamic.moveTo(x,y);});this.dynamic.strokePath();}}};
  }
  heatScene(){
   const s=a().compare;this.text(220,23,'A · 가열하지 않음');this.text(490,23,'B · 가열 조절');
   this.panel(135,45,170,235);this.panel(405,45,170,235);
   const lens=this.prop(650,150,7,100,'equipment',true);this.text(643,245,'확대해서 보기',17);
   const inspect=()=>{const site=lens.x<350?'surface':lens.y>210?'level':'inside';q().lens=site;this.action('ix-lens-'+site);};lens.onRelease=()=>{if(lens.x<585)inspect();else lens.setPosition(650,150);};
   this.tick=t=>{const h=heatingTrial(s.heat,s.time);this.dynamic.clear();this.cup(this.dynamic,220,267,125,205,h.room);this.cup(this.dynamic,490,267,125,205,h.heated);if(h.boiling)for(let i=0;i<9;i++){const depth=Math.max(1,waterHeight(h.heated,125)-18),y=259-((t/30+i*19)%depth);this.dynamic.lineStyle(2,0xc3f9ff,.9).strokeCircle(460+i%4*19,y,4+i%3);}this.dynamic.fillStyle(s.heat?0xe8a257:0x94a5a1).fillRoundedRect(421,277,138,18,8);};
   this.text(220,314,'같은 양의 물',18);this.text(490,314,'물속과 물높이를 살펴봐',18);
  }
  dewScene(){
   const d=a().dew;this.text(205,20,'차가운 컵');this.text(510,20,'실온 컵');this.prop(205,160,4,265);this.prop(510,160,4,265);
   if(d.sealed){const tape=this.add.graphics().setDepth(5);tape.fillStyle(0xe3bc6a,.95).fillRoundedRect(145,58,120,18,5);tape.fillRoundedRect(450,58,120,18,5);}
   let ids=[],kind=null;
   const touch=p=>{if(!kind)return;const center=kind==='cold'?205:510;ids=wipeDroplets(ids,{x:(p.x-center)+120,y:p.y+5},30);};
   this.input.on('pointerdown',p=>{if(p.y<55||p.y>280)return;kind=Math.abs(p.x-205)<90?'cold':Math.abs(p.x-510)<90?'room':null;if(kind){stopClock();ids=[];touch(p);}});
   this.input.on('pointermove',p=>{if(p.isDown)touch(p);});
   this.finishPointer=()=>{if(kind){const k=kind,removed=ids;kind=null;ids=[];later(()=>ctx.wipe(k,removed));}};
   this.tick=()=>{this.dynamic.clear();for(const [k,cx] of [['cold',205],['room',510]]){
    let drops=k==='room'?(!d.wiped.includes('room')?visibleDew(50,q().dewRoomRemoved):[]):!d.wiped.includes('cold')?visibleDew(50,q().dewRemoved):!d.rewiped?visibleDew(d.time,q().dewRemoved):visibleDew(d.time,q().dewRemoved).concat(visibleDew(d.againTime).filter(p=>q().dewRegion.includes(p.id)));
    for(const p of drops){if(kind===k&&ids.includes(p.id))continue;this.dynamic.fillStyle(0x6ccde5,.95).fillEllipse(cx+p.x-120,p.y-5,9,13);this.dynamic.lineStyle(1,0x3a90b2).strokeEllipse(cx+p.x-120,p.y-5,9,13);}
   }};this.text(360,310,'손가락으로 물방울을 닦아 봐',20);
  }
  explainScene(){
   const s=a().explain;
   if(s.chain.length===3){
    this.text(205,22,'차가운 음료병');this.text(510,22,'실온 음료병');this.prop(205,160,4,265);this.prop(510,160,4,265);
    const rubbed={cold:0,room:0};let last=null,starting=false;
    this.input.on('pointermove',p=>{if(!p.isDown||p.y<50||p.y>280||s.bottleWiped||starting){last=null;return;}if(!q().transferPrediction){this.cue('어느 병에 물방울이 생길지 예상부터 해 보자.');return;}const key=Math.abs(p.x-205)<95?'cold':Math.abs(p.x-510)<95?'room':null;if(key&&last?.key===key)rubbed[key]+=Math.hypot(p.x-last.x,p.y-last.y);last={key,x:p.x,y:p.y};if(rubbed.cold>85&&rubbed.room>85){starting=true;this.action('ix-bottle-start');}else if(rubbed[key]>85)this.cue('이 병은 닦았어. 다른 병도 문질러 줘.');});
    this.tick=()=>{this.dynamic.clear();for(const p of visibleDew(s.bottleWiped?s.time:0))this.dynamic.fillStyle(0x66c9e3,.95).fillEllipse(205+p.x-120,p.y-5,9,13);};
    this.text(360,310,s.bottleWiped?'시간을 보내 두 병을 비교해 봐':'예상한 뒤 병의 겉면을 문질러 봐',20);return;
   }
   if(s.evidence.length>=2){
    const keys=['drops','air','cold'],labels={air:'공기 중 수증기',cold:'차가운 표면',drops:'물방울'};
    for(let i=0;i<3;i++){this.panel(30+i*235,205,190,105);this.text(125+i*235,260,s.chain[i]?labels[s.chain[i]]:['어디에서?','무엇을 만나?','어떤 모습으로?'][i],20);}
    keys.filter(k=>!s.chain.includes(k)).forEach((k,i)=>{const x=130+i*230;const obj=k==='cold'?this.prop(x,85,5,100,'equipment',true):this.add.container(x,85,[this.add.circle(0,0,42,k==='air'?0xeaf2e9:0xa3e1ee,.9).setStrokeStyle(3,0x8cb8ad),this.text(0,0,k==='air'?'공기':'물',25)]).setSize(105,105).setInteractive({useHandCursor:true});
     if(k!=='cold')this.input.setDraggable(obj);this.text(x,150,labels[k],19);obj.onRelease=()=>{const slot=clamp(Math.round((obj.x-125)/235),0,2);if(obj.y>200&&slot===s.chain.length)this.action('ix-chain-'+k);else{obj.setPosition(x,85);this.cue('왼쪽부터, 물이 어디에서 와서 어떻게 바뀌었는지 이어 봐.');}};});
    this.text(360,25,'설명 그림 · 수증기는 눈에 보이지 않아',16);return;
   }
   const proofs=[['sealed','입구를 막았어',4],['contrast','차가운 컵에 생겼어',5],['again','닦아도 다시 생겼어',3]];
   this.panel(180,195,360,110);this.text(360,248,'내 설명에 쓸 증거 놓는 곳',20);
   proofs.forEach(([key,label,index],i)=>{const x=130+i*230,obj=this.prop(x,85,index,100,'equipment',true);this.text(x,153,label,17);if(s.evidence.includes(key)){obj.setTint(0xa9e9cf);this.text(x,27,'✓ 연결한 증거',17,'#21785d');}obj.onRelease=()=>{if(obj.y>190&&!s.evidence.includes(key))this.action('ix-evidence-'+key);else obj.setPosition(x,85);};});
  }
  workshopScene(){
   const final=route===10,context=final?finalContext():null,s=final?context.progress.diagnosis.working:state.lab.workshop;
   const names=['plate','ramp','funnel','tube','bucket'];this.cameras.main.setViewport(0,0,720,330);const scale=.64,offset=10;
   const result=final?context.progress.diagnosis.tests.at(-1):s.trials.at(-1),valid=result?.signature===testCollector(s.parts,s.cold,s.angle).signature;
   this.parts={};names.forEach((key,i)=>{
    const p=s.parts[key],obj=this.prop(p.x,p.y*scale+offset,i,key==='plate'?120:key==='ramp'?150:85,'workshop',!final||key==='funnel');this.parts[key]=obj;
    this.text(p.x+(key==='ramp'?45:0),p.y*scale-34,['냉각판','경사판','깔때기','연결관','물통'][i],17);
    if(key==='ramp'){obj.setDisplaySize(180,53);obj.setOrigin(.12,.5).setAngle(Math.atan(s.angle*2/180)*180/Math.PI);}
    obj.onMove=()=>{obj.x=Math.round(clamp(obj.x,60,key==='ramp'?480:650)/10)*10;obj.y=final?p.y*scale+offset:Math.round(clamp((obj.y-offset)/scale,55,390)/10)*10*scale+offset;};
    obj.onRelease=()=>{p.x=obj.x;p.y=Math.round((obj.y-offset)/scale);s.selected=key;if(final){context.progress.diagnosis.resolved=false;context.progress.tested=false;context.progress.lever=0;if(!context.preview)save();later(()=>ctx.render());}else{s.compare=false;this.commit();}};
   });
   this.tick=t=>{this.dynamic.clear();if(!valid)return;for(const l of result.links||[]){if(!l.incoming)continue;const start={x:l.from.x,y:l.from.y*scale+offset},end={x:l.to.x,y:l.to.y*scale+offset};this.dynamic.lineStyle(4,0x58c5dc,.55).lineBetween(start.x,start.y,end.x,end.y);for(let i=0;i<4;i++){const k=reduced()?i/4:(t/1400+i/4)%1;this.dynamic.fillStyle(0x57c8e5,.95).fillCircle(start.x+(end.x-start.x)*k,start.y+(end.y-start.y)*k,4);}if(l.lost>0){const k=reduced()?.7:(t/1300)%1;this.dynamic.fillStyle(0xe6a04b,.8).fillCircle(start.x+35*k,start.y+(305-start.y)*k,5);}}};
  }
 };
}

export function mountPhaser(route,ctx){
 const P=window.Phaser;if(!P)return;
 let hidden=[],anchor,mode=route;
 if(route==='home'||route==='map'){
  mode='map';anchor=document.querySelector('.journey-world');hidden=[...anchor.querySelectorAll('.journey-paths,.journey-traveler')];
 }else{
  const selectors={1:a().observe.step===0?'.pour-workspace':a().observe.step===1?'.activity-ice-play':'.activity-cloth',2:'.inquiry-cardbank,.sort-observation,.sort-choices',3:'.activity-freeze-rig',4:'.activity-pipe-test',5:'.activity-drawing-pair',6:'.activity-heating-pair',7:'.activity-dew-pair',8:'.evidence-pictures',9:'#workbench',10:'#workbench'};
  if(route===5&&q().drawMode==='record'||route===9&&state.lab.workshop.compare)return;
  hidden=[...document.querySelectorAll(selectors[route]||'__none')];if(!hidden.length)return;
  anchor=hidden[0].parentElement;
 }
 if(!anchor)return;
 const host=document.createElement('div');host.className='phaser-stage '+(mode==='map'?'phaser-island':'');host.setAttribute('role','img');host.setAttribute('aria-label',mode==='map'?'방울이가 길을 따라 걷는 연구섬 지도':'그림 속 도구를 직접 움직이는 실험 무대');
 if(mode==='map')anchor.insertBefore(host,anchor.firstChild.nextSibling);else anchor.insertBefore(host,hidden[0]);
 const token=generation;
 const start=()=>{if(token!==generation||!host.isConnected)return;game=new P.Game({type:P.CANVAS,parent:host,width:mode==='map'?1000:720,height:mode==='map'?563:330,transparent:true,resolution:Math.min(devicePixelRatio,2),scale:{mode:P.Scale.FIT,autoCenter:P.Scale.CENTER_BOTH},input:{activePointers:1},audio:{noAudio:true},banner:false,fps:{target:30,forceSetTimeOut:true},scene:makeScene(P,mode,ctx,host,hidden)});};
 requestAnimationFrame(start);
}
