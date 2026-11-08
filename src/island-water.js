// Moving water for the restored island. The diorama's water is painted into one baked texture,
// so a shader finds that paint and animates it in place, then a sea, spray and the mill's stream are added around it.
import {islandWaterwayLayout,MILL_CUP} from './three-layout.js';
const NOISE=`
float wHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float wNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wHash(i),wHash(i+vec2(1,0)),f.x),mix(wHash(i+vec2(0,1)),wHash(i+vec2(1,1)),f.x),f.y);}
float wRipple(vec2 p,float t){float a=wNoise(p+vec2(t*.7,t*.4)),b=wNoise(p*1.6-vec2(t*.5,-t*.6));return pow(1.-abs(a-b),9.);}
`;
const SEA_LEVEL=.006,SEA_RADIUS=.5;
// Measured from the stand model, in mill units: down the flume's channel, then over its end into the glass.
const STREAM=[[-.009,.08,.004],[-.009,.0735,.02],[-.009,.072,.04],[-.009,.0705,.058],[-.009,.067,.067],[-.008,.058,.07],[-.006,.046,.07]];
const CUP=MILL_CUP;
// Drops leave the wheel's lower buckets and land in the channel.
const WHEEL_DRIP={x:-.006,y:.102,z:.022},CHANNEL_Y=.074;

function animatePaintedWater(island,time){
 island.traverse(mesh=>{
  if(!mesh.isMesh)return;
  mesh.material.onBeforeCompile=shader=>{
   shader.uniforms.uTime=time;
   shader.vertexShader=shader.vertexShader
    .replace('#include <common>','#include <common>\nvarying vec3 vIslandP;varying vec3 vIslandN;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nvIslandP=position;vIslandN=normal;');
   shader.fragmentShader=shader.fragmentShader
    .replace('#include <common>',`#include <common>\nuniform float uTime;varying vec3 vIslandP;varying vec3 vIslandN;float waterShine;${NOISE}`)
    .replace('#include <map_fragment>',`#include <map_fragment>
     vec3 painted=diffuseColor.rgb;
     float wet=smoothstep(.05,.2,painted.b-painted.r)*smoothstep(.3,.5,painted.g+painted.b*.5);
     float fall=1.-smoothstep(.4,.8,abs(normalize(vIslandN).y));
     float around=atan(vIslandP.z,vIslandP.x)*52.;
     float down=vIslandP.y*120.+uTime*3.2;
     float streak=smoothstep(.45,.85,wNoise(vec2(around,down*.32)))*.9+smoothstep(.6,.9,wNoise(vec2(around*2.4,down*.8+9.)))*.7;
     float ripple=wRipple(vIslandP.xz*170.,uTime);
     waterShine=wet*mix(ripple*.8,streak,fall);
     diffuseColor.rgb=mix(painted,painted*(.9+.2*wNoise(vIslandP.xz*90.+uTime*.5))+vec3(.72,.9,1.)*waterShine*.6,wet);`)
    .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.5,.78,.95)*waterShine*.3;');
  };
  mesh.material.needsUpdate=true;
 });
}

