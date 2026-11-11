// Optional 3D views: the student's device (stages 9–10) and the restored island (ending).
// Three.js and the models load only when a view opens; the 2D screens stay complete,
// so a device without WebGL or a failed download just keeps the explanation in the dialog.
import {modal,esc,btn} from './ui.js';
import {state} from './state.js';
import {MODEL_DIR,deviceModels,islandModels,deviceLayout,pointAlong,MILL,orbitDistance} from './three-layout.js';
import {islandWater} from './island-water.js';

const BASE='/assets/vendor/three/';
// Mill placement beside the island and the wheel's axle on the stand (model units: metres).
export {MILL} from './three-layout.js';
let libs=null,active=null;
const loadLibs=()=>libs??=Promise.all([import(BASE+'three.module.min.js'),import(BASE+'GLTFLoader.js')]).then(([THREE,m])=>({THREE,loader:new m.GLTFLoader()})).catch(e=>{libs=null;throw e;});
const reduced=()=>!!state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
export function canShow3D(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch{return false;}}

export function closeThreeView(){if(!active)return;const v=active;active=null;v.stop=true;for(const f of v.dispose)try{f();}catch{}}

function open(title,hint,build,onContinue){
 closeThreeView();
 const d=modal(title,`<div class="three-view"><div class="three-stage" id="three-stage" tabindex="0" role="img" aria-label="${esc(title)}. 화살표 키로도 돌릴 수 있어."><p class="three-status" id="three-status">3D 모형을 불러오고 있어…</p></div><div class="three-controls" role="group" aria-label="3D 관찰 조작">${[['left','왼쪽 회전'],['right','오른쪽 회전'],['height','높이 바꾸기'],['in','＋ 확대'],['out','− 축소'],['reset','전체 보기']].map(([action,label])=>`<button type="button" class="btn secondary" data-three-camera="${action}">${label}</button>`).join('')}</div><p class="three-hint">${esc(hint)} 휠 또는 두 손가락으로 확대하고, 오른쪽 버튼으로 끌어 위치를 옮겨 봐.</p>${onContinue?btn('관찰 마치고 계속','three-continue','primary'):''}</div>`);
 if(onContinue)d.querySelector('[data-action="three-continue"]').addEventListener('click',()=>{closeThreeView();d.close();onContinue();},{once:true});
 d.classList.add('three-dialog');
 const stage=d.querySelector('#three-stage'),status=d.querySelector('#three-status'),view={stop:false,dispose:[]};active=view;
 d.addEventListener('close',()=>{if(active===view)closeThreeView();},{once:true});
 if(!canShow3D()){status.textContent='이 기기에서는 3D 보기를 열 수 없어. 지금 화면에서 그대로 계속하면 돼.';return;}
 loadLibs().then(({THREE,loader})=>view.stop?null:mount(THREE,loader,stage,view,build)).then(()=>{if(!view.stop)status.remove();})
  .catch(()=>{if(!view.stop)status.textContent='3D 모형을 불러오지 못했어. 지금 화면에서 그대로 계속하면 돼.';});
}

