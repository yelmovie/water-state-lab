import {state,save} from './state.js';
import {fieldMissions,chapterState,fieldAction,fieldReady,fieldProgress} from './fieldwork-model.js';
import {btn,buddy,icon,esc,toast,modal,propArt} from './ui.js';
import {playCue} from './sound.js';

let cleanups=[];
export function cleanupFieldwork(){cleanups.splice(0).forEach(fn=>fn());}
export function fieldChapter(n){return state.fieldwork.chapters[n]??=chapterState(n);}
export function hasFieldSeal(n){return fieldReady(n,state.fieldwork.chapters[n]);}
export function startFieldwork(n,pending,ctx){state.fieldwork.active=n;state.fieldwork.pending=pending;fieldChapter(n);save();ctx.render();}
const names={water:'물',ice:'얼음',warm:'따뜻한 받침',time:'시간 보내기',cold:'냉각팩',condition:'찾은 조건',weight:'100 g 추',melt:'녹인 뒤 사진',pack:'냉각팩',tray:'물 받이',destination:'줄어든 물',A:'A의 줄어든 물',B:'B의 줄어든 물',lens:'돋보기'};
const destinations={tall:'길쭉한 그릇',wide:'넓은 그릇',freeze:'물 → 얼음',melt:'얼음 → 물',evaporate:'물 → 수증기',condense:'수증기 → 물',first:'처음',middle:'얼린 뒤',last:'녹인 뒤',balance:'저울',air:'공기 중',surface:'A 표면',inside:'B 물속',level:'두 수위',A:'A컵',B:'B컵',plate:'금속판',under:'판 아래'};
function setup(n){
 let items=[],targets=[];
 const item=(id,x,y,art,label=names[id])=>items.push({id,x,y,art,label,w:110,h:90});
 const target=(id,x,y,label=destinations[id],w=150,h=86)=>targets.push({id,x,y,label,w,h});
 if(n===1){item('water',110,100,1);item('ice',110,265,2);target('tall',365,205,undefined,125,240);target('wide',570,205,undefined,200,240);}
 if(n===2){item('warm',100,60,6);item('time',100,185,-2);item('cold',100,310,5);['freeze','melt','evaporate','condense'].forEach((id,k)=>target(id,450,62+k*87,undefined,330,68));}
 if(n===3){item('ice',105,65,2,'얼린 뒤\n높이 65.4 · 100 g');item('melt',105,190,0,'녹인 뒤\n높이 60 · 100 g');item('water',105,315,0,'처음\n높이 60 · 100 g');item('weight',650,70,-1);['first','middle','last'].forEach((id,k)=>target(id,390,64+k*111,undefined,270,88));target('balance',620,290,undefined,140,130);}
 if(n===5){item('destination',120,330,0);target('air',600,355,'공기 중\n보이지 않는 수증기',220,60);}
 if(n===6){item('lens',650,70,7);item('A',130,320,0);item('B',345,320,0);target('air',590,345,'공기 중의 수증기',190,65);target('surface',210,120,undefined,145,100);target('inside',450,190,undefined,145,130);target('level',330,255,undefined,145,60);}
 if(n===7){item('pack',105,170,5);target('A',320,195,'A컵',160,210);target('B',550,195,'B컵',160,210);if([0,1].every(k=>fieldChapter(7).tested.some(t=>t.cold===k))){item('condition',105,320,7);target('identity',320,355,'컵 이름',180,60);target('cold',550,355,'차가운 표면',180,60);}}
 if(n===8){item('cold',100,105,5);item('tray',100,285,9,'물 받이');target('plate',475,110,'금속판',240,75);target('under',475,315,'판 아래',240,80);}
 if(n===10){item('time',100,75,-2);item('cold',625,75,5);target('evaporate',230,245,undefined,210,100);target('condense',500,245,undefined,210,100);}
 return {items,targets};
}
function alternatives(n){
 const {items,targets}=setup(n);
 if(n===4)return '<label class="activity-range">물 채움<input id="field-fill" type="range" min="40" max="100" step="1" value="'+fieldChapter(n).setting+'"></label>';
 if(n===9)return '<label>출발<select id="field-from">'+['냉각판','경사판','깔때기','연결관'].map((v,k)=>`<option value="${k}">${v}</option>`).join('')+'</select></label><label>도착<select id="field-to">'+['경사판','깔때기','연결관','물통'].map((v,k)=>`<option value="${k+1}">${v}</option>`).join('')+'</select></label>'+btn('물길 연결','field-connect');
 const select=items.length?'<label>움직일 물체<select id="field-item">'+items.map(i=>`<option value="${i.id}">${esc(i.label)}</option>`).join('')+'</select></label>':'';
 const places=targets.filter(t=>n!==6||t.id==='air').map(t=>btn(t.label,'field-place-'+t.id)).join('');
 return select+places+(n===5?btn('같은 물 넓게 펴기','field-spread'):n===6?['surface','inside','level'].map(k=>btn(destinations[k]+' 확대','field-inspect-'+k)).join(''):'');
}
export function fieldworkView(n){
 const m=fieldMissions[n],c=fieldChapter(n),done=fieldReady(n,c),test=![1,9].includes(n),[found,total]=fieldProgress(n,c);
 return `<div class="activity fieldwork-activity activity-${n}"><div class="activity-scene"><div class="activity-stage-caption">현장 의뢰 · ${m.title}</div><div class="expedition-board"><canvas id="field-canvas" width="720" height="400" role="img" aria-label="${esc(m.goal)}"></canvas></div><div class="challenge-status" role="status" aria-live="polite">${esc(c.message||"물체를 끌어 놓거나 버튼 대체 조작을 열어 봐.")}</div>${c.tested.length?`<div class="activity-records">${c.tested.slice(-3).map((t,k)=>`<span class="activity-record">시험 ${Math.max(1,c.tested.length-2)+k} · ${n===4?`물 ${t.value}% → 얼음 ${t.amount}%`:n===7?`${t.cold===0?'A':'B'}에 냉각팩`:n===5?'같은 시간의 두 자국 비교':t.ok?'물이 받이에 모임':'모인 물 없음'}</span>`).join('')}</div>`:''}</div><aside class="activity-tools quest-panel"><span class="eyebrow">관찰한 것을 써 볼 차례</span><h3>${m.problem}</h3><p class="challenge-goal">확인한 단서 <b>${found} / ${total}</b></p>${n===4?`<label class="activity-range">채운 물 <output>${c.setting}%</output><input id="field-fill-main" type="range" min="40" max="100" step="1" value="${c.setting}"></label>`:''}${test?btn(({2:'변신길 시험하기',3:'사진 순서 확인하기',4:'얼려서 비교하기',5:'같은 시간 뒤 비교하기',6:'관찰 결과 확인하기',7:'같은 시간 뒤 비교하기',8:'물 모이는지 시험하기',10:'마지막 물길 시험하기'})[n],'field-test','primary'):''}<div class="quest-prize">${icon('star',20)}<div><b>${m.reward}</b><p>${m.next}</p></div></div>${btn(done?'도장 받고 이어가기':'현장 문제를 해결해요','field-finish','gold',!done)}<details class="expedition-choices"><summary>버튼으로 조작하기</summary>${alternatives(n)}</details>${btn('실험 다시 살펴보기','field-back','quiet')}<p class="activity-science">${n===5?'같은 물·같은 바닥·같은 방의 학습용 비교야. 실제 마르는 시간은 환경에 따라 달라.':n===4?'얼 때 필요한 공간을 보는 단순 모형이야. 실제 배관 안전 수치가 아니야.':n===9?'물통으로 가는 중력 물길을 연결하는 그림 모형이야.':'시간과 물의 양은 비교를 위한 가상 모형이야. 수증기는 눈에 보이지 않아.'}</p></aside></div>`;
}
export function handleFieldwork(action,ctx){
 if(!action.startsWith('field-'))return false;
 const n=state.fieldwork.active||Number(state.route);if(!fieldMissions[n])return true;
 if(action==='field-back'){state.fieldwork.active=0;save();ctx.render();return true;}
 if(action==='field-finish'||action==='field-claim'){
  if(!hasFieldSeal(n)){toast('조건을 바꿔 보고, 관찰한 근거로 문제를 해결해 줘.');return true;}
  if(action==='field-finish'&&[1,3,5,7,9].includes(n)){
   const m=fieldMissions[n];modal('새로운 발견을 남겼어!',`<div class="reward-modal"><div class="reward-character">${buddy('celebrate')}${propArt(['magnifier','ice','beaker','icepack','seedling'][Math.floor((n-1)/2)])}</div><span class="eyebrow">FIELD NOTE ${String(n).padStart(2,'0')}</span><h3>${m.reward}</h3><div class="reward-proof">${m.ability}</div><p>${m.next}</p>${btn('도장을 여권에 넣고 출발','field-claim','primary wide')}</div>`);return true;
  }
  document.querySelector('#dialog')?.close();
  const pending=state.fieldwork.pending;state.fieldwork.active=0;state.fieldwork.pending='';save();playCue('success');
  if(pending==='field-ending')ctx.finishEnding();else ctx.baseAction(pending);
  return true;
 }
 let command,payload={};
 if(action==='field-test')command='test';
 if(action==='field-spread'){let c=fieldChapter(n);for(let cell=0;cell<24;cell++)c=fieldAction(n,c,'spread',{cell});state.fieldwork.chapters[n]=c;save();ctx.render();return true;}
 if(action.startsWith('field-place-')){command='place';payload={item:document.getElementById('field-item')?.value,target:action.slice(12)};}
 if(action.startsWith('field-inspect-')){command='inspect';payload={site:action.slice(14)};}
 if(action==='field-connect'){command='connect';payload={from:+document.getElementById('field-from').value,to:+document.getElementById('field-to').value};}
 if(command){state.fieldwork.chapters[n]=fieldAction(n,fieldChapter(n),command,payload);save();ctx.render();}
 return true;
}
export function bindFieldwork(n,ctx){
 cleanupFieldwork();const canvas=document.getElementById('field-canvas');if(!canvas)return;
 const g=canvas.getContext('2d'),assets={},layout=setup(n),f=state.fieldwork;
 let drag=null,activePointer=null,lineStart=null,brush=false,frame;
 const get=()=>fieldChapter(n);
 for(const [key,url] of [['equipment','equipment-atlas.webp'],['workshop','workshop-atlas.webp'],['buddy','buddy-poses.webp']]){const im=new Image();im.src='/assets/v2/'+url;assets[key]=im;}
 const act=(a,p={})=>{f.chapters[n]=fieldAction(n,get(),a,p);};
 const pos=e=>{const b=canvas.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*720,y:(e.clientY-b.top)/b.height*400};};
 const inside=(p,t)=>Math.abs(p.x-t.x)<t.w/2&&Math.abs(p.y-t.y)<t.h/2;
 const nodes=[[165,55],[300,135],[450,210],[450,280],[450,350]];
 const nearest=p=>{let i=nodes.findIndex(([x,y])=>Math.hypot(x-p.x,y-p.y)<45);return i;};
 const spread=p=>{if(p.x>=390&&p.x<=690&&p.y>=85&&p.y<=290)act('spread',{cell:Math.min(47,Math.floor((p.y-85)/205*6)*8+Math.min(7,Math.floor((p.x-390)/300*8)))});};
 const updateSetting=p=>act('setting',{value:100-(Math.max(65,Math.min(295,p.y))-65)/230*60});
 canvas.onpointerdown=e=>{if(e.button!==0||activePointer!==null)return;e.preventDefault();activePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);const p=pos(e);
  if(n===4&&p.x>290&&p.x<400){drag={id:'fill'};updateSetting(p);return;}
  if(n===5&&p.x>390&&p.y<300){brush=true;spread(p);return;}
  if(n===9){lineStart=nearest(p);return;}
  const item=[...layout.items].reverse().find(t=>inside(p,t));if(item)drag={...item,dx:p.x-item.x,dy:p.y-item.y};
 };
 canvas.onpointermove=e=>{if(activePointer!==e.pointerId)return;const p=pos(e);if(brush)spread(p);if(drag?.id==='fill')updateSetting(p);else if(drag){drag.x=p.x-drag.dx;drag.y=p.y-drag.dy;if(n===6&&drag.id==='lens'){const t=layout.targets.find(t=>t.id!=='air'&&inside(p,t));if(t)act('inspect',{site:t.id});}}};
 const finish=e=>{if(activePointer!==e.pointerId)return;activePointer=null;const p=pos(e);
  if(e.type!=='pointercancel'){
   if(n===9&&lineStart>=0)act('connect',{from:lineStart,to:nearest(p)});
   else if(drag&&drag.id!=='fill'){const t=layout.targets.find(t=>inside(p,t));if(t){if(drag.id==='lens')act('inspect',{site:t.id});else act('place',{item:drag.id,target:t.id});}}
  }
  drag=null;lineStart=null;brush=false;save();ctx.render();
 };
 canvas.onpointerup=finish;canvas.onpointercancel=finish;
 for(const id of ['field-fill','field-fill-main']){const input=document.getElementById(id);if(input){input.oninput=()=>{act('setting',{value:+input.value});const out=input.parentElement.querySelector('output');if(out)out.textContent=input.value+'%';};input.onchange=()=>{save();ctx.render();};cleanups.push(()=>{input.oninput=input.onchange=null;});}}
 function text(str,x,y,size=22,color='#234f59',align='center'){size=Math.max(22,size);g.font=`${size}px Jua, system-ui, sans-serif`;g.fillStyle=color;g.textAlign=align;g.textBaseline='middle';const lines=String(str).split('\n');lines.forEach((line,i)=>g.fillText(line,x,y+(i-(lines.length-1)/2)*size*1.15));}
 function panel(x,y,w,h,fill='#fffdf3',stroke='#c8d5c9'){g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=2;g.beginPath();g.roundRect(x,y,w,h,16);g.fill();g.stroke();}
 function art(index,x,y,w=100,type='equipment'){const im=assets[type];if(!im?.complete||!im.naturalWidth)return;const cols=type==='buddy'?4:3,rows=type==='buddy'?4:type==='workshop'?2:3,sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;g.drawImage(im,index%cols*sw,Math.floor(index/cols)*sh,sw,sh,x-w/2,y-w/2,w,w);}
 function cup(x,y,w,h,amount=70,ice=false){
  const image=assets.equipment;if(image?.complete&&image.naturalWidth){const sw=image.naturalWidth/3,sh=image.naturalHeight/3;g.drawImage(image,sw*.12,sh*.07,sw*.76,sh*.86,x-w*.6,y-h*1.04,w*1.2,h*1.1);}
  const level=Math.max(0,Math.min(100,amount))/100,bottom=y-9,top=bottom-(h-22)*level;
  if(level){g.save();g.globalAlpha=.58;const water=g.createLinearGradient(x,top,x,bottom);water.addColorStop(0,ice?'#c4edfa':'#75d7eb');water.addColorStop(1,ice?'#9ad2e7':'#208ead');g.fillStyle=water;g.beginPath();g.moveTo(x-w*.43,top);g.lineTo(x+w*.43,top);g.lineTo(x+w*.40,bottom-5);g.quadraticCurveTo(x,bottom+8,x-w*.4,bottom-5);g.closePath();g.fill();g.globalAlpha=1;g.strokeStyle=ice?'#d4f8ff':'#349db5';g.lineWidth=2;g.beginPath();g.ellipse(x,top,w*.43,Math.max(3,w*.055),0,0,Math.PI*2);g.stroke();g.restore();}
 }
 function clock(x,y,r=25){g.strokeStyle='#b58736';g.lineWidth=4;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.moveTo(x,y-r*.7);g.lineTo(x,y);g.lineTo(x+r*.5,y+r*.3);g.stroke();}
 function arrow(x1,y1,x2,y2,color='#56a6b5'){g.strokeStyle=color;g.fillStyle=color;g.lineWidth=5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1);g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-14*Math.cos(a-.5),y2-14*Math.sin(a-.5));g.lineTo(x2-14*Math.cos(a+.5),y2-14*Math.sin(a+.5));g.fill();}
 function draw(time){
  const c=get();g.clearRect(0,0,720,400);g.fillStyle='#fbf6e9';g.fillRect(0,0,720,400);
  for(const t of layout.targets){const hit=drag&&drag.id!=='fill'&&inside(drag,t),filled=Object.values(c.moves).includes(t.id);panel(t.x-t.w/2,t.y-t.h/2,t.w,t.h,hit?'#e3f6eb':filled?'#eef7ed':'#fffdf3',hit?'#25867b':'#c5d1c4');text(t.label,t.x,t.y+t.h/2-17,18);}
  if(n===1){for(const [key,x,w] of [['tall',365,75],['wide',570,155]]){if(c.marks.includes('water-'+key))cup(x,240,w,140,8500/w/1.4);else cup(x,240,w,140,0);if(c.marks.includes('ice-'+key))art(2,x,135,65);}text('같은 양의 물',465,32,22);}
  if(n===2||n===10){const keys=n===2?['freeze','melt','evaporate','condense']:['evaporate','condense'];keys.forEach(k=>{const t=layout.targets.find(t=>t.id===k),tool=c.moves[k];if(tool==='time')clock(t.x-95,t.y-4,20);else if(tool)art(tool==='cold'?5:6,t.x-95,t.y-4,52);if(c.marks.includes(k))text('연결됨',t.x+95,t.y-6,18,'#23755e');else if(c.message&&tool)text('변화 확인',t.x+95,t.y-6,17,'#ae6f3c');});if(n===10){text('온실로 돌아가는 물',360,350,24);text('수증기는 눈에 보이지 않아',360,385,18);}}
  if(n===3){for(const [id,to] of Object.entries(c.moves)){const t=layout.targets.find(t=>t.id===to);if(!t)continue;if(id==='weight'){panel(t.x-43,t.y-45,86,70,'#d9e1db');text('100 g',t.x,t.y-7,22);}else{art(id==='ice'?2:0,t.x-50,t.y-5,65);text(id==='ice'?'높이 65.4':'높이 60',t.x+40,t.y-5,18);}}}
  if(n===4){const fill=c.setting,last=c.tested.at(-1);text('손잡이로 물의 양 바꾸기',225,26,22);cup(225,315,130,240,fill);g.fillStyle='#f0c75b';g.beginPath();g.arc(345,65+(100-fill)/60*230,24,0,Math.PI*2);g.fill();text('↕',345,65+(100-fill)/60*230,25);text(fill+'% 채움',225,350,22);text('직전 시험 · 얼린 뒤',545,26,22);cup(545,315,130,240,last?Math.min(100,last.amount):0,true);if(last){text(last.ok?'공간이 남음':'얼음 자리 부족',545,350,22,last.ok?'#217f63':'#ac6335');if(!last.ok){g.strokeStyle='#c27f43';g.setLineDash([6,5]);g.strokeRect(480,315-last.amount*2.4,130,Math.max(10,(last.amount-100)*2.4));g.setLineDash([]);}}}
  if(n===5){text('A · 처음처럼 좁게',185,35,23);text('B · 같은 물을 넓게',540,35,23);panel(35,70,300,230,'#e0d9c2');panel(385,70,310,230,'#e0d9c2');g.fillStyle='#278dad';g.globalAlpha=c.tested.length?.55:.9;g.beginPath();g.ellipse(185,180,40,50,0,0,7);g.fill();g.globalAlpha=1;g.fillStyle='#278dad';g.globalAlpha=c.tested.some(t=>t.spread>=12)?.12:.8*Math.min(1,5/Math.max(1,c.spread.length));for(const cell of c.spread){const x=390+cell%8*37.5,y=85+Math.floor(cell/8)*34.2;g.beginPath();g.ellipse(x+19,y+17,22,20,0,0,7);g.fill();}if(!c.spread.length){g.beginPath();g.ellipse(540,180,40,50,0,0,7);g.fill();}g.globalAlpha=1;}
  if(n===6){cup(210,280,115,205,60);cup(450,280,115,205,43);for(let j=0;j<6;j++){g.strokeStyle='#bdeeff';g.lineWidth=3;g.beginPath();g.arc(425+j%3*23,250-(time/28+j*21)%95,5,0,7);g.stroke();}text('가열하지 않은 A',210,35,20);text('끓는 B',450,35,20);for(const k of c.marks)if(['surface','inside','level'].includes(k)){const t=layout.targets.find(t=>t.id===k);text('관찰 완료',t.x,t.y,17,'#227f63');}if(drag?.id==='lens'){g.strokeStyle='#e3b34f';g.lineWidth=5;g.beginPath();g.arc(drag.x,drag.y,48,0,7);g.stroke();}}
  if(n===7){for(const [key,x] of [['A',320],['B',550]]){cup(x,270,110,165,60);g.fillStyle='#eadab7';g.fillRect(x-58,100,116,12);g.strokeStyle='#ad9a71';g.strokeRect(x-58,100,116,12);if(c.selected===key)art(5,x+70,120,65);const last=c.tested.at(-1);if(last&&((last.cold===0&&key==='A')||(last.cold===1&&key==='B')))for(let i=0;i<14;i++){g.fillStyle='#43acc8';g.beginPath();g.ellipse(x-42+(i*29)%84,130+(i*37)%128,4,6,0,0,7);g.fill();}}text('입구는 두 컵 모두 밀봉',430,35,20);}
  if(n===8){g.fillStyle=c.moves.cold==='plate'?'#acdce2':'#c7d2ce';g.fillRect(365,85,220,27);if(c.moves.cold==='plate')art(5,580,100,75);if(c.moves.tray==='under')art(4,475,300,115,'workshop');if(c.tested.at(-1)?.ok){for(let i=0;i<6;i++){const t=state.settings.reduced?i/6:(time/1500+i/6)%1;g.fillStyle='#40abc4';g.beginPath();g.ellipse(435+i%3*40,130+t*130,4,7,0,0,7);g.fill();}text('모인 물방울',475,370,22);}}
  if(n===9){nodes.forEach(([x,y],i)=>{art(i,x,y,i===1?95:80,'workshop');text(['냉각판','경사판','깔때기','연결관','물통'][i],x+(i<2?95:100),y,21);g.strokeStyle='#d5b55f';g.lineWidth=3;g.beginPath();g.arc(x,y,38,0,7);g.stroke();});for(const line of c.lines){const [from,to]=line.split('-').map(Number),a=nodes[from],b=nodes[to];arrow(...a,...b);const t=state.settings.reduced?.5:(time/1400)%1;g.fillStyle='#32b6d1';g.beginPath();g.arc(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,6,0,7);g.fill();}}
  for(const it of layout.items){const obj=drag?.id===it.id?drag:it;panel(obj.x-53,obj.y-43,106,86,'#fffdf3',drag?.id===it.id?'#238b82':'#dac999');if(obj.art===-1)text('100 g',obj.x,obj.y,22);else if(obj.art===-2)clock(obj.x,obj.y);else if(obj.art===9)art(4,obj.x,obj.y,80,'workshop');else art(obj.art,obj.x,obj.y-5,72);text(obj.label,obj.x,Math.min(380,obj.y+53),18);}
  if(![1,3,5,9,10].includes(n)){art(c.done?14:10,42,350,75,'buddy');}
  if(c.done){panel(260,365,200,31,'#e4f3d8','#96b994');text('현장 의뢰 해결!',360,381,20,'#35704f');}
  canvas.dataset.ready='true';frame=requestAnimationFrame(draw);
 }
 draw(performance.now());
 cleanups.push(()=>{cancelAnimationFrame(frame);canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=null;});
}
export function passportView(){return `<div class="field-passport">${fieldMissions.slice(1).map((m,k)=>`<article class="${hasFieldSeal(k+1)?'earned':''}"><span class="passport-stamp">${hasFieldSeal(k+1)?icon('check',24):String(k+1).padStart(2,'0')}</span><div><b>${m.reward}</b><p>${hasFieldSeal(k+1)?m.ability:'관찰하고 현장 의뢰를 해결하면 남아요'}</p></div></article>`).join('')}</div>`;}
