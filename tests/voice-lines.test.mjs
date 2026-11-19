import test from 'node:test';
import assert from 'node:assert/strict';

// A minimal page: a document that takes input events, media elements that play at once, and a gain node that jumps to its target.
const document=new EventTarget();
document.hidden=false;document.documentElement={};
document.querySelectorAll=()=>[];
globalThis.document=document;
globalThis.MutationObserver=class{observe(){}disconnect(){}};
const created=[];let refuseNext=false;
globalThis.Audio=class{
 constructor(src=''){this.src=src;this.paused=true;this.currentTime=0;this.refuse=refuseNext;refuseNext=false;created.push(this);}
 addEventListener(){}
 play(){if(this.refuse)return Promise.reject(Error('refused'));this.paused=false;return Promise.resolve();}
 pause(){this.paused=true;}
 removeAttribute(){this.src='';}
 load(){}
};
const gains=[];
globalThis.AudioContext=class{
 state='running';currentTime=0;destination={};
 createGain(){const node={gain:{value:0,setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;}},connect(){}};gains.push(node);return node;}
 createMediaElementSource(){return {connect(){}};}
 resume(){return Promise.resolve();}
 suspend(){return Promise.resolve();}
};
const sound=await import('../src/sound.js');
const {state}=await import('../src/state.js');
const {speakLine,stopVoiceLine}=await import('../src/voice-lines.js');
const shown=text=>({isConnected:true,textContent:text,closest:()=>null,getClientRects:()=>[{}]});
const voices=()=>created.filter(a=>a.src.includes('/voice/'));
const music=()=>created.find(a=>a.src.includes('/music/'));
const level=()=>Math.round(gains[0].gain.value*1000)/1000;
const title='얼고, 마르고, 다시 맺히는 물의 비밀로 멈춘 물길을 다시 흐르게 해 줘!',mole='흐흐, 이 물길은 내가 막았지!';

test('the title line waits for the first input instead of being refused, then plays once over lowered music',async()=>{
 sound.setSoundSettings({sound:true,bgm:true,sfx:true,bgmVolume:40});
 const tagline=shown(title);
 assert.equal(speakLine(title,tagline),true);
 assert.equal(created.length,0,'nothing tries to play before the first tap or key press');
 document.dispatchEvent(new Event('pointerdown'));
 assert.match(music().src,/main-theme/);assert.equal(music().paused,false);assert.equal(level(),.4);
 assert.equal(voices().length,0,'the line waits until the tap is over');
 document.dispatchEvent(new Event('pointerup'));
 await new Promise(resolve=>setTimeout(resolve,260));
 assert.equal(voices().length,1);assert.match(voices()[0].src,/bangul-title\.mp3$/);assert.equal(voices()[0].paused,false);
 assert.equal(music().paused,false,'the music keeps playing under the line');assert.equal(level(),.1,'at a quarter of its level');
 voices()[0].onended();
 assert.equal(level(),.4,'and returns when the line ends');
 document.dispatchEvent(new Event('keyup'));
 await new Promise(resolve=>setTimeout(resolve,260));
 assert.equal(voices().length,1,'the title line is not said twice');
});

test('a line that ends, is paused by the device, is refused or is stopped always gives the music back',async()=>{
 const bubble=shown(mole),line=()=>voices().at(-1);
 speakLine(mole,bubble);assert.equal(level(),.1);line().onended();assert.equal(level(),.4,'ended');
 speakLine(mole,bubble);assert.equal(level(),.1);line().onpause();assert.equal(level(),.4,'paused by the device');
 speakLine(mole,bubble);line().onerror();assert.equal(level(),.4,'failed to load');
 refuseNext=true;speakLine(mole,bubble);assert.equal(level(),.1);await Promise.resolve();await Promise.resolve();assert.equal(level(),.4,'refused by the browser');
 speakLine(mole,bubble);assert.equal(level(),.1);stopVoiceLine();assert.equal(level(),.4,'stopped by the screen');assert.equal(line().paused,true);
});

test('a line ending does not undo a resident voice or an open film',()=>{
 const bubble=shown(mole);
 sound.holdMusic('npc');speakLine(mole,bubble);stopVoiceLine();
 assert.equal(level(),.1,'the resident is still speaking');
 sound.releaseMusic('npc');assert.equal(level(),.4);
 sound.holdMusic('film','pause');assert.equal(music().paused,true);
 speakLine(mole,bubble);voices().at(-1).onended();
 assert.equal(music().paused,true,'the film is still open');
 sound.releaseMusic('film');assert.equal(music().paused,false);assert.equal(level(),.4);
 sound.setSoundSettings({sound:false});
});

test('the voice switch alone stops and gates spoken lines; the effects switch no longer does',()=>{
 sound.setSoundSettings({sound:true,bgm:true,sfx:true,bgmVolume:40});state.settings.sound=true;state.settings.sfx=true;state.settings.voice=true;
 const bubble=shown(mole);speakLine(mole,bubble);const line=voices().at(-1);assert.equal(line.paused,false);assert.equal(level(),.1);
 state.settings.voice=false;sound.setSoundSettings({voice:false});
 assert.equal(line.paused,true,'turning voices off stops the line at once');assert.equal(level(),.4,'and lifts the music duck');
 const before=voices().length;speakLine(mole,bubble);assert.equal(voices().length,before,'no line starts while voices are off');
 state.settings.voice=true;state.settings.sfx=false;sound.setSoundSettings({voice:true,sfx:false});
 speakLine(mole,bubble);assert.equal(voices().length,before+1,'effects off: voices still speak');assert.equal(voices().at(-1).paused,false);
 stopVoiceLine();state.settings.sfx=true;sound.setSoundSettings({sound:false,sfx:true});
});
