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
  createOscillator(){return {type:'',frequency:{setValueAtTime:v=>frequencies.push(v),exponentialRampToValueAtTime:v=>frequencies.push(v)},connect(){},disconnect(){},start(){},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
 };
 sound.setSoundSettings({sound:true,sfx:true,bgm:false});
 await sound.playCue('pour');await sound.playCue('bubble');
 assert.deepEqual(frequencies,[680,180,220,920]);
});
