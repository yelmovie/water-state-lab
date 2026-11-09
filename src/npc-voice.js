import {state} from './state.js';
import {setMusicQuiet} from './sound.js';
import {icon} from './ui.js';
import {npcAudio} from './npc-audio.js';
let stopCurrent;
export function stopNpcVoice(){stopCurrent?.();}
export function attachNpcVoice(dialog,key){
 stopNpcVoice();const src=npcAudio[key];if(!src)return;
 const box=document.createElement('div');box.className='npc-voice-control';
 box.innerHTML=`<button type="button" class="btn secondary npc-listen">${icon('speaker',20)}<span>목소리 듣기</span></button><span class="npc-voice-status" role="status"></span><audio preload="metadata" src="${src}"></audio>`;
 dialog.append(box);const audio=box.querySelector('audio'),button=box.querySelector('button'),label=button.querySelector('span'),status=box.querySelector('.npc-voice-status');
 const lifetime=new AbortController(),{signal}=lifetime;
 const update=()=>{const playing=!audio.paused;label.textContent=playing?'잠깐 멈추기':audio.currentTime?'다시 듣기':'목소리 듣기';button.setAttribute('aria-pressed',String(playing));dialog.classList.toggle('npc-speaking',playing);setMusicQuiet(playing);};
 const stop=()=>{if(signal.aborted)return;observer.disconnect();lifetime.abort();audio.pause();audio.removeAttribute('src');audio.load();dialog.classList.remove('npc-speaking');setMusicQuiet(false);if(stopCurrent===stop)stopCurrent=undefined;};
 const observer=new MutationObserver(()=>{if(!box.isConnected)stop();});observer.observe(dialog,{childList:true,subtree:true});
 const play=()=>{if(!state.settings.sound||state.settings.sfx===false||document.hidden){status.textContent='위쪽 스피커로 게임 소리를 켜 줘.';return;}status.textContent='';audio.currentTime=0;void audio.play().catch(()=>{if(!signal.aborted)status.textContent='듣기 버튼을 다시 눌러 줘. 글로도 읽을 수 있어.';});};
 button.addEventListener('click',()=>audio.paused?play():audio.pause(),{signal});
 for(const event of ['playing','pause','ended'])audio.addEventListener(event,update,{signal});
 audio.addEventListener('error',()=>{update();status.textContent='목소리를 불러오지 못했어. 글로 읽을 수 있어.';},{signal});
 document.addEventListener('game-audio-settings',()=>{if(!state.settings.sound||state.settings.sfx===false)audio.pause();},{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();},{signal});
 dialog.addEventListener('close',stop,{signal,once:true});
 stopCurrent=stop;if(state.settings.sound&&state.settings.sfx!==false&&!document.hidden)play();
}
