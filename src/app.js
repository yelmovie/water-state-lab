import {remainingMapVillains} from './map-villains.js';
import {dropAdventureView,handleDropAdventure,mountDropAdventure,cleanupDropAdventure} from './drop-adventure.js';
import {prepareDrawingComparison} from './drawing-records.js';
import {mountTimeTools} from './time-dial.js';
import {observationSpeed,OBSERVATION_SPEEDS} from './observation-speed.js';
import {openStageLetter} from './field-briefing.js';
import {experimentMove,markStageControls,pinQuestion} from './stage-guide.js';
import {fieldTask} from './field-guidance.js';
import {playStoryFilm} from './story-film.js';
import {residentReward,openResidentList,talkToResident,stageEndTalk,residentForStage} from './island-residents.js';
import {bindObservation,observationPlaying,stopObservation} from './observation-play.js';
import {guidedQuestion,handleGuidedAction} from './guided-flow.js';
import {assistStep} from './stage-assist.js';
import {inquiryNotebook,wipe,observationClockBusy} from './inquiry.js';
import {canvasTarget,loadSceneEngine} from './scene-loader.js';
import {state,save,reset,setPreviewMode,getStorageStatus,captureResetToken} from './state.js';
import {missions,screenNames,canEnter,currentTrialValid,previousRoute,waterResumeRoute} from './domain.js';
import {icon,btn,buddy,propArt,note,toast,modal,esc,celebrate} from './ui.js';
import {journey,journeyView,mapEntryScreen,workshopProgress,mountMapCamera,cleanupMapCamera,travelIsland} from './journey.js';
import {activityView,handleActivity,bindActivity,cleanupActivity,getActivityProgress} from './activities.js';
import {workshopView,finalView,handleWorkshop,bindWorkshop,cleanupWorkshop,resetFinalPreview,finalContext} from './workshop.js';
import {playClick,playCue,setMusicTheme,setSoundSettings} from './sound.js';
import {openSettings,offlineText} from './settings.js';
import {OFFLINE_BUILD} from './version.js';
import {syncCoach,cleanupCoach,handleCoach,updateCoachMessage} from './coach.js';
import {closeConcept,openConcept,openCollectorLesson} from './concepts.js';
import {activityReady,experimentActivities,sortCards} from './activity-model.js';

