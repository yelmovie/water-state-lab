import {concepts} from './concept-data.js';
import {btn,buddy,esc,icon} from './ui.js';
import {setMusicQuiet,playCue} from './sound.js';

let active=null;
export function closeConcept(){active?.close();}
export function openConcept(n,{reduced=false,onContinue,continueLabel='실험으로 돌아가기'}={}){
 const clip=concepts[n];if(!clip)return;
 closeConcept();
 const opener=document.activeElement,d=document.createElement('dialog');
 d.className='concept-dialog';d.setAttribute('aria-labelledby','concept-title');
 d.innerHTML=`<div class="dialog-head"><div><span class="eyebrow">${n}번째 발견 · 9초 개념 영상</span><h2 id="concept-title">${clip.title}</h2></div><button class="icon-btn" data-concept="close" aria-label="영상 닫기">${icon('close')}</button></div><div class="concept-body"><div class="concept-screen"><video muted playsinline preload="metadata" poster="/assets/concepts/stage-${n}.webp" aria-label="${esc(clip.title)} · 소리 없는 개념 영상"></video><img class="concept-end" src="/assets/concepts/stage-${n}.webp" alt="${esc(clip.title)} 마지막 장면" hidden><button class="btn primary concept-play" data-concept="play">영상 재생</button></div><div class="concept-caption">${buddy('point')}<p role="status" aria-live="polite">${esc(clip.cues[0].text)}</p></div><div class="concept-beats" aria-label="영상의 세 장면">${clip.cues.map((c,i)=>`<button data-cue="${i}" aria-label="${i+1}번째 설명 보기" aria-pressed="${i===0}">${i+1}</button>`).join('')}</div><ol class="concept-transcript" hidden>${clip.cues.map(c=>`<li>${esc(c.text)}</li>`).join('')}</ol></div><footer class="concept-footer"><button class="btn secondary" data-concept="replay">다시 보기</button>${btn(continueLabel,'','primary').replace('data-action=""','data-concept="continue"')}</footer>`;
 document.body.append(d);const video=d.querySelector('video'),end=d.querySelector('.concept-end'),play=d.querySelector('[data-concept=play]'),caption=d.querySelector('.concept-caption p'),list=d.querySelector('.concept-transcript');
 let closed=false,failed=false,cue=-1,waiting;
 const showCue=i=>{if(i===cue)return;cue=i;caption.textContent=clip.cues[i].text;d.querySelectorAll('[data-cue]').forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));};
 const sync=()=>showCue(Math.min(2,Math.floor(video.currentTime/3)));
 function close(){if(closed)return;closed=true;clearTimeout(waiting);video.pause();video.removeAttribute('src');video.load();d.close();d.remove();document.removeEventListener('visibilitychange',visibility);setMusicQuiet(false);if(active?.dialog===d)active=null;if(opener?.isConnected)opener.focus({preventScroll:true});}
 function fallback(){if(closed||failed)return;failed=true;clearTimeout(waiting);video.pause();video.removeAttribute('src');video.load();video.hidden=true;end.hidden=false;play.hidden=true;list.hidden=false;d.querySelector('.concept-beats').hidden=true;caption.textContent='영상 대신 세 장면의 핵심을 함께 살펴봐.';d.querySelector('[data-concept=replay]').hidden=true;}
 function start(){if(closed||failed)return;clearTimeout(waiting);waiting=setTimeout(()=>{if(!closed&&video.paused&&!video.ended)play.hidden=false;},6000);end.hidden=true;void video.play().then(()=>{if(!closed)play.hidden=true;clearTimeout(waiting);}).catch(()=>{if(!closed){play.hidden=false;end.hidden=false;}});}
 const visibility=()=>{if(document.hidden){video.pause();play.hidden=false;}};
 d.addEventListener('cancel',e=>{e.preventDefault();close();});
 d.addEventListener('close',close,{once:true});
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.cue!==undefined&&!failed){video.pause();video.currentTime=Number(b.dataset.cue)*3;end.hidden=true;play.hidden=false;showCue(Number(b.dataset.cue));return;}
  const a=b.dataset.concept;if(a==='close')close();if(a==='play')start();if(a==='replay'){video.currentTime=0;showCue(0);start();}if(a==='continue'){close();onContinue?.();}
 });
 video.addEventListener('timeupdate',sync);video.addEventListener('seeked',sync);
 video.addEventListener('ended',()=>{end.hidden=false;showCue(2);play.hidden=true;d.querySelector('[data-concept=continue]').focus();});
 video.addEventListener('error',fallback);
 video.addEventListener('loadedmetadata',()=>{clearTimeout(waiting);if(!reduced&&!matchMedia('(prefers-reduced-motion: reduce)').matches)start();},{once:true});
 document.addEventListener('visibilitychange',visibility);active={close,dialog:d};setMusicQuiet(true);void playCue('discover');
 video.src=`/assets/concepts/stage-${n}.${video.canPlayType('video/webm; codecs="vp9"')?'webm':'mp4'}`;
 waiting=setTimeout(()=>{if(video.readyState<1)fallback();},6500);
 d.showModal();d.querySelector('[data-concept=continue]').focus();
}