async function mount(THREE,loader,stage,view,build){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.005,20),root=new THREE.Group();
 scene.add(new THREE.HemisphereLight(0xffffff,0xc9dde4,2.1));
 const sun=new THREE.DirectionalLight(0xfff6e6,1.5);sun.position.set(.7,1.3,1);scene.add(sun,root);
 const load=async name=>(await loader.loadAsync(MODEL_DIR+name)).scene;
 const decor=new THREE.Group(),tick=await build({THREE,root,decor,load});
 if(view.stop)return;
 tick?.(0,0,true);
 const box=new THREE.Box3().setFromObject(root),centre=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 root.position.sub(centre);root.add(decor);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}),el=renderer.domElement;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));stage.append(el);
 let yaw=-.55,pitch=.32,drag=null,frame=0,last=performance.now(),dist=1,zoom=1,interacted=false,height=0;
 const target=new THREE.Vector3(),pointers=new Map(),input=new AbortController();
 const setZoom=value=>{zoom=Math.max(1,Math.min(5,value));camera.zoom=zoom;camera.updateProjectionMatrix();stage.dataset.zoom=zoom.toFixed(2);interacted=true;};
 const pan=(dx,dy)=>{const units=2*dist*Math.tan(camera.fov*Math.PI/360)/stage.clientHeight/zoom;const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);target.addScaledVector(right,-dx*units).addScaledVector(up,dy*units);target.clamp(size.clone().multiplyScalar(-.55),size.clone().multiplyScalar(.55));};
 const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dist=orbitDistance(size,camera.aspect,camera.fov);};
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();
 // Zoom is optical, so detail stays visible without pushing the camera through the model.
 el.style.touchAction='none';
 el.addEventListener('wheel',e=>{e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);setZoom(zoom*Math.exp(-Math.max(-300,Math.min(300,delta))*.0025));},{passive:false,signal:input.signal});
 el.oncontextmenu=e=>e.preventDefault();
 el.onpointerdown=e=>{
  if(![0,2].includes(e.button))return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});interacted=true;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey};el.setPointerCapture(e.pointerId);
 };
 el.onpointermove=e=>{
  const previous=pointers.get(e.pointerId);if(!previous)return;
  const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];
  const dx=e.clientX-previous.x,dy=e.clientY-previous.y;
  if(other){const before=Math.hypot(previous.x-other.x,previous.y-other.y),after=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(before>4)setZoom(zoom*after/before);pan(dx/2,dy/2);}
  else if(drag?.pan)pan(dx,dy);
  else{yaw-=dx*.008;pitch=Math.max(.12,Math.min(1.1,pitch+dy*.006));}
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 };
 el.onpointerup=el.onpointercancel=el.onlostpointercapture=e=>{pointers.delete(e.pointerId);if(drag?.id===e.pointerId)drag=null;};
 window.addEventListener('blur',()=>{pointers.clear();drag=null;},{signal:input.signal});
 stage.parentElement.querySelector('.three-controls').addEventListener('click',e=>{
  const action=e.target.closest('[data-three-camera]')?.dataset.threeCamera;if(!action)return;
  interacted=true;
  if(action==='in')setZoom(zoom*1.3);
  if(action==='out')setZoom(zoom/1.3);
  if(action==='left')yaw+=Math.PI/4;
  if(action==='right')yaw-=Math.PI/4;
  if(action==='height'){height=(height+1)%3;pitch=[.32,.65,1][height];}
  if(action==='reset'){yaw=-.55;pitch=.32;height=0;target.set(0,0,0);setZoom(1);}
 },{signal:input.signal});
 stage.onkeydown=e=>{
  if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0'){target.set(0,0,0);setZoom(1);}else setZoom(zoom*(e.key==='-'?1/1.2:1.2));return;}
  const k={ArrowLeft:[.15,0],ArrowRight:[-.15,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];if(!k)return;
  e.preventDefault();interacted=true;yaw+=k[0];pitch=Math.max(.12,Math.min(1.1,pitch+k[1]));
 };
 const loop=now=>{
  if(view.stop)return;if(!stage.isConnected){closeThreeView();return;}
  frame=requestAnimationFrame(loop);if(document.hidden)return;
  const dt=Math.min(.05,(now-last)/1000),still=reduced();last=now;
  if(!drag&&!still&&!interacted)yaw-=dt*.22;
  tick?.(dt,now/1000,still);
  camera.position.set(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist).add(target);camera.lookAt(target);
  renderer.render(scene,camera);stage.dataset.ready='true';
 };
 frame=requestAnimationFrame(loop);
 view.dispose.push(()=>input.abort(),()=>cancelAnimationFrame(frame),()=>ro.disconnect(),()=>{
  scene.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[])){for(const k in m)if(m[k]?.isTexture)m[k].dispose();m.dispose();}});
  renderer.dispose();renderer.forceContextLoss();el.remove();
 });
}

function drops(THREE,root,count){
 const mat=new THREE.MeshStandardMaterial({color:0x5fd0ec,emissive:0x1f8fb3,emissiveIntensity:.35,roughness:.2});
 return Array.from({length:count},()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.0055,12,8),mat);root.add(m);return m;});
}

