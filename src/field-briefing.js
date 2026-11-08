import {modal,btn,esc} from './ui.js';
import {residentForStage} from './island-residents.js';
import {fieldMissions,experimentTitles} from './fieldwork-model.js';
import {state,save} from './state.js';
import {stageLetters,fieldLetters} from './npc-content.js';
import {attachNpcVoice} from './npc-voice.js';
import {npcRecordings} from './npc-audio.js';

function letter(n,lines,field){
 const npc=residentForStage(n);if(!npc||!lines)return;
 const title=field?fieldMissions[n]?.title:experimentTitles[n];if(!title)return;
 const dialog=modal(`${npc.name}의 ${field?'부탁':'실험'} 편지`,`<article class="field-briefing"><div class="letter-paper"><header class="letter-head"><div class="letter-subject"><p class="letter-to">탐험가 친구에게</p><h3>${esc(title)}</h3></div><p class="letter-postmark"><span>${esc(npc.spot)}</span><b>실험 안내</b></p><figure class="letter-stamp"><div><img src="/assets/v2/resident-${npc.stage}.webp" alt="" width="180" height="180"><figcaption>${esc(npc.name)}</figcaption></div></figure></header><div class="letter-body">${lines.map(text=>`<p>${esc(text)}</p>`).join('')}</div><p class="letter-from">${esc(npc.role)} ${esc(npc.name)} 보냄</p></div><div class="briefing-actions">${btn(field?'부탁을 해결하러 가자':'직접 알아보러 가자','field-help-close','primary')}</div></article>`);
 const key=`${field?'field':'letter'}-${String(n).padStart(2,'0')}`;
 if(npcRecordings[key]?.text===lines.join(' '))attachNpcVoice(dialog,key);return dialog;
}
export const openFieldBriefing=n=>letter(n,fieldLetters[n],true);
export const openStageLetter=n=>letter(n,stageLetters[n],false);
export function offerStageLetter(n){
 if(!stageLetters[n]||state.inquiry.stageBriefed.includes(n))return;
 const show=()=>{if(state.route!==n||state.fieldwork.active===n||state.inquiry.stageBriefed.includes(n))return;const open=document.querySelector('dialog[open]');if(open){open.addEventListener('close',()=>queueMicrotask(show),{once:true});return;}state.inquiry.stageBriefed.push(n);save();openStageLetter(n);};
 queueMicrotask(show);
}
