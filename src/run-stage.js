// 3D run stage for the transformation adventure (optional mode on the title screen).
// Three.js loads only when this screen opens. Every change of form and every gate is still
// decided by drop-adventure-model.js through runMove(); this file draws and reports.
import {expeditions,phaseName,restoreAdventure} from './drop-adventure-model.js';
import {RUN,runMove,runHint,buildCourse,createRunner,stepRunner,runZone,groundBelow,beginTransit,bounce,moleDepth,transitPoint} from './run-stage-model.js';
import {bindDirectionPad,mapKeyDirection} from './map-controls.js';
import {esc,btn,icon} from './ui.js';
import {playCue} from './sound.js';

const SCIENCE='얼음은 단단한 모양을 유지하고, 물은 모양을 바꾸며 흘러. 수증기는 눈에 보이지 않아 점선으로 위치만 표시했어. 얼굴·장치 사이 이동·버튼 횟수는 게임의 표현이며 실제 변화 시간이나 크기를 나타내지 않아. 달리기와 점프, 장치를 타고 건너는 길도 게임의 표현이야. 실제 뜨거운 물은 어른과 함께 다뤄.';
const ACT={heat:'열 주기',cool:'열 빼앗기'};
let stage=null,libs=null;
const loadThree=()=>libs??=import('/assets/vendor/three/three.module.min.js').catch(error=>{libs=null;throw error;});

export function cleanupRunStage(){const current=stage;stage=null;current?.dispose();}

export function runStageView(state,header,{phaseDescriptions}){
 const s=restoreAdventure(state.dropAdventure),mission=expeditions[s.chapter];
 const arrow=(dir,label,glyph)=>`<button type="button" class="run-dir run-dir-${dir}" data-run-dir="${dir}" aria-label="${label}">${glyph}</button>`;
 return `<div class="drop-adventure run-stage-shell">${header}<main class="run-stage" data-phase="${s.phase}">
  <div class="run-canvas" role="img" aria-label="방울이가 모습을 바꾸며 달리는 3D 물길"></div>
  <div class="run-labels" aria-hidden="true"></div>
  <header class="run-top"><div class="run-title"><small>자유 탐험 · 변신 모험 ${s.chapter+1} / ${expeditions.length}</small><h1>${esc(mission.title)}</h1></div>
   <div class="run-status"><span class="drop-phase-label phase-${s.phase}" data-run-phase>${phaseName[s.phase]} <span>${phaseDescriptions[s.phase]}</span></span><span class="drop-progress" data-run-progress>${s.gate} / ${mission.gates.length} 통과</span></div></header>
  <details class="run-more"><summary>더 보기</summary><div class="run-links">${btn('다시 도전','drop-retry','secondary')}${btn('기존 방식으로 하기','drop-mode-2d','secondary')}</div><div class="run-science"><b>게임과 실제 과학</b><p>${SCIENCE}</p></div></details>
  <p class="run-message" role="status" aria-live="polite" data-run-message>${esc(s.message)}</p>
  <div class="run-pad" role="group" aria-label="방울이 이동">${arrow('up','안쪽으로 이동','▲')}${arrow('left','왼쪽으로 이동','◀')}${arrow('right','오른쪽으로 달리기','▶')}${arrow('down','앞쪽으로 이동','▼')}</div>
  <div class="run-actions"><div class="run-energy"><span>열 빼앗기</span><meter min="-2" max="2" value="${s.heat}" aria-label="열 조절 단계" data-run-heat></meter><span>열 주기</span></div>
   <button type="button" class="run-act" data-run-act disabled aria-label="열판이나 냉각판 위에 서면 쓸 수 있어">열 조절</button>
   <button type="button" class="run-jump" data-run-jump aria-label="점프">점프</button></div>
  <section class="run-card" data-run-card aria-live="polite" aria-label="조작 방법"><p data-run-loading>3D 물길을 여는 중…</p></section>
  <section class="run-hint" data-run-hint hidden></section>
  <section class="run-done" data-run-done hidden></section>
 </main></div>`;
}

export function mountRunStage(state,ctx,options){
 cleanupRunStage();
 const root=document.querySelector('.run-stage');if(!root)return;
 const disposers=[],view={stop:false,dispose(){view.stop=true;for(const undo of disposers.splice(0).reverse())try{undo();}catch{/* keep releasing the rest */}}};
 stage=view;
 loadThree().then(THREE=>{if(!view.stop)start(THREE,root,state,ctx,options,view,disposers);}).catch(()=>{if(view.stop)return;cleanupRunStage();options.onFail();});
}

