import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync} from 'node:fs';
import {stageLetters,fieldLetters,npcVoices,npcVoiceProfiles} from '../src/npc-content.js';
import {npcAudio,npcRecordings as recordings} from '../src/npc-audio.js';
import {residents,residentForStage} from '../src/island-residents.js';

test('all building dialogue and internal-stage letters match direct local Sohee recordings',()=>{
 for(let n=1;n<=10;n++){
  const key='letter-'+String(n).padStart(2,'0');
  assert.equal(recordings[key].text,stageLetters[n].join(' '),key+' reads the displayed letter');
  assert.equal(recordings[key].voice,npcVoices[n]);
 }
 for(const r of residents){
  const id=String(r.stage).padStart(2,'0');
  for(const kind of ['hello','reply'])assert.equal(recordings[kind+'-'+id].text,r[kind]);
 }
 for(const [key,recording] of Object.entries(recordings)){
  assert.equal(recording.speaker,'Sohee');assert.match(recording.engine,/Qwen3-TTS direct/);
  assert.ok(recording.duration>1&&recording.duration<65,key+' has a useful duration');
  assert.ok(statSync(new URL('../public'+npcAudio[key],import.meta.url)).size>1000,key+' is a real playable asset');
 }
});

test('only the three remaining field requests and five building residents are narrated',()=>{
 assert.deepEqual(Object.keys(fieldLetters),['2','4','10']);
 for(const [n,lines] of Object.entries(fieldLetters)){
  const key='field-'+String(n).padStart(2,'0');
  assert.equal(recordings[key].text,lines.join(' '));assert.ok(npcAudio[key]);
 }
 assert.equal(Object.keys(npcAudio).length,23);
 assert.ok(!recordings['hello-01']&&!recordings['reply-09']);
});

test('five NPC profiles use distinct but modest pitch and rate corrections',()=>{
 assert.equal(Object.keys(npcVoiceProfiles).length,5);
 assert.equal(new Set(Object.values(npcVoiceProfiles).map(p=>p.id)).size,5);
 assert.equal(new Set(Object.values(npcVoiceProfiles).map(p=>p.pitchCents+':'+p.rate)).size,5);
 for(const [n,voice] of Object.entries(npcVoices)){
  const profile=npcVoiceProfiles[residentForStage(+n).stage];assert.equal(voice,profile.id);
  assert.ok(Math.abs(profile.pitchCents)<=150);assert.ok(profile.rate>=.94&&profile.rate<=1.04);
 }
 for(const recording of Object.values(recordings)){
  const profile=Object.values(npcVoiceProfiles).find(p=>p.id===recording.voice);
  assert.ok(profile);assert.equal(recording.pitchCents,profile.pitchCents);assert.equal(recording.rate,profile.rate);
 }
});
