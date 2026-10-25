import test from 'node:test';
import assert from 'node:assert/strict';
import {STANDARDS,SETTINGS_CONTENT} from '../src/settings-content.js';

class FakeElement{
 constructor(doc){this.doc=doc;this.nodes=new Map();this.events=new Map();this.attributes=new Map();this.open=false;this.isConnected=true;}
 setAttribute(key,value){this.attributes.set(key,value);}
 querySelector(selector){if(!this.nodes.has(selector))this.nodes.set(selector,new FakeElement(this.doc));return this.nodes.get(selector);}
 addEventListener(type,fn){this.events.set(type,fn);}
 focus(){this.doc.activeElement=this;}
 showModal(){this.open=true;}
 close(){this.open=false;this.events.get('close')?.();}
 remove(){this.isConnected=false;}
}
function mockDocument(){
 const doc={hidden:false,events:new Map(),created:[],addEventListener(type,fn){this.events.set(type,fn);},documentElement:{classList:{toggle(){}}}};
 doc.activeElement=new FakeElement(doc);doc.createElement=()=>{const el=new FakeElement(doc);doc.created.push(el);return el;};doc.body={append(){}};return doc;
}
function fakeAudio(){
 const instances=[];
 class Parameter{constructor(){this.values=[];}setValueAtTime(v){this.values.push(v);}linearRampToValueAtTime(v){this.values.push(v);}exponentialRampToValueAtTime(v){this.values.push(v);}setTargetAtTime(v){this.values.push(v);}}
 class AudioNode{constructor(){this.frequency=new Parameter();this.gain=new Parameter();this.stopped=false;}connect(){}disconnect(){this.disconnected=true;}start(){this.started=true;}stop(when){if(when===undefined)this.stopped=true;}}
 class Context{constructor(){this.state='running';this.currentTime=0;this.destination={};this.oscillators=[];this.gains=[];instances.push(this);}createOscillator(){const n=new AudioNode();this.oscillators.push(n);return n;}createGain(){const n=new AudioNode();this.gains.push(n);return n;}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}}
 return {Context,instances};
}

test('independent sound controls gate autoplay, coalesce effects, and pause music for hidden pages and stories',async t=>{
 const previousDocument=globalThis.document,previousAudio=globalThis.AudioContext;
 const doc=mockDocument(),mock=fakeAudio();globalThis.document=doc;globalThis.AudioContext=mock.Context;
 const audio=await import(`../src/sound.js?settings-test=${Date.now()}`);
 t.after(()=>{audio.setSoundSettings({sound:false});globalThis.document=previousDocument;globalThis.AudioContext=previousAudio;});
 audio.setSoundSettings({sound:true,bgm:true,sfx:false,bgmVolume:100});
 assert.equal(mock.instances.length,0,'music waits for a genuine first input');
 doc.events.get('pointerdown')();
 const ctx=mock.instances[0];assert.equal(ctx.oscillators.length,3);
 const firstMusic=ctx.oscillators.slice();
 await audio.playClick();assert.equal(ctx.oscillators.length,3,'SFX off leaves music intact');
 audio.setSoundSettings({bgm:false,sfx:true});assert.ok(firstMusic.every(n=>n.stopped));
 await audio.playClick();const firstCue=ctx.oscillators.at(-1);await audio.playCue('success');
 assert.equal(firstCue.stopped,true,'a new effect immediately stops the preceding effect');
 audio.setSoundSettings({bgm:true});
 const latestMusic=ctx.oscillators.slice(-3);
 const musicVolume=ctx.gains.at(-4).gain.values.at(-1);
 assert.ok(musicVolume<.035,'music master remains quieter than fixed effect gain even at 100%');
 doc.hidden=true;doc.events.get('visibilitychange')();assert.ok(latestMusic.every(n=>n.stopped));assert.equal(ctx.state,'suspended');
 doc.hidden=false;doc.events.get('visibilitychange')();await Promise.resolve();
 const resumedMusic=ctx.oscillators.slice(-3);assert.ok(resumedMusic.every(n=>!n.stopped));
 audio.setMusicQuiet(true);assert.ok(resumedMusic.every(n=>n.stopped),'stories can explicitly quiet music');
 audio.setMusicQuiet(false);audio.setSoundEnabled(false);
 const count=ctx.oscillators.length;await audio.playClick();assert.equal(ctx.oscillators.length,count,'master mute silences both channels');
});

