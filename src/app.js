import {observationSpeed,OBSERVATION_SPEEDS} from './observation-speed.js';
import {openStageLetter} from './field-briefing.js';
import {experimentMove,stageGuide,markStageControls} from './stage-guide.js';
import {fieldTask} from './field-guidance.js';
import {playStoryFilm} from './story-film.js';
import {residentReward,openResidentList,talkToResident,stageEndTalk,residentForStage} from './island-residents.js';
import {bindObservation,observationPlaying,stopObservation} from './observation-play.js';
import {guidedQuestion,handleGuidedAction} from './guided-flow.js';
import {assistStep} from './stage-assist.js';
import {inquiryNotebook,wipe} from './inquiry.js';
import {mountPhaser,cleanupPhaser,focusExperiment} from './phaser-scenes.js';
import {discoveryStars,discoveryGoals} from './scene-model.js';
import {state,save,reset,setPreviewMode,getStorageStatus,captureResetToken} from './state.js';
import {missions,screenNames,canEnter,researchStyle,previousRoute} from './domain.js';
import {icon,btn,mascot,buddy,propArt,note,toast,modal,esc,celebrate} from './ui.js';
import {journey,journeyView,mapEntryScreen,workshopProgress,travelRoute,mountMapCamera,cleanupMapCamera,travelIsland} from './journey.js';
import {activityView,handleActivity,bindActivity,cleanupActivity,getActivityProgress} from './activities.js';
import {workshopView,finalView,handleWorkshop,bindWorkshop,cleanupWorkshop,resetFinalPreview,finalContext} from './workshop.js';
import {playClick,playCue,setMusicTheme,setSoundSettings} from './sound.js';
import {openSettings,offlineText} from './settings.js';
import {OFFLINE_BUILD} from './version.js';
import {syncCoach,cleanupCoach,handleCoach,updateCoachMessage} from './coach.js';
import {closeConcept,openConcept} from './concepts.js';
import {activityReady,experimentActivities,nextSortCard,sortCards} from './activity-model.js';
import {currentTrialValid} from './domain.js';
import {fieldMissions,fieldStages,areaStages,experimentTitles,experimentQuestions,fieldProgress} from './fieldwork-model.js';
import {fieldworkView,bindFieldwork,cleanupFieldwork,handleFieldwork,startFieldwork,hasFieldSeal,fieldChapter} from './fieldwork.js';
import {passportView,certificateView} from './achievement.js';
const app=document.querySelector('#app');
const ctx={render,go,pageDone,complete,action:routeAction,baseAction,wipe:(kind,ids)=>wipe(kind,ids,ctx),finishEnding,say:updateCoachMessage,enterMission:m=>{if(canEnter((m-1)*2+1,state))document.querySelector(`[data-action="mission-${m}"]`)?.click();}};
let endingTimer,travelTimer,lastRenderedRoute,resetToken,manualToolsRoute=null,clockObserver=null;
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
const finishActions={'act-complete-1':2,'act-complete-2':4,'act-complete-3':6,'act-complete-4':8};
function baseAction(action){if(!action)return;if(handleActivity(action,ctx))return;handleWorkshop(action,ctx);}
function routeAction(action){if(handleGuidedAction(action,state)){persist();render();return;}if(handleFieldwork(action,ctx))return;const n=finishActions[action];if([6,8].includes(n)&&activityReady(n,experimentActivities(n,state))){if(state.settings.autoplay!==false){baseAction(action);return;}openConcept(n/2,{reduced:state.settings.reduced,continueLabel:'관찰 마치기',onContinue:()=>baseAction(action)});return;}if(n&&!hasFieldSeal(n)&&activityReady(n,experimentActivities(n,state))){startFieldwork(n,action,ctx);return;}baseAction(action);}
function showStory(kind,onFinish){playStoryFilm(kind,{muted:!state.settings.sound,onFinish});if(kind==='final'&&state.route==='ending')setMusicTheme('ending',true);}
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
  if(first&&state.pages.includes(10)&&!state.villageArrivals.includes(10))state.villageArrivals.push(10);
  pageDone(10);
 }
 go('ending');
 if(first)showStory('final');
}
function pageDone(n){
 const first=!state.pages.includes(n);
 if(first){state.pages.push(n);state.villageArrivals.push(n);}
 const saved=persist();
 return first&&saved;
}
function complete(m,record){const first=!state.completed.includes(m);state.evidence[m]=record;if(first)state.completed.push(m);const greeted=pageDone(m*2,false);persist();if(state.settings.autoplay!==false){go('map');toast(`${residentForStage(m*2).spot}의 발견을 남겼어! 다음 건물로 가 보자.`);return;}render();playCue('success');const j=journey[m-1];if(first&&greeted){stageEndTalk(m*2,{label:'지도 보기',action:'reward-map'},j.tool);return celebrate(document.querySelector('#dialog'));}modal(first?'새로운 물길을 연결했어!':'연구 기록을 새로 남겼어',`<div class="reward-modal">${first?residentReward(m*2):`<div class="reward-character">${buddy('celebrate')}${propArt(j.prop)}</div>`}<span class="eyebrow">${m}번째 발견</span><h3>${j.tool}</h3><p>${j.after}</p><div class="reward-proof">${m===1?'직접 옮기고 부어 본 관찰':m===2?`${record.trials.length}개 조건을 비교한 배관 기록`:m===3?'같은 조건과 다른 조건을 나란히 비교한 기록':'두 컵을 비교하고 다시 닦아 확인한 증거'}</div>${btn('지도 보기 '+icon('arrow'),'reward-map','primary wide')}</div>`);}
function soundButton(){return `${icon(state.settings.sound?'speaker':'speakerOff')}`;}
function header(home=false){return `<header class="topbar" aria-label="화면 도구"><div class="topbar-left">${state.settings.adminUnlock?'<button type="button" class="btn teacher-stage-launch" data-action="teacher-stages">시연할 장</button>':''}${home?'':`<nav class="page-nav" aria-label="페이지 이동"><button class="icon-btn" data-action="home" aria-label="홈으로 가기" title="홈으로 가기">${icon('home')}</button><button class="icon-btn" data-action="previous" aria-label="이전 페이지로 가기" title="이전 페이지로 가기" ${previousRoute(state.route)===null?'disabled':''}>${icon('back')}</button></nav>`}</div><div class="topbar-right"><button class="icon-btn" data-action="sound" aria-label="소리 ${state.settings.sound?'끄기':'켜기'}" aria-pressed="${state.settings.sound}" title="소리 ${state.settings.sound?'끄기':'켜기'}">${soundButton()}</button><button class="icon-btn ${state.settings.adminUnlock?'admin-active':''}" data-action="settings" aria-label="설정" title="설정${state.settings.adminUnlock?' · 교사 시연 중':''}">${icon('settings')}</button></div></header>`;}

