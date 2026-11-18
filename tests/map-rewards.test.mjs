import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {initialState} from '../src/state.js';
import {missions} from '../src/domain.js';
import {mapVillainToken,remainingMapVillains,recordMapVillainClear,MAP_VILLAINS_KEY} from '../src/map-villains.js';
// Loading the module must not need a browser: the card layer is built on first use.
import {REWARD_CARDS,ownedRewardCards,revealRewardCard} from '../src/map-rewards.js';

const publicFile=url=>new URL('../public'+url,import.meta.url);

test('one achievement card per island villain, in mission order, with shipped art and slot thumbnails',()=>{
 assert.equal(REWARD_CARDS.length,missions.length);
 REWARD_CARDS.forEach((card,index)=>{
  assert.equal(card.id,String(missions[index].id));
  assert.ok(card.title&&card.stage);
  assert.equal(card.art,`/assets/reward-cards/card-${index+1}-${card.id}.webp`);
  assert.equal(card.thumb,`/assets/reward-cards/thumb-${index+1}-${card.id}.webp`);
  for(const url of [card.art,card.thumb])assert.ok(existsSync(publicFile(url)),url);
 });
 assert.equal(new Set(REWARD_CARDS.map(card=>card.title)).size,REWARD_CARDS.length);
});

test('a card is owned exactly when its villain is cleared for the current run; no save field is added',()=>{
 const state=initialState(),keys=Object.keys(state).sort();
 state.completed=[1,2,3,4,5];
 const record={},storage={getItem:()=>JSON.stringify(record)};
 assert.deepEqual(ownedRewardCards(state,storage),[false,false,false,false,false]);
 record[2]=mapVillainToken(state,3);
 assert.deepEqual(ownedRewardCards(state,storage),[false,false,true,false,false]);
 record[0]=mapVillainToken(state,1);record[4]=mapVillainToken(state,5);
 assert.deepEqual(ownedRewardCards(state,storage),[true,false,true,false,true]);
 assert.equal(remainingMapVillains(state,storage),ownedRewardCards(state,storage).filter(owned=>!owned).length);
 // A record from another run, or for an area that is not finished, is not a card.
 state.completed=[1,2];
 assert.deepEqual(ownedRewardCards(state,storage),[true,false,false,false,false]);
 state.completed=[1,2,3,4,5];state.mapRunId+='-new';
 assert.deepEqual(ownedRewardCards(state,storage),[false,false,false,false,false]);
 assert.deepEqual(Object.keys(state).sort(),keys);
});

test('the clear that the villain saves is the one the card reads',()=>{
 const state=initialState();state.completed=[1,2,3,4,5];
 let raw=null;const storage={getItem:()=>raw,setItem:(key,value)=>{assert.equal(key,MAP_VILLAINS_KEY);raw=value;}};
 assert.equal(recordMapVillainClear(3,mapVillainToken(state,4),storage),true);
 assert.deepEqual(ownedRewardCards(state,storage),[false,false,false,true,false]);
});

test('no card is shown for a villain without a clear record (teacher preview)',async()=>{
 const state=initialState();state.completed=[1,2,3,4,5];state.mapRunId='preview-test';
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>null,setItem(){}}});
 try{assert.equal(await revealRewardCard(1,state),undefined);}
 finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});

test('every card cue has a shipped sound file and plays through the shared sound path',()=>{
 const sound=readFileSync(new URL('../src/sound.js',import.meta.url),'utf8'),wiring=readFileSync(new URL('../src/map-rewards.js',import.meta.url),'utf8');
 const files={cardWhoosh:'wind-whoosh-03.mp3',cardReveal:'reward-01.mp3',cardEpic:'reward-03.mp3',cardSlot:'pickup-01.mp3',cardComplete:'victory-jingle-01.mp3'};
 for(const [cue,file] of Object.entries(files)){
  assert.ok(sound.includes(`${cue}:'${file}'`),cue);
  assert.ok(wiring.includes(`'${cue}'`),`${cue} is wired`);
  assert.ok(existsSync(publicFile('/assets/audio/'+file)),file);
 }
 assert.match(wiring,/playCue\(SOUNDS\[name\]\)/);
});

test('the map and its villains wait while a card layer is open',()=>{
 const read=file=>readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
 assert.match(read('journey.js'),/const blocked=\(\)=>document\.querySelector\('dialog\[open\],\.rc-layer'\)/);
 const villains=read('map-villains.js');
 assert.match(villains,/const paused=\(\)=>document\.querySelector\('dialog\[open\],\.rc-layer'\)/);
 assert.ok(!villains.includes("document.querySelector('dialog[open]')"),'every villain pause check includes the card layer');
 assert.match(villains,/options\.onCleared\?\.\(index\)/);
 assert.match(readFileSync(new URL('../index.html',import.meta.url),'utf8'),/href="\/src\/reward-cards\.css"/);
});
