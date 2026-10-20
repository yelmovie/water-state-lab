import {esc,icon} from './ui.js';
import {SETTINGS_CONTENT as C,STANDARDS} from './settings-content.js';
import {APP_VERSION} from './version.js';
import {playClick,setSoundSettings} from './sound.js';

const paragraphs=lines=>lines.map(line=>`<p>${esc(line)}</p>`).join('');
const details=(title,body)=>`<details class="settings-section"><summary>${esc(title)}</summary><div>${body}</div></details>`;
const switchButton=(id,label,on)=>`<div class="settings-row"><span id="${id}-label">${esc(label)}</span><button id="${id}" class="settings-switch" type="button" aria-labelledby="${id}-label ${id}-state" aria-pressed="${on}"><span class="settings-switch-track" aria-hidden="true"></span><span id="${id}-state">${esc(on?C.sound.on:C.sound.off)}</span></button></div>`;
let activeDialog;

/** One modal and one all-stage preview toggle; teacher preview never grants rewards. */
export function openSettings({state,save=()=>{},render=()=>{},go=()=>{},reset=()=>{},openIntro=()=>{},certificate=()=>{},onSoundChange=()=>{},onReset}){
 if(activeDialog?.open){activeDialog.focus();return activeDialog;}
 const opener=document.activeElement,dialog=document.createElement('dialog');
 dialog.className='settings-dialog';dialog.setAttribute('aria-labelledby','settings-title');
 const settings=state.settings;
 const done=state.restored===true&&[1,2,3,4,5].every(id=>state.completed.includes(id));
 const teacher=`${paragraphs(C.teacher.lines)}${details(C.teacher.standardsTitle,`<p>${esc(C.teacher.standardsIntro)}</p>${STANDARDS.map(s=>`<p><strong>[${esc(s.code)}]</strong> ${esc(s.text)}</p>`).join('')}`)}${details(C.teacher.toolsTitle,`<p>${esc(C.teacher.toolsIntro)}</p><button type="button" id="settings-unlock" class="btn secondary wide" aria-pressed="${settings.adminUnlock===true}">${esc(settings.adminUnlock?C.teacher.toolsOn:C.teacher.toolsOff)}</button><p class="settings-muted">${esc(C.teacher.toolsNote)}</p>${switchButton('settings-reduced',C.sound.reduced,settings.reduced===true)}`)}`;
 const credits=`${paragraphs(C.credits.lines)}${details(C.credits.sourcesTitle,`<p>${esc(C.credits.sourcesIntro)}</p>${C.credits.sources.map(([title,text])=>`<p><strong>${esc(title)}</strong><br>${esc(text)}</p>`).join('')}`)}<p>${esc(C.credits.copyright)}</p><p>${esc(C.credits.own)}</p><p>${esc(C.credits.external)}</p><p>${esc(C.credits.references)}</p>`;
 dialog.innerHTML=`<div class="settings-head"><h2 id="settings-title">${esc(C.title)}</h2><button type="button" id="settings-x" class="icon-btn" aria-label="${esc(C.close)}">${icon('close')}</button></div><div class="settings-scroll">${switchButton('settings-bgm',C.sound.bgm,settings.bgm===true)}${switchButton('settings-sfx',C.sound.sfx,settings.sfx!==false)}<div class="settings-volume"><label for="settings-bgm-volume">${esc(C.sound.volume)} <output id="settings-volume-output">${settings.bgmVolume??35}%</output></label><input type="range" id="settings-bgm-volume" min="0" max="100" step="5" value="${settings.bgmVolume??35}" ${settings.bgm?'':'disabled'}></div><button type="button" id="settings-intro" class="btn secondary wide">${esc(C.replay.intro)}</button><div class="settings-replays"><button type="button" id="settings-ending" class="btn secondary wide" ${done?'':'disabled'}>${done?'':icon('lock',18)} ${esc(C.replay.ending)}</button><button type="button" id="settings-certificate" class="btn secondary wide" ${done?'':'disabled'}>${done?'':icon('lock',18)} ${esc(C.replay.certificate)}</button>${done?'':`<p class="settings-muted">${esc(C.replay.locked)}</p>`}</div>${details(C.app.title,C.app.rows.map(([label,text])=>`<p><strong>${esc(label)}</strong><br>${esc(text)}</p>`).join('')+`<p class="settings-signature">${esc(C.app.name)} v${esc(APP_VERSION)} · ${esc(C.app.maker)}</p>`)}${details(C.student.title,paragraphs(C.student.lines))}${details(C.teacher.title,teacher)}${details(C.credits.title,credits)}</div><footer class="settings-footer"><button type="button" id="settings-reset" class="btn secondary">${esc(C.reset.button)}</button><button type="button" id="settings-close" class="btn primary">${esc(C.close)}</button></footer>`;
 document.body.append(dialog);activeDialog=dialog;
 dialog.addEventListener('close',()=>{activeDialog=undefined;dialog.remove();if(opener?.isConnected)opener.focus();},{once:true});
 const close=()=>dialog.close();
 dialog.querySelector('#settings-x').onclick=close;dialog.querySelector('#settings-close').onclick=close;
 const updateSwitch=(id,on)=>{const b=dialog.querySelector(id);b.setAttribute('aria-pressed',String(on));b.querySelector('span:last-child').textContent=on?C.sound.on:C.sound.off;};
 const syncSound=()=>{settings.sound=settings.bgm||settings.sfx;setSoundSettings(settings);save();onSoundChange(settings);};
 dialog.querySelector('#settings-bgm').onclick=()=>{settings.bgm=!settings.bgm;updateSwitch('#settings-bgm',settings.bgm);dialog.querySelector('#settings-bgm-volume').disabled=!settings.bgm;syncSound();};
 dialog.querySelector('#settings-sfx').onclick=()=>{settings.sfx=settings.sfx===false;updateSwitch('#settings-sfx',settings.sfx);syncSound();if(settings.sfx)void playClick();};
 dialog.querySelector('#settings-bgm-volume').oninput=e=>{settings.bgmVolume=Number(e.target.value);dialog.querySelector('#settings-volume-output').textContent=`${settings.bgmVolume}%`;syncSound();};
 dialog.querySelector('#settings-unlock').onclick=e=>{
  settings.adminUnlock=!settings.adminUnlock;e.currentTarget.setAttribute('aria-pressed',String(settings.adminUnlock));e.currentTarget.textContent=settings.adminUnlock?C.teacher.toolsOn:C.teacher.toolsOff;
  save();render();
 };
 dialog.querySelector('#settings-reduced').onclick=()=>{settings.reduced=!settings.reduced;updateSwitch('#settings-reduced',settings.reduced);document.documentElement.classList.toggle('reduce-motion',settings.reduced);save();};
 dialog.querySelector('#settings-intro').onclick=()=>{close();openIntro();};
 dialog.querySelector('#settings-ending').onclick=()=>{if(!done)return;close();go('ending');};
 dialog.querySelector('#settings-certificate').onclick=()=>{if(!done)return;close();certificate();};
 dialog.querySelector('#settings-reset').onclick=()=>{
  const confirmation=document.createElement('dialog');confirmation.className='settings-confirm';confirmation.setAttribute('aria-labelledby','settings-reset-title');
  confirmation.innerHTML=`<h2 id="settings-reset-title">${esc(C.reset.title)}</h2><p>${esc(C.reset.body)}</p><div class="settings-confirm-actions"><button type="button" id="settings-cancel-reset" class="btn secondary" autofocus>${esc(C.reset.cancel)}</button><button type="button" id="settings-confirm-reset" class="btn danger">${esc(C.reset.confirm)}</button></div>`;
  document.body.append(confirmation);
  confirmation.addEventListener('close',()=>{confirmation.remove();if(dialog.open)dialog.querySelector('#settings-reset').focus();},{once:true});
  confirmation.querySelector('#settings-cancel-reset').onclick=()=>confirmation.close();
  confirmation.querySelector('#settings-confirm-reset').onclick=()=>{
   const audio={sound:settings.sound,bgm:settings.bgm,sfx:settings.sfx,bgmVolume:settings.bgmVolume};
   confirmation.close();close();
   if(onReset)onReset(audio);else{reset(audio);setSoundSettings(audio);go('home');}
  };
  confirmation.showModal();confirmation.querySelector('#settings-cancel-reset').focus();
 };
 dialog.showModal();dialog.querySelector('#settings-x').focus();return dialog;
}
