import {missions} from './domain.js';

export const MAP_VILLAINS_KEY='water-state-lab:map-villains:v1';
const sessionClears=new Set();
export const mapVillainToken=(state,id)=>state.mapRunId+JSON.stringify(state.evidence[id]||null);
function readVillainRecord(storage,key=MAP_VILLAINS_KEY){
 try{
  const raw=JSON.parse((storage??globalThis.localStorage).getItem(key)||'{}');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))return raw;
 }catch{}
 return {};
}
export function remainingMapVillains(state,storage){
 const record=readVillainRecord(storage);
 return missions.filter((mission,index)=>{
  const token=mapVillainToken(state,mission.id);
  return !state.completed.includes(mission.id)||(record[index]!==token&&!sessionClears.has(index+':'+token));
 }).length;
}
export function recordMapVillainClear(index,token,storage,key=MAP_VILLAINS_KEY){
 sessionClears.add(index+':'+token);
 const record=readVillainRecord(storage,key);record[index]=token;
 try{(storage??globalThis.localStorage).setItem(key,JSON.stringify(record));return true;}catch{return false;}
}

/** Elliptical body bounds ignore transparent sprite corners at any map zoom. */
export function spritesTouch(actor,target){
 if(!actor?.width||!actor.height||!target?.width||!target.height)return false;
 const dx=actor.left+actor.width*.5-target.left-target.width*.5;
 const dy=actor.top+actor.height*.55-target.top-target.height*.55;
 const rx=actor.width*.3+target.width*.32,ry=(actor.height+target.height)*.36;
 return (dx/rx)**2+(dy/ry)**2<=1;
}

/** Combat changes the finale condition, independently of lesson access. */
// Sprite sheets: map-villain-mole.webp is 4×2 frames, bangul-combat-sheet.webp is 4×1 frames (256 px each).
// The mole faces left in every frame, so facing right is a horizontal flip.
const MOLE={idle:0,step:1,taunt:2,guard:3,lunge:4,hit:5,knocked:6,down:7};
const BANGUL={ready:0,shoot:1,relief:3};
const RANGE=24; // % of map width: how close Bangul must be for the attack button or Space key to reach a villain.
const NEAR=16; // % of map width: Bangul this close makes the villain speak.
const TAUNTS={
 locked:['흐흐, 이 물길은 내가 막았지!','밸브를 꽉 잠가 버릴 테다!','물 한 방울도 못 지나가게 할 거야~','꼬마 물방울, 저리 가!'],
 ready:['뭐? 과학의 힘을 모았다고?!','그 물방울 파동… 설마 나한테?','덤벼 봐라, 꼬마 물방울!']
};
const SFX=['끼익!','쾅!','꽉!','뿌직!'];

