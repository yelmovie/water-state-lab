import {btn,esc} from './ui.js';
import {residentForStage,residentPortrait,prepareResidentPortrait} from './island-residents.js';
import {fieldMissions,experimentTitles} from './fieldwork-model.js';
import {state,save} from './state.js';
import {stageLetters,fieldLetters} from './npc-content.js';
import {residentStage} from './resident-stage.js';
import {npcRecordings} from './npc-audio.js';

function letter(n,lines,field){
 const npc=residentForStage(n);if(!npc||!lines)return;
 const title=field?fieldMissions[n]?.title:experimentTitles[n];if(!title)return;
 const key=`${field?'field':'letter'}-${String(n).padStart(2,'0')}`;
 const dialog=residentStage(npc,{lines,context:esc(title),portrait:residentPortrait(npc,'think'),actions:btn(field?'부탁을 해결하러 가자':'직접 알아보러 가자','field-help-close','primary'),voice:npcRecordings[key]?.text===lines.join(' ')?key:undefined});
 prepareResidentPortrait(dialog);
 return dialog;
}
export const openFieldBriefing=n=>letter(n,fieldLetters[n],true);
export const openStageLetter=n=>letter(n,stageLetters[n],false);
export function offerStageLetter(n){
 if(!stageLetters[n]||state.inquiry.stageBriefed.includes(n))return;
 const show=()=>{if(state.route!==n||state.fieldwork.active===n||state.inquiry.stageBriefed.includes(n))return;const open=document.querySelector('dialog[open]');if(open){open.addEventListener('close',()=>queueMicrotask(show),{once:true});return;}state.inquiry.stageBriefed.push(n);save();openStageLetter(n);};
 queueMicrotask(show);
}
