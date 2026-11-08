import test from 'node:test';
import assert from 'node:assert/strict';
import {processView} from '../src/transform-process.js';
import {cyclePlate} from '../src/greenhouse-cycle.js';
import {chapterState} from '../src/fieldwork-model.js';
import {access} from 'node:fs/promises';

test('the cold plate uses generated wet imagery only while moisture is present',()=>{
 const c=chapterState(2);c.moves.dewStage='dry';c.moves.dewTime='0';
 assert.doesNotMatch(processView(c,'condense'),/cold-plate-wet\.webp/);
 c.moves.dewStage='wet';c.moves.dewTime='100';
 const html=processView(c,'condense');assert.equal((html.match(/cold-plate-wet\.webp/g)||[]).length,1,'the room-temperature plate stays dry');assert.doesNotMatch(html,/class="process-drop"/);
 c.moves.dewStage='rewiped';c.moves.dewTime='0';assert.doesNotMatch(processView(c,'condense'),/cold-plate-wet\.webp/);
});
test('the round collector shows its integrated rear pack before the wet state',()=>{
 assert.doesNotMatch(cyclePlate(false,true,false,100),/collector-cold-wet/);
 const dry=cyclePlate(true,true,false,0);assert.match(dry,/collector-cold-dry\.webp/);assert.doesNotMatch(dry,/collector-cold-wet/);
 const wet=cyclePlate(true,true,false,100);assert.match(wet,/collector-cold-wet\.webp/);assert.doesNotMatch(wet,/experiment-props-20261107\/icepack/);
});
test('all generated experiment assets are present in the distributable asset tree',async()=>{
 for(const name of ['cold-plate-wet','bottle-wet','collector-cold-dry','collector-cold-wet','room-bench'])await access(new URL(`../public/assets/learning/condensation-20261108/${name}.webp`,import.meta.url));
});