export function mountMapVillains(world, options) {
 const abort=new AbortController(), timers=new Set(), nodes=[], targets=[];
 const style=document.createElement('style');style.textContent=STYLES;world.append(style);
 const status=document.createElement('span');status.className='mv-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');world.append(status);
 const stored=readVillainRecord(undefined,options.key);
 const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);return id;};
 const cancel=id=>{if(id){clearTimeout(id);timers.delete(id);}};
 const reducedNow=()=>options.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const touch=matchMedia('(pointer: coarse)').matches;
 const fighter=options.fighter;
 const tell=message=>{status.textContent=message;options.notify?.(message);};
 const pick=list=>list[Math.floor(Math.random()*list.length)];
 // Load both sheets up front so the first pose change never shows an empty frame.
 for(const src of ['/assets/v2/map-villain-mole.webp','/assets/v2/bangul-combat-sheet.webp','/assets/learning/bangul-hit-20261111/bangul-hit.webp'])if(typeof Image==='function')Object.assign(new Image(),{src});
 let fighting=null,nextHurtAt=performance.now()+900;

 const frameAt=(el,f)=>{el.style.backgroundPosition=f==null?'':`${(f%4)*100/3}% ${Math.floor(f/4)*100}%`;el.closest('.mv-target')?.classList.toggle('mv-acting',f!=null);};
 const pointPx=(x,y)=>[x/100*world.offsetWidth,y/100*world.offsetHeight];
 const burst=(x,y,kind,count)=>{
  for(let i=0;i<count;i++){
   const p=document.createElement('span');p.className='mv-particle mv-'+kind;p.style.left=x+'px';p.style.top=y+'px';world.append(p);
   const up=kind==='steam',fall=kind==='sludge';
   const angle=(up?-Math.PI/2:fall?-Math.PI/2:0)+(Math.random()-.5)*(up?1.6:fall?2.2:Math.PI*2),dist=(up?38:26)+Math.random()*22;
   const end=fall?`translate(calc(-50% + ${Math.cos(angle)*dist}px),calc(-50% + ${18+Math.random()*10}px)) scale(.7)`:`translate(calc(-50% + ${Math.cos(angle)*dist}px),calc(-50% + ${Math.sin(angle)*dist}px)) scale(${up?1.6:.9})`;
   const keys=fall?[{transform:'translate(-50%,-50%) scale(.6)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(angle)*dist*.6}px),calc(-50% + ${Math.sin(angle)*dist*.8}px)) scale(1)`,opacity:1,offset:.45},{transform:end,opacity:0}]:[{transform:'translate(-50%,-50%) scale(.5)',opacity:1},{transform:end,opacity:0}];
   p.animate(keys,{duration:up?700:fall?650:480,easing:fall?'ease-in':'cubic-bezier(.16,1,.3,1)'}).finished.then(()=>p.remove(),()=>p.remove());
  }
 };

 const hitFighter=from=>{
  const now=performance.now();
  if(abort.signal.aborted||document.hidden||document.querySelector('dialog[open]')||now<nextHurtAt)return;
  nextHurtAt=now+1300;
  const at=fighter?.at?.();
  fighter?.hurt?.(from);options.sound?.('thud');
  status.textContent='앗! 방울이가 두더지에 부딪혔어. 살짝 떨어져서 움직여 봐!';
  if(at&&!reducedNow()){const [x,y]=pointPx(at.x,at.y);burst(x,y-world.offsetWidth*.027,'drop',9);}
 };

 options.stages.forEach((stage,index)=>{
  if(!stage.ready)return;
  const token=stage.token||'pending';const cleared=stage.ready&&(stored[index]===token||sessionClears.has(index+':'+token));
  const b=document.createElement('button');b.type='button';b.className='mv-target';b.style.left=stage.x+'%';b.style.top=stage.y+'%';b.dataset.stage=String(index);b.dataset.state=cleared?'cleared':stage.ready?'ready':'locked';
  b.innerHTML='<span class="mv-murk" aria-hidden="true"><i></i><i></i><i></i></span><span class="mv-wave" aria-hidden="true"></span><span class="mv-say" aria-hidden="true"><b></b><small></small></span><span class="mv-creature" aria-hidden="true"><span class="mv-sprite"></span></span><span class="mv-label"></span><span class="mv-meter" aria-hidden="true">● ● ●</span>';
  const label=b.querySelector('.mv-label'),meter=b.querySelector('.mv-meter'),creature=b.querySelector('.mv-creature'),sprite=b.querySelector('.mv-sprite');
  const say=b.querySelector('.mv-say'),sayText=say.querySelector('b'),sayHint=say.querySelector('small');
  let hits=0,busy=false,dx=0,dy=0,facingRight=false,roamTimer=0,sayTimer=0,wasNear=false,lastSaid=-1e9;
  const hint=()=>stage.ready?(touch?'공격 버튼을 눌러 봐!':'공격 버튼 · 스페이스!'):'이 구역 탐구를 마치면 물리칠 수 있어';
  b.setAttribute('aria-label',stage.name+' 물길을 막는 밸브 두더지 · '+(cleared?'퇴치 완료':stage.ready?'물방울 파동으로 세 번 공격':'이 구역 탐구를 마치면 공격할 수 있어요'));
  if(cleared){b.disabled=true;label.textContent='물길 정화 완료';meter.textContent='✓';}

  const face=right=>{facingRight=right;creature.style.scale=right?'-1 1':'';};
  const speak=(text,withHint=true,ms=2800)=>{
   sayText.textContent=text;sayHint.textContent=withHint?hint():'';sayHint.hidden=!withHint;
   say.classList.remove('show');void say.offsetWidth;say.classList.add('show');lastSaid=performance.now();
   cancel(sayTimer);sayTimer=later(()=>say.classList.remove('show'),ms);
  };
  const where=()=>{const offset=getComputedStyle(b).translate.match(/-?[\d.]+/g)?.map(Number)||[dx,dy];return {x:stage.x+offset[0]/(world.offsetWidth||1)*100,y:stage.y+(offset[1]||0)/(world.offsetHeight||1)*100};};
  const freeze=()=>{
   cancel(roamTimer);roamTimer=0;b.classList.remove('mv-walking','mv-crank');
   const now=getComputedStyle(b).translate.match(/-?[\d.]+/g)?.map(Number);if(now){dx=now[0];dy=now[1]||0;}
   b.style.transition='none';b.style.translate=`${dx}px ${dy}px`;
  };
  const sfx=text=>{
   const t=document.createElement('span');t.className='mv-sfx';t.textContent=text;t.setAttribute('aria-hidden','true');b.append(t);
   t.animate([{transform:'translate(-50%,0) scale(.6) rotate(-8deg)',opacity:0},{transform:'translate(-50%,-14px) scale(1.15) rotate(6deg)',opacity:1,offset:.3},{transform:'translate(-50%,-34px) scale(1) rotate(0)',opacity:0}],{duration:900,easing:'ease-out'}).finished.then(()=>t.remove(),()=>t.remove());
  };

  // Roaming: wander near the home spot, then stop and wreck the waterway.
  const roam=()=>{
   roamTimer=0;
   if(reducedNow()||busy||fighting||b.dataset.state!=='locked'&&b.dataset.state!=='ready')return;
   if(document.hidden){roamTimer=later(roam,1500);return;}
   // 1) mischief at the current spot
   b.classList.remove('mv-walking');b.classList.add('mv-crank');
   const [hx,hy]=pointPx(stage.x,stage.y);
   later(()=>{if(b.classList.contains('mv-crank')){sfx(pick(SFX));burst(hx+dx,hy+dy+10,'sludge',5);}},300);
   later(()=>{if(b.classList.contains('mv-crank'))sfx(pick(SFX));},1100);
   roamTimer=later(()=>{
    b.classList.remove('mv-crank');
    // 2) walk to a new spot around home
    let nx,ny;do{const a=Math.random()*Math.PI*2;nx=Math.cos(a)*(20+Math.random()*34);ny=Math.sin(a)*(6+Math.random()*12);}while(Math.hypot(nx-dx,ny-dy)<18);
    const dur=Math.round(Math.hypot(nx-dx,ny-dy)/30*1000);
    face(nx>dx);b.classList.add('mv-walking');
    b.style.transition=`translate ${dur}ms linear`;b.style.translate=`${nx}px ${ny}px`;dx=nx;dy=ny;
    roamTimer=later(()=>{b.classList.remove('mv-walking');roamTimer=later(roam,400+Math.random()*700);},dur);
   },1700+Math.random()*700);
  };
  const resume=(ms=1200)=>{if(!roamTimer)roamTimer=later(roam,ms);};

  // Speak when Bangul walks past.
  const watch=()=>{
   if(b.dataset.state==='locked'||b.dataset.state==='ready'){
    const at=fighter?.at?.();
    if(at&&!busy){
     const p=where(),ratio=(world.offsetHeight/world.offsetWidth)||1,near=Math.hypot(p.x-at.x,(p.y-at.y)*ratio)<NEAR;
     if(near&&!wasNear&&performance.now()-lastSaid>6000)speak(pick(TAUNTS[b.dataset.state]));
     wasNear=near;
    }
   }
   later(watch,350);
  };

  const lunge=screenDir=>reducedNow()||creature.animate([{transform:'translateX(0)'},{transform:`translateX(${screenDir*(facingRight?-1:1)*10}px)`},{transform:'translateX(0)'}],{duration:320,easing:'ease-out'});
  const shake=()=>reducedNow()||creature.animate([{transform:'translateX(0)'},{transform:'translateX(5px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}],{duration:260});

  const attack=()=>{
   if(busy||b.dataset.state==='cleared'||b.dataset.state==='leaving')return;
   if(!stage.ready){speak('아직은 날 못 이겨! 흐흐');status.textContent=stage.name+' 탐구를 먼저 마치고 과학의 힘을 모아 주세요.';return;}
   if(fighting&&fighting!==b)return;
   busy=true;fighting=b;b.dataset.busy='';hits++;const hit=hits,reduced=reducedNow();
   freeze();b.classList.toggle('mv-reduced',reduced);
   meter.textContent='● '.repeat(3-hit)+'○ '.repeat(hit);
   if(hit===3)b.dataset.state='leaving';
   const at=fighter?.at?.(),[hx,hy]=pointPx(stage.x,stage.y),vx=hx+dx,vy=hy+dy,impactY=vy-14,me=where();
   // Bangul and the villain turn to face each other.
   const bangulRight=!!at&&at.x>me.x;
   face(bangulRight);
   fighter?.pose?.(BANGUL.ready,bangulRight);
   const impact=()=>{
    options.sound?.(hit===3?'finish':'hit');
    frameAt(sprite,hit===1?MOLE.hit:hit===2?MOLE.knocked:MOLE.down);shake();
    b.classList.remove('mv-hit');void b.offsetWidth;b.classList.add('mv-hit');
    if(!reduced)burst(vx,impactY,'drop',7);
    speak(['으악!','아야야, 내 밸브!','내 물길이이~!'][hit-1],false,1100);
    status.textContent=stage.name+' 밸브 두더지에게 '+hit+'번째 물방울 파동!';
   };
   const shoot=()=>{
    fighter?.pose?.(BANGUL.shoot,bangulRight);options.sound?.('shoot');
    if(reduced||!at){impact();return;}
    const [bx,by]=pointPx(at.x,at.y),size=world.offsetWidth*.052,ox=bx+(bangulRight?1:-1)*size*.42,oy=by-size*.5;
    const shot=document.createElement('span');shot.className='mv-shot';shot.style.left=ox+'px';shot.style.top=oy+'px';world.append(shot);
    shot.animate([{transform:'translate(-50%,-50%) scale(.5)'},{transform:`translate(calc(-50% + ${vx-ox}px),calc(-50% + ${impactY-oy}px)) scale(1.1)`}],{duration:280,easing:'cubic-bezier(.5,0,.75,0)'}).finished.then(()=>{shot.remove();if(!abort.signal.aborted)impact();},()=>shot.remove());
   };
   const settle=()=>{frameAt(sprite,null);fighter?.pose?.(null);busy=false;fighting=null;delete b.dataset.busy;b.classList.remove('mv-hit');resume();};
   if(reduced){
    shoot();
    if(hit===3)later(()=>finish(true),100);else later(settle,120);
    return;
   }
   later(shoot,140);
   if(hit<3){
    // The villain answers back once; it never changes progress.
    later(()=>{frameAt(sprite,MOLE.lunge);lunge(bangulRight?-1:1);sfx('쾅!');options.sound?.('thud');},760);
    later(()=>hitFighter(me),860);
    later(settle,1150);
   }else{
    later(()=>{
     burst(vx,vy-6,'steam',6);burst(vx,vy,'drop',9);b.classList.add('mv-cleaning');
     creature.animate([{transform:'scale(1)',opacity:1,filter:'brightness(1)'},{transform:'scale(1.12)',opacity:.9,filter:'brightness(1.8)',offset:.25},{transform:'translateY(-14px) scale(.15)',opacity:0,filter:'brightness(2)'}],{duration:520,easing:'ease-in',fill:'forwards'});
     fighter?.pose?.(BANGUL.relief,bangulRight);
    },900);
    later(()=>finish(false),1450);
   }
  };
  const finish=reduced=>{
   const saved=options.preview||recordMapVillainClear(index,token,undefined,options.key);
   b.dataset.state='cleared';b.classList.remove('mv-hit','mv-cleaning');delete b.dataset.busy;label.textContent='물길 정화 완료';meter.textContent='✓';say.classList.remove('show');
   b.setAttribute('aria-label',stage.name+' 밸브 두더지 퇴치 완료');b.setAttribute('aria-disabled','true');
   status.textContent=stage.name+' 밸브 두더지가 사라지고 물길이 맑아졌어요. '+(options.preview?'시연 기록은 저장하지 않아요.':saved?'퇴치 기록을 저장했어요.':'저장하지 못했어요. 이 창에서만 유지돼요.');
   if(!reduced)options.sound?.('success');
   later(()=>{fighter?.pose?.(null);fighting=null;options.onCleared?.();},reduced?0:300);
  };
  b.addEventListener('pointerdown',e=>e.stopPropagation(),{signal:abort.signal});
  b.addEventListener('keydown',e=>{if(e.repeat&&(e.key==='Enter'||e.key===' '))e.preventDefault();},{signal:abort.signal});
  b.addEventListener('click',e=>{e.stopPropagation();attack();},{signal:abort.signal});
  world.append(b);nodes.push(b);targets.push({stage,b,creature,attack,where});
  if(!cleared){roamTimer=later(roam,300+index*450);later(watch,600);}
 });

 const cleanup=()=>{abort.abort();timers.forEach(clearTimeout);nodes.forEach(n=>n.remove());world.querySelectorAll('.mv-shot,.mv-particle').forEach(n=>n.remove());style.remove();status.remove();fighter?.pose?.(null);};
 cleanup.checkContact=()=>{
  if(abort.signal.aborted||fighting||document.hidden||performance.now()<nextHurtAt||document.querySelector('dialog[open]'))return;
  const bounds=fighter?.bounds?.();
  if(!bounds)return;
  const target=targets.find(t=>['locked','ready'].includes(t.b.dataset.state)&&getComputedStyle(t.b).visibility!=='hidden'&&spritesTouch(bounds,t.creature.getBoundingClientRect()));
  if(target)hitFighter(target.where());
 };
 const watchContact=()=>{cleanup.checkContact();options.onProximity?.();later(watchContact,100);};
 later(watchContact,100);
 cleanup.hasNearbyTarget=()=>{
  const at=fighter?.at?.();
  const ratio=world.offsetHeight/world.offsetWidth||1;
  return !!at&&targets.some(t=>{
   if(t.b.dataset.state!=='ready')return false;
   const p=t.where();return Math.hypot(p.x-at.x,(p.y-at.y)*ratio)<=RANGE;
  });
 };
 /** Touch button and Space key share the same reach and combat rules. */
 cleanup.attackNearest=()=>{
  const at=fighter?.at?.();
  if(fighting)return;
  const live=targets.filter(t=>t.b.dataset.state==='ready');
  if(!live.length){tell(targets.some(t=>t.b.dataset.state==='locked')?'탐구를 마치면 밸브 두더지를 물리칠 힘이 생겨요.':'모든 밸브 두더지를 물리쳤어요!');return;}
  const ratio=world.offsetHeight/world.offsetWidth||1;
  const dist=t=>{if(!at)return Infinity;const p=t.where();return Math.hypot(p.x-at.x,(p.y-at.y)*ratio);};
  const near=live.reduce((a,t)=>dist(t)<dist(a)?t:a);
  if(dist(near)>RANGE){tell(near.stage.name+' 밸브 두더지 가까이 걸어가서 공격 버튼을 눌러요.');return;}
  near.attack();
 };
 return cleanup;
}

const STYLES=`
.mv-target{position:absolute;z-index:15;transform:translate(-50%,-50%);width:124px;min-height:132px;padding:4px;background:transparent;border:0;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;touch-action:manipulation;pointer-events:auto;color:#fff;font:16px/1.2 var(--font-display);isolation:isolate}
.mv-target:focus-visible{outline:4px solid #fff59b;outline-offset:4px;border-radius:15px}
.mv-creature{position:relative;display:block;width:104px;height:104px;transform-origin:50% 90%;transition:scale .15s}
.mv-sprite{position:absolute;inset:0;background:url('/assets/v2/map-villain-mole.webp') 0 0/400% 200% no-repeat;animation:mv-idle 2.4s step-end infinite,mv-bob 1.2s ease-in-out infinite;transform-origin:50% 95%;
 filter:drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 6px #7b2fbf) drop-shadow(0 5px 3px #0009)}
.mv-walking .mv-sprite{animation:mv-walk .5s step-end infinite,mv-step .25s ease-in-out infinite alternate}
.mv-crank .mv-sprite{animation:mv-crank .36s step-end infinite,mv-rattle .12s linear infinite alternate}
.mv-target.mv-acting .mv-sprite{animation:none}
.mv-murk{position:absolute;left:50%;top:84px;width:150px;height:48px;transform:translate(-50%,0);border-radius:50%;pointer-events:none;
 background:radial-gradient(ellipse at 50% 50%,#3b2149e6 0 30%,#4e3a2ccc 55%,#5b4a3a00 72%);animation:mv-murk 2.2s ease-in-out infinite;transition:opacity .5s,filter .5s}
.mv-murk i{position:absolute;bottom:40%;width:9px;height:9px;border-radius:50%;background:#6f4d7fd9;box-shadow:inset -2px -2px #2c173a;animation:mv-bubble 1.8s ease-in infinite}
.mv-murk i:nth-child(1){left:30%}.mv-murk i:nth-child(2){left:52%;animation-delay:.6s}.mv-murk i:nth-child(3){left:68%;animation-delay:1.2s}
.mv-cleaning .mv-murk{filter:hue-rotate(160deg) saturate(2) brightness(1.8);opacity:0}
.mv-target[data-state=cleared] .mv-murk{display:block;opacity:1;background:radial-gradient(ellipse,#bff4ffcc 0 30%,#6fd2f080 55%,#6fd2f000 72%);animation:none}
.mv-target[data-state=cleared] .mv-murk i{display:none}
.mv-say{position:absolute;bottom:calc(100% - 18px);left:50%;transform:translate(-50%,6px) scale(.85);min-width:190px;max-width:240px;padding:7px 12px;border:3px solid #5a2a7a;border-radius:16px;background:#fff;color:#3a1752;font:17px/1.25 var(--font-display);text-align:center;word-break:keep-all;box-shadow:0 4px 0 #3a175244;opacity:0;pointer-events:none;transition:opacity .18s,transform .22s cubic-bezier(.34,1.56,.64,1);z-index:2}
.mv-say:after{content:'';position:absolute;left:50%;top:100%;width:14px;height:14px;background:#fff;border:3px solid #5a2a7a;border-top:0;border-left:0;transform:translate(-50%,-7px) rotate(45deg)}
.mv-say b{display:block;font-weight:400}
.mv-say small{display:block;margin-top:3px;font-size:16px;color:#b2421c}
.mv-say.show{opacity:1;transform:translate(-50%,0) scale(1)}
.mv-sfx{position:absolute;left:50%;top:6px;z-index:3;font:20px/1 var(--font-display);color:#ffe066;-webkit-text-stroke:4px #4a1d63;paint-order:stroke fill;pointer-events:none;white-space:nowrap}
.mv-label{display:none;background:#236754;border:2px solid #b8f2d8;border-radius:12px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 0 #12303266}
.mv-meter{display:none;font-size:16px;letter-spacing:1px;color:#ff6b5b;-webkit-text-stroke:3px #3a1752;paint-order:stroke fill}
.mv-target[data-state=ready] .mv-meter,.mv-target[data-state=leaving] .mv-meter{display:block}
.mv-wave{position:absolute;top:44px;width:40px;height:40px;border:5px solid #9effea;border-radius:50%;opacity:0;pointer-events:none}
.mv-target[data-state=ready] .mv-wave{animation:mv-ready 1.6s ease-out infinite}
.mv-hit .mv-wave{animation:mv-burst .45s ease-out}
.mv-target[data-state=cleared]{min-height:48px;cursor:default}
.mv-target[data-state=cleared] .mv-creature,.mv-target[data-state=cleared] .mv-wave,.mv-target[data-state=cleared] .mv-say{display:none}
.mv-target[data-state=cleared] .mv-label{display:block}
.mv-target[data-state=cleared] .mv-murk{top:2px}
.mv-shot{position:absolute;z-index:16;width:22px;height:22px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 35% 30%,#fff 0 18%,#9fe7ff 30%,#2f9fd8 75%);box-shadow:0 0 10px #8fe3ff,0 0 0 3px #d9f7ff88;pointer-events:none}
.mv-particle{position:absolute;z-index:16;pointer-events:none;border-radius:50%}
.mv-drop{width:9px;height:9px;background:radial-gradient(circle at 35% 30%,#fff,#5cc4f0 60%,#2f8fc8)}
.mv-steam{width:18px;height:18px;background:radial-gradient(circle,#fffffff2 30%,#ffffff00 70%)}
.mv-sludge{width:10px;height:10px;background:radial-gradient(circle at 35% 30%,#8a6a9a,#4a2a5a 60%,#2b1736)}
.mv-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@keyframes mv-idle{0%{background-position:0 0}60%{background-position:66.667% 0}80%{background-position:0 0}90%{background-position:100% 0}}
@keyframes mv-walk{0%{background-position:33.333% 0}50%{background-position:0 0}}
@keyframes mv-crank{0%{background-position:66.667% 0}50%{background-position:0 100%}}
@keyframes mv-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes mv-step{0%{transform:translateY(0) rotate(-3deg)}100%{transform:translateY(-6px) rotate(3deg)}}
@keyframes mv-rattle{0%{transform:translate(-2px,0) rotate(-4deg)}100%{transform:translate(2px,-2px) rotate(4deg)}}
@keyframes mv-murk{0%,100%{transform:translate(-50%,0) scale(1)}50%{transform:translate(-50%,0) scale(1.08,1.15)}}
@keyframes mv-bubble{0%{transform:translateY(0) scale(.4);opacity:0}30%{opacity:1}100%{transform:translateY(-16px) scale(1);opacity:0}}
@keyframes mv-ready{0%{opacity:.7;transform:scale(.6)}100%{opacity:0;transform:scale(2)}}
@keyframes mv-burst{0%{opacity:1;transform:scale(.4)}100%{opacity:0;transform:scale(2.3)}}
.mv-reduced .mv-sprite,.mv-reduced .mv-wave,.mv-reduced .mv-murk,.mv-reduced .mv-murk i{animation:none!important}
@media(prefers-reduced-motion:reduce){.mv-sprite,.mv-wave,.mv-murk,.mv-murk i{animation:none!important}.mv-say{transition:none}}
`;
