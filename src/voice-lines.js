import {state} from './state.js';
import {holdMusic,releaseMusic,soundUnlocked} from './sound.js';
import {voiceLines} from './voice-lines-data.js';

// Reads popup text aloud with the recorded ElevenLabs line whose words match exactly what is on screen.
// One voice at a time: a new line replaces the old one, and closing the popup stops it.
const norm=text=>String(text||'').replace(/\s+/g,'');
const exact=new Map(),suffix=[];
for(const [text,src,mode] of voiceLines){if(mode==='suffix')suffix.push([norm(text),src]);else exact.set(norm(text),src);}
export function voiceFor(text){const t=norm(text);if(!t)return '';return exact.get(t)||suffix.find(([s])=>t.endsWith(s))?.[1]||'';}

const WATCH='.concept-caption p,.collector-concept-copy p,.lesson-card strong,#stage-how,.drop-feedback,.drop-world-label,#map-coach-help p,.coach-help p,.freeze-talk-line,.activity-status,.mv-say b,.start-tagline,#ending-caption';
const QUEUED='.concept-caption p,.lesson-card strong';
let audio=null,owner=null,pending=[],lastSrc='',lastAt=0,waiting=null;
const audible=()=>state.settings.sound&&state.settings.sfx!==false&&!document.hidden;
const otherVoice=()=>[...document.querySelectorAll('.npc-voice-control audio')].some(a=>!a.paused&&!a.ended);
// The music plays at a quarter under a line ('voice' hold in sound.js). Films and concept clips hold it under their own names.
export function stopVoiceLine(){pending=[];if(!audio)return;const a=audio;audio=null;owner=null;a.onended=a.onerror=a.onpause=null;a.pause();a.removeAttribute('src');a.load();releaseMusic('voice');}
function start(src,el){
 if(!audible())return;
 // A browser refuses sound before the first tap or key press, so the title line waits for it instead of being lost.
 if(!soundUnlocked()){waiting=[src,el];return;}
 if(audio)stopVoiceLine();
 const a=new Audio(src);a.volume=.95;audio=a;owner=el;lastSrc=src;lastAt=Date.now();holdMusic('voice');
 // Ended, failed, refused or paused by the device: the hold always comes off.
 const next=()=>{if(audio!==a)return;audio=null;owner=null;releaseMusic('voice');const n=pending.shift();if(n&&n[1].isConnected)start(n[0],n[1]);};
 a.onended=a.onerror=a.onpause=next;void a.play().catch(next);
}
/** Plays the line for `text` now, or after the current one when `queue` is set. */
export function speakLine(text,el=document.body,{queue=false}={}){
 const src=voiceFor(text);if(!src)return false;
 if(audio&&queue){pending=[[src,el]];return true;}
 start(src,el);return true;
}
const seen=new WeakMap();
// Villain bubbles fade out with a class instead of `hidden`.
function visible(el){return el.isConnected&&!el.closest('[hidden]')&&el.getClientRects().length>0&&!(el.closest('.mv-say')&&!el.closest('.mv-say.show'));}
function scan(){
 if(owner&&(!visible(owner)||(seen.get(owner)!==undefined&&!voiceFor(owner.textContent))))stopVoiceLine();
 const found=[];
 for(const el of document.querySelectorAll(WATCH)){
  const text=visible(el)?norm(el.textContent):'';
  if(seen.get(el)===text)continue;seen.set(el,text);
  const src=text&&voiceFor(text);
  // A re-render of the same popup must not start the same line again.
  if(src&&!(src===lastSrc&&(audio||Date.now()-lastAt<8000))&&!found.some(f=>f[0]===src))found.push([src,el]);
 }
 for(const [src,el] of found){
  if(otherVoice()){waitFor(src,el);continue;}
  if(audio&&el.matches(QUEUED))pending=[[src,el]];else start(src,el);
 }
}
// A resident's own voice in the same dialog finishes first; the lesson card follows it.
function waitFor(src,el,tries=0){setTimeout(()=>{if(!el.isConnected||tries>60)return;if(otherVoice())waitFor(src,el,tries+1);else start(src,el);},500);}
// First input: once that tap or key press is over, say the line that was waiting if its text is still shown.
// A tap on a start button leaves the screen or opens the intro film over it, and then the line is skipped.
const covered=el=>[...document.querySelectorAll('dialog[open]')].some(d=>!d.contains(el));
function sayWaiting(){setTimeout(()=>{const w=waiting;waiting=null;if(w&&!audio&&visible(w[1])&&!covered(w[1])&&voiceFor(w[1].textContent)===w[0]&&!otherVoice())start(w[0],w[1]);},200);}
function firstInput(){if(waiting)for(const up of ['pointerup','pointercancel','keyup'])document.addEventListener(up,sayWaiting,{once:true,capture:true});}
let frame=0;
if(typeof document!=='undefined'&&typeof MutationObserver!=='undefined'){
 for(const down of ['pointerdown','keydown'])document.addEventListener(down,firstInput,{once:true,capture:true});
 new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan();});})
  .observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','class','open']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoiceLine();});
 document.addEventListener('game-audio-settings',()=>{if(!audible())stopVoiceLine();});
}
