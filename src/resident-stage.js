import {modal,esc} from './ui.js';
import {attachNpcVoice} from './npc-voice.js';
import {state} from './state.js';

let releaseCurrent=()=>{};
export function residentStage(resident,{lines,actions,context='',portrait,voice}){
 releaseCurrent();
 const text=lines.join(' ');
 const dialog=modal(`${resident.name}의 이야기`,`<div class="water-conversation"><div class="water-character">${portrait}</div><section class="water-paper"><div class="water-speaker"><strong>${esc(resident.name)}</strong><span>${esc(resident.role)}</span></div>${context?`<div class="water-context">${context}</div>`:''}<p class="water-speech" role="button" tabindex="0" aria-label="대사 모두 보기"><span class="water-layout" aria-hidden="true">${esc(text)}</span><span class="water-visual" aria-hidden="true"></span></p><span class="water-readable" role="status">${esc(text)}</span><div class="water-controls"><div class="water-actions">${actions}</div></div></section></div>`);
 dialog.className='water-stage-dialog';
 const scene=dialog.querySelector('.water-conversation'),visual=dialog.querySelector('.water-visual');
 const events=new AbortController(),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,animation;
 const finish=()=>{cancelAnimationFrame(frame);frame=0;visual.textContent=text;};
 const stop=()=>{finish();animation?.cancel();};
 const dispose=()=>{stop();events.abort();observer.disconnect();if(releaseCurrent===dispose)releaseCurrent=()=>{};};
 const observer=new MutationObserver(()=>{if(!scene.isConnected)dispose();});
 observer.observe(dialog,{childList:true,subtree:true});
 dialog.addEventListener('close',()=>{if(!dialog.open)dispose();},{signal:events.signal});
 const speech=dialog.querySelector('.water-speech');
 speech.addEventListener('click',finish,{signal:events.signal});
 speech.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();finish();}},{signal:events.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();},{signal:events.signal});
 motion.addEventListener('change',()=>{if(motion.matches)stop();},{signal:events.signal});
 if(motion.matches||state.settings.reduced||document.hidden)finish();
 else{
  const characters=Array.from(text),start=performance.now();
  const tick=now=>{const count=Math.floor((now-start)/25)+1;visual.textContent=characters.slice(0,count).join('');if(count>=characters.length)finish();else frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);
  animation=dialog.querySelector('.water-character').animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
 }
 releaseCurrent=dispose;
 if(voice){attachNpcVoice(dialog,voice);const control=dialog.querySelector('.npc-voice-control');if(control)dialog.querySelector('.water-controls').append(control);}
 return dialog;
}
