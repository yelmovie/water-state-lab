import test from 'node:test';
import assert from 'node:assert/strict';
import {STANDARDS,SETTINGS_CONTENT,STAGE_LEARNING} from '../src/settings-content.js';

class FakeElement{
 constructor(doc){this.doc=doc;this.nodes=new Map();this.events=new Map();this.attributes=new Map();this.dataset={};this.open=false;this.isConnected=true;}
 setAttribute(key,value){this.attributes.set(key,value);}
 removeAttribute(key){this.attributes.delete(key);}
 querySelectorAll(){return [];}
 querySelector(selector){if(!this.nodes.has(selector))this.nodes.set(selector,new FakeElement(this.doc));return this.nodes.get(selector);}
 addEventListener(type,fn){this.events.set(type,fn);}
 focus(){this.doc.activeElement=this;}
 showModal(){this.open=true;}
 close(){this.open=false;this.events.get('close')?.();}
 remove(){this.isConnected=false;}
 pause(){}
 load(){}
}
function mockDocument(){
 const doc={hidden:false,events:new Map(),created:[],addEventListener(type,fn){this.events.set(type,fn);},dispatchEvent(event){this.events.get(event.type)?.(event);return true;},removeEventListener(type){this.events.delete(type);},documentElement:{classList:{toggle(){}}}};
 doc.activeElement=new FakeElement(doc);doc.createElement=()=>{const el=new FakeElement(doc);doc.created.push(el);return el;};doc.body={append(){}};return doc;
}
function fakeAudio(){
 const instances=[];
 class Parameter{constructor(){this.values=[];}setValueAtTime(v){this.values.push(v);}linearRampToValueAtTime(v){this.values.push(v);}exponentialRampToValueAtTime(v){this.values.push(v);}setTargetAtTime(v){this.values.push(v);}}
 class AudioNode{constructor(){this.frequency=new Parameter();this.gain=new Parameter();this.stopped=false;}connect(){}disconnect(){this.disconnected=true;}start(){this.started=true;}stop(when){if(when===undefined)this.stopped=true;}}
 class Context{constructor(){this.state='running';this.currentTime=0;this.destination={};this.oscillators=[];this.gains=[];instances.push(this);}createOscillator(){const n=new AudioNode();this.oscillators.push(n);return n;}createGain(){const n=new AudioNode();this.gains.push(n);return n;}createMediaElementSource(){return new AudioNode();}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}}
 return {Context,instances};
}
// Music elements play; sampled effects refuse so the effect path falls back to countable oscillators.
function fakeMediaElements(){
 const created=[];
 class Element{constructor(src=''){this.src=src;this.paused=true;this.currentTime=7;this.events={};created.push(this);}addEventListener(type,fn){this.events[type]=fn;}play(){if(!this.src.includes('/music/'))return Promise.reject(Error('no sample'));this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
 return {Element,created};
}

test('independent sound controls gate autoplay, coalesce effects, and pause music for hidden pages and stories',async t=>{
 const previousDocument=globalThis.document,previousAudio=globalThis.AudioContext,previousElement=globalThis.Audio;
 const doc=mockDocument(),mock=fakeAudio(),media=fakeMediaElements();globalThis.document=doc;globalThis.AudioContext=mock.Context;globalThis.Audio=media.Element;
 const audio=await import(`../src/sound.js?settings-test=${Date.now()}`);
 t.after(()=>{audio.setSoundSettings({sound:false});globalThis.document=previousDocument;globalThis.AudioContext=previousAudio;globalThis.Audio=previousElement;});
 audio.setSoundSettings({sound:true,bgm:true,sfx:false,bgmVolume:100});
 assert.equal(mock.instances.length,0,'music waits for a genuine first input');
 doc.events.get('pointerdown')();
 const ctx=mock.instances[0],music=media.created[0],musicGain=ctx.gains[0];
 assert.match(music.src,/\/music\/main-theme\.mp3$/);assert.equal(music.loop,true,'the main theme repeats');assert.equal(music.paused,false);
 assert.equal(musicGain.gain.values.at(-1),1,'the volume slider drives the gain node, which iPad Safari honours');
 await audio.playClick();assert.equal(ctx.oscillators.length,0,'SFX off leaves music intact');assert.equal(music.paused,false);
 audio.setSoundSettings({bgm:false,sfx:true});assert.equal(music.paused,true);
 await audio.playClick();const firstCue=ctx.oscillators.at(-1);await audio.playCue('success');
 assert.equal(firstCue.stopped,true,'a new effect immediately stops the preceding effect');
 audio.setSoundSettings({bgm:true});assert.equal(music.paused,false);
 doc.hidden=true;doc.events.get('visibilitychange')();assert.equal(music.paused,true);assert.equal(ctx.state,'suspended');
 doc.hidden=false;doc.events.get('visibilitychange')();await Promise.resolve();await Promise.resolve();assert.equal(music.paused,false);
 audio.setMusicQuiet(true);assert.equal(music.paused,true,'stories can explicitly quiet music');
 audio.setMusicTheme('ending');assert.equal(music.paused,true,'a theme change waits for the film to close');
 audio.setMusicQuiet(false);assert.match(music.src,/\/music\/ending-theme\.mp3$/);assert.equal(music.loop,false);assert.equal(music.paused,false);
 music.pause();music.events.ended();audio.setMusicQuiet(true);audio.setMusicQuiet(false);assert.equal(music.paused,true,'the ending theme plays once');
 audio.setMusicTheme('ending',true);assert.equal(music.paused,false,'watching the ending again replays it');assert.equal(music.currentTime,0);
 audio.setMusicTheme('main');assert.match(music.src,/main-theme/);assert.equal(music.loop,true);
 audio.setSoundEnabled(false);assert.equal(music.paused,true);
 const count=ctx.oscillators.length;await audio.playClick();assert.equal(ctx.oscillators.length,count,'master mute silences both channels');
});

test('settings use the common order, lock rewards until completion, and preserve audio through confirmed reset',async t=>{
 const previousDocument=globalThis.document;const doc=mockDocument();globalThis.document=doc;t.after(()=>{globalThis.document=previousDocument;});
 const {openSettings}=await import('../src/settings.js');
 const state={mapRunId:'settings-test',evidence:{},settings:{sound:true,bgm:false,sfx:true,bgmVolume:35,reduced:false,adminUnlock:false},completed:[],restored:false};
 let resets=0,savedAudio,rendered=0;
 const opener=doc.activeElement;
 doc.querySelector=selector=>selector==='dialog[open]'?doc.created.find(el=>el.open):null;
 const token={raw:'test'};
 let dialog=openSettings({state,render:()=>rendered++,getResetToken:()=>token,storageStatus:()=>({}),onReset:(audio,received)=>{assert.equal(received,token);resets++;savedAudio=audio;}});
 const html=dialog.innerHTML;
 const requiredOrder=['settings-bgm-label','settings-sfx-label','settings-bgm-volume','settings-intro','앱 정보 · 배움과 보상','학생용 가이드','교사용 가이드','성취기준','이미지·소리·저작권 고지','settings-unlock','settings-footer'];
 requiredOrder.forEach((token,index)=>{assert.ok(html.includes(token));if(index)assert.ok(html.indexOf(token)>html.indexOf(requiredOrder[index-1]));});
 assert.match(html,/id="settings-ending"[^>]*disabled/);assert.match(html,/id="settings-certificate"[^>]*disabled/);
 assert.match(html,/id="settings-bgm-volume"[^>]*disabled/);assert.doesNotMatch(html,/<details[^>]*\sopen(?:\s|>)/);
 assert.equal((html.match(/id="settings-unlock"/g)||[]).length,1);assert.doesNotMatch(html,/teacher-picker|teacher-stage|teacher-experiment|teacher-field/);assert.doesNotMatch(html,/<a\b|mailto:|[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
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
 assert.doesNotMatch(dialog.innerHTML,/id="settings-certificate"[^>]*disabled/);
 assert.match(dialog.innerHTML,/id="settings-ending"[^>]*disabled/);dialog.close();
});

test('settings include all three original standards, local saving policy, and separate original and external rights',()=>{
 assert.deepEqual(STANDARDS.map(s=>s.code),['4과10-01','4과10-02','4과10-03']);
 assert.equal(STANDARDS[2].text,'물의 상태 변화를 이용하여 물을 얻을 수 있는 장치를 설계하고 만들 수 있다.');
 assert.equal(SETTINGS_CONTENT.teacher.standardsTitle,'성취기준');
 assert.ok(SETTINGS_CONTENT.credits.own);assert.ok(SETTINGS_CONTENT.credits.external);
});

test('completed comparison buildings unlock and open their replays without a field chapter',async t=>{
 const previousDocument=globalThis.document,doc=mockDocument();globalThis.document=doc;
 t.after(()=>{globalThis.document=previousDocument;});
 doc.querySelector=selector=>selector==='dialog[open]'?doc.created.find(el=>el.open):null;
 const {openSettings}=await import('../src/settings.js');
 const state={settings:{reduced:true,adminUnlock:false},completed:[3,4],restored:false,fieldwork:{chapters:{}}};
 const dialog=openSettings({state,storageStatus:()=>({})});
 try{
  for(const id of [1,2,5])assert.match(dialog.innerHTML,new RegExp(`data-settings-concept="${id}"[^>]*disabled`),'unfinished buildings stay locked');
  for(const id of [3,4]){
   assert.doesNotMatch(dialog.innerHTML,new RegExp(`data-settings-concept="${id}"[^>]*disabled`));
   const button={dataset:{settingsConcept:String(id)},disabled:false};
   dialog.querySelector('#settings-concept-list').onclick({target:{closest:()=>button}});
   const replay=doc.created.at(-1);assert.notEqual(replay,dialog,'the enabled replay also passes its click guard');
   assert.match(replay.className,/concept-dialog/);assert.equal(replay.open,true);replay.close();
  }
 }finally{dialog.close();}
});

test('the five area films share one timeline with the player',async()=>{
 const {concepts}=await import('../src/concept-data.js');
 assert.equal(concepts.filter(Boolean).length,5);
 for(const clip of concepts.filter(Boolean)){
  assert.ok(clip.seconds>=18&&clip.seconds<=26,clip.title);
  for(const q of clip.cues)assert.doesNotMatch(q.text,/분자|육각형/,'particle explanations are out of scope for grade 4');
  assert.equal(clip.cues[0].at,0,'the first caption starts with the film');
  clip.cues.reduce((at,q)=>{assert.ok(q.at>at&&q.at<clip.seconds-2,`${clip.title} cue at ${q.at}`);return q.at;},-1);
 }
});

test('the workshop explanation is separate from the dew garden film and can still open its video',async t=>{
 const previousDocument=globalThis.document,doc=mockDocument();globalThis.document=doc;
 t.after(()=>{globalThis.document=previousDocument;});
 const {openConcept,openCollectorLesson}=await import('../src/concepts.js');
 let continued=0;
 openConcept(4,{reduced:true});
 const garden=doc.created.at(-1);
 assert.doesNotMatch(garden.className,/collector-concept/);
 assert.equal(garden.querySelector('video').src,'/assets/concepts/zone-4.mp4');
 garden.close();
 openCollectorLesson({reduced:true,continueLabel:'이 장치로 출발',onContinue:()=>continued++});
 const collector=doc.created.at(-1);
 assert.match(collector.className,/collector-concept/,'the interactive explanation still opens first');
 assert.match(collector.innerHTML,/data-collector-film/,'a film button sits next to replay');
 const button={dataset:{},hasAttribute:name=>name==='data-collector-film'};
 collector.events.get('click')({target:{closest:()=>button}});
 const film=doc.created.at(-1);
 assert.ok(film,'the film dialog opens');assert.doesNotMatch(film.className,/collector-concept/);
 assert.equal(film.open,true);assert.equal(film.querySelector('video').src,'/assets/concepts/zone-4.mp4');
 assert.match(film.innerHTML,/이 장치로 출발/,'the film keeps the same way forward');
 film.close();assert.equal(continued,0,'closing the film does not skip ahead');
});


test('all ten experiments expose their learning objective and an existing curriculum standard',()=>{
 assert.equal(STAGE_LEARNING.length,10);
 assert.deepEqual(STAGE_LEARNING.map(stage=>stage.stage),[1,2,3,4,5,6,7,8,9,10]);
 for(const stage of STAGE_LEARNING){
  assert.ok(stage.title.length>0);
  assert.ok(stage.objective.length>20);
  assert.ok(STANDARDS.some(standard=>standard.code===stage.standard));
 }
});
