/** Map-only reward. Never writes learning progress or unlocks a lesson. */
// Sprite sheets: map-villain-mole.webp is 4×2 frames, bangul-combat-sheet.webp is 4×1 frames (256 px each).
const MOLE={idle:0,step:1,taunt:2,guard:3,lunge:4,hit:5,knocked:6,down:7};
const BANGUL={ready:0,shoot:1,hurt:2,relief:3};
const RANGE=24; // % of map width: how close Bangul must be for the Space key to reach a villain.

export function mountMapVillains(world, options) {
 const abort=new AbortController(), timers=new Set(), nodes=[], targets=[];
 const style=document.createElement('style');style.textContent=STYLES;world.append(style);
 const status=document.createElement('span');status.className='mv-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');world.append(status);
 let stored={};try{const raw=JSON.parse(localStorage.getItem(options.key)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))stored=raw;}catch{}
 const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);};
 const reducedNow=()=>options.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const touch=matchMedia('(pointer: coarse)').matches;
 const fighter=options.fighter;
 const tell=message=>{status.textContent=message;options.notify?.(message);};
 // Load both sheets up front so the first pose change never shows an empty frame.
 for(const src of ['/assets/v2/map-villain-mole.webp','/assets/v2/bangul-combat-sheet.webp'])Object.assign(new Image(),{src});
 let fighting=null;

 const frameAt=(el,f)=>{el.style.backgroundPosition=f==null?'':`${(f%4)*100/3}% ${Math.floor(f/4)*100}%`;el.closest('.mv-target')?.classList.toggle('mv-acting',f!=null);};
 const pointPx=(x,y)=>[x/100*world.offsetWidth,y/100*world.offsetHeight];
 const burst=(x,y,kind,count)=>{
  for(let i=0;i<count;i++){
   const p=document.createElement('span');p.className='mv-particle mv-'+kind;p.style.left=x+'px';p.style.top=y+'px';world.append(p);
   const angle=(kind==='steam'?-Math.PI/2:0)+(Math.random()-.5)*(kind==='steam'?1.6:Math.PI*2),dist=(kind==='steam'?38:26)+Math.random()*22;
   p.animate([{transform:'translate(-50%,-50%) scale(.5)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(angle)*dist}px),calc(-50% + ${Math.sin(angle)*dist}px)) scale(${kind==='steam'?1.6:.9})`,opacity:0}],{duration:kind==='steam'?700:480,easing:'cubic-bezier(.16,1,.3,1)'}).finished.finally(()=>p.remove());
  }
 };

 options.stages.forEach((stage,index)=>{
  const token=stage.token||'pending';const cleared=stage.ready&&stored[index]===token;
  const b=document.createElement('button');b.type='button';b.className='mv-target';b.style.left=stage.x+'%';b.style.top=stage.y+'%';b.dataset.stage=String(index);b.dataset.state=cleared?'cleared':stage.ready?'ready':'locked';
  b.innerHTML='<span class="mv-wave" aria-hidden="true"></span><span class="mv-creature" aria-hidden="true"><span class="mv-shadow"></span><span class="mv-sprite"></span></span><span class="mv-label"></span><span class="mv-meter" aria-hidden="true">● ● ●</span>';
  const label=b.querySelector('.mv-label'),meter=b.querySelector('.mv-meter'),creature=b.querySelector('.mv-creature'),sprite=b.querySelector('.mv-sprite');let hits=0,busy=false;
  const readyText=touch?'눌러서 공격!':'스페이스 공격!';
  const describe=()=>{label.textContent=cleared?'퇴치 완료':stage.ready?readyText:'탐구 후 힘 충전';b.setAttribute('aria-label',stage.name+' 밸브 두더지 악당 · '+(cleared?'퇴치 완료':stage.ready?'물방울 파동으로 세 번 공격':'탐구를 완료하면 공격할 수 있어요'));};describe();
  if(cleared){b.disabled=true;meter.textContent='✓';}
  const lunge=dir=>reducedNow()||creature.animate([{transform:'translateX(0)'},{transform:`translateX(${dir*-10}px)`},{transform:'translateX(0)'}],{duration:320,easing:'ease-out'});
  const shake=()=>reducedNow()||creature.animate([{transform:'translateX(0)'},{transform:'translateX(5px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}],{duration:260});

  const attack=()=>{
   if(busy||b.dataset.state==='cleared'||b.dataset.state==='leaving')return;
   if(!stage.ready){tell(stage.name+' 탐구를 먼저 마치고 과학의 힘을 모아 주세요.');return;}
   if(fighting&&fighting!==b)return;
   busy=true;fighting=b;b.dataset.busy='';hits++;const hit=hits,reduced=reducedNow();
   b.classList.toggle('mv-reduced',reduced);
   meter.textContent='● '.repeat(3-hit)+'○ '.repeat(hit);
   if(hit===3){b.dataset.state='leaving';label.textContent='정화 성공!';}
   const at=fighter?.at?.(),[vx,vy]=pointPx(stage.x,stage.y),impactY=vy-12;
   // Bangul faces the villain: flip when the villain is on Bangul's left.
   const flip=!!at&&at.x>stage.x;
   fighter?.pose?.(BANGUL.ready,flip);
   const impact=()=>{
    options.sound?.(hit===3);
    frameAt(sprite,hit===1?MOLE.hit:hit===2?MOLE.knocked:MOLE.down);shake();
    b.classList.remove('mv-hit');void b.offsetWidth;b.classList.add('mv-hit');
    if(!reduced)burst(vx,impactY,'drop',7);
    status.textContent=stage.name+' 밸브 두더지에게 '+hit+'번째 물방울 파동!';
   };
   const shoot=()=>{
    fighter?.pose?.(BANGUL.shoot,flip);
    if(reduced||!at){impact();return;}
    const [bx,by]=pointPx(at.x,at.y),size=world.offsetWidth*.052,ox=bx+(flip?-1:1)*size*.42,oy=by-size*.5;
    const shot=document.createElement('span');shot.className='mv-shot';shot.style.left=ox+'px';shot.style.top=oy+'px';world.append(shot);
    shot.animate([{transform:'translate(-50%,-50%) scale(.5)'},{transform:`translate(calc(-50% + ${vx-ox}px),calc(-50% + ${impactY-oy}px)) scale(1.1)`}],{duration:280,easing:'cubic-bezier(.5,0,.75,0)'}).finished.finally(()=>{shot.remove();impact();});
   };
   if(reduced){
    shoot();
    if(hit===3)later(()=>finish(true),100);
    else later(()=>{frameAt(sprite,null);fighter?.pose?.(null);busy=false;fighting=null;delete b.dataset.busy;b.classList.remove('mv-hit');},120);
    return;
   }
   later(shoot,140);
   if(hit<3){
    // The villain answers back once; it never changes progress.
    later(()=>{frameAt(sprite,MOLE.lunge);lunge(flip?-1:1);},760);
    later(()=>{fighter?.pose?.(BANGUL.hurt,flip);fighter?.shake?.();},860);
    later(()=>{frameAt(sprite,null);fighter?.pose?.(null);busy=false;fighting=null;delete b.dataset.busy;b.classList.remove('mv-hit');},1150);
   }else{
    later(()=>{
     burst(vx,vy-6,'steam',6);burst(vx,vy,'drop',9);
     creature.animate([{transform:'scale(1)',opacity:1,filter:'brightness(1)'},{transform:'scale(1.12)',opacity:.9,filter:'brightness(1.8)',offset:.25},{transform:'translateY(-14px) scale(.15)',opacity:0,filter:'brightness(2)'}],{duration:520,easing:'ease-in',fill:'forwards'});
     fighter?.pose?.(BANGUL.relief,flip);
    },900);
    later(()=>finish(false),1450);
   }
  };
  const finish=reduced=>{
   let saved=true;if(!options.preview){try{stored[index]=token;localStorage.setItem(options.key,JSON.stringify(stored));}catch{saved=false;}}
   b.dataset.state='cleared';b.classList.remove('mv-hit');delete b.dataset.busy;label.textContent='퇴치 완료';meter.textContent='✓';
   b.setAttribute('aria-label',stage.name+' 악당 퇴치 완료');b.setAttribute('aria-disabled','true');
   status.textContent=stage.name+' 밸브 두더지가 사라졌어요. '+(options.preview?'시연 기록은 저장하지 않아요.':saved?'퇴치 기록을 저장했어요.':'저장하지 못했어요. 이 창에서만 유지돼요.');
   later(()=>{fighter?.pose?.(null);fighting=null;},reduced?0:300);
  };
  b.addEventListener('pointerdown',e=>e.stopPropagation(),{signal:abort.signal});
  b.addEventListener('keydown',e=>{if(e.repeat&&(e.key==='Enter'||e.key===' '))e.preventDefault();},{signal:abort.signal});
  b.addEventListener('click',e=>{e.stopPropagation();attack();},{signal:abort.signal});
  world.append(b);nodes.push(b);targets.push({stage,b,attack});
 });

 const cleanup=()=>{abort.abort();timers.forEach(clearTimeout);nodes.forEach(n=>n.remove());world.querySelectorAll('.mv-shot,.mv-particle').forEach(n=>n.remove());style.remove();status.remove();fighter?.pose?.(null);};
 /** Space key: attack the closest villain that Bangul can reach. */
 cleanup.attackNearest=()=>{
  const at=fighter?.at?.();
  if(fighting)return;
  const live=targets.filter(t=>t.b.dataset.state==='ready');
  if(!live.length){tell(targets.some(t=>t.b.dataset.state==='locked')?'탐구를 마치면 밸브 두더지를 물리칠 힘이 생겨요.':'모든 밸브 두더지를 물리쳤어요!');return;}
  const ratio=world.offsetHeight/world.offsetWidth||1;
  const dist=t=>at?Math.hypot(t.stage.x-at.x,(t.stage.y-at.y)*ratio):Infinity;
  const near=live.reduce((a,t)=>dist(t)<dist(a)?t:a);
  if(dist(near)>RANGE){tell(near.stage.name+' 밸브 두더지 가까이 걸어가서 스페이스를 눌러요.');return;}
  near.attack();
 };
 return cleanup;
}

const STYLES=`
.mv-target{position:absolute;z-index:15;transform:translate(-50%,-50%);width:112px;min-height:128px;padding:4px;background:transparent;border:0;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;touch-action:manipulation;pointer-events:auto;color:#fff;font:16px/1.2 var(--font-display);isolation:isolate}
.mv-target:focus-visible{outline:4px solid #fff59b;outline-offset:4px;border-radius:15px}
.mv-label{background:#1f4a4d;border:2px solid #d6b45c;border-radius:12px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 0 #12303266}
.mv-creature{position:relative;display:block;width:92px;height:92px;transform-origin:50% 90%}
.mv-shadow{position:absolute;left:18%;right:18%;bottom:2px;height:12%;border-radius:50%;background:#16302c55;filter:blur(1px)}
.mv-sprite{position:absolute;inset:0;background:url('/assets/v2/map-villain-mole.webp') 0 0/400% 200% no-repeat;animation:mv-idle 1.8s step-end infinite,mv-bob 1.8s ease-in-out infinite;transform-origin:50% 95%}
.mv-target.mv-acting .mv-sprite{animation:none}
.mv-target[data-state=locked] .mv-sprite{background-position:100% 0;animation:mv-bob 2.6s ease-in-out infinite;filter:saturate(.55) brightness(.9)}
.mv-meter{font-size:16px;color:#ffeaa6;text-shadow:0 1px 3px #172840}
.mv-wave{position:absolute;top:36px;width:34px;height:34px;border:5px solid #9effea;border-radius:50%;opacity:0;pointer-events:none}
.mv-target[data-state=ready] .mv-wave{animation:mv-ready 1.8s ease-out infinite}
.mv-hit .mv-wave{animation:mv-burst .45s ease-out}
.mv-target[data-state=cleared]{min-height:48px;cursor:default}
.mv-target[data-state=cleared] .mv-creature,.mv-target[data-state=cleared] .mv-wave{display:none}
.mv-target[data-state=cleared] .mv-label{background:#236754;border-color:#b8f2d8}
.mv-shot{position:absolute;z-index:16;width:22px;height:22px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 35% 30%,#fff 0 18%,#9fe7ff 30%,#2f9fd8 75%);box-shadow:0 0 10px #8fe3ff,0 0 0 3px #d9f7ff88;pointer-events:none}
.mv-particle{position:absolute;z-index:16;pointer-events:none;border-radius:50%}
.mv-drop{width:9px;height:9px;background:radial-gradient(circle at 35% 30%,#fff,#5cc4f0 60%,#2f8fc8)}
.mv-steam{width:18px;height:18px;background:radial-gradient(circle,#fffffff2 30%,#ffffff00 70%)}
.mv-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@keyframes mv-idle{0%{background-position:0 0}25%{background-position:33.333% 0}50%{background-position:0 0}75%{background-position:66.667% 0}}
@keyframes mv-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes mv-ready{0%{opacity:.7;transform:scale(.6)}100%{opacity:0;transform:scale(2)}}
@keyframes mv-burst{0%{opacity:1;transform:scale(.4)}100%{opacity:0;transform:scale(2.3)}}
.mv-reduced .mv-sprite,.mv-reduced .mv-wave{animation:none!important}
@media(prefers-reduced-motion:reduce){.mv-sprite,.mv-wave{animation:none!important}}
`;
