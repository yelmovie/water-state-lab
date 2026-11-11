import {esc,icon} from './ui.js';
import {SETTINGS_CONTENT as C,STANDARDS,STAGE_LEARNING} from './settings-content.js';
import {APP_VERSION} from './version.js';
import {playClick,setSoundSettings} from './sound.js';
import {concepts} from './concept-data.js';
import {openConcept} from './concepts.js';
import {fieldReady,experimentTitles} from './fieldwork-model.js';
import {captureResetToken,getStorageStatus} from './state.js';

const paragraphs=lines=>lines.map(line=>`<p>${esc(line)}</p>`).join('');
const details=(title,body)=>`<details class="settings-section"><summary>${esc(title)}</summary><div>${body}</div></details>`;
const switchButton=(id,label,on)=>`<div class="settings-row"><span id="${id}-label">${esc(label)}</span><button id="${id}" class="settings-switch" type="button" aria-labelledby="${id}-label" aria-describedby="${id}-state" aria-pressed="${on}"><span class="settings-switch-track" aria-hidden="true"></span><span id="${id}-state">${esc(on?C.sound.on:C.sound.off)}</span></button></div>`;
let activeDialog;
/** Teacher-facing line for the offline cache; status comes from the built site's service worker. */
export const offlineText=({done,total})=>total&&done>=total?C.teacher.offlineDone:C.teacher.offlineSaving.replace('{n}',total?Math.floor(done/total*100):0);

