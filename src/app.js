import {inquiryNotebook,wipe} from './inquiry.js';
import {mountPhaser,cleanupPhaser,travelIsland,focusExperiment} from './phaser-scenes.js';
import {discoveryStars,discoveryGoals} from './scene-model.js';
import {state,save,reset,setPreviewMode,getStorageStatus,captureResetToken} from './state.js';
import {missions,screenNames,canEnter,researchStyle,previousRoute} from './domain.js';
import {icon,btn,mascot,buddy,propArt,note,toast,modal,esc} from './ui.js';
import {journey,journeyView,workshopProgress,travelRoute} from './journey.js';
import {activityView,handleActivity,bindActivity,cleanupActivity,getActivityProgress} from './activities.js';
import {workshopView,finalView,handleWorkshop,bindWorkshop,cleanupWorkshop,resetFinalPreview} from './workshop.js';
import {playClick,playCue,setSoundSettings} from './sound.js';
import {openSettings,offlineText} from './settings.js';
import {OFFLINE_BUILD} from './version.js';
import {syncCoach,cleanupCoach,handleCoach,updateCoachMessage} from './coach.js';
import {closeConcept,conceptVideoFormat} from './concepts.js';
import {activityReady,sortCards} from './activity-model.js';
import {currentTrialValid} from './domain.js';
import {finalContext} from './workshop.js';
import {fieldMissions,experimentTitles,experimentQuestions} from './fieldwork-model.js';
import {fieldworkView,bindFieldwork,cleanupFieldwork,handleFieldwork,startFieldwork,hasFieldSeal,passportView} from './fieldwork.js';
const app=document.querySelector('#app');
const ctx={render,go,pageDone,complete,action:routeAction,baseAction,wipe:(kind,ids)=>wipe(kind,ids,ctx),finishEnding,beforeEnding:()=>{if(finalContext().preview||hasFieldSeal(10))return true;startFieldwork(10,'field-ending',ctx);return false;},say:updateCoachMessage,enterMission:m=>{if(canEnter((m-1)*2+1,state))document.querySelector(`[data-action="mission-${m}"]`)?.click();}};
let endingTimer,travelTimer,lastRenderedRoute,resetToken;
function syncStorageNotice(){
 const status=getStorageStatus();let notice=document.querySelector('#learning-save-notice');
 if(!notice){notice=document.createElement('div');notice.id='learning-save-notice';notice.className='learning-save-notice';notice.setAttribute('role','status');document.body.append(notice);}
 const failed=['damaged','unsupported','unavailable','conflict','full'].includes(status.code);
 notice.hidden=!failed;notice.textContent=failed?status.message:'';
 if(failed&&!status.protected){const retry=document.createElement('button');retry.textContent='저장 다시 시도';retry.onclick=()=>{save();syncStorageNotice();};notice.append(retry);}
 document.body.classList.toggle('save-warning-visible',failed);
}
document.addEventListener('storage-status',syncStorageNotice);
function persist(){const ok=save();if(!ok)toast(getStorageStatus().message);return ok;}
function go(route){if(route!==state.route)state.fieldwork.active=0;clearTimeout(travelTimer);clearInterval(endingTimer);clearTimeout(toast.timer);document.querySelector('#toast').classList.remove('show');document.querySelector('#toast').textContent='';if(typeof route==='number'&&!canEnter(route,state)){toast('앞 실험의 기록을 먼저 완성해 줘.');return;}if(route==='ending'&&!state.restored&&!state.settings.adminUnlock)return;state.route=route;if(typeof route==='number')state.lastScreen=route;persist();render();window.scrollTo(0,0);}
const finishActions={'act-next-1':1,'act-complete-1':2,'act-next-3':3,'act-complete-2':4,'act-next-5':5,'act-complete-3':6,'act-next-7':7,'act-complete-4':8,'complete-5':9};
function baseAction(action){if(!action)return;if(handleActivity(action,ctx))return;handleWorkshop(action,ctx);}
function routeAction(action){if(handleFieldwork(action,ctx))return;const n=finishActions[action];if(n&&!hasFieldSeal(n)&&(n<=8?activityReady(n,state.activities):currentTrialValid(state.lab.workshop))){startFieldwork(n,action,ctx);return;}baseAction(action);}
function finishEnding(){const f=finalContext();if(!f.progress.tested||!f.progress.diagnosis?.resolved||!hasFieldSeal(10)){toast('내 장치로 물을 보내고 마지막 의뢰까지 해결해 줘.');return;}if(!f.preview){state.restored=true;pageDone(10);}go('ending');}
function openIntro(){modal('방울이의 부탁',`<div class="story-overlay"><article class="story-card"><div class="story-illustration"><img src="/assets/v2/story-repair.webp" alt="끊어진 물길을 조사하는 방울이와 멈춘 연구섬"></div><div class="story-copy"><span class="eyebrow">관찰하고 고치는 과학 탐험</span><h2>연구실로 가는 물길이 멈췄어!</h2><p>나는 방울이야. 물이 얼고, 마르고, 다시 맺히는 비밀을 찾아서 멈춘 물길을 함께 고쳐 줘.</p><ol><li>직접 실험해서 변화를 찾아요.</li><li>현장 의뢰를 해결해 도장 10개와 도구 5개를 모아요.</li><li>내 장치로 물을 보내 온실과 물레를 깨워요.</li></ol><div class="story-actions">${btn('첫 물길로 출발','intro-start','primary')}${btn('지도부터 둘러보기','intro-close','secondary')}</div><p class="story-reward">현장 도장 10개를 모으면, 내 물길과 연구 인증서가 완성돼요.</p></div></article></div>`);state.fieldwork.introSeen=true;persist();}
function pageDone(n){if(!state.pages.includes(n))state.pages.push(n);persist();}
function complete(m,record){const first=!state.completed.includes(m);state.evidence[m]=record;if(first)state.completed.push(m);pageDone(m*2);persist();render();playCue('success');const j=journey[m-1];modal(first?'새로운 물길을 연결했어!':'연구 기록을 새로 남겼어',`<div class="reward-modal"><div class="reward-character">${buddy('celebrate')}${propArt(j.prop)}</div><span class="eyebrow">${m}번째 발견</span><h3>${j.tool}</h3><p>${j.after}</p><div class="reward-proof">${m===1?'직접 옮기고 부어 본 관찰':m===2?`${record.trials.length}개 조건을 비교한 배관 기록`:m===3?'같은 조건과 다른 조건을 나란히 비교한 기록':'두 컵을 비교하고 다시 닦아 확인한 증거'}</div>${btn('섬으로 돌아가 다음 물길 잇기 '+icon('arrow'),'reward-map','primary wide')}</div>`);}
function soundButton(){return `${icon(state.settings.sound?'speaker':'speakerOff')}`;}
function header(home=false){return `<header class="topbar" aria-label="화면 도구"><div class="topbar-left">${home?'':`<nav class="page-nav" aria-label="페이지 이동"><button class="icon-btn" data-action="home" aria-label="홈으로 가기" title="홈으로 가기">${icon('home')}</button><button class="icon-btn" data-action="previous" aria-label="이전 페이지로 가기" title="이전 페이지로 가기" ${previousRoute(state.route)===null?'disabled':''}>${icon('back')}</button></nav>`}</div><div class="topbar-right"><button class="icon-btn" data-action="sound" aria-label="소리 ${state.settings.sound?'끄기':'켜기'}" aria-pressed="${state.settings.sound}" title="소리 ${state.settings.sound?'끄기':'켜기'}">${soundButton()}</button><button class="icon-btn ${state.settings.adminUnlock?'admin-active':''}" data-action="settings" aria-label="설정" title="설정${state.settings.adminUnlock?' · 교사 시연 중':''}">${icon('settings')}</button></div></header>`;}