function makeSea(THREE,time,shore,splash){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uTime:time,uShore:{value:new THREE.Vector2(shore.x,shore.y)},uCentre:{value:new THREE.Vector2(shore.cx,shore.cy)},uSplash:{value:splash.map(p=>new THREE.Vector2(p.x,p.z))},uRadius:{value:SEA_RADIUS}},
  vertexShader:'varying vec2 vP;void main(){vP=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vP;uniform float uTime,uRadius;uniform vec2 uShore,uCentre;uniform vec2 uSplash[${splash.length}];${NOISE}
  void main(){
   float d=length((vP-uCentre)/uShore),r=length(vP);
   float wobble=wNoise(vP*42.+uTime*.2);
   vec3 colour=mix(vec3(.5,.9,.88),vec3(.11,.53,.72),smoothstep(1.,2.5,d+wobble*.25));
   colour+=vec3(.35,.5,.55)*wRipple(vP*95.,uTime*.8)*.3;
   float swell=sin(d*24.-uTime*1.5+wobble*6.);
   float foam=smoothstep(.72,1.,swell)*(1.-smoothstep(1.02,1.5,d));
   foam=max(foam,1.-smoothstep(.98,1.08,d+wobble*.09));
   for(int i=0;i<${splash.length};i++){float s=length(vP-uSplash[i]);foam=max(foam,smoothstep(.55,1.,sin(s*360.-uTime*7.))*(1.-smoothstep(.0,.045,s)));}
   float glint=pow(wNoise(vP*220.+vec2(uTime*1.3,-uTime)),26.)*2.5;
   colour=mix(colour,vec3(1.),clamp(foam*.85+glint,0.,1.));
   gl_FragColor=vec4(colour,1.-smoothstep(uRadius*.72,uRadius,r));
  }`});
 const sea=new THREE.Mesh(new THREE.CircleGeometry(SEA_RADIUS,128).rotateX(-Math.PI/2),material);
 sea.position.y=SEA_LEVEL;
 return sea;
}

// Finds the falls by reading the paint under each steep vertex.
function findFalls(island){
 let geometry,image;
 island.traverse(o=>{if(o.isMesh){geometry=o.geometry;image=o.material.map?.image;}});
 const pos=geometry.attributes.position,nor=geometry.attributes.normal,uv=geometry.attributes.uv,size=512;
 const c=document.createElement('canvas');c.width=c.height=size;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,size,size);
 const pixels=g.getImageData(0,0,size,size).data,found=[],shore={minX:1,maxX:-1,minZ:1,maxZ:-1};
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
  if(y<.02){shore.minX=Math.min(shore.minX,x);shore.maxX=Math.max(shore.maxX,x);shore.minZ=Math.min(shore.minZ,z);shore.maxZ=Math.max(shore.maxZ,z);}
  if(Math.abs(nor.getY(i))>.6||y>.06)continue;
  const p=(Math.floor(uv.getY(i)*size)%size*size+Math.floor(uv.getX(i)*size)%size)*4;
  if(pixels[p+2]-pixels[p]>40)found.push({x,y,z});
 }
 found.sort((a,b)=>a.y-b.y);
 // One landing point per fall: keep the lowest vertex of each spot.
 const falls=[];
 for(const p of found)if(falls.length<6&&falls.every(q=>Math.hypot(q.x-p.x,q.z-p.z)>.05))falls.push(p);
 return {falls,shore:{x:(shore.maxX-shore.minX)/2,y:(shore.maxZ-shore.minZ)/2,cx:(shore.maxX+shore.minX)/2,cy:(shore.maxZ+shore.minZ)/2}};
}

/** Soft points that leave `origins`. `rise` lifts them as mist; a negative `fall` drops them as droplets. */
function makeSpray(THREE,time,origins,{count,spread,rise,fall=0,size,colour,speed}){
 const base=new Float32Array(count*3),seed=new Float32Array(count);
 for(let i=0;i<count;i++){const o=origins[i%origins.length];base.set([o.x,o.y,o.z],i*3);seed[i]=(i*.6180339)%1;}
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(base,3));
 geometry.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uTime:time,uSpread:{value:spread},uRise:{value:rise},uFall:{value:fall},uSize:{value:size},uSpeed:{value:speed},uColour:{value:new THREE.Color(colour)}},
  vertexShader:`attribute float aSeed;uniform float uTime,uSpread,uRise,uFall,uSize,uSpeed;varying float vLife;
  void main(){
   float life=fract(uTime*uSpeed+aSeed);vLife=life;
   float turn=aSeed*40.;
   vec3 p=position+vec3(cos(turn),0.,sin(turn))*uSpread*life;
   p.y+=uRise*life-uFall*life*life;
   vec4 view=modelViewMatrix*vec4(p,1.);
   gl_PointSize=uSize*(.6+life)/-view.z;
   gl_Position=projectionMatrix*view;
  }`,
  fragmentShader:`uniform vec3 uColour;varying float vLife;
  void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(uColour,(1.-smoothstep(.1,.5,d))*sin(vLife*3.1416)*.7);}`});
 return new THREE.Points(geometry,material);
}

function streamMaterial(THREE,time){
 return new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:time},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float uTime;${NOISE}
  void main(){
   float n=wNoise(vec2(vUv.x*26.-uTime*4.2,vUv.y*5.));
   vec3 colour=mix(vec3(.26,.72,.88),vec3(.92,.99,1.),smoothstep(.5,.85,n));
   gl_FragColor=vec4(colour,.72+.28*n);
  }`});
}
function makeStream(THREE,time){
 const curve=new THREE.CatmullRomCurve3(STREAM.map(p=>new THREE.Vector3(...p)));
 return new THREE.Mesh(new THREE.TubeGeometry(curve,48,.0046,10),streamMaterial(THREE,time));
}