/** Optional videos preserve the settings list and return focus to its selected item. */
export function openSettings({state,save=()=>{},render=()=>{},go=()=>{},reset=()=>{},showStory=()=>{},certificate=()=>{},notebook,discoveries,onSoundChange=()=>{},onReset,getResetToken=captureResetToken,storageStatus=getStorageStatus,offline=()=>null}){
 if(activeDialog?.open){activeDialog.querySelector('#settings-x').focus();return activeDialog;}
 const opener=document.activeElement,dialog=document.createElement('dialog');
 dialog.className='settings-dialog';dialog.setAttribute('aria-labelledby','settings-title');
 const settings=state.settings;
 const earnedCertificate=()=>!settings.adminUnlock&&state.restored===true&&[1,2,3,4,5].every(id=>state.completed.includes(id));
 const conceptUnlocked=n=>settings.adminUnlock||([3,4].includes(n)&&state.completed.includes(n))||fieldReady(n*2,state.fieldwork?.chapters?.[n*2]);
 const done=earnedCertificate();
 const learning=details('실험별 배움',`<ol class="settings-learning">${STAGE_LEARNING.map(stage=>`<li><strong>${stage.stage}장 · ${esc(stage.title)}</strong><p>${esc(stage.objective)}</p><small>성취기준 [${esc(stage.standard)}]</small></li>`).join('')}</ol>`);
 const cache=offline(),teacher=`<h3>${esc(C.teacher.standardsTitle)}</h3><ul class="settings-standards">${STANDARDS.map(s=>`<li><strong>[${esc(s.code)}]</strong> ${esc(s.text)}</li>`).join('')}</ul>${learning}`;
 const offlineStatus=cache?`<p id="settings-offline" class="settings-muted" role="status">${esc(offlineText(cache))}</p>`:'';
 const teacherTools=`<section class="settings-unlock-card" aria-label="교사 시연"><h3>교사용 설정</h3>${switchButton('settings-autoplay','자동으로 보기',settings.autoplay!==false)}<p class="settings-muted">켜면 준비와 시간 관찰을 자동으로 진행해요. 예상과 답은 학생이 직접 골라요. 끄면 학생이 도구와 시계를 눌러 진행해요.</p>${switchButton('settings-unlock',C.teacher.toolsTitle,!!settings.adminUnlock)}<p id="settings-preview-notice" class="settings-muted" role="status">${esc(settings.adminUnlock?C.teacher.toolsOn:C.teacher.toolsOff)}</p></section>`;
 const credits=`${paragraphs(C.credits.lines)}${details(C.credits.sourcesTitle,`<p>${esc(C.credits.sourcesIntro)}</p>${C.credits.sources.map(([title,text])=>`<p><strong>${esc(title)}</strong><br>${esc(text)}</p>`).join('')}`)}<p>${esc(C.credits.copyright)}</p><p>${esc(C.credits.own)}</p><p>${esc(C.credits.external)}</p><p>${esc(C.credits.references)}</p>`;
 const clips=()=>concepts.slice(1).map(clip=>{
  const unlocked=conceptUnlocked(clip.id);
  return `<button type="button" class="settings-concept-card" data-settings-concept="${clip.id}" ${unlocked?'':'disabled'}><img src="/assets/concepts/zone-${clip.id}.webp" alt="" loading="lazy"><span><strong>${clip.id}. ${esc(unlocked?clip.title:experimentTitles[clip.id])}</strong><small>${unlocked?(settings.adminUnlock?`교사 시연 · ${clip.seconds}초`:C.replay.conceptReady):esc(C.replay.conceptLocked.replace('{n}',clip.id))}</small></span>${unlocked?'':icon('lock',20)}</button>`;
 }).join('');
 const records=`<div class="settings-records">${notebook?`<button type="button" id="settings-notebook" class="btn secondary">${icon('book')}${esc(C.app.notebook)}</button>`:''}${discoveries?`<button type="button" id="settings-discoveries" class="btn secondary">${icon('flask')}${esc(C.app.discoveries)}</button>`:''}</div>`;
 const audio=`${switchButton('settings-bgm',C.sound.bgm,settings.bgm===true)}${switchButton('settings-sfx',C.sound.sfx,settings.sfx!==false)}<div class="settings-volume"><label for="settings-bgm-volume">${esc(C.sound.volume)} <output id="settings-volume-output" for="settings-bgm-volume">${settings.bgmVolume??35}%</output></label><input type="range" id="settings-bgm-volume" min="0" max="100" step="5" value="${settings.bgmVolume??35}" aria-valuetext="${settings.bgmVolume??35}%" ${settings.bgm?'':'disabled'}></div>${switchButton('settings-reduced',C.sound.reduced,settings.reduced===true)}`;
 const videos=`<div class="settings-replays"><button type="button" id="settings-ending" class="btn secondary wide" ${done||settings.adminUnlock?'':'disabled aria-describedby="settings-replay-locked"'}>${esc(C.replay.ending)}</button><button type="button" id="settings-certificate" class="btn secondary wide" ${done?'':'disabled aria-describedby="settings-replay-locked"'}>${esc(C.replay.certificate)}</button><p id="settings-replay-locked" class="settings-muted" ${done?'hidden':''}>${esc(C.replay.locked)}</p></div>${details(C.replay.concepts,`<div id="settings-concept-list" class="settings-concept-list">${clips()}</div>`)}`;
 const guides=details(C.student.title,paragraphs(C.student.lines))+details(C.teacher.title,teacher)+details(C.app.title,C.app.rows.map(([label,text])=>`<p><strong>${esc(label)}</strong><br>${esc(text)}</p>`).join('')+records+offlineStatus+`<p id="storage-diagnostics" class="settings-muted"></p><p class="settings-signature">${esc(C.app.name)} v${esc(APP_VERSION)} · ${esc(C.app.maker)}</p>`)+details(C.credits.title,credits);
 dialog.innerHTML=`<div class="settings-head"><h2 id="settings-title">${esc(C.title)}</h2><button type="button" id="settings-x" class="icon-btn" aria-label="${esc(C.close)}">${icon('close')}</button></div><p id="settings-save-notice" class="settings-notice" role="alert" hidden></p><div class="settings-scroll">${teacherTools}${details('소리 · 화면',audio)}<button type="button" id="settings-intro" class="btn secondary wide">${esc(C.replay.intro)}</button>${details('영상·인증서',videos)}${details('가이드 · 앱 정보',guides)}</div><footer class="settings-footer"><button type="button" id="settings-reset" class="btn secondary" ${settings.adminUnlock?'disabled aria-describedby="settings-preview-notice"':''}>${esc(C.reset.button)}</button><button type="button" id="settings-close" class="btn primary">${esc(C.close)}</button></footer>`;
 document.body.append(dialog);activeDialog=dialog;
 let confirmation;
 dialog.addEventListener('close',()=>{
  confirmation?.close();if(activeDialog===dialog)activeDialog=undefined;dialog.remove();render();
  if(!document.querySelector('dialog[open]'))(opener?.isConnected?opener:document.querySelector('[data-action="settings"]'))?.focus({preventScroll:true});
 },{once:true});
 const close=()=>dialog.close();
 dialog.querySelector('#settings-x').onclick=close;dialog.querySelector('#settings-close').onclick=close;
 const showStatus=()=>{const status=storageStatus(),notice=dialog.querySelector('#settings-save-notice');notice.textContent=status.message||'';notice.hidden=!status.message;
 const diagnostics=dialog.querySelector('#storage-diagnostics');
 diagnostics.textContent=`현재 저장 상태 · 읽기 ${status.read==='ok'?'성공':'실패'} · 쓰기 ${{saved:'성공',failed:'실패',blocked:'보류','not-attempted':'아직 시도 전'}[status.write]||'확인 전'} · 충돌 ${status.conflict?'있음':'없음'} · 원본 보호 ${status.protected?'중':'없음'}${status.preview?' · 교사 시연은 학생 진행과 분리':''}`;
 };
 const persist=()=>{const result=save();showStatus();return result;};
 const updateSwitch=(id,on)=>{const b=dialog.querySelector(id);b.setAttribute('aria-pressed',String(on));b.querySelector('span:last-child').textContent=on?C.sound.on:C.sound.off;};
 const syncSound=()=>{settings.sound=settings.bgm||settings.sfx;setSoundSettings(settings);persist();onSoundChange(settings);};
 dialog.querySelector('#settings-bgm').onclick=()=>{settings.bgm=!settings.bgm;updateSwitch('#settings-bgm',settings.bgm);dialog.querySelector('#settings-bgm-volume').disabled=!settings.bgm;syncSound();};
 dialog.querySelector('#settings-sfx').onclick=()=>{settings.sfx=settings.sfx===false;updateSwitch('#settings-sfx',settings.sfx);syncSound();if(settings.sfx)void playClick();};
 dialog.querySelector('#settings-bgm-volume').oninput=e=>{settings.bgmVolume=Number(e.target.value);e.target.setAttribute('aria-valuetext',`${settings.bgmVolume}%`);dialog.querySelector('#settings-volume-output').textContent=`${settings.bgmVolume}%`;syncSound();};
 dialog.querySelector('#settings-autoplay').onclick=()=>{settings.autoplay=settings.autoplay===false;updateSwitch('#settings-autoplay',settings.autoplay);persist();render();};
 dialog.querySelector('#settings-unlock').onclick=()=>{
  settings.adminUnlock=!settings.adminUnlock;
  persist(); // Ending a preview restores the student snapshot before any unlocks are refreshed.
  updateSwitch('#settings-unlock',settings.adminUnlock);
  const unlocked=earnedCertificate();
  dialog.querySelector('#settings-preview-notice').textContent=settings.adminUnlock?C.teacher.toolsOn:C.teacher.toolsOff;
  dialog.querySelector('#settings-reset').disabled=settings.adminUnlock;
  dialog.querySelector('#settings-ending').disabled=!unlocked&&!settings.adminUnlock;
  dialog.querySelector('#settings-certificate').disabled=!unlocked;
  dialog.querySelector('#settings-replay-locked').hidden=unlocked;
  dialog.querySelector('#settings-concept-list').innerHTML=clips();
  render();
 };
 dialog.querySelector('#settings-reduced').onclick=()=>{settings.reduced=!settings.reduced;updateSwitch('#settings-reduced',settings.reduced);document.documentElement.classList.toggle('reduce-motion',settings.reduced);persist();};
 dialog.querySelector('#settings-intro').onclick=()=>showStory('intro');
 dialog.querySelector('#settings-ending').onclick=()=>{if(earnedCertificate()||settings.adminUnlock)showStory('final');};
 dialog.querySelector('#settings-certificate').onclick=()=>{if(earnedCertificate()){close();certificate();}};
 if(notebook)dialog.querySelector('#settings-notebook').onclick=()=>{close();notebook();};
 if(discoveries)dialog.querySelector('#settings-discoveries').onclick=()=>{close();discoveries();};
 dialog.querySelector('#settings-concept-list').onclick=e=>{
  const button=e.target.closest('[data-settings-concept]');if(!button||button.disabled)return;
  const n=Number(button.dataset.settingsConcept);
  if(conceptUnlocked(n))openConcept(n,{reduced:settings.reduced,continueLabel:C.replay.conceptReturn});
 };
 dialog.querySelector('#settings-reset').onclick=()=>{
  if(settings.adminUnlock||confirmation?.open)return;
  const token=getResetToken();if(!token){showStatus();return;}
  confirmation=document.createElement('dialog');confirmation.className='settings-confirm';confirmation.setAttribute('aria-labelledby','settings-reset-title');confirmation.setAttribute('aria-describedby','settings-reset-description');
  confirmation.innerHTML=`<h2 id="settings-reset-title">${esc(C.reset.title)}</h2><p id="settings-reset-description">${esc(C.reset.body)}</p><p id="settings-reset-error" role="alert" hidden></p><div class="settings-confirm-actions"><button type="button" id="settings-cancel-reset" class="btn secondary" autofocus>${esc(C.reset.cancel)}</button><button type="button" id="settings-confirm-reset" class="btn danger">${esc(C.reset.confirm)}</button></div>`;
  document.body.append(confirmation);const current=confirmation;
  current.addEventListener('close',()=>{current.remove();if(confirmation===current)confirmation=undefined;if(dialog.open)dialog.querySelector('#settings-reset').focus({preventScroll:true});},{once:true});
  current.querySelector('#settings-cancel-reset').onclick=()=>current.close();
  current.querySelector('#settings-confirm-reset').onclick=()=>{
   const audio={sound:settings.sound,bgm:settings.bgm,sfx:settings.sfx,bgmVolume:settings.bgmVolume};
   const success=onReset?onReset(audio,token):reset(token);
   if(success===false){const error=current.querySelector('#settings-reset-error');error.textContent=storageStatus().message||C.reset.failed;error.hidden=false;current.querySelector('#settings-confirm-reset').disabled=true;current.querySelector('#settings-cancel-reset').focus();return;}
   current.close();close();if(!onReset){setSoundSettings(audio);go('home');}
  };
  current.showModal();current.querySelector('#settings-cancel-reset').focus();
 };
 showStatus();dialog.showModal();dialog.querySelector('#settings-x').focus();return dialog;
}