// Title screen: logo, Bangul and one next step. With saved progress, "continue" leads and the map is the second choice.
function homeView(){const started=state.pages.length>0||state.completed.length>0;return `<div class="start-screen">${header(true)}<main class="start-main"><img class="start-bg" src="/assets/v2/title-island.webp" width="1344" height="752" alt=""><div class="start-bubbles" aria-hidden="true">${'<i></i>'.repeat(9)}</div><div class="start-copy"><span class="start-kicker">${icon('drop',20)}방울이와 함께하는 물의 상태 변화 탐험</span><h1 class="start-title"><img src="/assets/v2/title-logo.webp" width="927" height="532" alt="방울이의 물길 탐험"></h1><p class="start-tagline">얼고, 마르고, 다시 맺히는 물의 비밀로<br>멈춘 물길을 다시 흐르게 해 줘!</p><div class="start-actions">${started?btn(`${state.restored?'완성한 물길 보기':'이어서 탐험하기'} ${icon('arrow')}`,'start','primary start-cta')+btn('탐험 지도 보기','map','start-second'):btn(`방울이와 탐험 시작 ${icon('arrow')}`,'title-start','primary start-cta')}</div><small class="start-save">내 탐험 기록은 이 기기에 저장돼요</small></div><img class="start-bangul" src="/assets/v2/bangul-title.webp" width="774" height="1015" alt="돋보기를 들고 손을 흔드는 물방울 연구원 방울이"></main></div>`;}
function mapView(){return `<div class="journey-shell">${header()}${journeyView()}</div>`;}
let currentTask;
function experimentShell(n){
 const m=missions[Math.ceil(n/2)-1],progress=n<=8?getActivityProgress(n):workshopProgress(n),field=state.fieldwork.active===n,q=fieldMissions[n],steps=q?[...progress.steps,{label:'현장 의뢰 해결',done:hasFieldSeal(n)}]:progress.steps;
 currentTask=field?([2,4].includes(n)?null:fieldTask(n,fieldChapter(n))):experimentMove(n,state,n===10?finalContext():null);
 const assist=field||!observationPlaying()?null:assistStep(n,state,n===10?finalContext():null);
 if(assist)currentTask={...currentTask,kind:'watch',title:assist.title,instruction:assist.note,target:'',regions:[]};
 const question=guidedQuestion(n,state,n===10?finalContext():null),npc=residentForStage(n),manual=manualToolsRoute===n||state.settings.autoplay===false;
 const parts=[['물과 얼음','세 가지 모습'],['높이와 무게','얼 때 남은 공간'],['물그림','증발과 끓음'],['차가운 컵','새 병에서 확인'],['물 모으기','온실에 연결']][m.id-1];
 const play='<button type="button" id="observation-play" class="guided-play" aria-pressed="false" title="자동으로 관찰하거나 실험 도구를 직접 조작해 봐."><span class="guided-clock observation-clock" data-guided-play-icon aria-hidden="true"><img src="/assets/learning/experiment-props-20261107/clock.webp" alt=""><i class="clock-hour"></i><i class="clock-minute"></i><i class="clock-pivot"></i></span><span data-guided-play-label>자동 관찰</span></button>';
 const speed=`<label class="observation-speed-control" data-observation-speed><span>속도</span><select id="observation-speed" aria-label="관찰 속도">${OBSERVATION_SPEEDS.map(value=>`<option value="${value}" ${observationSpeed(state.settings)===value?'selected':''}>${value}배</option>`).join('')}</select></label>`;
 const nav=parts.map((label,i)=>{const route=m.screens[i];return `<button type="button" data-action="building-part-${route}" aria-current="${route===n?'step':'false'}" ${canEnter(route,state)?'':'disabled'}><span>${i+1}</span>${label}</button>`;}).join('');
 const hint=`<div class="compact-guide"><button class="hint-button coach-trigger" data-action="buddy-hint" aria-label="방울이 힌트 보기" aria-expanded="false" aria-controls="coach-help">${buddy(field&&hasFieldSeal(n)?'celebrate':'point')}<span class="coach-trigger-badge" aria-hidden="true">…</span><span class="coach-trigger-label"><span class="coach-label-name">방울이 </span>힌트</span></button><p class="sr-only">${esc(currentTask?.instruction??q?.goal??'')}</p></div>`;
 const guide=`<header class="building-guide"><button type="button" class="building-guide-npc" data-action="${field?'field-help':'stage-letter'}" aria-label="${npc.name}의 실험 안내"><img src="/assets/v2/resident-${npc.stage}.webp" alt="${npc.role}" draggable="false"></button><div class="building-guide-copy"><small>${esc(npc.spot)} · ${esc(npc.name)}</small><h1 id="stage-direction">${esc(question?question.prompt:currentTask?.title||({2:'물의 네 가지 변신',4:'물을 담고 추운 밤을 지켜봐',10:'온실에 물 모으기'})[field?n:0]||parts[n%2===0?1:0])}</h1><p id="stage-how">${esc(question?'답을 고르면 다음 관찰이 이어져.':currentTask?.instruction||'준비부터 관찰까지 자동으로 이어져. 달라지는 모습을 지켜봐.')}</p></div><nav class="building-parts" aria-label="이 건물의 실험">${nav}</nav><div class="building-guide-actions">${play}${speed}${hint}<button type="button" class="guided-tools-toggle" data-action="guided-tools" aria-label="${manual?'관찰로 돌아가기':'직접 해보기'}" aria-pressed="${manual}">${icon('hand',20)}<span>${manual?'관찰로 돌아가기':'직접 해보기'}</span></button></div></header>`;
 const panel=question?`<aside class="guided-question-panel" aria-labelledby="guided-question-title"><span class="guided-question-label">생각해 보기</span><h2 id="guided-question-title">${esc(question.prompt)}</h2><div class="guided-question-choices">${question.choices.map(choice=>`<button type="button" class="btn" data-guided-answer data-action="${choice.action}">${esc(choice.label)}</button>`).join('')}</div>${question.note?`<p class="guided-question-note">${esc(question.note)}</p>`:''}<span class="guided-answer-after">답을 고르면 관찰이 계속돼</span></aside>`:'';
 return `<div class="experiment-shell guided-shell scene-${n}">${header()}<main class="experiment-main${manual?' manual-tools':''}" data-guided-phase="${question?'question':'observe'}" data-question-id="${question?.id||''}" data-has-question="${!!question}"><div class="scene-workspace">${guide}<section class="activity-area" aria-label="큰 화면으로 관찰하는 실험">${field?fieldworkView(n):n<=8?activityView(n):n===9?workshopView():finalView()}</section>${panel}</div></main></div>`;
}
function endingView(){const preview=!state.restored,seals=areaStages.filter(hasFieldSeal).length;return `<div class="ending-shell">${header()}<main class="ending-main"><div class="ending-illustration"><figure class="ending-art-card reward-reveal"><img src="/assets/v2/rescue-reward.webp" alt="방울이와 함께 복구한 연구섬의 물레"><figcaption id="ending-caption">네가 모은 물로 온실과 물레가 다시 움직여!</figcaption></figure>${btn('엔딩 영상 다시 보기','final-replay','secondary wide')}<button type="button" class="btn secondary wide three-open" data-action="three-island">연구섬 3D로 둘러보기</button><div class="ending-stats"><div><strong>${state.completed.length}<span>/ 5</span></strong><small>연구 기록</small></div><div><strong>${seals}<span>/ ${areaStages.length}</span></strong><small>발견 도장</small></div><div><strong>${state.lab.workshop.trials.length}<span>회</span></strong><small>내 설계 시험</small></div></div></div><div class="ending-copy"><span class="unit-label">${preview?'교사 시연 · 학생 기록과 별개예요':'MISSION COMPLETE · 복구 100%'}</span><h1>우리가 찾은 물의 비밀로,<br>연구섬을 깨웠어!</h1><p>관찰하고 다시 고친 네 기록이 물길을 되살렸어.</p><div class="ending-statement"><h3>나는 이제 이런 일을 할 수 있어!</h3>${[['observe','물의 변화를 관찰할 수 있어'],['compare','내 증거로 두 조건을 비교할 수 있어'],['design','화면 속 물길 설계를 고칠 수 있어']].map(([k,v])=>btn(v,'ability-'+k,state.fieldwork.ability===k?'selected':'secondary')).join('')}</div><div class="home-actions">${btn(icon('print')+' 나의 연구 인증서','certificate','primary',preview)}${btn('탐구 여권 보기','notebook','secondary')}${btn(state.restored&&!state.residentsMet.includes(10)?'느티 만나러 연구섬으로':'연구섬 다시 탐험','map','quiet')}${btn('처음부터 다시하기','request-reset','ending-restart',preview)}</div><button type="button" class="btn quiet classroom-making" data-action="classroom-making">교실에서 진짜 장치도 만들어 볼까?</button></div></main></div>`;}
function notebook(){void playCue('page');const records=missions.map(m=>{const e=state.evidence[m.id];return `<article class="notebook-record"><span class="eyebrow">RESEARCH ${String(m.id).padStart(2,'0')} ${e?'· 기록 완료':'· 조사 중'}</span><h3>${m.reward}</h3>${e?`<p>${m.id===1?e.records.join('<br>'):m.id===2?`예상 ${e.prediction} → 관찰 ${e.result}<br>무게 ${e.mass} · 다시 녹이기 완료<br>${e.trials.length}개 조건의 배관 시험`:m.id===3?e.observations.join('<br>'):m.id===4?`${e.chain.join(' → ')}<br>무게 ${e.mass}<br>생활 적용: ${e.transfer}`:`${e.trials}회 설계 시험 · 수집 지수 ${e.first} → ${e.last}<br>내 장치를 코어 복구에 사용`}</p>`:'<p class="muted">아직 수집 전</p>'}</article>`;}).join('');modal('나의 연구노트',`${passportView()}${inquiryNotebook()}<div class="notebook-list">${records}</div>`);if(areaStages.every(hasFieldSeal))celebrate(document.querySelector('#dialog'),900);}
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
function certificate(){const strength=({observe:'물의 변화를 관찰할 수 있어요',compare:'내 증거로 두 조건을 비교할 수 있어요',design:'화면 속 물길 설계를 고칠 수 있어요'})[state.fieldwork.ability]||researchStyle(state);modal('연구 인증서',`<div class="certificate-form"><p>학교·반·번호·이름은 인쇄한 뒤 빈칸에 직접 적어 줘.</p>${btn(icon('print')+' 인쇄 / PDF 저장','print-certificate','primary')}</div>${certificateView(strength)}`);void playCue('success');celebrate(document.querySelector('#dialog'),1700);}
function discoveries(){modal('우리의 발견과 도구',`<p>빨리 끝내는 대신, 관찰하고 비교해서 얻은 별이야.</p><div class="discovery-collection">${journey.map((j,i)=>`<article>${propArt(j.prop)}<div><h3>${j.tool}</h3><p>${j.need}</p><ul>${discoveryGoals[i].map((goal,k)=>`<li class="${discoveryStars(i+1,state)[k]?'earned':''}"><span>${discoveryStars(i+1,state)[k]?'★':'☆'}</span> ${goal}</li>`).join('')}</ul></div></article>`).join('')}</div>`);}
function simplifyControls(route){
 if(typeof route!=='number')return;
 const scene=document.querySelector('.activity-scene');
 // Keep primary operations visible; long concept explanations remain in their own details.
 const tools=document.querySelector('.activity-tools,.control-panel');
 if(tools){
  const extra=document.createElement('details');extra.className='canvas-alternatives essential-controls';extra.open=false;extra.innerHTML='<summary>다른 조작</summary>';
  if(route===1&&state.activities.observe.step===0)extra.innerHTML+=btn('길쭉한 그릇 선택','ix-pour-target-tall')+btn('넓은 그릇 선택','ix-pour-target-wide');
  if(route===2){
   const sort=state.activities.sort,active=state.inquiry.sortProof||nextSortCard(sort).id;
   extra.open=false;
   extra.innerHTML+=sortCards.map(c=>btn(c.name,'ix-sort-card-'+c.id,active===c.id?'selected':'')).join('')+
    ['solid','liquid','gas'].map((k,i)=>btn(['고체에 놓기','액체에 놓기','기체에 놓기'][i],'ix-sort-answer-'+k)).join('');
  }

  if(route===8&&activityReady(7,experimentActivities(8,state))&&state.activities.explain.evidence.length<2)extra.innerHTML+=btn('입구를 막은 증거','ix-evidence-sealed')+btn('두 컵을 비교한 증거','ix-evidence-contrast')+btn('다시 닦은 증거','ix-evidence-again');
  if(route===1&&state.activities.observe.step===0){const hold=tools.querySelector('#hold-pour');if(hold)extra.append(hold);}
  if(extra.children.length>1)tools.append(extra);

 }
 if(scene&&state.completed.includes(1)&&route>=3&&route!==6){const zoom=document.createElement('button');zoom.className='scene-lens icon-btn';zoom.dataset.action='focus-experiment';zoom.setAttribute('aria-label','찾은 돋보기로 실험 확대');zoom.title='찾은 관찰 돋보기';zoom.innerHTML=icon('zoom');scene.append(zoom);}
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
 if(!dock){dock=document.createElement('div');dock.className='workspace-controls';dock.setAttribute('aria-label','이 화면의 조작 도구');stage.append(dock);}
 // Keep every control inside its original experiment so delegated events still reach it.
 for(const control of stage.querySelectorAll('.activity-tools,.control-panel,[data-time-controls],.tray-action-row,.process-controls,.cycle-controls,.cold-side,.cold-bubble,.bench-foot,.measure-records,.diagnosis-choices'))if(!dock.contains(control))dock.append(control);
 const phase=stage.querySelector('.cold-yard')?.dataset.sky;
 if(phase&&stage.dataset.workspacePhase!==phase)stage.dataset.workspacePhase=phase;
 const header=app.querySelector('.building-guide'),question=app.querySelector('.guided-question-panel');
 const top=Math.max(58,header?.getBoundingClientRect().height||0)+16;
 const bottom=Math.max(dock.getBoundingClientRect().height,question?.getBoundingClientRect().height||0)+16;
 for(const [name,value] of [['--workspace-header-height',top],['--workspace-controls-height',bottom]])if(stage.style.getPropertyValue(name)!==value+'px')stage.style.setProperty(name,value+'px');
}
function bindCompactGuide(){
 clockObserver?.disconnect();clockObserver=null;syncCompactGuide();integrateWorkspaceControls();const area=app.querySelector('.activity-area');if(!area)return;
 clockObserver=new MutationObserver(()=>{syncCompactGuide();integrateWorkspaceControls();});clockObserver.observe(area,{subtree:true,childList:true,attributes:true,attributeFilter:['value','height','aria-busy','hidden','open']});
}
window.addEventListener('resize',()=>{if(typeof state.route==='number')integrateWorkspaceControls();});
document.addEventListener('guided-question-change',()=>{if(typeof state.route==='number')render();});
export function render(){
 clockObserver?.disconnect();clockObserver=null;
 cleanupCoach();closeConcept();cleanupMapCamera();
 clearInterval(endingTimer);cleanupPhaser();cleanupFieldwork();cleanupActivity();cleanupWorkshop();document.documentElement.classList.toggle('reduce-motion',state.settings.reduced);const route=state.route;const fieldSelections=lastRenderedRoute===route?[...app.querySelectorAll('select[id^=field-]')].map(el=>[el.id,el.value]):[];const active=document.activeElement;const focusKey=lastRenderedRoute===route&&app.contains(active)?{id:active.id,action:active.dataset.action,scroll:active.closest('aside')?.scrollTop}:null;const panelKey=d=>d.className+'|'+d.querySelector(':scope > summary')?.textContent;const openPanels=new Map(lastRenderedRoute===route?[...app.querySelectorAll('details')].map(d=>[panelKey(d),d.open]):[]);currentTask=null;app.innerHTML=route==='home'?homeView():route==='map'?mapView():route==='ending'?endingView():experimentShell(route);lastRenderedRoute=route;setMusicTheme(route==='ending'?'ending':'main');document.title=(typeof route==='number'?screenNames[route]+' · ':'')+'방울이의 물길 탐험';
 if(typeof route==='number'){const resident=residentForStage(route);if(!state.settings.adminUnlock&&!state.residentsMet.includes(resident.stage)){state.residentsMet.push(resident.stage);save();}if(state.fieldwork.active===route)bindFieldwork(route,ctx);else{if(route<=8)bindActivity(route,ctx);bindWorkshop(route,ctx);}}
 if(state.fieldwork.active!==route){
  if(route==='map')mountMapCamera();
  mountPhaser(route,ctx,currentTask?.regions);simplifyControls(route);
 }
 bindObservation(state,routeAction,state.route===10?finalContext():null,persist,manual=>{manualToolsRoute=manual?state.route:null;render();});
 if(typeof route==='number')bindCompactGuide();
 if(typeof route==='number'){syncCoach(route,route<=8?getActivityProgress(route):workshopProgress(route),state.fieldwork.active===route,hasFieldSeal(route),currentTask);markStageControls(app,currentTask);integrateWorkspaceControls();}
 app.querySelectorAll('details').forEach(d=>{if(d.closest('.workspace-controls')&&!d.matches('.essential-controls'))d.open=false;else if(openPanels.has(panelKey(d)))d.open=openPanels.get(panelKey(d));else if(d.matches(".workshop-keyboard")&&matchMedia("(max-width:800px)").matches)d.open=false;});
 for(const [id,value] of fieldSelections){const select=document.getElementById(id);if(select&&[...select.options].some(o=>o.value===value))select.value=value;}
 syncStorageNotice();
 app.querySelectorAll('button.selected').forEach(b=>b.setAttribute('aria-pressed','true'));
 if(focusKey){const target=focusKey.id?document.getElementById(focusKey.id):[...app.querySelectorAll('[data-action]')].find(b=>b.dataset.action===focusKey.action);if(target&&!target.disabled){target.focus({preventScroll:true});if(target.closest('aside'))target.closest('aside').scrollTop=focusKey.scroll||0;}}
 if(route==='ending'&&!state.settings.reduced){const lines=['다섯 개의 연구 기록이 하나의 물길로.','예상과 달라도, 다시 관찰했어.','흘러내린 물방울을 모아 장치를 고쳤어.','네가 알아낸 과학으로 연구실이 다시 움직여.'];let i=0;endingTimer=setInterval(()=>{const el=document.querySelector('#ending-caption');if(el)el.textContent=lines[++i%lines.length];if(i>=3)clearInterval(endingTimer);},4000);}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;if(a!=='sound'&&state.settings.sound)playClick();
 if(a==='guided-tools'){stopObservation();const opening=manualToolsRoute!==state.route;manualToolsRoute=opening?state.route:null;render();if(!opening)queueMicrotask(()=>document.getElementById('observation-play')?.click());return;}
 if(a.startsWith('building-part-')){const n=Number(a.slice(14));if(canEnter(n,state)){manualToolsRoute=null;state.fieldwork.active=0;go(n);}return;}
 if(handleCoach(a))return;
 if(a==='sound')return changeSound(!state.settings.sound);if(a==='previous'){const route=previousRoute(state.route);if(route!==null)go(route);return;}
 if(a==='map-hint'){const trigger=document.querySelector('.map-coach'),bubble=document.querySelector('#map-coach-help');if(bubble){bubble.hidden=!bubble.hidden;trigger.setAttribute('aria-expanded',String(!bubble.hidden));}return;}if(a==='home')return go('home');if(a==='map')return go('map');if(a==='ending')return go('ending');
 if(a==='start'){return go(state.restored?'ending':state.pages.length&&canEnter(state.lastScreen,state)?state.lastScreen:'map');}
 if(a==='title-start')return startAdventure();
 if(a==='final-replay'&&state.route==='ending')return showStory('final');if(a.startsWith('ability-')){state.fieldwork.ability=a.slice(8);persist();render();return;}if(a==='notebook')return notebook();if(a==='discoveries')return discoveries();if(a==='focus-experiment')return focusExperiment();if(a==='settings')return settings();if(a==='certificate')return certificate();if(a==='print-certificate')return window.print();
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
 if(a.startsWith('mission-')){const m=+a.slice(8),screen=mapEntryScreen(m);if(!canEnter(screen,state))return;if(travelIsland(m-1,()=>go(screen)))return;return go(screen);}
 if(a.startsWith('screen-'))return go(+a.slice(7));
 if(a==='stage-letter'&&typeof state.route==='number'){openStageLetter(state.route);return;}
 if(a==='buddy-hint'&&state.fieldwork.active===state.route){toast(fieldMissions[state.route].goal);return;}if(a==='buddy-hint'){const p=state.route<=8?getActivityProgress(state.route):workshopProgress(state.route);toast(p.hint);return;}
 routeAction(a);
});
// Offline classroom play (built site only): install keeps the first screen, then one file at a time is saved while idle.
let offline=null;
async function warmOffline(){
 const reg=await navigator.serviceWorker.ready,pause=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;
 const ask=()=>new Promise(ok=>{const ch=new MessageChannel(),t=setTimeout(()=>ok(null),60000);ch.port1.onmessage=e=>{clearTimeout(t);ok(e.data);};reg.active?reg.active.postMessage({type:'warm'},[ch.port2]):ok(null);});
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
