import test from 'node:test';
import assert from 'node:assert/strict';

// Sound lanes (2026-11-19): interface sounds cut only each other, battle and reward sounds overlap,
// footsteps have their own voice and a 300 ms pace.
const document=new EventTarget();document.hidden=false;globalThis.document=document;
const audio=[],sources=[];
globalThis.Audio=class extends EventTarget{
 constructor(src){super();this.src=src;this.currentTime=0;this.paused=true;this.ended=false;audio.push(this);}
 play(){this.paused=false;return Promise.resolve();}
 pause(){if(!this.paused){this.paused=true;this.dispatchEvent(new Event('pause'));}}
};
globalThis.AudioContext=class {
 state='running';currentTime=0;destination={};
 createGain(){return {gain:{value:1,setTargetAtTime(){},setValueAtTime(){}},connect(){},disconnect(){}};}
 createMediaElementSource(){return {connect(){}};}
 createBufferSource(){const s={buffer:null,playbackRate:{value:1},connect(){},disconnect(){},start(){s.started=true;},stop(){s.stopped=true;}};sources.push(s);return s;}
 decodeAudioData(data){return Promise.resolve({data});}
 suspend(){return Promise.resolve();}
 resume(){return Promise.resolve();}
};
globalThis.fetch=async src=>({ok:true,arrayBuffer:async()=>src});
let clock=1000;globalThis.performance={now:()=>clock};
const sound=await import('../src/sound.js?lanes');
sound.setSoundSettings({sound:true,sfx:true,bgm:false});
document.dispatchEvent(new Event('pointerdown'));
const player=name=>audio.find(a=>a.src.endsWith(name));

test('an interface sound never cuts a battle or card sound, but still cuts the previous interface sound',async()=>{
 await sound.playCue('finish');await sound.playCue('cardComplete');
 await sound.playCue('click');await sound.playCue('error');
 assert.equal(player('impactPunch_heavy_000.ogg').paused,false);
 assert.equal(player('victory-jingle-01.mp3').paused,false);
 assert.equal(player('click_003.ogg').paused,true);
 assert.equal(player('error_001.ogg').paused,false);
});

test('battle sounds overlap up to four at once; the oldest gives way',async()=>{
 sound.stopCue();
 for(const kind of ['shoot','hit','exit','cardWhoosh','cardSlot'])await sound.playCue(kind);
 assert.equal(player('splash_09.ogg').paused,true);
 for(const file of ['impactMetal_medium_000.ogg','bubble-01.mp3','wind-whoosh-03.mp3','pickup-01.mp3'])assert.equal(player(file).paused,false,file);
 sound.stopCue();
 assert.ok(audio.every(a=>a.paused));
});

test('afterCue waits for a playing jingle and runs at once when it is silent',async()=>{
 await sound.playCue('cardComplete');
 let ran=0;sound.afterCue('cardComplete',()=>ran++);
 assert.equal(ran,0);
 const jingle=player('victory-jingle-01.mp3');jingle.paused=true;jingle.ended=true;jingle.dispatchEvent(new Event('ended'));
 assert.equal(ran,1);
 sound.afterCue('cardComplete',()=>ran++);assert.equal(ran,2);
 sound.afterCue('nothing-played',()=>ran++);assert.equal(ran,3);
});

test('footsteps sound every 300 ms while moving, alternate files, vary the speed and leave other sounds alone',async()=>{
 await sound.playCue('hit');
 const before=sound.footstepState().requested;
 for(let t=0;t<=960;t+=16){clock=5000+t;sound.footstep(.94);await Promise.resolve();}
 await new Promise(r=>setTimeout(r,0));
 assert.equal(sound.footstepState().requested-before,4);
 const steps=sources.slice(-4);
 assert.deepEqual(steps.map(s=>s.buffer.data.slice(-11)),['step-01.mp3','step-02.mp3','step-01.mp3','step-02.mp3']);
 for(const s of steps)assert.ok(s.playbackRate.value>=.94*.96-1e-9&&s.playbackRate.value<=.94*1.04+1e-9);
 assert.equal(player('impactMetal_medium_000.ogg').paused,false);
 sound.stopFootstep();assert.equal(steps.at(-1).stopped,true);assert.equal(sound.footstepState().playing,false);
});

test('footsteps follow the effects switch and stay quiet under an open film',async()=>{
 const count=()=>sound.footstepState().requested;
 const off=count();sound.setSoundSettings({sfx:false});clock+=1000;sound.footstep();assert.equal(count(),off);
 sound.setSoundSettings({sfx:true});
 sound.holdMusic('film','pause');clock+=1000;sound.footstep();assert.equal(count(),off);
 sound.releaseMusic('film');clock+=1000;sound.footstep();assert.equal(count(),off+1);
});