function start(THREE,root,state,ctx,{devices,phaseDescriptions,art,companion,onFail},view,disposers){
 let adventure=restoreAdventure(state.dropAdventure);
 const mission=expeditions[adventure.chapter],course=buildCourse(adventure.chapter),runner=createRunner(course,adventure);
 const host=root.querySelector('.run-canvas'),labelLayer=root.querySelector('.run-labels');
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 const canvas=renderer.domElement;host.append(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.5,260);
 scene.background=new THREE.Color(0x9fd3f7);scene.fog=new THREE.Fog(0x68c9e7,60,190);
 const sun=new THREE.DirectionalLight(0xfff3d6,1.5);sun.position.set(-5,11,9);
 scene.add(new THREE.HemisphereLight(0xffffff,0x9cc9c2,2.1),sun);
 disposers.push(()=>{
  scene.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[])){m.map?.dispose();m.dispose();}});
  renderer.dispose();renderer.forceContextLoss();canvas.remove();labelLayer.replaceChildren();
 });
 const loader=new THREE.TextureLoader();
 const picture=url=>{const t=loader.load(url);t.colorSpace=THREE.SRGBColorSpace;return t;};
 const painted=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};
 const tiled=t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
 const waterY=course.minY-2.4;

 // Path: plain boxes with a repeating stone top. Piers reach down into the water so nothing floats.
 const stoneTop=tiled(picture('/assets/run-stage/path-tile.webp')),stoneSide=tiled(picture('/assets/run-stage/pier-tile.webp'));
 const topMat=new THREE.MeshLambertMaterial({map:stoneTop}),sideMat=new THREE.MeshLambertMaterial({map:stoneSide}),stepMat=new THREE.MeshLambertMaterial({map:stoneTop,color:0xf3d7a8}),bridgeMat=new THREE.MeshLambertMaterial({map:stoneTop,color:0xc9965f});
 function block(x0,x1,y0,y1,z0,z1,top=topMat,side=sideMat){
  const w=x1-x0,h=y1-y0,d=z1-z0,geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv;
  // Face order: +x,-x,+y,-y,+z,-z. Repeat the tile every three units instead of stretching it.
  for(let i=0;i<24;i++){const face=i>>2,u=face<2?d:w,v=face===2||face===3?d:h;uv.setXY(i,uv.getX(i)*u/3,uv.getY(i)*v/3);}
  const mesh=new THREE.Mesh(geo,[side,side,top,side,side,side]);mesh.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);scene.add(mesh);return mesh;
 }
 for(const b of course.boxes){
  if(b.kind==='gate')continue;
  if(b.kind==='bridge')block(b.x0,b.x1,b.y0,b.y1,b.z0,b.z1,bridgeMat,bridgeMat);
  else if(b.kind==='step')block(b.x0,b.x1,b.y0,b.y1,b.z0,b.z1,stepMat,sideMat);
  else block(b.x0,b.x1,waterY-.6,b.y1,b.z0,b.z1);
 }
 const ripples=tiled(painted(128,128,(g,w,h)=>{g.fillStyle='#31c8d6';g.fillRect(0,0,w,h);g.strokeStyle='#c9fbff';g.lineWidth=3;g.lineCap='round';for(let i=0;i<7;i++){const x=(i*47)%w,y=(i*29+12)%h;g.globalAlpha=.55;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+14,y-6,x+28,y);g.stroke();}}));
 ripples.repeat.set(70,32);
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(course.length+300,220),new THREE.MeshLambertMaterial({map:ripples}));
 sea.rotation.x=-Math.PI/2;sea.position.set(course.length/2,waterY,-12);scene.add(sea);
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(114,38),new THREE.MeshBasicMaterial({map:picture('/assets/run-stage/backdrop.webp'),fog:false}));
 // The painting's horizon (74% down) sits on the far edge of the 3D sea.
 backdrop.position.set(0,waterY+8.8,-78);scene.add(backdrop);

 // Labels are HTML placed over the 3D points, so Korean text and names stay crisp.
 const labels=[],point=new THREE.Vector3(),vaporAt={x:-999,y:-999,w:0,h:0};
 function label(html,x,y,z,cls=''){const el=document.createElement('div');el.className='run-label '+cls;el.innerHTML=html;labelLayer.append(el);const item={el,pos:new THREE.Vector3(x,y,z)};labels.push(item);return item;}
 function standing(url,w,h,x,y,z){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:picture(url),transparent:true,alphaTest:.08}));mesh.position.set(x,y,z);scene.add(mesh);return mesh;}

 // Plates and valve: drawn in code so the warm and cold colours stay consistent.
 const plateMats={heat:new THREE.MeshLambertMaterial({map:picture('/assets/run-stage/heat-plate.webp'),transparent:true,alphaTest:.4,emissive:0xff7a1a,emissiveIntensity:.1}),cool:new THREE.MeshLambertMaterial({map:picture('/assets/run-stage/cool-plate.webp'),transparent:true,alphaTest:.4,emissive:0x38b6ff,emissiveIntensity:.1})};
 const plateGeo=new THREE.PlaneGeometry(RUN.padHalf*2,RUN.padHalf*2).rotateX(-Math.PI/2),parts=[];
 const brass=new THREE.MeshLambertMaterial({color:0xc6a35a}),red=new THREE.MeshLambertMaterial({color:0xd8503c}),glass=new THREE.MeshLambertMaterial({color:0xdaf3f7,transparent:true,opacity:.45,depthWrite:false}),pipeWater=new THREE.MeshLambertMaterial({color:0x2f9ed6});
 for(const seg of course.segments){
  const gate=seg.gate,device=devices[gate.scene],mid=seg.gateX+RUN.deviceSpan/2,part={seg};parts.push(part);
  for(const kind of ['heat','cool']){
   const p=seg.pads[kind],mesh=new THREE.Mesh(plateGeo,plateMats[kind].clone());mesh.material.map=plateMats[kind].map;
   mesh.position.set(p.x,seg.level+.03,p.z);scene.add(mesh);part[kind]=mesh;
   part[kind+'Label']=label(kind==='heat'?'열판':'냉각판',p.x,seg.level+.25,p.z+(kind==='heat'?-1.25:1.2),'run-label-'+kind);
  }
  if(seg.valve){
   const v=seg.valve,post=new THREE.Mesh(new THREE.CylinderGeometry(.11,.15,1.1,10),brass);post.position.set(v.x,seg.level+.55,v.z);
   const wheel=new THREE.Mesh(new THREE.TorusGeometry(.36,.08,8,18),red);wheel.position.set(v.x,seg.level+1.15,v.z+.05);
   // A full pipe beside the valve: its water level is the model's `space`, drawn in code.
   const tube=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,1.5,16),glass);tube.position.set(v.x+.95,seg.level+.75,v.z);
   const water=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,1,16),pipeWater);water.position.set(v.x+.95,seg.level+.5,v.z);
   scene.add(post,wheel,water,tube);part.wheel=wheel;part.pipeWater=water;
   part.valveLabel=label('',v.x+.4,seg.level+1.75,v.z,'run-label-valve');
  }
  // The device stands in the break of the path. Reaching it asks the model; the ride across is the game's picture of passing.
  // A closed gate is a brass railing at the end of the path; it opens when the model lets the runner through.
  const fence=new THREE.Group(),postGeo=new THREE.CylinderGeometry(.09,.11,.95,10),railGeo=new THREE.BoxGeometry(.09,.09,RUN.halfZ*2-.3);
  for(const z of [-RUN.halfZ+.15,0,RUN.halfZ-.15]){const post=new THREE.Mesh(postGeo,brass);post.position.set(0,.475,z);fence.add(post);}
  for(const y of [.45,.85]){const rail=new THREE.Mesh(railGeo,brass);rail.position.set(0,y,0);fence.add(rail);}
  fence.position.set(seg.gateX-.08,seg.level,0);scene.add(fence);part.fence=fence;
  // Each device stands on its own pier in the break of the path. The numbers come from where the feet are in each picture.
  const span=RUN.deviceSpan,low=Math.min(seg.level,seg.exit.y),url=art+device.image+'.webp';
  let pier=low-.45;
  if(gate.scene==='channel'){
   // Water line of the trough meets the path; the front wall is drawn again in front so the water form lies inside.
   const w=span+1,h=w/3,y=seg.level-.27;pier=seg.level-1.07;
   standing(url,w,h,mid,y,-.35);
   const stream=new THREE.Mesh(new THREE.PlaneGeometry(w*.93,h*.1),new THREE.MeshBasicMaterial({color:0x6fdcec,transparent:true,opacity:.6}));stream.position.set(mid,y+h*.07,-.3);scene.add(stream);
   const front=new THREE.Mesh(new THREE.PlaneGeometry(w,h*.5),new THREE.MeshBasicMaterial({map:picture(url),transparent:true,alphaTest:.08}));
   front.material.map.repeat.set(1,.5);front.position.set(mid,y-h*.25,.3);scene.add(front);
  }
  if(gate.scene==='cooling'){pier=seg.level-.92;standing(url,4.6,4.6,mid,seg.level+.34,-.35);}
  if(gate.scene==='air'){
   standing(url,2.7,1.8,seg.gateX+1.75,seg.level+.35,-.35);
   const dot=new THREE.SphereGeometry(.09,8,6),dotMat=new THREE.MeshBasicMaterial({color:0x5c8f97});
   for(let i=2;i<12;i++){const p=transitPoint(seg,{x:seg.gateX-RUN.halfW,y:seg.level,z:0},i/12),m=new THREE.Mesh(dot,dotMat);m.position.set(p.x,p.y+.7,-.2);scene.add(m);}
  }
  if(gate.scene==='condenser'){pier=low-.25;standing(url,4.4,4.02,mid+.15,low+1.41,-.35);}
  block(seg.gateX+.5,seg.gateX+span-.5,waterY-.6,pier,-1.3,1.3,sideMat,sideMat);
  part.gateLabel=label('',mid,Math.max(seg.level,seg.exit.y)+(gate.scene==='cooling'?3.1:gate.scene==='condenser'?3.9:2.5),0,'run-label-gate');part.gateLabel.gate=true;
 }
 // Decoration: small standing pictures. They sit behind the walking lanes or out on the sea, never in the runner's way.
 const decorMaps={},decorSize={bush:[1.2,1],reeds:[1.55,1.78],lantern:[.62,1.5],fountain:[2.5,2.4],planter:[.75,1.1],islet:[5.6,5.8],boat:[2.5,2.65],buoy:[1.25,1.7],lilies:[2.6,1.7]},floating=[];
 function decor(name,x,y,z,{scale=1,flat=false,bob=0,drift=0}={}){
  const map=decorMaps[name]??=picture(`/assets/run-stage/decor-${name}.webp`),[w,h]=decorSize[name];
  const geo=new THREE.PlaneGeometry(w*scale,h*scale);if(flat)geo.rotateX(-Math.PI/2);else geo.translate(0,h*scale/2,0);
  const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.35}));mesh.position.set(x,y,z);scene.add(mesh);
  if(bob||drift)floating.push({mesh,x,y,bob,drift,phase:x*.7});
  return mesh;
 }
 const lamps=[];
 for(const seg of course.segments){lamps.push({x:seg.checkpoint.x-.95,mesh:decor('lantern',seg.checkpoint.x-.95,seg.level,-2.72)});}
 lamps.push({x:course.finish.x-.95,mesh:decor('lantern',course.finish.x-.95,course.finish.y,-2.72)});
 const busy=x=>lamps.some(l=>Math.abs(x-l.x)<1.1)||course.segments.some(g=>Math.abs(x-g.pads.heat.x)<2.1||g.valve&&Math.abs(x-g.valve.x)<2.3||x>g.gateX-2.2&&x<g.gateX+.2)||course.boxes.some(b=>(b.kind==='step')&&x>b.x0-.7&&x<b.x1+.7)||course.moles.some(m=>Math.abs(x-m.x)<1.2);
 let planted=0;
 for(const b of course.boxes){
  if(b.kind!=='floor')continue;
  for(let x=b.x0+1.1;x<b.x1-.9;x+=2.9){if(busy(x)||Math.abs(x-(course.finish.x+4.6))<2.2)continue;decor(planted++%3===1?'planter':'bush',x,b.y1,-2.68,{scale:planted%2?.95:1.1});}
  if(b.x1-b.x0>4)decor('reeds',b.x0+(b.x1-b.x0)*.35,waterY-.12,-3.55,{bob:.03});
 }
 decor('fountain',course.finish.x+4.6,course.finish.y,-1.5);
 for(let x=-14,i=0;x<course.length+30;x+=17,i++){
  // Nothing floats right behind a device, where it would look as if it sat on it.
  const clear=at=>!course.segments.some(g=>at>g.gateX-2.5&&at<g.gateX+RUN.deviceSpan+2.5);
  if(clear(x+5))decor('lilies',x+5,waterY+.04,-9-(i%3)*2.5,{flat:true,bob:.02});
  if(i%2===0&&clear(x+9))decor('buoy',x+9,waterY-.18,-18,{bob:.14});
  if(i%3===1)decor('boat',x,waterY-.2,-24,{bob:.1,drift:1.6});
  if(i%2===1)decor('islet',x+3,waterY-.5,-30-(i%4)*5,{scale:1.25});
 }
 label('물길 도착',course.finish.x+4.6,course.finish.y+2.75,-1.5,'run-label-goal');

 // Runner: an upright picture for ice and water. Vapour is invisible, so only a dashed position ring is shown.
 const ringTexture=painted(256,256,(g,w,h)=>{g.setLineDash([22,16]);g.lineWidth=9;g.strokeStyle='#2f5f6b';g.fillStyle='rgba(249,255,255,.28)';g.beginPath();g.ellipse(w/2,h/2,112,98,0,0,Math.PI*2);g.fill();g.stroke();});
 // Six frames per form, bottoms on one line: the run cycle on the ground, one held frame in the air.
 const sheets={ice:{map:picture('/assets/run-stage/ice-run.webp'),frames:6,air:3,rest:5},water:{map:picture('/assets/run-stage/water-run.webp'),frames:6,air:2,rest:5}};
 const forms={ice:new THREE.SpriteMaterial({map:sheets.ice.map,transparent:true,alphaTest:.05}),water:new THREE.SpriteMaterial({map:sheets.water.map,transparent:true,alphaTest:.05}),vapor:new THREE.SpriteMaterial({map:ringTexture,transparent:true,depthWrite:false})};
 disposers.push(()=>{for(const form of Object.values(forms)){form.map?.dispose();form.dispose();}});
 const body=new THREE.Sprite(forms[adventure.phase]);body.center.set(.5,.03);body.renderOrder=3;scene.add(body);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:painted(128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,8,w/2,h/2,62);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),transparent:true,depthWrite:false}));
 glow.renderOrder=2;glow.visible=false;scene.add(glow);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.55,20),new THREE.MeshBasicMaterial({map:painted(64,64,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,2,w/2,h/2,30);r.addColorStop(0,'rgba(20,60,70,.5)');r.addColorStop(1,'rgba(20,60,70,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),transparent:true,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.renderOrder=1;scene.add(shadow);
 const splash=new THREE.Mesh(new THREE.RingGeometry(.35,.55,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false}));
 splash.rotation.x=-Math.PI/2;splash.visible=false;scene.add(splash);let splashT=0,wasY=runner.y;
 const vaporLabel=label('방울이는 지금<br>수증기 상태야',0,0,0,'run-label-vapor');
 const moleSheet='/assets/v2/map-villain-mole.webp',moles=course.moles.map(mole=>{const map=picture(moleSheet);map.repeat.set(.25,.5);map.offset.set(0,.5);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.05}));sprite.scale.set(1.7,1.7,1);sprite.center.set(.5,.08);scene.add(sprite);return {mole,sprite,map};});

 // HUD
 const hud={phase:root.querySelector('[data-run-phase]'),progress:root.querySelector('[data-run-progress]'),message:root.querySelector('[data-run-message]'),heat:root.querySelector('[data-run-heat]'),act:root.querySelector('[data-run-act]'),jump:root.querySelector('[data-run-jump]'),card:root.querySelector('[data-run-card]'),hint:root.querySelector('[data-run-hint]'),done:root.querySelector('[data-run-done]'),pad:root.querySelector('.run-pad')};
 let shownZone,shownMessage;
 function sync(){
  root.dataset.phase=adventure.phase;
  hud.phase.className='drop-phase-label phase-'+adventure.phase;hud.phase.innerHTML=`${phaseName[adventure.phase]} <span>${phaseDescriptions[adventure.phase]}</span>`;
  hud.progress.textContent=`${adventure.gate} / ${mission.gates.length} 통과`;hud.heat.value=adventure.heat;
  if(shownMessage!==adventure.message)hud.message.textContent=shownMessage=adventure.message;
  body.material=forms[adventure.phase];
  for(const part of parts){
   const i=part.seg.index,gate=part.seg.gate,passed=i<adventure.gate,current=i===adventure.gate&&!adventure.done;
   part.fence.visible=!passed;
   part.gateLabel.el.innerHTML=`<small>${passed?'✓ 통과':current?'지금 가야 할 곳':`${i+1}번째 길`}</small><b>${esc(gate.name)}</b><span>${esc(devices[gate.scene].description)}</span>`;
   part.gateLabel.el.classList.toggle('is-passed',passed);part.gateLabel.el.classList.toggle('is-current',current);
   if(part.valveLabel){part.valveLabel.el.innerHTML=adventure.space?'밸브 · 얼 자리를 남겼어':'밸브 · 배관에 물이 꽉 찼어';part.pipeWater.scale.y=adventure.space?.72:1;part.pipeWater.position.y=part.seg.level+(adventure.space?.36:.5);}
  }
 }
 function commit(next){adventure=next;state.dropAdventure=next;ctx.save();sync();}
 function syncAction(zone){
  const key=zone?zone.kind+(zone.kind==='valve'?adventure.space:''):'';
  if(key===shownZone)return;shownZone=key;
  hud.act.disabled=!zone;hud.act.dataset.kind=zone?.kind||'';
  hud.act.textContent=!zone?'열 조절':zone.kind==='valve'?(adventure.space?'✓ 여유 공간 남겼어':'물을 덜어 공간 남기기'):ACT[zone.kind];
  hud.act.setAttribute('aria-label',zone?hud.act.textContent:'열판이나 냉각판 위에 서면 쓸 수 있어');
 }

 // Pausing: start card, companion hint, arrival panel, any open dialog, or a hidden tab.
 let waiting=true,hinting=false,finished=adventure.done,stops=0,falls=0,flash=0,flashWarm=true,pop=0,flinch=0;
 const paused=()=>waiting||hinting||finished||document.hidden||!!document.querySelector('dialog[open]');
 // fresh: Bangul has just arrived (celebrate once). Reopening a finished run shows the same panel without the burst or sound.
 function showDone(fresh=false){
  finished=true;hud.done.hidden=false;
  const total=expeditions.length,count=adventure.chapter+1,last=count===total,log=`<ul>${adventure.log.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  const steps=`<ol class="run-done-steps" aria-label="변신 모험 ${count} / ${total} 완료">${expeditions.map((m,i)=>`<li class="${i<count?'is-done':''}" style="--i:${i}"><b>${i<count?icon('check',18):i+1}</b><span>${esc(m.title)}</span></li>`).join('')}</ol>`;
  hud.done.classList.toggle('is-finale',last);root.classList.toggle('is-finale',last);
  if(!last){
   hud.done.innerHTML=`<p class="run-done-count">변신 모험 ${count} / ${total} 완료</p><h2>내가 만든 물의 변화</h2>${log}<div class="run-done-actions">${btn('다음 모험으로','drop-next','primary')}${btn('연구섬 지도','map','secondary')}</div>`;
  }else{
   const mapDone=(state.completed?.length||0)>=5;
   const still=!fresh||state.settings.reduced?' is-still':'';
   hud.done.innerHTML=`<div class="run-finale${still}">
    <div class="run-finale-burst" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--a:${i*20}deg;--d:${120+(i%3)*46}px;--t:${(i%4)*.06}s"></i>`).join('')}</div>
    <img class="run-finale-bangul" src="/assets/v2/bangul-title.webp" width="774" height="1015" alt="손을 흔드는 방울이">
    <div class="run-finale-copy">
     <p class="run-done-count">변신 모험 ${total} / ${total} 모두 완료</p>
     <h2>모든 물길을 통과했어!</h2>
     ${steps}
     <h3>마지막 모험에서 만든 물의 변화</h3>${log}
     <p class="run-finale-next">${mapDone?'이제 연구섬 지도에서 네가 되살린 물길과 섬 주민들을 다시 만나 봐.':'이제 연구섬 지도로 가서 섬마다 실험하고, 멈춘 물길을 되살려 봐!'}</p>
     <div class="run-done-actions">${btn(`연구섬 지도 탐험하러 가기 ${icon('arrow',20)}`,'map','primary')}${btn('처음 길 다시 탐험','drop-next','secondary')}</div>
    </div></div>`;
   if(fresh)void playCue('victory');
  }
  hud.done.querySelector('.run-done-actions .btn.primary')?.focus({preventScroll:true});
 }
 function closeHint(){hinting=false;hud.hint.hidden=true;hud.hint.replaceChildren();}
 function showHint(text){
  hinting=true;hud.hint.hidden=false;void playCue('hint');
  hud.hint.innerHTML=`<img src="${companion.image}" alt="${esc(companion.role)} ${esc(companion.name)}" draggable="false"><div><small>${esc(companion.role)} ${esc(companion.name)}의 귀띔</small><p>${esc(text)}</p><div class="run-hint-actions"><button type="button" class="btn primary" data-run-continue>계속 달릴래</button>${btn('기존 방식으로 하기','drop-mode-2d','secondary')}</div></div>`;
  hud.hint.querySelector('[data-run-continue]').focus({preventScroll:true});
 }
 function ready(){
  hud.card.innerHTML=`<ul><li>방향 버튼이나 방향키·WASD로 달리고, 점프 버튼이나 스페이스로 턱과 틈을 넘어.</li><li>주황색 열판이나 파란 냉각판 위에 서서 버튼을 두 번 누르면 방울이의 모습이 바뀌어.</li><li>모습이 맞으면 장치를 타고 다음 길로 건너가. 떨어져도 바로 앞에서 다시 시작해.</li></ul><button type="button" class="btn primary" data-run-go>출발!</button>`;
  hud.card.querySelector('[data-run-go]').focus({preventScroll:true});
 }
 function go(){waiting=false;hud.card.hidden=true;}

 // Input: buttons first, keyboard alongside. Everything is released when the window loses focus.
 const input=new AbortController(),on={signal:input.signal},keys=new Map();let padDir=null,tapUntil=0,jumpQueued=false;
 disposers.push(()=>input.abort());
 const typing=target=>!!target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
 const control=target=>!!target?.closest?.('button,a,summary,[role="button"]');
 function act(){
  if(paused())return;
  const zone=runZone(course,runner);if(!zone)return;
  const move=runMove(adventure,zone.kind);commit(move.state);shownZone=undefined;
  if(move.phaseChanged){pop=.5;flash=.6;flashWarm=zone.kind==='heat';void playCue('drop');}
  else{pop=.25;void playCue(zone.kind==='valve'?'latch':'click');}
 }
 const pad=bindDirectionPad(hud.pad,'[data-run-dir]',b=>b.dataset.runDir,{press:d=>{padDir=d;},release:d=>{if(padDir===d)padDir=null;},cancel:d=>{if(padDir===d)padDir=null;},tap:d=>{padDir=d;tapUntil=performance.now()+260;},blocked:paused,signal:input.signal});
 disposers.push(()=>pad.destroy());
 hud.jump.addEventListener('pointerdown',e=>{e.preventDefault();if(!paused())jumpQueued=true;},on);
 hud.jump.addEventListener('click',e=>{if(e.detail===0&&!paused())jumpQueued=true;},on);
 hud.act.addEventListener('pointerdown',e=>e.preventDefault(),on);
 hud.act.addEventListener('click',act,on);
 root.addEventListener('click',e=>{
  if(e.target.closest('[data-run-go]'))go();
  if(e.target.closest('[data-run-continue]'))closeHint();
 },on);
 document.addEventListener('keydown',e=>{
  if(e.isComposing||e.ctrlKey||e.altKey||e.metaKey||typing(e.target)||document.querySelector('dialog[open]'))return;
  const enter=e.key==='Enter',space=e.code==='Space';
  if(waiting||hinting){if((enter||space)&&!control(e.target)){e.preventDefault();if(waiting){if(hud.card.querySelector('[data-run-go]'))go();}else closeHint();}return;}
  if(finished)return;
  const dir=mapKeyDirection(e);
  if(dir){e.preventDefault();keys.set(e.code||e.key,dir);return;}
  if(space){e.preventDefault();if(root.contains(document.activeElement))document.activeElement.blur();if(!e.repeat)jumpQueued=true;return;}
  if(e.code==='KeyE'||enter&&!control(e.target)){e.preventDefault();if(!e.repeat)act();}
 },on);
 document.addEventListener('keyup',e=>{keys.delete(e.code||e.key);if(e.code==='Space'&&!finished&&!waiting&&!hinting&&!typing(e.target))e.preventDefault();},on);
 const release=()=>{keys.clear();padDir=null;jumpQueued=false;};
 window.addEventListener('blur',release,on);document.addEventListener('visibilitychange',release,on);
 function held(){
  if(padDir&&tapUntil&&performance.now()>tapUntil){padDir=null;tapUntil=0;}
  const dirs=new Set(keys.values());if(padDir)dirs.add(padDir);
  return {x:(dirs.has('right')?1:0)-(dirs.has('left')?1:0),z:(dirs.has('down')?1:0)-(dirs.has('up')?1:0),jump:jumpQueued};
 }

 function handle(event){
  if(event.type==='jump')void playCue('click');
  if(event.type==='flinch'){flinch=.5;void playCue('hit');}
  if(event.type==='fell'){
   void playCue('drop');falls++;
   if(falls>=3){falls=0;showHint('틈과 턱 바로 앞에서 점프 버튼을 눌러 봐. 좁은 다리는 ▲▼ 버튼으로 줄을 맞춘 다음 건너면 돼.');}
  }
  if(event.type==='gate'){
   const move=runMove(adventure,'gate');commit(move.state);
   if(move.passed){stops=falls=0;beginTransit(runner,course.segments[event.segment]);void playCue('success');}
   else{bounce(runner);void playCue('error');if(++stops>=3){stops=0;showHint(runHint(adventure));}}
  }
  if(event.type==='arrived'){falls=0;if(adventure.done)showDone(true);}
 }

 let width=0,height=0,topSafe=130,frame=0,last=performance.now(),camX=runner.x+1.2,camY=runner.y,step=0;
 function resize(){
  width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  topSafe=Math.max(hud.message.getBoundingClientRect().bottom,root.querySelector('.run-top').getBoundingClientRect().bottom)-root.getBoundingClientRect().top+10;
 }
 const observer=new ResizeObserver(resize);observer.observe(host);disposers.push(()=>observer.disconnect());resize();
 function draw(dt,time){
  const follow=runner.grounded||runner.transit?runner.y:camY;
  camX+=(runner.x+1.2-camX)*Math.min(1,dt*6);camY+=(follow-camY)*Math.min(1,dt*3.5);
  // Narrow screens step the camera back so a whole station stays in view.
  const back=18*Math.max(1,1.5/camera.aspect);
  camera.position.set(camX,camY+back*.36,back);camera.lookAt(camX,camY+2,0);
  backdrop.position.x=camX;backdrop.scale.setScalar(Math.max(1,camera.aspect/1.7));sea.position.x=camX;ripples.offset.x=time*.02;
  const moving=Math.hypot(runner.vx,runner.vz)>.6&&runner.grounded&&!runner.transit;
  if(moving)step+=dt*11;
  const vapor=adventure.phase==='vapor';
  pop=Math.max(0,pop-dt);flash=Math.max(0,flash-dt);flinch=Math.max(0,flinch-dt);
  const riding=runner.transit?course.segments[runner.transit.segment].gate.scene:'',flat=riding==='channel'?Math.min(1,runner.transit.t*5,(runner.transit.dur-runner.transit.t)*5):0;
  const stretch=(runner.transit?1:runner.grounded?1:1+Math.max(-.12,Math.min(.16,runner.vy*.012)))*(1-flat*.42),size=(vapor?1.75:1.5)*(1+Math.sin(pop*Math.PI*4)*.12*(pop>0?1:0));
  // The pictures share one baseline, so the little lift of each stride is added here, the same for every form.
  const stride=moving?(step%6)/6:0,hop=moving?Math.max(0,Math.sin(stride*Math.PI*2-.9)):0;
  body.position.set(runner.x,runner.y+(vapor?.25:0)+hop*.2,runner.z);body.scale.set(size/stretch,size*stretch*(vapor?.86:1),1);
  if(!vapor){
   const {map,frames,air,rest}=sheets[adventure.phase],index=flat?0:runner.transit||!runner.grounded?air:moving?Math.floor(step)%frames:rest,left=runner.facing<0;
   map.repeat.x=(left?-1:1)/frames;map.offset.x=(index+(left?1:0))/frames;
  }
  body.material.opacity=flinch>0&&Math.floor(time*16)%2?.45:1;
  // Falling into the sea leaves a ring on the surface before the runner is put back.
  if(wasY>waterY&&runner.y<=waterY&&!runner.transit){splash.position.set(runner.x,waterY+.03,runner.z);splashT=.6;}
  wasY=runner.y;splashT=Math.max(0,splashT-dt);splash.visible=splashT>0;
  if(splash.visible){splash.scale.setScalar(1+(.6-splashT)*5);splash.material.opacity=splashT/.6;}
  body.visible=runner.y>waterY-.4||!!runner.transit;
  const ground=groundBelow(course,runner.x,runner.z,runner.y);
  shadow.visible=ground>-Infinity&&!runner.transit;
  if(shadow.visible){const lift=Math.min(1,(runner.y-ground)/3);shadow.position.set(runner.x,ground+.02,runner.z);shadow.scale.setScalar(1-lift*.45);shadow.material.opacity=1-lift*.5;}
  glow.visible=flash>0||adventure.heat!==0;
  if(glow.visible){const warm=flash>0?flashWarm:adventure.heat>0;glow.material.color.set(warm?0xffa94a:0x74d2ff);glow.position.set(runner.x,runner.y+.65,runner.z-.05);glow.scale.setScalar(flash>0?2.2+(.6-flash)*3:2+Math.sin(time*6)*.15);glow.material.opacity=flash>0?flash/.6:.75;}
  vaporLabel.el.hidden=!vapor;vaporLabel.pos.set(runner.x,runner.y+1.95,runner.z);
  const zone=paused()?null:runZone(course,runner);syncAction(zone);
  for(const part of parts){
   for(const kind of ['heat','cool']){const on=zone?.kind===kind&&zone.segment===part.seg.index;part[kind].material.emissiveIntensity=on?.5+Math.sin(time*7)*.2:.1;part[kind+'Label'].el.classList.toggle('is-under',on);}
   if(part.wheel)part.wheel.rotation.z=adventure.space?1.2:0;
  }
  for(const f of floating){f.mesh.position.y=f.y+Math.sin(time*1.3+f.phase)*f.bob;if(f.drift)f.mesh.position.x=f.x+Math.sin(time*.12+f.phase)*f.drift;}
  for(const {mole,sprite,map} of moles){const z=moleDepth(mole,runner.time),toward=Math.cos(runner.time*mole.speed/mole.range+mole.phase)>0;sprite.position.set(mole.x,mole.y,z);map.offset.x=(Math.floor(runner.time*5)%2)*.25;map.repeat.x=toward?.25:-.25;if(!toward)map.offset.x+=.25;}
  renderer.render(scene,camera);
  for(const item of labels){
   if(item===vaporLabel&&!vapor)continue;
   point.copy(item.pos).project(camera);
   const visible=point.z<1&&Math.abs(point.x)<1.2&&Math.abs(point.y)<1.3;
   item.el.style.visibility=visible?'visible':'hidden';
   if(!visible)continue;
   let x=(point.x*.5+.5)*width,y=(-point.y*.5+.5)*height;
   // Gate names stay below the top bar and inside the screen while their device is in view.
   if(item.gate){
    const w=item.el.offsetWidth,h=item.el.offsetHeight;
    // The gate ahead keeps its name below the top bar and inside the screen. A passed gate's name simply leaves with its device,
    // and no gate name is drawn under the vapour marker's own label.
    if(item.el.classList.contains('is-current')){x=Math.max(w/2+8,Math.min(width-w/2-8,x));y=Math.max(topSafe+h,y);}
    const under=y-h<topSafe||vapor&&Math.abs(x-vaporAt.x)<(w+vaporAt.w)/2&&y>vaporAt.y-vaporAt.h&&y-h<vaporAt.y;
    item.el.classList.toggle('is-under',under);
   }
   if(item===vaporLabel){vaporAt.x=x;vaporAt.y=y;vaporAt.w=item.el.offsetWidth;vaporAt.h=item.el.offsetHeight;}
   item.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
  }
  root.dataset.ready='true';
 }
 function loop(now){
  if(view.stop)return;
  if(!root.isConnected){cleanupRunStage();return;}
  frame=requestAnimationFrame(loop);
  const dt=Math.min(RUN.maxDt,Math.max(0,(now-last)/1000));last=now;
  if(document.hidden)return;
  if(paused()){jumpQueued=false;}
  else{const events=stepRunner(runner,course,adventure,held(),dt);jumpQueued=false;for(const event of events)handle(event);}
  draw(dt,now/1000);
 }
 disposers.push(()=>cancelAnimationFrame(frame));
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!view.stop){cleanupRunStage();onFail();}},on);
 // Test and review hook: read-only view of the running stage.
 root.runStage={get adventure(){return adventure;},runner,course,paused};
 sync();
 if(finished){hud.card.hidden=true;showDone();}
 else if(adventure.gate===0&&adventure.steps===0&&adventure.mistakes===0)ready();
 else go();
 frame=requestAnimationFrame(loop);
}