export function openDevice(design,{withCore=false,flowing=false,coreInletY=272,connected=true,onContinue}={}){
 if(withCore&&!connected)flowing=false;
 const layout=deviceLayout(design,withCore,coreInletY,connected),status=withCore?(flowing?'물이 코어까지 도착했어!':'아직 물이 코어에 닿지 않았어.'):(flowing?'시험한 물길로 물이 흘러.':'시험해서 물길이 이어지면 물이 흘러.');
 open(withCore?'내 장치와 물방울 코어':'내 장치',`드래그해서 돌려 봐. 냉각판 ${layout.cold?'켜짐':'꺼짐'} · ${status}`,async({THREE,root,load})=>{
  const entries=Object.entries(layout.parts),models=await Promise.all(entries.map(([key])=>load(deviceModels[key])));
  entries.forEach(([,p],i)=>{const m=models[i];m.position.set(p.x,p.y,0);m.rotation.z=p.rotation;m.scale.setScalar(p.scale);root.add(m);});
  if(layout.corePipe.length){
   const [start,end]=layout.corePipe.map(p=>new THREE.Vector3(p.x,p.y,.012)),curve=new THREE.LineCurve3(start,end);
   const pipe=new THREE.Mesh(new THREE.TubeGeometry(curve,1,.008,12,false),new THREE.MeshStandardMaterial({color:0x91cbd2,roughness:.25,metalness:.1,transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide}));
   pipe.name='core-transfer-pipe';root.add(pipe);
   const brass=new THREE.MeshStandardMaterial({color:0xc6ad6a,roughness:.4,metalness:.5}),direction=end.clone().sub(start).normalize();
   // The first coupling sits on the bucket wall, the last overlaps the core's brass inlet.
   for(const distance of [.035,start.distanceTo(end)-.002]){
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.008,.0022,6,16),brass);
    collar.position.copy(start).addScaledVector(direction,distance);collar.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);root.add(collar);
   }
  }
  const core=withCore?models[entries.findIndex(([key])=>key==='core')]:null,glow=[];
  if(core&&flowing){core.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.emissive=new THREE.Color(0x48d8ff);glow.push(o.material);}});const light=new THREE.PointLight(0x7fe9ff,.6,.4);light.position.set(layout.parts.core.x,layout.parts.core.y+.11,.05);root.add(light);}
  const water=flowing?drops(THREE,root,7):[];
  return (dt,t,still)=>{
   water.forEach((m,i)=>{const p=pointAlong(layout.path,still?(i+.5)/water.length:(t*.18+i/water.length)%1);m.position.set(p.x,p.y,.012);});
   for(const m of glow)m.emissiveIntensity=still?.35:.28+.14*Math.sin(t*2.2);
  };
 },onContinue);
}

/** The restored island. Water effects sit in `decor` so they never change how the camera frames the model. */
export async function buildIsland({THREE,root,decor,load}){
 const [island,stand,wheel]=await Promise.all([load(islandModels.island),load(islandModels.stand),load(islandModels.wheel)]);
 const mill=new THREE.Group();mill.add(stand);wheel.position.set(MILL.wheel.x,MILL.wheel.y,MILL.wheel.z);mill.add(wheel);
 const base=new THREE.Box3().setFromObject(stand),size=base.getSize(new THREE.Vector3()),centre=base.getCenter(new THREE.Vector3()),height=MILL.y/MILL.scale;
 const foundation=new THREE.Mesh(new THREE.BoxGeometry(size.x*1.025,height,size.z*1.025),new THREE.MeshStandardMaterial({color:0xd7cdb6,roughness:.86}));
 foundation.position.set(centre.x,base.min.y-height/2,centre.z);mill.add(foundation);
 mill.position.set(MILL.x,MILL.y,MILL.z);mill.rotation.y=MILL.yaw;mill.scale.setScalar(MILL.scale);root.add(island,mill);
 const flow=islandWater(THREE,{island,mill,decor});
 return (dt,t,still)=>{
  if(!still)wheel.rotation.x-=dt*.9;
  flow(t,still);
 };
}
export function openIsland(){
 open('되살린 연구섬 다시보기','모은 물이 물레의 받이에서 수로를 따라 마을로 흘러. 드래그해서 이어진 물길을 둘러봐.',buildIsland);
}