test('settings use the common order, lock rewards until completion, and preserve audio through confirmed reset',async t=>{
 const previousDocument=globalThis.document;const doc=mockDocument();globalThis.document=doc;t.after(()=>{globalThis.document=previousDocument;});
 const {openSettings}=await import('../src/settings.js');
 const state={settings:{sound:true,bgm:false,sfx:true,bgmVolume:35,reduced:false,adminUnlock:false},completed:[],restored:false};
 let resets=0,savedAudio,rendered=0;
 const opener=doc.activeElement;
 doc.querySelector=selector=>selector==='dialog[open]'?doc.created.find(el=>el.open):null;
 const token={raw:'test'};
 let dialog=openSettings({state,render:()=>rendered++,getResetToken:()=>token,storageStatus:()=>({}),onReset:(audio,received)=>{assert.equal(received,token);resets++;savedAudio=audio;}});
 const html=dialog.innerHTML;
 const requiredOrder=['settings-bgm-label','settings-sfx-label','settings-bgm-volume','settings-intro','앱 정보 · 배움과 보상','학생용 가이드','교사용 가이드','이미지·소리·저작권 고지','settings-footer'];
 requiredOrder.forEach((token,index)=>{assert.ok(html.includes(token));if(index)assert.ok(html.indexOf(token)>html.indexOf(requiredOrder[index-1]));});
 assert.match(html,/id="settings-ending"[^>]*disabled/);assert.match(html,/id="settings-certificate"[^>]*disabled/);
 assert.match(html,/id="settings-bgm-volume"[^>]*disabled/);assert.doesNotMatch(html,/<details[^>]*\sopen(?:\s|>)/);
 assert.equal((html.match(/id="settings-unlock"/g)||[]).length,1);assert.doesNotMatch(html,/<a\b|mailto:|[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
 const toggle=dialog.querySelector('#settings-unlock');toggle.onclick({currentTarget:toggle});assert.equal(state.settings.adminUnlock,true);assert.deepEqual(state.completed,[]);assert.equal(rendered,1);
 assert.equal(dialog.querySelector('#settings-reset').disabled,true,'student reset is unavailable during preview');
 dialog.querySelector('#settings-reset').onclick();assert.equal(doc.created.length,1);
 toggle.onclick({currentTarget:toggle});assert.equal(state.settings.adminUnlock,false);assert.equal(dialog.querySelector('#settings-reset').disabled,false);
 dialog.querySelector('#settings-reset').onclick();let confirm=doc.created.at(-1);
 assert.equal(doc.activeElement,confirm.querySelector('#settings-cancel-reset'),'cancel receives the initial focus');
 confirm.querySelector('#settings-cancel-reset').onclick();assert.equal(resets,0);assert.equal(dialog.open,true);
 dialog.querySelector('#settings-reset').onclick();confirm=doc.created.at(-1);confirm.querySelector('#settings-confirm-reset').onclick();
 assert.equal(resets,1);assert.deepEqual(savedAudio,{sound:true,bgm:false,sfx:true,bgmVolume:35});assert.equal(doc.activeElement,opener);
 state.restored=true;state.completed=[1,2,3,4,5];dialog=openSettings({state});
 assert.doesNotMatch(dialog.innerHTML,/id="settings-certificate"[^>]*disabled/);dialog.close();
});

test('settings include all three original standards, local saving policy, and separate original and external rights',()=>{
 assert.deepEqual(STANDARDS.map(s=>s.code),['4과10-01','4과10-02','4과10-03']);
 assert.equal(STANDARDS[2].text,'물의 상태 변화를 이용하여 물을 얻을 수 있는 장치를 설계하고 만들 수 있다.');
 assert.ok(SETTINGS_CONTENT.teacher.lines.some(line=>line.includes('서버로 전송하지 않고')));
 assert.ok(SETTINGS_CONTENT.teacher.standardsIntro.includes('이 게임만으로 성취기준 전체를 달성했다고 판단하지 않으며'));
 assert.ok(SETTINGS_CONTENT.credits.own);assert.ok(SETTINGS_CONTENT.credits.external);
});
