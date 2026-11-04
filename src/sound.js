// Project themes (the main theme loops, the ending theme plays once) + locally hosted Kenney CC0 interface sounds.
let context,unlocked=false,music=null,musicGain=null,loadedTheme=null,endedTheme=null,theme='main',activeCue=null,cueSequence=0,quiet=false;
let settings={sound:true,bgm:true,sfx:true,bgmVolume:35};
const SFX_VOLUME=.035;
const themes={main:'/assets/audio/music/main-theme.mp3',ending:'/assets/audio/music/ending-theme.mp3'};
const files={click:'click_003.ogg',drop:'drop_003.ogg',success:'confirmation_002.ogg',discover:'confirmation_001.ogg',error:'error_001.ogg',hint:'question_002.ogg',connect:'switch_002.ogg',pour:'splash_09.ogg',bubble:'bubble_02.ogg',page:'bookFlip1.ogg',wipe:'cloth1.ogg',latch:'metalLatch.ogg'};
const players=new Map();let fileCue=null;
const hidden=()=>typeof document!=='undefined'&&document.hidden;
const desiredMusic=()=>settings.sound&&settings.bgm&&!quiet&&!hidden()&&unlocked;

function audioContext(){
 const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!AudioContext)return null;
 context??=new AudioContext();
 return context;
}
function stopCue(){
 cueSequence++;
 if(fileCue){fileCue.pause();fileCue.currentTime=0;fileCue=null;}
 if(!activeCue)return;
 try{activeCue.oscillator.stop();}catch{/* It may have already ended. */}
 activeCue.oscillator.disconnect();activeCue.gain.disconnect();activeCue=null;
}
// Routed through a gain node because iPad Safari ignores HTMLMediaElement.volume.
function musicPlayer(ctx){
 if(music||typeof Audio==='undefined')return music;
 music=new Audio();music.preload='none';
 music.addEventListener('ended',()=>{endedTheme=loadedTheme;});
 try{musicGain=ctx.createGain();musicGain.gain.value=0;ctx.createMediaElementSource(music).connect(musicGain);musicGain.connect(ctx.destination);}catch{musicGain=null;}
 return music;
}
function syncMusic(){
 if(!desiredMusic()){music?.pause();return;}
 if(endedTheme===theme)return;
 try{
  const ctx=audioContext();if(!ctx)return;
  if(ctx.state==='suspended'){void ctx.resume().then(()=>{if(ctx.state==='running')syncMusic();}).catch(()=>{});return;}
  if(ctx.state!=='running')return;
  const player=musicPlayer(ctx);if(!player)return;
  if(loadedTheme!==theme){player.src=themes[theme];loadedTheme=theme;}
  player.loop=theme==='main';
  const volume=settings.bgmVolume/100;
  if(!musicGain)player.volume=volume;
  else{if(player.paused)musicGain.gain.setValueAtTime(0,ctx.currentTime);musicGain.gain.setTargetAtTime(volume,ctx.currentTime,.25);}
  if(player.paused)void player.play()?.catch(()=>{/* A blocked or missing track never blocks learning. */});
 }catch{/* Audio availability must never block an activity. */}
}

/** Settings controls keep BGM and SFX independent; sound is the master mute. */
export function setSoundSettings(next={}){
 settings={...settings,...next};
 settings.bgm=settings.bgm!==false;settings.sfx=settings.sfx!==false;settings.sound=settings.sound!==false;
 const volume=Number(settings.bgmVolume);settings.bgmVolume=Number.isFinite(volume)?Math.max(0,Math.min(100,volume)):35;
 if(!settings.sound||!settings.sfx)stopCue();
 syncMusic();
}
/** Compatibility for the shared speaker button: mute or enable both channels. */
export function setSoundEnabled(value){
 const on=Boolean(value);setSoundSettings({sound:on,bgm:on,sfx:on});
 if(!on&&context)void context.suspend().catch(()=>{});
}
/** Call true while a narrated story or video is playing, false when it closes. */
export function setMusicQuiet(value){quiet=Boolean(value);syncMusic();}
/** Picks the theme for the current screen; replay restarts it, because the ending theme stops after one pass. */
export function setMusicTheme(name,replay=false){
 if(!themes[name])return;
 if(theme!==name||replay)endedTheme=null;
 theme=name;
 if(replay&&music&&loadedTheme===name)music.currentTime=0;
 syncMusic();
}
export function playClick(){return playCue('click');}
export async function playCue(kind='click'){
 if(!settings.sound||!settings.sfx||hidden())return;
 stopCue();const request=cueSequence;
 // Sampled effects have one shared voice. Device/codec failures use the original soft tone.
 if(typeof Audio!=='undefined'){
  let player=players.get(kind);
  if(!player){player=new Audio('/assets/audio/'+(files[kind]||files.click));player.preload='auto';players.set(kind,player);}
  player.volume=({click:.22,pour:.24,bubble:.20,page:.24,wipe:.18,latch:.24})[kind]??.32;fileCue=player;
  try{await player.play();return;}catch{if(request!==cueSequence)return;fileCue=null;}
 }
 try{
  const ctx=audioContext();if(!ctx)return;
  if(ctx.state==='suspended')await ctx.resume();
  if(request!==cueSequence||!settings.sound||!settings.sfx||hidden()||ctx.state!=='running')return;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  oscillator.type='sine';
  const tones={click:[660,440],drop:[420,780],success:[523,1047],discover:[440,880],error:[270,180]};
  const [from,to]=tones[kind]||tones.click;
  oscillator.frequency.setValueAtTime(from,now);oscillator.frequency.exponentialRampToValueAtTime(to,now+.065);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(SFX_VOLUME,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.08);
  oscillator.connect(gain);gain.connect(ctx.destination);activeCue={oscillator,gain};
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