function homeView(){return `<div class="journey-shell">${header(true)}${journeyView(true)}</div>`;}
function mapView(){return `<div class="journey-shell">${header()}${journeyView()}</div>`;}
function experimentShell(n){const m=missions[Math.ceil(n/2)-1],progress=n<=8?getActivityProgress(n):workshopProgress(n),field=state.fieldwork.active===n,q=fieldMissions[n],steps=[...progress.steps,{label:'현장 의뢰 해결',done:hasFieldSeal(n)}];return `<div class="experiment-shell scene-${n}">${header()}<main class="experiment-main"><div class="experiment-heading"><button class="back-map" data-action="map">${icon('back')}<span>연구섬</span></button><div class="quest-brief"><span class="eyebrow">${m.id}번째 구역 · ${field?'현장 의뢰':experimentTitles[n]}</span><h1>${field?q.title:experimentQuestions[n]}</h1></div></div><ol class="activity-progress quest-objectives">${steps.map((s,i)=>`<li class="${s.done?'done':''}"><span>${s.done?icon('check',16):i+1}</span>${s.label}</li>`).join('')}</ol><div class="scene-workspace"><div class="compact-guide"><button class="hint-button coach-trigger" data-action="buddy-hint" aria-label="방울이 힌트 보기" aria-expanded="false" aria-controls="coach-help">${buddy(field&&hasFieldSeal(n)?'celebrate':'point')}<span class="coach-trigger-badge" aria-hidden="true">…</span><span class="coach-trigger-label">방울이 힌트</span></button><p class="sr-only">${field?esc(state.fieldwork.chapters[n]?.message||q.goal):esc(progress.instruction)}</p></div><section class="activity-area" aria-label="직접 해 보는 실험">${field?fieldworkView(n):n<=8?activityView(n):n===9?workshopView():finalView()}</section></div></main></div>`;}
function endingView(){const preview=!state.restored,seals=fieldMissions.slice(1).filter((_,i)=>hasFieldSeal(i+1)).length;return `<div class="ending-shell">${header()}<main class="ending-main"><div class="ending-illustration"><figure class="ending-art-card reward-reveal"><img src="/assets/v2/rescue-reward.webp" alt="방울이와 함께 복구한 연구섬의 물레"><figcaption id="ending-caption">네가 모은 물로 온실과 물레가 다시 움직여!</figcaption></figure><button type="button" class="btn secondary wide three-open" data-action="three-island">연구섬 3D로 둘러보기</button><div class="ending-stats"><div><strong>${state.completed.length}<span>/ 5</span></strong><small>연구 기록</small></div><div><strong>${seals}<span>/ 10</span></strong><small>현장 도장</small></div><div><strong>${state.lab.workshop.trials.length}<span>회</span></strong><small>내 설계 시험</small></div></div></div><div class="ending-copy"><span class="unit-label">${preview?'교사 시연 · 학생 기록과 별개예요':'MISSION COMPLETE · 복구 100%'}</span><h1>우리가 찾은 물의 비밀로,<br>연구섬을 깨웠어!</h1><p>처음 생각과 달라도, 관찰하고 다시 고쳤어.<br>네 기록과 네 장치가 물길을 되살린 거야.</p><div class="ending-statement"><h3>나는 이제 이런 일을 할 수 있어!</h3>${[['observe','물의 변화를 관찰할 수 있어'],['compare','내 증거로 두 조건을 비교할 수 있어'],['design','화면 속 물길 설계를 고칠 수 있어']].map(([k,v])=>btn(v,'ability-'+k,state.fieldwork.ability===k?'selected':'secondary')).join('')}</div><div class="home-actions">${btn(icon('print')+' 나의 연구 인증서','certificate','primary',preview)}${btn('탐구 여권 보기','notebook','secondary')}${btn('연구섬 다시 탐험','map','quiet')}</div><details class="classroom-making"><summary>교실에서 진짜 장치도 만들어 볼까?</summary><p>선생님과 차가운 용기·받침·모으는 컵으로 내 설계를 만들어 봐. 물이 모이는 곳과 새는 곳을 관찰하고 한 부분씩 고쳐 보자.</p><p>화면에서는 가상 설계를 시험했어. 실제 제작과 관찰 결과는 따로 남겨 줘.</p></details></div></main></div>`;}
function notebook(){const records=missions.map(m=>{const e=state.evidence[m.id];return `<article class="notebook-record"><span class="eyebrow">RESEARCH ${String(m.id).padStart(2,'0')} ${e?'· 기록 완료':'· 조사 중'}</span><h3>${m.reward}</h3>${e?`<p>${m.id===1?e.records.join('<br>'):m.id===2?`예상 ${e.prediction} → 관찰 ${e.result}<br>무게 ${e.mass} · 다시 녹이기 완료<br>${e.trials.length}개 조건의 배관 시험`:m.id===3?e.observations.join('<br>'):m.id===4?`${e.chain.join(' → ')}<br>무게 ${e.mass}<br>생활 적용: ${e.transfer}`:`${e.trials}회 설계 시험 · 수집 지수 ${e.first} → ${e.last}<br>내 장치를 코어 복구에 사용`}</p>`:'<p class="muted">아직 수집 전</p>'}</article>`;}).join('');modal('나의 연구노트',`<p class="muted">현장 의뢰를 해결하면 도장과 내 관찰 기록이 이곳에 쌓여.</p>${passportView()}${inquiryNotebook()}<div class="notebook-list">${records}</div>`);}
function settings(){openSettings({state,save:()=>{setPreviewMode(state.settings.adminUnlock);return persist();},render:()=>{resetFinalPreview();if(typeof state.route==='number'&&!canEnter(state.route,state))state.route='map';if(state.route==='ending'&&!state.restored&&!state.settings.adminUnlock)state.route='map';render();},go,reset,openIntro,certificate,notebook,discoveries,offline:()=>offline,onSoundChange:()=>{setSoundSettings(state.settings);const b=document.querySelector('[data-action="sound"]');if(b){b.innerHTML=soundButton();b.setAttribute('aria-pressed',String(state.settings.sound));}},onReset:(audio,token)=>{if(!reset(token))return false;Object.assign(state.settings,audio);resetFinalPreview();setSoundSettings(state.settings);go('home');return true;}});}
function changeSound(enabled){state.settings.sound=enabled;setSoundSettings(state.settings);persist();const b=document.querySelector('[data-action="sound"]');if(b){b.innerHTML=soundButton();b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',`소리 ${enabled?'끄기':'켜기'}`);b.title=b.getAttribute('aria-label');}if(enabled)playClick();}
function certificate(){modal('물방울 연구실 연구 인증서',`<div class="certificate-form"><label for="student-name">인증서에 표시할 별명 (선택)</label><input id="student-name" maxlength="20" placeholder="예: 물방울 탐험가"><p class="muted">별명은 저장하거나 전송하지 않아. 인쇄할 인증서에만 표시돼.</p>${btn(icon('print')+' 인증서 인쇄 / PDF 저장','print-certificate','primary wide')}</div><div id="certificate-print"><div class="certificate-border"><span class="eyebrow">SCIENCE WORLD · WATER DROP LAB</span><h2>물방울 연구실<br>연구 인증서</h2><p class="cert-name" id="cert-name">물방울 연구원</p><p>관찰 · 측정 · 실험 · 증거 분석 · 설계로<br>멈춘 연구실의 물길을 복구했습니다.</p><div class="cert-badge">연구 기록 5 / 5 · 복구 100%</div><p>${({observe:'물의 변화를 관찰할 수 있어요',compare:'내 증거로 두 조건을 비교할 수 있어요',design:'화면 속 물길 설계를 고칠 수 있어요'})[state.fieldwork.ability]||researchStyle(state)}</p><small>${new Date().toLocaleDateString('ko-KR')} · 물방울 연구실</small></div></div>`);document.querySelector('#student-name').oninput=e=>document.querySelector('#cert-name').textContent=e.target.value.trim()||'물방울 연구원';}
function discoveries(){modal('우리의 발견과 도구',`<p>빨리 끝내는 대신, 관찰하고 비교해서 얻은 별이야.</p><div class="discovery-collection">${journey.map((j,i)=>`<article>${propArt(j.prop)}<div><h3>${j.tool}</h3><p>${j.need}</p><ul>${discoveryGoals[i].map((goal,k)=>`<li class="${discoveryStars(i+1,state)[k]?'earned':''}"><span>${discoveryStars(i+1,state)[k]?'★':'☆'}</span> ${goal}</li>`).join('')}</ul></div></article>`).join('')}</div>`);}
function simplifyControls(route){
 if(typeof route!=='number')return;
 const scene=document.querySelector('.activity-scene');
 // Keep primary operations visible; long concept explanations remain in their own details.
 const tools=document.querySelector('.activity-tools,.control-panel');
 if(tools){
  const extra=document.createElement('details');extra.className='canvas-alternatives essential-controls';extra.open=true;extra.innerHTML='<summary>버튼으로 조작하기</summary>';
  if(route===1&&state.activities.observe.step===0)extra.innerHTML+=btn('길쭉한 그릇 선택','ix-pour-target-tall')+btn('넓은 그릇 선택','ix-pour-target-wide');
  if(route===2){const active=state.inquiry.sortProof||sortCards.find(c=>!state.activities.sort.placed[c.id])?.id;extra.innerHTML+=sortCards.map(c=>btn(c.name,'ix-sort-card-'+c.id,active===c.id?'selected':'')).join('')+['solid','liquid','gas'].map((k,i)=>btn(['고체에 놓기','액체에 놓기','기체에 놓기'][i],'ix-sort-place-'+k,state.inquiry.sortDraft[active]===k?'selected':'')).join('')+btn('관찰과 맞는지 확인','ix-sort-check');}
  if(route===6)extra.innerHTML+=['surface','inside','level'].map((k,i)=>btn(['A 표면 관찰','B 물속 관찰','두 수위 비교'][i],'ix-lens-'+k)).join('');
  if(route===8&&state.activities.explain.evidence.length<2)extra.innerHTML+=btn('입구를 막은 증거','ix-evidence-sealed')+btn('두 컵을 비교한 증거','ix-evidence-contrast')+btn('다시 닦은 증거','ix-evidence-again');
  if(extra.children.length>1)tools.append(extra);

 }
 if(scene&&state.completed.includes(1)&&route>=3){const zoom=document.createElement('button');zoom.className='scene-lens icon-btn';zoom.dataset.action='focus-experiment';zoom.setAttribute('aria-label','찾은 돋보기로 실험 확대');zoom.title='찾은 관찰 돋보기';zoom.innerHTML=icon('zoom');scene.append(zoom);}
 if(tools&&typeof route==='number'){const prize=document.createElement('div');prize.className='quest-prize';prize.innerHTML=icon('star',22)+`<div><b>${fieldMissions[route].reward}</b><p>${fieldMissions[route].next}</p></div>`;tools.append(prize);}
 const guide=document.querySelector('.compact-guide');if(guide)guide.dataset.mission=String(Math.ceil(route/2));
}
export function render(){
 cleanupCoach();closeConcept();
 clearInterval(endingTimer);cleanupPhaser();cleanupFieldwork();cleanupActivity();cleanupWorkshop();document.documentElement.classList.toggle('reduce-motion',state.settings.reduced);const route=state.route;const fieldSelections=lastRenderedRoute===route?[...app.querySelectorAll('select[id^=field-]')].map(el=>[el.id,el.value]):[];const active=document.activeElement;const focusKey=lastRenderedRoute===route&&app.contains(active)?{id:active.id,action:active.dataset.action,scroll:active.closest('aside')?.scrollTop}:null;const panelKey=d=>d.className+'|'+d.querySelector(':scope > summary')?.textContent;const openPanels=new Map(lastRenderedRoute===route?[...app.querySelectorAll('details')].map(d=>[panelKey(d),d.open]):[]);app.innerHTML=route==='home'?homeView():route==='map'?mapView():route==='ending'?endingView():experimentShell(route);lastRenderedRoute=route;document.title=(typeof route==='number'?screenNames[route]+' · ':'')+'물방울 연구실';
 if(typeof route==='number'){if(state.fieldwork.active===route)bindFieldwork(route,ctx);else{if(route<=8)bindActivity(route,ctx);bindWorkshop(route,ctx);}}
 if(state.fieldwork.active!==route){mountPhaser(route,ctx);simplifyControls(route);}
 if(typeof route==='number')syncCoach(route,route<=8?getActivityProgress(route):workshopProgress(route),state.fieldwork.active===route,hasFieldSeal(route));
 app.querySelectorAll('details').forEach(d=>{if(openPanels.has(panelKey(d)))d.open=openPanels.get(panelKey(d));});
 for(const [id,value] of fieldSelections){const select=document.getElementById(id);if(select&&[...select.options].some(o=>o.value===value))select.value=value;}
 syncStorageNotice();
 app.querySelectorAll('button.selected').forEach(b=>b.setAttribute('aria-pressed','true'));
 if(focusKey){const target=focusKey.id?document.getElementById(focusKey.id):[...app.querySelectorAll('[data-action]')].find(b=>b.dataset.action===focusKey.action);if(target&&!target.disabled){target.focus({preventScroll:true});if(target.closest('aside'))target.closest('aside').scrollTop=focusKey.scroll||0;}}
 if(route==='ending'&&!state.settings.reduced){const lines=['다섯 개의 연구 기록이 하나의 물길로.','예상과 달라도, 다시 관찰했어.','흘러내린 물방울을 모아 장치를 고쳤어.','네가 알아낸 과학으로 연구실이 다시 움직여.'];let i=0;endingTimer=setInterval(()=>{const el=document.querySelector('#ending-caption');if(el)el.textContent=lines[++i%lines.length];if(i>=3)clearInterval(endingTimer);},4000);}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;if(a!=='sound'&&state.settings.sound)playClick();
 if(handleCoach(a))return;
 if(a==='sound')return changeSound(!state.settings.sound);if(a==='previous'){const route=previousRoute(state.route);if(route!==null)go(route);return;}
 if(a==='admin-open'&&state.settings.adminUnlock){const value=document.querySelector('#admin-route').value;document.querySelector('#dialog').close();return go(/^\d+$/.test(value)?Number(value):value);}
 if(a==='map-hint'){const trigger=document.querySelector('.map-coach'),bubble=document.querySelector('#map-coach-help');if(bubble){bubble.hidden=!bubble.hidden;trigger.setAttribute('aria-expanded',String(!bubble.hidden));}return;}if(a==='home')return go('home');if(a==='map')return go('map');if(a==='ending')return go('ending');
 if(a==='start'){return go(state.restored?'ending':state.pages.length&&canEnter(state.lastScreen,state)?state.lastScreen:'map');}
 if(a==='intro-start'||a==='intro-close'){document.querySelector('#dialog').close();return go('map');}if(a==='intro-replay')return openIntro();if(a.startsWith('ability-')){state.fieldwork.ability=a.slice(8);persist();render();return;}if(a==='notebook')return notebook();if(a==='discoveries')return discoveries();if(a==='focus-experiment')return focusExperiment();if(a==='settings')return settings();if(a==='certificate')return certificate();if(a==='print-certificate')return window.print();
 if(a==='request-reset'){resetToken=captureResetToken();if(!resetToken){toast(getStorageStatus().message);return;}modal('연구 기록을 처음부터 만들까?',`<p>이 브라우저에 저장된 실험과 설계 기록이 지워져.</p>${btn('기록 지우고 새로 시작','reset','danger wide')}${btn('취소','cancel-reset','wide')}`);return;}
 if(a==='cancel-reset'){resetToken=null;document.querySelector('#dialog').close();return;}
 if(a==='reset'){if(!reset(resetToken)){toast(getStorageStatus().message);return;}resetFinalPreview();setSoundSettings(state.settings);document.querySelector('#dialog').close();go('home');return;}
 if(a==='reward-map'){document.querySelector('#dialog').close();go('map');return;}
 if(a.startsWith('mission-')){const m=+a.slice(8),first=(m-1)*2+1;if(!canEnter(first,state))return;if(travelIsland(m-1,()=>go(first)))return;return go(first);}
 if(a.startsWith('screen-'))return go(+a.slice(7));
 if(a==='buddy-hint'&&state.fieldwork.active===state.route){toast(fieldMissions[state.route].goal);return;}if(a==='buddy-hint'){const p=state.route<=8?getActivityProgress(state.route):workshopProgress(state.route);toast(p.hint);return;}
 routeAction(a);
});
// Offline classroom play (built site only): install keeps the first screen, then one file at a time is saved while idle.
let offline=null;
async function warmOffline(){
 const reg=await navigator.serviceWorker.ready,video=conceptVideoFormat(document.createElement('video')),pause=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;
 const ask=()=>new Promise(ok=>{const ch=new MessageChannel(),t=setTimeout(()=>ok(null),60000);ch.port1.onmessage=e=>{clearTimeout(t);ok(e.data);};reg.active?reg.active.postMessage({type:'warm',video},[ch.port2]):ok(null);});
 for(;;){
  if(document.hidden||!navigator.onLine){await pause(5000);continue;}
  const r=await ask();
  if(!r||r.error){if(++fails>20)return;await pause(15000);continue;}fails=0;
  offline=r;const line=document.querySelector('#settings-offline');if(line)line.textContent=offlineText(r);
  if(r.done>=r.total)return;await pause(250);
 }
}
if(OFFLINE_BUILD&&'serviceWorker' in navigator){
 offline={done:0,total:0};
 addEventListener('load',()=>{
  // Registering after load lets the install reuse the files the page just fetched instead of downloading them twice.
  // A waiting update takes over only here at start-up, never by reloading a class mid-lesson.
  navigator.serviceWorker.register('/sw.js').then(reg=>reg.waiting?.postMessage('skip-waiting')).catch(()=>{});
  // ponytail: random 2-10 s start + sequential files keeps 30 tablets on one AP from bursting together.
  setTimeout(()=>{const run=()=>warmOffline().catch(()=>{});'requestIdleCallback' in window?requestIdleCallback(run,{timeout:10000}):run();},2000+Math.random()*8000);
 });
}
setPreviewMode(state.settings.adminUnlock);setSoundSettings(state.settings);
render();
window.bootStep?.('app');{const art=app.querySelector('.journey-art')||app.querySelector('img'),shown=()=>window.bootStep?.('screen');if(!art||art.complete)shown();else{art.addEventListener('load',shown,{once:true});art.addEventListener('error',shown,{once:true});}}
// The story opens once the loading screen has finished, so its progress bar is never hidden behind the dialog.
(window.bootDone||Promise.resolve()).then(()=>{if(state.route==='home'&&!state.fieldwork.introSeen)openIntro();});
