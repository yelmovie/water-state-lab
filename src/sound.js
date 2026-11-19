// Project themes (the main theme loops, the ending theme plays once) + locally hosted CC0 interface and water sounds.
let context,unlocked=false,music=null,musicGain=null,loadedTheme=null,endedTheme=null,theme='main',activeCue=null,cueSequence=0;
let settings={sound:true,bgm:true,sfx:true,voice:true,sfxVolume:100,bgmVolume:35};
// Effects size from settings (0–100 %, default 100 % = the levels below unchanged). Experiment, battle, reward and step sounds all scale by it.
const sfxScale=()=>settings.sfxVolume/100;
// After the ending theme's single pass, the ending screen keeps the main theme at this share instead of falling silent.
const AFTER_ENDING=.45;let afterEnding=false;
const SFX_VOLUME=.035;
const themes={main:'/assets/audio/music/main-theme.mp3',ending:'/assets/audio/music/ending-theme.mp3'};
const files={click:'click_003.ogg',drop:'water-drop.mp3',success:'confirmation_002.ogg',discover:'confirmation_001.ogg',error:'error_001.ogg',hint:'question_002.ogg',connect:'switch_002.ogg',pour:'water-pour.mp3',bubble:'water-bubble.mp3',page:'bookFlip1.ogg',wipe:'cloth1.ogg',latch:'metalLatch.ogg',shoot:'splash_09.ogg',hit:'impactMetal_medium_000.ogg',finish:'impactPunch_heavy_000.ogg',thud:'impactSoft_heavy_000.ogg',appear:'bubble-03.mp3',exit:'bubble-01.mp3',victory:'victory-jingle-04.mp3',
 // Achievement cards (map-rewards.js): fly in, reveal (the two rarest cards use the longer jingle), land in the slot, full set.
 cardWhoosh:'wind-whoosh-03.mp3',cardReveal:'reward-01.mp3',cardEpic:'reward-03.mp3',cardSlot:'pickup-01.mp3',cardComplete:'victory-jingle-01.mp3'};
const players=new Map(),cueGains=new Map(),cueBase=new Map();let fileCue=null,uiSequence=0;
// Battle and reward sounds (shots, hits, exits, appear, achievement cards, jingles) overlap each other, up to four at once.
// Interface sounds (click, answer, hint, …) keep one shared voice and only cut each other, never these.
const COMBAT=new Set(['shoot','hit','finish','thud','appear','exit','victory','cardWhoosh','cardReveal','cardEpic','cardSlot','cardComplete']),COMBAT_MAX=4;
let combatPlaying=[];
// A finishing chime (activity done, right answer) plays to its end even when a concept clip or the next popup sounds at once.
const FINISHING=new Set(['success']);
const hidden=()=>typeof document!=='undefined'&&document.hidden;
// Why the music is held back, by name: 'duck' plays it at a quarter under a spoken line, 'pause' stops it while a story film or concept clip is open.
// It returns only when every name is gone, so one voice ending cannot undo another voice or an open film.
const holds=new Map(),DUCK=.25,DUCK_SECONDS=.06;
const held=mode=>[...holds.values()].includes(mode);
const desiredMusic=()=>settings.sound&&settings.bgm&&!held('pause')&&!hidden()&&unlocked;

