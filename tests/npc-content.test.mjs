import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {stageLetters,fieldLetters,npcVoices,npcVoiceProfiles} from '../src/npc-content.js';
import {npcAudio,npcRecordings as recordings} from '../src/npc-audio.js';
import {residents,residentForStage} from '../src/island-residents.js';

test('all building dialogue and letters match validated local character recordings',()=>{
 for(let n=1;n<=10;n++){
  const key='letter-'+String(n).padStart(2,'0');
  assert.equal(recordings[key].text,stageLetters[n].join(' '),key+' reads the displayed letter');
  assert.equal(recordings[key].voice,npcVoices[n]);
 }
 for(const r of residents){const id=String(r.stage).padStart(2,'0');for(const kind of ['hello','reply'])assert.equal(recordings[kind+'-'+id].text,r[kind]);}
 for(const [key,recording] of Object.entries(recordings)){
  assert.match(recording.engine,/ElevenLabs v4/);assert.ok(recording.speaker);
  assert.ok(recording.duration>1&&recording.duration<65,key+' has a useful duration');
  const path=new URL('../public'+npcAudio[key],import.meta.url);assert.ok(statSync(path).size>1000,key+' is a real playable asset');
  assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),recording.sha256,key+' matches verified audio');
 }
});
test('three remaining field requests and five building residents are narrated',()=>{
 assert.deepEqual(Object.keys(fieldLetters),['2','4','10']);
 for(const [n,lines] of Object.entries(fieldLetters)){const key='field-'+String(n).padStart(2,'0');assert.equal(recordings[key].text,lines.join(' '));assert.ok(npcAudio[key]);}
 assert.equal(Object.keys(npcAudio).length,23);assert.ok(!recordings['hello-01']&&!recordings['reply-09']);
});
test('five fictional characters retain distinct voice identities and verified direction',()=>{
 const profiles=Object.values(npcVoiceProfiles);assert.equal(profiles.length,5);assert.equal(new Set(profiles.map(p=>p.voice)).size,5);
 for(const [n,voice] of Object.entries(npcVoices)){const profile=npcVoiceProfiles[residentForStage(+n).stage];assert.equal(voice,profile.id);assert.ok(Math.abs(profile.pitch)<=3);assert.ok(profile.rate>=.9&&profile.rate<=1.1);}
 for(const recording of Object.values(recordings)){const profile=profiles.find(p=>p.id===recording.voice);assert.ok(profile);assert.equal(recording.sourceVoice,profile.voice);assert.ok(Math.abs(recording.pitch)<=3);assert.ok(recording.rate>=.8&&recording.rate<=1.2);assert.equal(recording.speaker,profile.speaker);}
});