import {fieldMissions,areaStages,experimentTitles} from './fieldwork-model.js';
import {fieldworkView,bindFieldwork,cleanupFieldwork,handleFieldwork,startFieldwork,hasFieldSeal,fieldChapter} from './fieldwork.js';
import {passportView,certificateView,researchRecords} from './achievement.js';
const app=document.querySelector('#app');
const ctx={render,go,pageDone,complete,action:routeAction,baseAction,wipe:(kind,ids)=>wipe(kind,ids,ctx),finishEnding,say:updateCoachMessage,enterMission:m=>{if(canEnter((m-1)*2+1,state))document.querySelector(`[data-action="mission-${m}"]`)?.click();}};
let endingTimer,travelTimer,lastRenderedRoute,resetToken,manualToolsRoute=null,clockObserver=null,workspaceObserver=null;
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
function go(route){if(route==='home'||route==='map')state.dropReturn=false;if(route!==state.route)state.fieldwork.active=0;clearTimeout(travelTimer);clearInterval(endingTimer);clearTimeout(toast.timer);document.querySelector('#toast').classList.remove('show');document.querySelector('#toast').textContent='';if(typeof route==='number'&&!canEnter(route,state)){toast('앞 실험의 기록을 먼저 완성해 줘.');return;}if(route==='ending'&&!state.restored&&!state.settings.adminUnlock)return;if(route==='ending'&&!state.settings.adminUnlock&&remainingMapVillains(state)){state.finalePending=true;route='map';toast('남은 밸브 두더지를 모두 물리치면 엔딩 영상이 열려!');}state.route=route;if(typeof route==='number')state.lastScreen=route;persist();render();window.scrollTo(0,0);}
const finishActions={'act-complete-1':2,'act-complete-2':4,'act-complete-3':6,'act-complete-4':8};
function baseAction(action){if(!action)return;if(handleActivity(action,ctx))return;handleWorkshop(action,ctx);}
function routeAction(action){
 if(handleGuidedAction(action,state)){
  persist();
  const host=document.getElementById('field-coldnight');
  if(action.startsWith('guide-night-fill-')&&host)host.dispatchEvent(new Event('cold-levels-change'));else render();
  return;
 }
 if(handleFieldwork(action,ctx))return;
 if(state.route===9&&(action==='workshop-collector'||action==='complete-5'&&currentTrialValid(state.lab.workshop))){
  const complete=action==='complete-5';
  openCollectorLesson({reduced:state.settings.reduced,continueLabel:complete?'이 장치로 출발':'공방으로 돌아가기',onContinue:complete?()=>{
   if(state.route!==9)return;
   baseAction(action);
   if(state.route===10)openStageLetter(10);
  }:undefined});
  return;
 }
 const n=finishActions[action];
 if([6,8].includes(n)&&activityReady(n,experimentActivities(n,state))){
  openConcept(n/2,{reduced:state.settings.reduced,continueLabel:state.settings.autoObservation===true?'지도로 돌아가기':'관찰 마치기',onContinue:()=>baseAction(action)});
  return;
 }
 if(n&&!hasFieldSeal(n)&&activityReady(n,experimentActivities(n,state))){startFieldwork(n,action,ctx);return;}
 baseAction(action);
}
function showStory(kind,onFinish){if(kind==='final'&&!state.settings.adminUnlock&&(!state.restored||remainingMapVillains(state)))return;playStoryFilm(kind,{muted:!state.settings.sound,onFinish});if(kind==='final'&&state.route==='ending')setMusicTheme('ending',true);}
function openEnding(){
 const play=state.finalePending;
 go('ending');
 if(state.route==='ending'&&play){state.finalePending=false;persist();showStory('final');}
}
function startAdventure(){
 if(state.fieldwork.introSeen)return go('map');
 showStory('intro',()=>{state.fieldwork.introSeen=true;go('map');});
}
function finishEnding(){
 const f=finalContext();
 if(!f.progress.tested||!f.progress.diagnosis?.resolved){toast('고친 장치로 물이 도착하는지 시험해 줘.');return;}
 if(!f.preview&&!hasFieldSeal(10)){startFieldwork(10,'field-ending',ctx);return;}
 const first=!state.restored;
 if(!f.preview){
  state.restored=true;
  if(first)state.finalePending=true;
  if(first&&state.pages.includes(10)&&!state.villageArrivals.includes(10))state.villageArrivals.push(10);
  pageDone(10);
 }
 state.dropReturn=false;
 if(!f.preview&&first){
  const toEnding=state.settings.autoObservation===true&&!remainingMapVillains(state);
  stageEndTalk(10,{label:toEnding?'엔딩 보기':'지도 보기',action:'resident-close'});
  const dialog=document.querySelector('#dialog');
  const leave=()=>{
   if(dialog.open)return;
   dialog.removeEventListener('close',leave);
   if(state.route!==10)return;
   if(toEnding)openEnding();else go('map');
  };
  dialog.addEventListener('close',leave);
  return;
 }
 if(!f.preview&&state.settings.autoObservation!==true){go('map');return;}
 go('ending');
 if(state.route==='ending'&&(first||state.finalePending)){state.finalePending=false;persist();showStory('final');}
}
function pageDone(n){
 const first=!state.pages.includes(n);
 if(first){state.pages.push(n);state.villageArrivals.push(n);}
 const saved=persist();
 return first&&saved;
}
function complete(m,record){const first=!state.completed.includes(m);state.evidence[m]=record;if(first)state.completed.push(m);const greeted=pageDone(m*2,false);persist();state.dropReturn=false;if(state.settings.autoObservation===true){go('map');toast(`${residentForStage(m*2).spot}의 발견을 남겼어! 다음 건물로 가 보자.`);return;}render();playCue('success');const j=journey[m-1];if(first&&greeted){stageEndTalk(m*2,{label:'지도 보기',action:'reward-map'},j.tool);return celebrate(document.querySelector('#dialog'));}modal(first?'새로운 물길을 연결했어!':'연구 기록을 새로 남겼어',`<div class="reward-modal">${first?residentReward(m*2):`<div class="reward-character">${buddy('celebrate')}${propArt(j.prop)}</div>`}<span class="eyebrow">${m}번째 발견</span><h3>${j.tool}</h3><p>${j.after}</p><div class="reward-proof">${m===1?'직접 옮기고 부어 본 관찰':m===2?`${record.trials.length}개 조건을 비교한 배관 기록`:m===3?'같은 조건과 다른 조건을 나란히 비교한 기록':'두 컵을 비교하고 다시 닦아 확인한 증거'}</div>${btn('지도 보기 '+icon('arrow'),'reward-map','primary wide')}</div>`);}
function soundButton(){return `${icon(state.settings.sound?'speaker':'speakerOff')}`;}
function header(home=false){return `<header class="topbar" aria-label="화면 도구"><div class="topbar-left">${state.settings.adminUnlock?'<button type="button" class="btn teacher-stage-launch" data-action="teacher-stages">시연할 장</button>':''}${home?'':`<nav class="page-nav" aria-label="페이지 이동"><button class="icon-btn" data-action="home" aria-label="홈으로 가기" title="홈으로 가기">${icon('home')}</button><button class="icon-btn" data-action="previous" aria-label="이전 페이지로 가기" title="이전 페이지로 가기" ${previousRoute(state.route)===null?'disabled':''}>${icon('back')}</button></nav>`}</div><div class="topbar-right"><button class="icon-btn" data-action="sound" aria-label="소리 ${state.settings.sound?'끄기':'켜기'}" aria-pressed="${state.settings.sound}" title="소리 ${state.settings.sound?'끄기':'켜기'}">${soundButton()}</button><button class="icon-btn ${state.settings.adminUnlock?'admin-active':''}" data-action="settings" aria-label="설정" title="설정${state.settings.adminUnlock?' · 교사 시연 중':''}">${icon('settings')}</button></div></header>`;}