// A continuous U-shaped channel, including the bends. Water remains visible between its walls.
function channelGeometry(THREE,path,left,right,top,bottom){
 const positions=[],indices=[],uv=[],offsets=[];
 path.forEach((p,i)=>{
  const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)],length=Math.hypot(b.x-a.x,b.z-a.z),nx=-(b.z-a.z)/length,nz=(b.x-a.x)/length;
  offsets.push({x:nx,z:nz});
  for(const [offset,y]of [[left,top],[right,top],[left,bottom],[right,bottom]]){positions.push(p.x+nx*offset,p.y+y,p.z+nz*offset);uv.push(i/(path.length-1),offset===left?0:1);}
  if(!i)return;
  const a0=(i-1)*4,b0=i*4;
  for(const [a1,a2,b1,b2]of [[0,1,0,1],[2,0,2,0],[1,3,1,3],[3,2,3,2]])indices.push(a0+a1,a0+a2,b0+b1,a0+a2,b0+b2,b0+b1);
 });
 const end=(base,reverse)=>{const face=[base,base+2,base+1,base+1,base+2,base+3];indices.push(...(reverse?face.reverse():face));};end(0,false);end((path.length-1)*4,true);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 return {geometry,offsets};
}
function makeVillageWaterway(THREE,time,decor){
 const {cup,path,landing,width}=islandWaterwayLayout(),group=new THREE.Group();group.name='mill-to-village-waterway';
 const stone=new THREE.MeshStandardMaterial({color:0xe4d9bd,roughness:.83,flatShading:true}),brass=new THREE.MeshStandardMaterial({color:0xb79554,metalness:.48,roughness:.4}),water=streamMaterial(THREE,time);
 const half=width/2;
 for(const [left,right,top,bottom,material]of [[-half-.003,half+.003,-.0015,-.005,stone],[-half-.003,-half,.003,-.005,stone],[half,half+.003,.003,-.005,stone],[-half,half,0,-.0002,water]]){
  const {geometry}=channelGeometry(THREE,path,left,right,top,bottom);group.add(new THREE.Mesh(geometry,material));
 }
 const {geometry:guide,offsets}=channelGeometry(THREE,path,-half,half,0,0);guide.dispose();
 for(const side of [-1,1]){
  const points=path.map((p,i)=>new THREE.Vector3(p.x+offsets[i].x*(half+.0015)*side,p.y+.003,p.z+offsets[i].z*(half+.0015)*side)),curve=new THREE.CurvePath();
  for(let i=1;i<points.length;i++)curve.add(new THREE.LineCurve3(points[i-1],points[i]));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0007,6),brass));
 }
 const curve=new THREE.CurvePath();for(let i=1;i<path.length;i++)curve.add(new THREE.LineCurve3(new THREE.Vector3(path[i-1].x,path[i-1].y,path[i-1].z),new THREE.Vector3(path[i].x,path[i].y,path[i].z)));
 // Two grounded piers support the span over the sea; the last reach rests on the island bank.
 for(const t of [.25,.67]){
  const p=curve.getPointAt(t),top=p.y-.005,base=SEA_LEVEL-.003,height=top-base;
  const pier=new THREE.Mesh(new THREE.BoxGeometry(.012,height,.016),stone);pier.position.set(p.x,base+height/2,p.z);group.add(pier);
  for(const y of [base+.002,top-.002]){const cap=new THREE.Mesh(new THREE.BoxGeometry(.019,.004,.022),stone);cap.position.set(p.x,y,p.z);group.add(cap);}
 }
 // A short brass outlet through the cup wall feeds the open channel.
 const inlet=new THREE.Vector3(cup.x,cup.y-.001,cup.z),outlet=new THREE.Vector3(path[0].x,path[0].y,path[0].z),axis=outlet.clone().sub(inlet),pipe=new THREE.Mesh(new THREE.CylinderGeometry(.0047,.0047,axis.length(),12,1,true),brass);
 pipe.position.copy(inlet.clone().add(outlet).multiplyScalar(.5));pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.clone().normalize());group.add(pipe);
 const feed=new THREE.LineCurve3(inlet,outlet);group.add(new THREE.Mesh(new THREE.TubeGeometry(feed,4,.003,8),water));
 const last=path.at(-1),drop=new THREE.LineCurve3(new THREE.Vector3(last.x,last.y,last.z),new THREE.Vector3(landing.x,landing.y,landing.z));group.add(new THREE.Mesh(new THREE.TubeGeometry(drop,4,.0035,8),water));
 decor.add(group);
 decor.add(makeSpray(THREE,time,[landing],{count:12,spread:.006,rise:.007,fall:.007,size:.12,colour:0xecfbff,speed:1.5}));
}
function makeCupWater(THREE,time){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:time},
  vertexShader:'varying vec2 vP;void main(){vP=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vP;uniform float uTime;
  void main(){float r=length(vP);float ring=smoothstep(.5,1.,sin(r*900.-uTime*9.));gl_FragColor=vec4(mix(vec3(.33,.76,.9),vec3(1.),ring*.8),.85);}`});
 const surface=new THREE.Mesh(new THREE.CircleGeometry(CUP.radius,40).rotateX(-Math.PI/2),material);
 surface.position.set(0,CUP.y,CUP.z);
 return surface;
}

/** Adds every water effect and returns the per-frame update. */
export function islandWater(THREE,{island,mill,decor}){
 const time={value:0},{falls,shore}=findFalls(island),splash=falls.length?falls:[{x:0,y:0,z:0}];
 animatePaintedWater(island,time);
 decor.add(makeSea(THREE,time,shore,splash));
 decor.add(makeSpray(THREE,time,splash.map(p=>({x:p.x,y:SEA_LEVEL+.004,z:p.z})),{count:150,spread:.03,rise:.05,size:.9,colour:0xffffff,speed:.3}));
 mill.add(makeStream(THREE,time),makeCupWater(THREE,time));
 mill.add(makeSpray(THREE,time,[WHEEL_DRIP],{count:26,spread:.008,rise:0,fall:WHEEL_DRIP.y-CHANNEL_Y,size:.32,colour:0x8fe3f5,speed:1.3}));
 mill.add(makeSpray(THREE,time,[{x:-.006,y:CUP.y+.002,z:CUP.z}],{count:18,spread:.016,rise:.022,fall:.022,size:.22,colour:0xe8fbff,speed:1.8}));
 makeVillageWaterway(THREE,time,decor);
 return (t,still)=>{time.value=still?2:t;};
}
