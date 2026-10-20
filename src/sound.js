// Original Web Audio score: no downloaded music, speech, or remote requests.
let context,unlocked=false,music=null,activeCue=null,cueSequence=0,quiet=false;
let settings={sound:true,bgm:false,sfx:true,bgmVolume:35};
const SFX_VOLUME=.035;
const chords=[[261.63,329.63,392],[220,293.66,349.23],[246.94,293.66,392],[196,261.63,329.63]];
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
 if(!activeCue)return;
 try{activeCue.oscillator.stop();}catch{/* It may have already ended. */}
 activeCue.oscillator.disconnect();activeCue.gain.disconnect();activeCue=null;
}
function stopMusic(){
 if(!music)return;
 clearInterval(music.timer);
 for(const voice of music.voices){try{voice.oscillator.stop();}catch{}voice.oscillator.disconnect();voice.gain.disconnect();}
 music.master.disconnect();music=null;
}
function syncMusic(){
 if(!desiredMusic()){stopMusic();return;}
 try{
  const ctx=audioContext();if(!ctx)return;
  if(ctx.state==='suspended'){void ctx.resume().then(()=>{if(ctx.state==='running')syncMusic();}).catch(()=>{});return;}
  if(ctx.state!=='running')return;
  const volume=SFX_VOLUME*.7*settings.bgmVolume/100;
  if(music){music.master.gain.setTargetAtTime(volume,ctx.currentTime,.15);return;}
  const master=ctx.createGain(),voices=[];master.gain.setValueAtTime(0,ctx.currentTime);master.gain.linearRampToValueAtTime(volume,ctx.currentTime+1.2);master.connect(ctx.destination);
  for(let i=0;i<3;i++){
   const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';
   oscillator.frequency.setValueAtTime(chords[0][i]/2,ctx.currentTime);gain.gain.setValueAtTime(.23,ctx.currentTime);
   oscillator.connect(gain);gain.connect(master);oscillator.start();voices.push({oscillator,gain});
  }
  let chord=0;
  const timer=setInterval(()=>{if(!desiredMusic()){stopMusic();return;}chord=(chord+1)%chords.length;voices.forEach((voice,i)=>voice.oscillator.frequency.setTargetAtTime(chords[chord][i]/2,ctx.currentTime,1.4));},8000);
  music={master,voices,timer};
 }catch{/* Audio availability must never block an activity. */}
}

/** Settings controls keep BGM and SFX independent; sound is the master mute. */
export function setSoundSettings(next={}){
 settings={...settings,...next};
 settings.bgm=settings.bgm===true;settings.sfx=settings.sfx!==false;settings.sound=settings.sound!==false;
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
export function playClick(){return playCue('click');}
export async function playCue(kind='click'){
 if(!settings.sound||!settings.sfx||hidden())return;
 stopCue();const request=cueSequence;
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
  if(hidden()){stopCue();stopMusic();if(context)void context.suspend().catch(()=>{});}
  else syncMusic();
 });
}