// Title screen: logo, Bangul and one next step. With saved progress, "continue" leads and the map is the second choice.
function homeView(){const started=waterResumeRoute(state)!==null;return `<div class="start-screen">${header(true)}<main class="start-main"><img class="start-bg" src="/assets/v2/title-island.webp" width="1344" height="752" alt=""><div class="start-bubbles" aria-hidden="true">${'<i></i>'.repeat(9)}</div><div class="start-copy"><span class="start-kicker">${icon('drop',20)}방울이와 함께하는 물의 상태 변화 탐험</span><h1 class="start-title"><img src="/assets/v2/title-logo.webp" width="927" height="532" alt="방울이의 물길 탐험"></h1><p class="start-tagline">얼고, 마르고, 다시 맺히는 물의 비밀로<br>멈춘 물길을 다시 흐르게 해 줘!</p><div class="start-actions">${btn('방울이 변신 모험','drop-start','primary start-cta')}${started?btn(`${state.restored?'완성한 물길 보기':'이어서 탐험하기'} ${icon('arrow')}`,'start','primary start-cta')+btn('탐험 지도 보기','map','start-second'):btn(`실험부터 시작 ${icon('arrow')}`,'title-start','primary start-cta')}</div><small class="start-save">내 탐험 기록은 이 기기에 저장돼요</small></div><img class="start-bangul" src="/assets/v2/bangul-title.webp" width="774" height="1015" alt="돋보기를 들고 손을 흔드는 물방울 연구원 방울이"></main></div>`;}
function mapView(){return `<div class="journey-shell">${header()}${journeyView()}</div>`;}
let currentTask;
function experimentShell(n){
 const m=missions[Math.ceil(n/2)-1],progress=n<=8?getActivityProgress(n):workshopProgress(n),field=state.fieldwork.active===n,q=fieldMissions[n],steps=q?[...progress.steps,{label:'현장 의뢰 해결',done:hasFieldSeal(n)}]:progress.steps;
 currentTask=field?([2,4].includes(n)?null:fieldTask(n,fieldChapter(n))):experimentMove(n,state,n===10?finalContext():null);
 const assist=field||!observationPlaying()?null:assistStep(n,state,n===10?finalContext():null);
 if(assist)currentTask={...currentTask,kind:'watch',title:assist.title,instruction:assist.note,target:'',regions:[]};
 const question=guidedQuestion(n,state,n===10?finalContext():null),npc=residentForStage(n),auto=state.settings.autoObservation===true,manual=n===1||manualToolsRoute===n||!auto;
 const parts=[['물과 얼음','세 가지 모습'],['높이와 무게','얼 때 남은 공간'],['물그림','증발과 끓음'],['차가운 컵','관찰결과'],['물 모으기','온실에 연결']][m.id-1];
 const play=auto?'<span class="observation-mode" aria-label="교사 설정 · 자동 관찰 켜짐">자동 관찰</span>':'';
 const speed=`<label class="observation-speed-control" data-observation-speed><span>속도</span><select id="observation-speed" aria-label="관찰 속도">${OBSERVATION_SPEEDS.map(value=>`<option value="${value}" ${observationSpeed(state.settings)===value?'selected':''}>${value}배</option>`).join('')}</select></label>`;
 const nav=parts.map((label,i)=>{const route=m.screens[i];return `<button type="button" data-action="building-part-${route}" aria-current="${route===n?'step':'false'}" ${canEnter(route,state)?'':'disabled'}><span>${i+1}</span>${label}</button>`;}).join('');
 const hint=`<div class="compact-guide"><button class="hint-button coach-trigger" data-action="buddy-hint" aria-label="방울이 힌트 보기" aria-expanded="false" aria-controls="coach-help">${buddy(field&&hasFieldSeal(n)?'celebrate':'point')}<span class="coach-trigger-badge" aria-hidden="true">…</span><span class="coach-trigger-label"><span class="coach-label-name">방울이 </span>힌트</span></button><p class="sr-only">${esc(currentTask?.instruction??q?.goal??'')}</p></div>`;
 const guide=`<header class="building-guide${!question&&currentTask?.kind==='next'&&currentTask.title==='오늘 알게 된 것'?' lesson-shown':''}"><button type="button" class="building-guide-npc" data-action="${field?'field-help':'stage-letter'}" aria-label="${npc.name}의 실험 안내"><img src="/assets/v2/resident-${npc.stage}.webp" alt="${npc.role}" draggable="false"></button><div class="building-guide-copy"><small>${esc(npc.spot)} · ${esc(npc.name)}</small><h1 id="stage-direction">${esc(question?question.prompt:currentTask?.title||({2:'물의 네 가지 변신',4:'물을 담고 추운 밤을 지켜봐',10:'온실에 물 모으기'})[field?n:0]||parts[n%2===0?1:0])}</h1><p id="stage-how">${esc(question?'답을 하나 골라 봐.':currentTask?.instruction||'화면의 안내를 따라 실험해 봐.')}</p></div><nav class="building-parts" aria-label="이 건물의 실험">${nav}</nav><div class="building-guide-actions">${play}${speed}${hint}${auto&&n!==1?`<button type="button" class="guided-tools-toggle" data-action="guided-tools" aria-label="${manual?'관찰로 돌아가기':'직접 해보기'}" aria-pressed="${manual}">${icon('hand',20)}<span>${manual?'관찰로 돌아가기':'직접 해보기'}</span></button>`:''}</div></header>`;
 const panel=question?`<aside class="guided-question-panel" aria-labelledby="guided-question-title"><span class="guided-question-label">❓ 문제</span><h2 id="guided-question-title">${esc(question.prompt)}</h2><div class="guided-question-choices">${question.choices.map(choice=>`<button type="button" class="btn" data-guided-answer data-action="${choice.action}">${esc(choice.label)}</button>`).join('')}</div>${question.note?`<p class="guided-question-note">${esc(question.note)}</p>`:''}<span class="guided-answer-after">👇 답을 하나 골라 줘</span></aside>`:'';
 return `<div class="experiment-shell guided-shell scene-${n}">${header()}<main class="experiment-main${manual?' manual-tools':''}" data-guided-phase="${question?'question':'observe'}" data-question-id="${question?.id||''}" data-has-question="${!!question}"><div class="scene-workspace">${guide}<section class="activity-area" aria-label="큰 화면으로 관찰하는 실험">${field?fieldworkView(n):n<=8?activityView(n):n===9?workshopView():finalView()}</section>${panel}</div></main></div>`;
}
function endingView(){const preview=!state.restored;return `<div class="ending-shell">${header()}<main class="ending-main"><div class="ending-illustration"><figure class="ending-art-card reward-reveal"><img src="/assets/v2/rescue-reward.webp" alt="방울이와 함께 복구한 연구섬의 물레"><figcaption id="ending-caption">네가 모은 물로 온실과 물레가 다시 움직여!</figcaption></figure></div><div class="ending-copy"><span class="unit-label">${preview?'교사 시연 · 학생 기록과 별개예요':'MISSION COMPLETE · 복구 100%'}</span><h1>우리가 찾은 물의 비밀로,<br>연구섬을 깨웠어!</h1><p>관찰하고 다시 고친 네 기록이 물길을 되살렸어.</p><div class="home-actions">${btn(icon('print')+' 나의 연구 인증서','certificate','primary',preview)}${btn('탐구 노트 보기','notebook','secondary')}${btn(state.restored&&!state.residentsMet.includes(10)?'느티 만나러 연구섬으로':'연구섬 다시 탐험','map','quiet')}${btn('처음부터 다시 하기','request-reset','ending-restart',preview)}</div><div class="ending-replay-actions">${btn('엔딩 영상 다시 보기','final-replay','secondary wide')}<button type="button" class="btn secondary wide three-open" data-action="three-island">되살린 연구섬 다시 보기</button></div><button type="button" class="btn quiet classroom-making" data-action="classroom-making">교실에서 진짜 장치도 만들어 볼까?</button></div></main></div>`;}
function notebook(){
 void playCue('page');
 modal('나의 연구 노트',`${passportView()}${researchRecords(state.evidence)}<details class="notebook-observations"><summary>내가 남긴 관찰 그림 보기</summary>${inquiryNotebook()}</details>`);
 if(areaStages.every(hasFieldSeal))celebrate(document.querySelector('#dialog'),900);
}
function previewStage(n,field){
 if(!state.settings.adminUnlock||!canEnter(n,state))return;
 state.fieldwork.active=0;
 state.fieldwork.pending='';
 go(n);
 if(field)startFieldwork(n,'teacher-return',ctx);
}
function teacherStages(){
 if(!state.settings.adminUnlock)return;
 modal('시연할 장',`<div class="teacher-stage-list"><p>실험이나 현장 의뢰를 바로 열 수 있어요.</p><ol>${experimentTitles.slice(1).map((title,i)=>`<li><strong>${i+1}장 · ${esc(title)}</strong><div>${btn('실험','teacher-experiment-'+(i+1),'secondary')}${fieldMissions[i+1]?btn('현장 의뢰','teacher-field-'+(i+1),'secondary'):''}</div></li>`).join('')}</ol>${btn('연구섬 지도','teacher-map','quiet')}${btn('복구 결과 보기','teacher-ending','quiet')}</div>`);
}
function settings(){openSettings({state,save:()=>{setPreviewMode(state.settings.adminUnlock);return persist();},render:()=>{resetFinalPreview();if(typeof state.route==='number'&&!canEnter(state.route,state))state.route='map';if(state.route==='ending'&&!state.restored&&!state.settings.adminUnlock)state.route='map';render();},go,reset,showStory,certificate,notebook,discoveries,offline:()=>offline,onSoundChange:()=>{setSoundSettings(state.settings);const b=document.querySelector('[data-action="sound"]');if(b){b.innerHTML=soundButton();b.setAttribute('aria-pressed',String(state.settings.sound));}},onReset:(audio,token)=>{if(!reset(token))return false;Object.assign(state.settings,audio);resetFinalPreview();setSoundSettings(state.settings);go('home');return true;}});}
function changeSound(enabled){state.settings.sound=enabled;setSoundSettings(state.settings);persist();const b=document.querySelector('[data-action="sound"]');if(b){b.innerHTML=soundButton();b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',`소리 ${enabled?'끄기':'켜기'}`);b.title=b.getAttribute('aria-label');}if(enabled)playClick();}
function certificate(){modal('연구 인증서',`<div class="certificate-form"><p>학교·반·번호·이름은 인쇄한 뒤 빈칸에 직접 적어 줘.</p>${btn(icon('print')+' 인쇄 / PDF 저장','print-certificate','primary')}</div>${certificateView()}`);void playCue('success');celebrate(document.querySelector('#dialog'),1700);}
function discoveries(){
 const found=journey.filter((_,i)=>state.completed.includes(i+1)||(i===4&&state.restored));
 modal('우리의 발견과 도구',found.length?`<div class="discovery-collection">${found.map(j=>`<article>${propArt(j.prop)}<div><h3>${j.tool}</h3><p>${j.after}</p></div></article>`).join('')}</div>`:'<p>연구를 마치면 여기에서 발견과 도구를 다시 볼 수 있어.</p>');
}
let sceneModule,sceneImport,sceneRevision=0;
function mountCanvas(route,regions,revision){
 const target=canvasTarget(route,state,app);if(!target)return;
 const current=()=>revision===sceneRevision&&target.anchor.isConnected;
 const notice=document.createElement('aside');
 notice.className='scene-load-notice';notice.hidden=true;
 notice.innerHTML='<p role="status"></p><button type="button" class="btn secondary">다시 시도</button>';
 const status=notice.querySelector('p'),retry=notice.querySelector('button');
 app.firstElementChild.append(notice);
 const failed=()=>{
  if(!current())return;
  notice.hidden=false;status.textContent='그림 무대를 열지 못했어. 화면의 조작 도구는 그대로 쓸 수 있어.';
  retry.disabled=false;retry.textContent='다시 시도';
 };
 const ready=()=>{
  if(!current())return;
  const restoreFocus=notice.contains(document.activeElement);
  notice.hidden=true;
  const lens=app.querySelector('.scene-lens');if(lens)lens.hidden=false;
  integrateWorkspaceControls();
  if(restoreFocus)app.querySelector(route==='map'?'.journey-next button':'.building-guide-npc')?.focus({preventScroll:true});
 };
 const mount=()=>{if(current())sceneModule.mountPhaser(target,ctx,regions,{ready,failed});};
 const load=(retryRequested=false)=>{
  retry.disabled=true;retry.textContent='다시 여는 중…';
  if(!notice.hidden)status.textContent='그림 무대를 다시 여는 중…';
  if(sceneModule&&window.Phaser?.Game){mount();return;}
  sceneImport??=import('./phaser-scenes.js').then(module=>sceneModule=module).catch(()=>null);
  let limit;
  const unavailable=()=>{if(!current())return;failed();retry.textContent='다시 열기';retry.onclick=()=>location.reload();};
  const moduleReady=Promise.race([sceneImport,new Promise(resolve=>{limit=setTimeout(()=>resolve(null),10000);})]);
  Promise.all([loadSceneEngine(retryRequested),moduleReady]).then(([,module])=>{
   if(!current())return;
   if(module)mount();else unavailable();
  },failed).finally(()=>clearTimeout(limit));
 };
 retry.onclick=()=>load(true);
 load();
}
function simplifyControls(route){
 if(typeof route!=='number')return;
 const scene=document.querySelector('.activity-scene');
 // Keep primary operations visible; long concept explanations remain in their own details.
 const tools=document.querySelector('.activity-tools,.control-panel');
 if(tools){
  const extra=document.createElement('details');extra.className='canvas-alternatives essential-controls';extra.open=false;extra.innerHTML='<summary>다른 조작</summary>';
  if(route===1&&state.activities.observe.step===0)extra.innerHTML+=btn('길쭉한 그릇 선택','ix-pour-target-tall')+btn('넓은 그릇 선택','ix-pour-target-wide');
  if(route===2){
   extra.classList.add('sort-keyboard-controls');
   extra.innerHTML='<summary>버튼으로 분류하기</summary><div class="sort-keyboard-cards">'+sortCards.map(card=>btn(card.name,'ix-sort-card-'+card.id)).join('')+'</div><div class="sort-keyboard-answers">'+['고체','액체','기체'].map((label,i)=>btn(label,'ix-sort-answer-'+['solid','liquid','gas'][i])).join('')+'</div>';
  }



  if(route===1&&state.activities.observe.step===0){const hold=tools.querySelector('#hold-pour');if(hold)extra.append(hold);}
  if(extra.children.length>1)tools.append(extra);

 }
 if(scene&&state.completed.includes(1)&&route>=3&&route!==6){const zoom=document.createElement('button');zoom.className='scene-lens icon-btn';zoom.hidden=true;zoom.dataset.action='focus-experiment';zoom.setAttribute('aria-label','찾은 돋보기로 실험 확대');zoom.title='찾은 관찰 돋보기';zoom.innerHTML=icon('zoom');scene.append(zoom);}
 if(tools&&fieldMissions[route]){const prize=document.createElement('div');prize.className='quest-prize';prize.innerHTML=icon('star',22)+`<div><b>${fieldMissions[route].reward}</b><p>${fieldMissions[route].next}</p></div>`;tools.append(prize);}
 const guide=document.querySelector('.compact-guide');if(guide)guide.dataset.mission=String(Math.ceil(route/2));
}
function syncCompactGuide(){
 const area=app.querySelector('.activity-area'),clock=app.querySelector('.guided-clock');if(!area||!clock)return;
 const n=state.route,a=state.activities,c=state.fieldwork.chapters[n];
 let t=n===1?a.observe.time:n===3?a.freeze.processTime||0:n===5?a.draw.time:n===6?a.compare.time:n===7?a.dew.rewiped?a.dew.againTime:a.dew.time:n===8?a.explain.time:0;
 if(state.fieldwork.active===n&&c){
  if(n===10)t=Number(c.moves.cycleTime)||0;
  else if(n===2)t=Number(c.moves.dewTime??c.moves.boilTime??c.moves.meltTime??c.moves.freezeTime??c.moves.freezeFill)||0;
  if(!app.querySelector('.guided-question-panel')){
   const heading=area.querySelector('.tray-heading,.process-heading,.cycle-heading');
   if(heading){const title=heading.querySelector('h2'),note=heading.querySelector('p');if(title)document.getElementById('stage-direction').textContent=title.textContent;if(note)document.getElementById('stage-how').textContent=note.textContent;}
  }
 }
 clock.style.setProperty('--clock-angle',t*10+'deg');clock.style.setProperty('--clock-hour',t*.8+'deg');
 clock.classList.toggle('is-waiting',!!area.querySelector('[aria-busy="true"],[data-measure-pause]:not([hidden]),[data-cycle-pause]:not([hidden])'));
}
function integrateWorkspaceControls(){
 const area=app.querySelector('.activity-area'),stage=area?.firstElementChild;if(!stage)return;
 stage.classList.add('workspace-stage');
 let dock=stage.querySelector(':scope > .workspace-controls');
 if(!dock){
  dock=document.createElement('div');dock.className='workspace-controls';dock.setAttribute('aria-label','이 화면의 조작 도구');stage.append(dock);
  workspaceObserver?.observe(dock);
 }
 // Keep every control inside its original experiment so delegated events still reach it.
 for(const control of stage.querySelectorAll('.activity-tools,.control-panel,[data-time-controls],.tray-action-row,.process-controls,.cycle-controls,.cold-side,.cold-bubble,.bench-foot,.measure-records,.diagnosis-choices'))if(!dock.contains(control))dock.append(control);
 // Optional instructions open above the controls, so they cannot push an action below the viewport.
 for(const details of dock.querySelectorAll(':is(.tool-drawer,.science-detail,.canvas-alternatives,.activity-alternative):not(.workspace-disclosure)')){
  if(details.parentElement.closest('details'))continue;
  const content=document.createElement('div');content.className='workspace-detail-content';
  content.append(...[...details.children].filter(child=>child.tagName!=='SUMMARY'));
  details.classList.add('workspace-disclosure');details.name='workspace-help';details.append(content);
 }
 mountTimeTools(stage,()=>{if(!observationClockBusy())stopObservation();baseAction('ix-play');},observationClockBusy);
 const phase=stage.querySelector('.cold-yard')?.dataset.sky;
 if(phase&&stage.dataset.workspacePhase!==phase)stage.dataset.workspacePhase=phase;
 const header=app.querySelector('.building-guide'),question=app.querySelector('.guided-question-panel');
 // Put the question in the same dock as the controls, so they cannot overlap.
 if(question&&!dock.contains(question))dock.append(question);
 dock.dataset.hasQuestion=String(!!question);
 const stageRect=stage.getBoundingClientRect();
 // Questions in the bottom dock must never contribute to top padding.
 // Including their position feeds the previous layout back into its own height.
 const headerBottom=header?.getBoundingClientRect().bottom||stageRect.top+58;
 const top=Math.max(58,headerBottom-stageRect.top)+12;
 const bottom=dock.getBoundingClientRect().height+20;
 for(const [name,value] of [['--workspace-header-height',top],['--workspace-controls-height',bottom]])if(stage.style.getPropertyValue(name)!==value+'px')stage.style.setProperty(name,value+'px');
}
function bindCompactGuide(){
 const area=app.querySelector('.activity-area');if(!area)return;
 workspaceObserver=new ResizeObserver(integrateWorkspaceControls);
 for(const el of app.querySelectorAll('.building-guide,.workspace-controls'))workspaceObserver.observe(el);
 const cold=area.querySelector('#field-coldnight');
 if(cold){cold.addEventListener('cold-phase-change',integrateWorkspaceControls);integrateWorkspaceControls();return;}
 syncCompactGuide();integrateWorkspaceControls();
 clockObserver=new MutationObserver(()=>{syncCompactGuide();integrateWorkspaceControls();});clockObserver.observe(area,{subtree:true,childList:true,attributes:true,attributeFilter:['value','height','aria-busy','hidden','open']});
}
window.addEventListener('resize',()=>{if(typeof state.route==='number')integrateWorkspaceControls();});
document.addEventListener('guided-question-change',()=>{if(typeof state.route==='number')render();});
export function render(){
 const revision=++sceneRevision;
 if(state.route==='ending'&&state.restored&&!state.settings.adminUnlock&&remainingMapVillains(state)){state.route='map';state.finalePending=true;persist();}
 const resumeFinale=state.settings.autoObservation===true&&state.route==='map'&&state.restored&&state.finalePending&&!state.settings.adminUnlock&&!remainingMapVillains(state);
 if(resumeFinale){state.route='ending';state.finalePending=false;persist();}
 if(state.route===5&&state.fieldwork.active!==5&&prepareDrawingComparison(state.activities.draw))save();
 clockObserver?.disconnect();clockObserver=null;
 workspaceObserver?.disconnect();workspaceObserver=null;
 cleanupCoach();closeConcept();cleanupMapCamera();cleanupDropAdventure();
 clearInterval(endingTimer);sceneModule?.cleanupPhaser();cleanupFieldwork();cleanupActivity();cleanupWorkshop();document.documentElement.classList.toggle('reduce-motion',state.settings.reduced);const route=state.route;const fieldSelections=lastRenderedRoute===route?[...app.querySelectorAll('select[id^=field-]')].map(el=>[el.id,el.value]):[];const active=document.activeElement;const focusKey=lastRenderedRoute===route&&app.contains(active)?{id:active.id,action:active.dataset.action,scroll:active.closest('aside')?.scrollTop}:null;const panelKey=d=>d.className+'|'+d.querySelector(':scope > summary')?.textContent;const openPanels=new Map(lastRenderedRoute===route?[...app.querySelectorAll('details')].map(d=>[panelKey(d),d.open]):[]);currentTask=null;app.innerHTML=route==='home'?homeView():route==='map'?mapView():route==='ending'?endingView():route==='adventure'?dropAdventureView(state,header()):experimentShell(route);lastRenderedRoute=route;if(route==='adventure')mountDropAdventure();setMusicTheme(route==='ending'?'ending':'main');document.title=(typeof route==='number'?screenNames[route]+' · ':'')+'방울이의 물길 탐험';
 if(typeof route==='number'){const resident=residentForStage(route);if(!state.settings.adminUnlock&&!state.residentsMet.includes(resident.stage)){state.residentsMet.push(resident.stage);save();}if(state.fieldwork.active===route)bindFieldwork(route,ctx);else{if(route<=8)bindActivity(route,ctx);bindWorkshop(route,ctx);}}
 if(state.fieldwork.active!==route){
  if(route==='map')mountMapCamera(()=>{
   if(!state.restored||state.settings.adminUnlock)return;
   const remaining=remainingMapVillains(state);
   const status=document.querySelector('.map-finale-status');
   if(status)status.textContent=remaining?`남은 밸브 두더지 ${remaining}마리 · 모두 물리치면 엔딩 영상이 열려!`:'물길을 모두 되살렸어!';
   if(!remaining){
    const button=document.querySelector('.journey-next [data-action="ending"]');
    if(button){button.disabled=false;button.textContent=state.finalePending?'엔딩 보기':'우리의 발견 보기';}
    if(state.settings.autoObservation===true){state.finalePending=false;go('ending');showStory('final');}
   }
  });
  simplifyControls(route);mountCanvas(route,currentTask?.regions,revision);
 }
 bindObservation(state,routeAction,state.route===10?finalContext():null,persist,manualToolsRoute===route);
 if(typeof route==='number'){syncCoach(route,route<=8?getActivityProgress(route):workshopProgress(route),state.fieldwork.active===route,hasFieldSeal(route),currentTask);bindCompactGuide();markStageControls(app,currentTask);pinQuestion(app);integrateWorkspaceControls();}
 app.querySelectorAll('details').forEach(d=>{if(d.closest('.workspace-controls')&&!d.matches('.essential-controls'))d.open=false;else if(openPanels.has(panelKey(d)))d.open=openPanels.get(panelKey(d));else if(d.matches(".workshop-keyboard")&&matchMedia("(max-width:800px)").matches)d.open=false;});
 for(const [id,value] of fieldSelections){const select=document.getElementById(id);if(select&&[...select.options].some(o=>o.value===value))select.value=value;}
 syncStorageNotice();
 app.querySelectorAll('button.selected').forEach(b=>b.setAttribute('aria-pressed','true'));
 if(focusKey){const target=focusKey.id?document.getElementById(focusKey.id):[...app.querySelectorAll('[data-action]')].find(b=>b.dataset.action===focusKey.action);if(target&&!target.disabled){target.focus({preventScroll:true});if(target.closest('aside'))target.closest('aside').scrollTop=focusKey.scroll||0;}}
 if(resumeFinale)showStory('final');
 if(route==='ending'&&!state.settings.reduced){const lines=['다섯 개의 연구 기록이 하나의 물길로.','예상과 달라도, 다시 관찰했어.','흘러내린 물방울을 모아 장치를 고쳤어.','네가 알아낸 과학으로 연구실이 다시 움직여.'];let i=0;endingTimer=setInterval(()=>{const el=document.querySelector('#ending-caption');if(el)el.textContent=lines[++i%lines.length];if(i>=3)clearInterval(endingTimer);},4000);}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled||b.getAttribute('aria-busy')==='true')return;const a=b.dataset.action;if(handleDropAdventure(a,state,{go,render,save:persist}))return;if(a!=='sound'&&state.settings.sound)playClick();
 if(a==='guided-tools'){stopObservation();const opening=manualToolsRoute!==state.route;manualToolsRoute=opening?state.route:null;render();return;}
 if(a.startsWith('building-part-')){const n=Number(a.slice(14));if(canEnter(n,state)){manualToolsRoute=null;state.fieldwork.active=0;go(n);}return;}
 if(handleCoach(a))return;
 if(a==='sound')return changeSound(!state.settings.sound);if(a==='previous'){const route=previousRoute(state.route);if(route!==null)go(route);return;}
 if(a==='map-hint'){const trigger=document.querySelector('.map-coach'),bubble=document.querySelector('#map-coach-help');if(bubble){bubble.hidden=!bubble.hidden;trigger.setAttribute('aria-expanded',String(!bubble.hidden));}return;}if(a==='home')return go('home');if(a==='map')return go('map');if(a==='ending')return openEnding();
 if(a==='start'){return go(waterResumeRoute(state)??'map');}
 if(a==='title-start')return startAdventure();
 if(a==='final-replay'&&state.route==='ending')return showStory('final');if(a.startsWith('ability-')){state.fieldwork.ability=a.slice(8);persist();render();return;}if(a==='notebook')return notebook();if(a==='discoveries')return discoveries();if(a==='focus-experiment')return sceneModule?.focusExperiment();if(a==='settings')return settings();if(a==='certificate')return certificate();if(a==='print-certificate')return window.print();
 if(a==='classroom-making'){modal('교실에서 장치 만들기','<p>선생님과 차가운 용기·받침·모으는 컵으로 내 설계를 만들어 봐. 물이 모이는 곳과 새는 곳을 관찰하고 한 부분씩 고쳐 보자.</p><p>화면에서는 가상 설계를 시험했어. 실제 제작과 관찰 결과는 따로 남겨 줘.</p>');return;}
 if(a==='request-reset'){resetToken=captureResetToken();if(!resetToken){toast(getStorageStatus().message);return;}modal('연구 기록을 처음부터 만들까?',`<p>이 브라우저에 저장된 실험과 설계 기록이 지워져.</p>${btn('기록 지우고 새로 시작','reset','danger wide')}${btn('취소','cancel-reset','wide')}`);return;}
 if(a==='cancel-reset'){resetToken=null;document.querySelector('#dialog').close();return;}
 if(a==='reset'){if(!reset(resetToken)){toast(getStorageStatus().message);return;}resetFinalPreview();setSoundSettings(state.settings);document.querySelector('#dialog').close();go('home');return;}
 if(a==='resident-close'){document.querySelector('#dialog')?.close();return;}
 if(a==='resident-list'&&state.route==='map')return openResidentList();
 if(a.startsWith('resident-')){
  const [,verb,id]=a.split('-');
  if(verb==='ask'||verb==='talk'&&state.route==='map')return talkToResident(Number(id),verb==='ask');
 }
 if(a==='teacher-stages')return teacherStages();
 if(a.startsWith('teacher-')&&state.settings.adminUnlock){
  document.querySelector('#dialog')?.close();
  if(a==='teacher-map'||a==='teacher-ending')return go(a.slice(8));
  const [,kind,n]=a.split('-');if(kind==='experiment'||kind==='field')return previewStage(Number(n),kind==='field');
 }
 if(a==='reward-map'){document.querySelector('#dialog').close();go('map');return;}
 if(a.startsWith('mission-')){
  const m=+a.slice(8),screen=mapEntryScreen(m);if(!canEnter(screen,state))return;
  if(b.hasAttribute('data-map-enter'))return go(screen);
  const guided=!!b.closest('.journey-next');
  if(travelIsland(m-1,()=>{if(guided&&state.route==='map')go(mapEntryScreen(m));},guided))return;
  return go(screen);
 }
 if(a==='screen-10'&&b.closest('.journey-next')&&canEnter(10,state)&&travelIsland(4,()=>{if(state.route==='map')go(10);},true))return;
 if(a.startsWith('screen-'))return go(+a.slice(7));
 if(a==='stage-letter'&&typeof state.route==='number'){openStageLetter(state.route);return;}
 if(a==='buddy-hint'&&state.fieldwork.active===state.route){toast(fieldMissions[state.route].goal);return;}if(a==='buddy-hint'){const p=state.route<=8?getActivityProgress(state.route):workshopProgress(state.route);toast(p.hint);return;}
 routeAction(a);
});
// Offline classroom play (built site only): install keeps the first screen, then one file at a time is saved while idle.
let offline=null;
async function warmOffline(){
 const reg=await navigator.serviceWorker.ready,pause=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;
 const ask=()=>new Promise(ok=>{
  const ch=new MessageChannel();
  const finish=data=>{clearTimeout(timer);ch.port1.close();ch.port2.close();ok(data);};
  const timer=setTimeout(()=>finish(null),60000);
  ch.port1.onmessage=e=>finish(e.data);
  if(reg.active)reg.active.postMessage({type:'warm'},[ch.port2]);else finish(null);
 });
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
  // Start offline installation after the first screen has loaded.
  // Offer an update even when installation finishes after register() has resolved.
  // A new worker must reload the document too, so cached modules and styles stay together.
  let controller=navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   const previous=controller;controller=navigator.serviceWorker.controller;
   if(previous){save();location.reload();}
  });
  navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{
   const offer=()=>{
    if(!reg.waiting||!navigator.serviceWorker.controller||document.querySelector('#app-update'))return;
    const button=document.createElement('button');
    button.id='app-update';button.type='button';button.textContent='새 버전 준비됐어 · 적용하기';
    button.addEventListener('click',()=>{save();button.disabled=true;button.textContent='새 버전을 여는 중…';reg.waiting?.postMessage('skip-waiting');});
    document.body.append(button);
   };
   reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',offer));
   offer();
  }).catch(()=>{});
  // ponytail: random 2-10 s start + sequential files keeps 30 tablets on one AP from bursting together.
  setTimeout(()=>{const run=()=>warmOffline().catch(()=>{});'requestIdleCallback' in window?requestIdleCallback(run,{timeout:10000}):run();},2000+Math.random()*8000);
 });
}
setPreviewMode(state.settings.adminUnlock);setSoundSettings(state.settings);
render();
window.bootReady?.();