function audioContext(){
 const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!AudioContext)return null;
 context??=new AudioContext();
 return context;
}
// Cuts only the interface sound in progress; a new interface sound calls this.
function stopUiCue(){
 uiSequence++;
 if(fileCue){fileCue.pause();fileCue.currentTime=0;fileCue=null;}
 if(!activeCue)return;
 try{activeCue.oscillator.stop();}catch{/* It may have already ended. */}
 activeCue.oscillator.disconnect();activeCue.gain.disconnect();activeCue=null;
}
/** Cuts every effect in progress (muting, a hidden tab, the ending film). */
export function stopCue(){
 cueSequence++;stopUiCue();
 for(const player of combatPlaying){player.pause();player.currentTime=0;}
 combatPlaying=[];stopFootstep();
}
/** Runs `next` once the sampled cue `kind` has finished (at most `max` ms), so a jingle is never cut by what follows it. */
export function afterCue(kind,next,max=2600){
 const player=players.get(kind);
 if(!player||player.paused||player.ended){next();return;}
 let done=false,timer=0;
 const go=()=>{if(done)return;done=true;clearTimeout(timer);player.removeEventListener('ended',go);player.removeEventListener('pause',go);next();};
 player.addEventListener('ended',go);player.addEventListener('pause',go);timer=setTimeout(go,max);
}

// Footsteps have their own voice: they never cut another sound and nothing else cuts them.
// Two CC0 steps alternate every 300 ms with a slightly different speed each time; a spoken line halves them.
const STEP_FILES=['/assets/audio/step-01.mp3','/assets/audio/step-02.mp3'],STEP_GAP=300,STEP_GAIN=.16,STEP_SPREAD=.04;
let stepBuffers=null,stepVoice=null,stepAt=0,stepTurn=0;
function stepSamples(ctx){
 stepBuffers??=Promise.all(STEP_FILES.map(src=>fetch(src).then(r=>{if(!r.ok)throw new Error(src);return r.arrayBuffer();}).then(data=>ctx.decodeAudioData(data)))).catch(()=>{stepBuffers=null;return null;});
 return stepBuffers;
}
/** Call on each frame the traveler really moves; a step sounds at most every 300 ms. `speed` is the unit's base playback rate. */
export function footstep(speed=1){
 const now=globalThis.performance?.now?.()??Date.now();
 if(now-stepAt<STEP_GAP)return;
 if(!settings.sound||!settings.sfx||hidden()||!unlocked||held('pause'))return;
 const ctx=audioContext();if(!ctx||ctx.state!=='running'||typeof fetch!=='function')return;
 stepAt=now;const turn=stepTurn++,sequence=cueSequence;
 void stepSamples(ctx).then(buffers=>{
  if(!buffers||sequence!==cueSequence||!settings.sound||!settings.sfx||hidden()||held('pause'))return;
  try{
   const source=ctx.createBufferSource(),gain=ctx.createGain();
   source.buffer=buffers[turn%buffers.length];
   source.playbackRate.value=speed*(1+(Math.random()*2-1)*STEP_SPREAD);
   gain.gain.value=STEP_GAIN*sfxScale()*(held('duck')?.5:1);
   source.connect(gain);gain.connect(ctx.destination);
   stopFootstep(false);stepVoice={source,gain};
   source.onended=()=>{source.disconnect();gain.disconnect();if(stepVoice?.source===source)stepVoice=null;};
   source.start();
  }catch{/* A step is decoration only. */}
 });
}
/** Stops the step in progress within a few frames; the next movement starts with a fresh step. */
export function stopFootstep(reset=true){
 if(reset)stepAt=0;
 const voice=stepVoice;if(!voice)return;
 stepVoice=null;
 try{const t=context.currentTime;voice.gain.gain.setTargetAtTime(0,t,.015);voice.source.stop(t+.06);}catch{/* Already ended. */}
}
/** Test hook: how many footsteps have been requested and whether one is sounding. */
export const footstepState=()=>({requested:stepTurn,playing:!!stepVoice});
// Routed through a gain node because iPad Safari ignores HTMLMediaElement.volume.
function musicPlayer(ctx){
 if(music||typeof Audio==='undefined')return music;
 music=new Audio();music.preload='none';
 music.addEventListener('ended',()=>{endedTheme=loadedTheme;if(loadedTheme==='ending'&&theme==='ending'){afterEnding=true;syncMusic();}});
 try{musicGain=ctx.createGain();musicGain.gain.value=0;ctx.createMediaElementSource(music).connect(musicGain);musicGain.connect(ctx.destination);}catch{musicGain=null;}
 return music;
}
function syncMusic(){
 if(!desiredMusic()){music?.pause();return;}
 if(endedTheme===theme&&!afterEnding)return;
 try{
  const ctx=audioContext();if(!ctx)return;
  if(ctx.state==='suspended'){void ctx.resume().then(()=>{if(ctx.state==='running')syncMusic();}).catch(()=>{});return;}
  if(ctx.state!=='running')return;
  const player=musicPlayer(ctx);if(!player)return;
  const track=afterEnding?'main':theme;
  if(loadedTheme!==track){player.src=themes[track];loadedTheme=track;}
  player.loop=track==='main';
  const volume=settings.bgmVolume/100*(held('duck')?DUCK:1)*(afterEnding?AFTER_ENDING:1);
  if(!musicGain)player.volume=volume;
  // A stopped theme fades in; a playing one moves to its new level in about 0.2 s (three time constants).
  else if(player.paused){musicGain.gain.setValueAtTime(0,ctx.currentTime);musicGain.gain.setTargetAtTime(volume,ctx.currentTime,.25);}
  else musicGain.gain.setTargetAtTime(volume,ctx.currentTime,DUCK_SECONDS);
  if(player.paused)void player.play()?.catch(()=>{/* A blocked or missing track never blocks learning. */});
 }catch{/* Audio availability must never block an activity. */}
}

