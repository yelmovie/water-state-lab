// Optional 3D views: the student's device (stages 9–10) and the restored island (ending).
// Three.js and the models load only when a view opens; the 2D screens stay complete,
// so a device without WebGL or a failed download just keeps the explanation in the dialog.
import {modal,esc} from './ui.js';
import {state} from './state.js';
import {MODEL_DIR,deviceModels,islandModels,deviceLayout,pointAlong} from './three-layout.js';

const BASE='/assets/vendor/three/';
// Mill placement beside the island and the wheel's axle on the stand (model units: metres).
export const MILL={x:.24,y:0,z:.16,scale:1.15,yaw:-2.1,wheel:{x:0,y:.115,z:-.019}};
let libs=null,active=null;
const loadLibs=()=>libs??=Promise.all([import(BASE+'three.module.min.js'),import(BASE+'GLTFLoader.js')]).then(([THREE,m])=>({THREE,loader:new m.GLTFLoader()})).catch(e=>{libs=null;throw e;});
const reduced=()=>!!state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
export function canShow3D(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch{return false;}}

export function closeThreeView(){if(!active)return;const v=active;active=null;v.stop=true;for(const f of v.dispose)try{f();}catch{}}

function open(title,hint,build){
 closeThreeView();
 const d=modal(title,`<div class="three-view"><div class="three-stage" id="three-stage" tabindex="0" role="img" aria-label="${esc(title)}. 화살표 키로도 돌릴 수 있어."><p class="three-status" id="three-status">3D 모형을 불러오고 있어…</p></div><p class="three-hint">${esc(hint)}</p></div>`);
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
 const tick=await build({THREE,root,load});
 if(view.stop)return;
 tick?.(0,0,true);
 const box=new THREE.Box3().setFromObject(root),centre=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 // Fit what a turning model can cover: its horizontal footprint across, its height up.
 const across=Math.hypot(size.x,size.z)/2,tall=size.y*.6,tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
 root.position.sub(centre);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}),el=renderer.domElement;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));stage.append(el);
 let yaw=-.55,pitch=.32,drag=null,frame=0,last=performance.now(),dist=1;
 const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dist=Math.max(across/(tanV*camera.aspect),tall/tanV)*1.12+across*.3;};
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();
 // Drag or arrow keys turn the model; it is never required to continue the lesson.
 el.style.touchAction='none';
 el.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,yaw,pitch};el.setPointerCapture(e.pointerId);};
 el.onpointermove=e=>{if(!drag)return;yaw=drag.yaw-(e.clientX-drag.x)*.008;pitch=Math.max(-.05,Math.min(1.1,drag.pitch+(e.clientY-drag.y)*.006));};
 el.onpointerup=el.onpointercancel=()=>{drag=null;};
 stage.onkeydown=e=>{const k={ArrowLeft:[.15,0],ArrowRight:[-.15,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];if(!k)return;e.preventDefault();yaw+=k[0];pitch=Math.max(-.05,Math.min(1.1,pitch+k[1]));};
 const loop=now=>{
  if(view.stop)return;if(!stage.isConnected){closeThreeView();return;}
  frame=requestAnimationFrame(loop);if(document.hidden)return;
  const dt=Math.min(.05,(now-last)/1000),still=reduced();last=now;
  if(!drag&&!still)yaw-=dt*.22;
  tick?.(dt,now/1000,still);
  camera.position.set(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(0,0,0);
  renderer.render(scene,camera);stage.dataset.ready='true';
 };
 frame=requestAnimationFrame(loop);
 view.dispose.push(()=>cancelAnimationFrame(frame),()=>ro.disconnect(),()=>{
  scene.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[])){for(const k in m)if(m[k]?.isTexture)m[k].dispose();m.dispose();}});
  renderer.dispose();renderer.forceContextLoss();el.remove();
 });
}

function drops(THREE,root,count){
 const mat=new THREE.MeshStandardMaterial({color:0x5fd0ec,emissive:0x1f8fb3,emissiveIntensity:.35,roughness:.2});
 return Array.from({length:count},()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.0055,12,8),mat);root.add(m);return m;});
}

export function openDevice(design,{withCore=false,flowing=false}={}){
 const layout=deviceLayout(design,withCore),status=withCore?(flowing?'물이 코어까지 도착했어!':'아직 물이 코어에 닿지 않았어.'):(flowing?'시험한 물길로 물이 흘러.':'시험해서 물길이 이어지면 물이 흘러.');
 open(withCore?'내 장치와 물방울 코어':'내 장치',`드래그해서 돌려 봐. 냉각판 ${layout.cold?'켜짐':'꺼짐'} · ${status}`,async({THREE,root,load})=>{
  const entries=Object.entries(layout.parts),models=await Promise.all(entries.map(([key])=>load(deviceModels[key])));
  entries.forEach(([,p],i)=>{const m=models[i];m.position.set(p.x,p.y,0);m.rotation.z=p.rotation;m.scale.setScalar(p.scale);root.add(m);});
  const core=withCore?models[entries.findIndex(([key])=>key==='core')]:null,glow=[];
  if(core&&flowing){core.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.emissive=new THREE.Color(0x48d8ff);glow.push(o.material);}});const light=new THREE.PointLight(0x7fe9ff,.6,.4);light.position.set(layout.parts.core.x,layout.parts.core.y+.11,.05);root.add(light);}
  const water=flowing?drops(THREE,root,7):[];
  return (dt,t,still)=>{
   water.forEach((m,i)=>{const p=pointAlong(layout.path,still?(i+.5)/water.length:(t*.18+i/water.length)%1);m.position.set(p.x,p.y,.012);});
   for(const m of glow)m.emissiveIntensity=still?.35:.28+.14*Math.sin(t*2.2);
  };
 });
}

export function openIsland(){
 open('되살린 연구섬','드래그해서 섬을 둘러봐. 네가 모은 물로 물레가 다시 돌아.',async({THREE,root,load})=>{
  const [island,stand,wheel]=await Promise.all([load(islandModels.island),load(islandModels.stand),load(islandModels.wheel)]);
  const mill=new THREE.Group();mill.add(stand);wheel.position.set(MILL.wheel.x,MILL.wheel.y,MILL.wheel.z);mill.add(wheel);
  mill.position.set(MILL.x,MILL.y,MILL.z);mill.rotation.y=MILL.yaw;mill.scale.setScalar(MILL.scale);root.add(island,mill);
  const water=drops(THREE,mill,5),spout={x:MILL.wheel.x,y:MILL.wheel.y-.052};
  return (dt,t,still)=>{
   if(!still)wheel.rotation.x-=dt*.9;
   water.forEach((m,i)=>{const k=still?(i+.5)/water.length:(t*.6+i/water.length)%1;m.position.set(spout.x,spout.y-k*.03,MILL.wheel.z);});
  };
 });
}
