// Moving water for the restored island. The diorama's water is painted into one baked texture,
// so a shader finds that paint and animates it in place, then a sea, spray and the mill's stream are added around it.
const NOISE=`
float wHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float wNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wHash(i),wHash(i+vec2(1,0)),f.x),mix(wHash(i+vec2(0,1)),wHash(i+vec2(1,1)),f.x),f.y);}
float wRipple(vec2 p,float t){float a=wNoise(p+vec2(t*.7,t*.4)),b=wNoise(p*1.6-vec2(t*.5,-t*.6));return pow(1.-abs(a-b),9.);}
`;
const SEA_LEVEL=.006,SEA_RADIUS=.5;
// Measured from the stand model, in mill units: down the flume's channel, then over its end into the glass.
const STREAM=[[-.009,.08,.004],[-.009,.0735,.02],[-.009,.072,.04],[-.009,.0705,.058],[-.009,.067,.067],[-.008,.058,.07],[-.006,.046,.07]];
const CUP={y:.047,z:.069,radius:.0185};
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

function makeStream(THREE,time){
 const curve=new THREE.CatmullRomCurve3(STREAM.map(p=>new THREE.Vector3(...p)));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:time},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float uTime;${NOISE}
  void main(){
   float n=wNoise(vec2(vUv.x*26.-uTime*4.2,vUv.y*5.));
   vec3 colour=mix(vec3(.26,.72,.88),vec3(.92,.99,1.),smoothstep(.5,.85,n));
   gl_FragColor=vec4(colour,.72+.28*n);
  }`});
 return new THREE.Mesh(new THREE.TubeGeometry(curve,48,.0046,10),material);
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
 return (t,still)=>{time.value=still?2:t;};
}