/** Settings controls keep BGM and SFX independent; sound is the master mute. */
export function setSoundSettings(next={}){
 settings={...settings,...next};
 settings.bgm=settings.bgm!==false;settings.sfx=settings.sfx!==false;settings.voice=settings.voice!==false;settings.sound=settings.sound!==false;
 const volume=Number(settings.bgmVolume);settings.bgmVolume=Number.isFinite(volume)?Math.max(0,Math.min(100,volume)):35;
 const effects=Number(settings.sfxVolume);settings.sfxVolume=Number.isFinite(effects)?Math.max(0,Math.min(100,effects)):100;
 // A sound already playing follows a new effects size at once.
 for(const [player,gain] of cueGains)gain.gain.value=(cueBase.get(player)??0)*sfxScale();
 if(!settings.sound||!settings.sfx)stopCue();
 if(typeof document!=='undefined')document.dispatchEvent(new Event('game-audio-settings'));
 syncMusic();
}
/** Compatibility for the shared speaker button: mute or enable music, effects and voices together. */
export function setSoundEnabled(value){
 const on=Boolean(value);setSoundSettings({sound:on,bgm:on,sfx:on,voice:on});
 if(!on&&context)void context.suspend().catch(()=>{});
}
/** Holds the music back under `tag` until releaseMusic(tag): 'duck' for a spoken line, 'pause' for a story film or concept clip. */
export function holdMusic(tag,mode='duck'){if(holds.get(tag)===mode)return;holds.set(tag,mode);syncMusic();}
/** Always call this when the line or film ends, stops early or fails. */
export function releaseMusic(tag){if(holds.delete(tag))syncMusic();}
/** True once the first tap or key press has let the browser play sound. */
export const soundUnlocked=()=>unlocked;
/** Picks the theme for the current screen; replay restarts it, because the ending theme stops after one pass. */
export function setMusicTheme(name,replay=false){
 if(!themes[name])return;
 if(theme!==name||replay){endedTheme=null;afterEnding=false;}
 theme=name;
 if(replay&&music&&loadedTheme===name)music.currentTime=0;
 syncMusic();
}
export function playClick(){return playCue('click');}
export async function playCue(kind='click'){
 if(!settings.sound||!settings.sfx||hidden())return;
 const combat=COMBAT.has(kind);
 if(!combat)stopUiCue();
 const request=cueSequence,uiRequest=uiSequence;
 const stale=()=>request!==cueSequence||(!combat&&uiRequest!==uiSequence);
 // Interface sounds share one voice; battle and reward sounds overlap. Device/codec failures use the original soft tone.
 if(typeof Audio!=='undefined'){
  let player=players.get(kind);
  if(!player){player=new Audio('/assets/audio/'+(files[kind]||files.click));player.preload='auto';players.set(kind,player);}
  const volume=({click:.22,pour:.38,bubble:.28,drop:.38,page:.24,wipe:.18,latch:.24,shoot:.3,hit:.42,finish:.5,thud:.34,appear:.2,exit:.32,victory:.34,cardWhoosh:.26,cardReveal:.34,cardEpic:.34,cardSlot:.3,cardComplete:.34})[kind]??.32;
  // Safari media volume is fixed. A gain node keeps experiment sounds soft on iPad too.
  try{
   const ctx=audioContext();
   if(ctx?.state==='suspended')await ctx.resume();
   if(stale()||!settings.sound||!settings.sfx||hidden())return;
   if(ctx&&!cueGains.has(player)){const gain=ctx.createGain();ctx.createMediaElementSource(player).connect(gain);gain.connect(ctx.destination);cueGains.set(player,gain);}
   const gain=cueGains.get(player);cueBase.set(player,volume);if(gain)gain.gain.value=volume*sfxScale();else player.volume=volume*sfxScale();
  }catch{player.volume=volume*sfxScale();}
  if(stale())return;
  if(combat){
   // The same battle sound starts over; the oldest one gives way past four at once.
   combatPlaying=combatPlaying.filter(p=>p!==player&&!p.paused&&!p.ended);
   while(combatPlaying.length>=COMBAT_MAX){const oldest=combatPlaying.shift();oldest.pause();oldest.currentTime=0;}
   player.currentTime=0;combatPlaying.push(player);
   try{await player.play();return;}catch{combatPlaying=combatPlaying.filter(p=>p!==player);if(stale())return;}
  }else{
   fileCue=FINISHING.has(kind)?null:player;
   try{await player.play();return;}catch{if(stale())return;fileCue=null;}
  }
 }
 try{
  const ctx=audioContext();if(!ctx)return;
  if(ctx.state==='suspended')await ctx.resume();
  if(stale()||!settings.sound||!settings.sfx||hidden()||ctx.state!=='running')return;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  oscillator.type='sine';
  const tones={click:[660,440],drop:[420,780],success:[523,1047],discover:[440,880],error:[270,180],hint:[523,659],connect:[260,520],pour:[680,180],bubble:[220,920],page:[480,240],wipe:[320,160],latch:[180,540],shoot:[900,300],hit:[200,120],finish:[160,80],thud:[140,90],appear:[300,520],exit:[700,200],victory:[523,1047],cardWhoosh:[520,940],cardReveal:[784,1319],cardEpic:[659,1319],cardSlot:[988,1319],cardComplete:[523,1047]};
  const [from,to]=tones[kind]||tones.click;
  oscillator.frequency.setValueAtTime(from,now);oscillator.frequency.exponentialRampToValueAtTime(to,now+.065);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,SFX_VOLUME*sfxScale()),now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.08);
  oscillator.connect(gain);gain.connect(ctx.destination);if(!combat)activeCue={oscillator,gain};
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(activeCue?.oscillator===oscillator)activeCue=null;};
  oscillator.start(now);oscillator.stop(now+.09);
 }catch{/* A blocked audio device must never block navigation. */}
}

if(typeof document!=='undefined'){
 const unlock=()=>{unlocked=true;syncMusic();};
 document.addEventListener('pointerdown',unlock,{once:true,capture:true});
 document.addEventListener('keydown',unlock,{once:true,capture:true});
 document.addEventListener('visibilitychange',()=>{
  if(hidden()){stopCue();music?.pause();if(context)void context.suspend().catch(()=>{});}
  else syncMusic();
 });
}
