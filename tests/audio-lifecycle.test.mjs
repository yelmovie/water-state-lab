import test from 'node:test';
import assert from 'node:assert/strict';
const document = new EventTarget();document.hidden=false;globalThis.document=document;
let notices=0;document.addEventListener('game-audio-settings',()=>notices++);
const sound=await import('../src/sound.js');
test('settings changes notify active NPC playback synchronously',()=>{
 sound.setSoundSettings({sound:true,sfx:true});assert.equal(notices,1);
 sound.setSoundSettings({sound:false});assert.equal(notices,2);
 sound.setSoundSettings({sound:true,sfx:false});assert.equal(notices,3);
});
test('water and bubble procedural fallback use distinct contours',async()=>{
 const frequencies=[];
 globalThis.AudioContext=class {
  state='running';currentTime=0;destination={};
  suspend(){return Promise.resolve();}
  createOscillator(){return {type:'',frequency:{setValueAtTime:v=>frequencies.push(v),exponentialRampToValueAtTime:v=>frequencies.push(v)},connect(){},disconnect(){},start(){},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
 };
 sound.setSoundSettings({sound:true,sfx:true,bgm:false});
 await sound.playCue('pour');await sound.playCue('bubble');
 assert.deepEqual(frequencies,[680,180,220,920]);
});
test('CC0 water samples use gain, one voice, mute and background cleanup',async()=>{
 const audio=[],gains=[];
 globalThis.Audio=class {
  constructor(src){this.src=src;this.currentTime=0;this.paused=true;audio.push(this);}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
 };
 globalThis.AudioContext=class {
  state='running';destination={};
  createGain(){const node={gain:{value:1},connect(){}};gains.push(node);return node;}
  createMediaElementSource(){return {connect(){}};}
  suspend(){this.state='suspended';return Promise.resolve();}
  resume(){this.state='running';return Promise.resolve();}
 };
 const sampled=await import('../src/sound.js?sampled');
 sampled.setSoundSettings({sound:true,sfx:true,bgm:false});
 await sampled.playCue('pour');
 assert.equal(audio[0].src,'/assets/audio/water-pour.mp3');
 assert.equal(gains[0].gain.value,.38);
 await sampled.playCue('bubble');
 assert.equal(audio[0].paused,true);
 assert.equal(audio[1].src,'/assets/audio/water-bubble.mp3');
 sampled.setSoundSettings({sound:false});assert.equal(audio[1].paused,true);
 await sampled.playCue('drop');assert.equal(audio.length,2);
 sampled.setSoundSettings({sound:true});await sampled.playCue('drop');
 assert.equal(audio[2].src,'/assets/audio/water-drop.mp3');
 document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(audio[2].paused,true);
 document.hidden=false;
 delete globalThis.Audio;
});
