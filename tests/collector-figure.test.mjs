import test from 'node:test';
import assert from 'node:assert/strict';
import {collectorTrial} from '../src/collector-model.js';
import {targetParts} from '../src/domain.js';
import {comparisonExamples,figureLayout,figureFrame} from '../src/collector-figure-model.js';

test('dry condensation example makes no liquid; the open connection example spills before the funnel',()=>{
 const [dry,leak]=comparisonExamples().map(({result})=>figureLayout(result));
 for(let t=0;t<=dry.duration;t+=.05){const f=figureFrame(dry,t);assert.equal(f.drops.length,0);assert.equal(f.spilled,false);assert.equal(f.collected,false);}
 assert.ok(leak.tracks.some(t=>t.phase===0));
 assert.ok(leak.tracks.some(t=>t.spill));
 assert.equal(leak.tracks.some(t=>t.phase===3||t.phase===4),false);
 assert.equal(figureFrame(leak,leak.duration).spilled,true);
 assert.equal(figureFrame(leak,leak.duration).collected,false);
});

test('a working layout reaches the bucket, and water on a level ramp stays there',()=>{
 const working=figureLayout(collectorTrial(targetParts,true,20));
 const level=figureLayout(collectorTrial(targetParts,true,0));
 assert.equal(figureFrame(working,working.duration).collected,true);
 assert.equal(figureFrame(working,working.duration).spilled,false);
 assert.equal(figureFrame(level,level.duration).collected,false);
 assert.equal(figureFrame(level,level.duration).drops.at(0).phase,1);
});

test('the visible trail stops at the current drop and never leads beyond a failed join',()=>{
 const [,example]=comparisonExamples();
 const leak=figureLayout(example.result),track=leak.tracks.find(t=>t.spill);
 const early=figureFrame(leak,track.start-.2);
 assert.equal(early.leak,undefined);
 assert.ok(early.trails.length>0&&early.trails.every(t=>!t.spill));
 const flowing=figureFrame(leak,(track.start+track.end)/2);
 const d=flowing.drops.find(d=>d.spill);
 assert.deepEqual(flowing.trails.find(t=>t.spill).points.at(-1),d.point);
 const end=figureFrame(leak,leak.duration);
 assert.deepEqual(end.trails.find(t=>t.spill).points.at(-1),track.points.at(-1));
 assert.equal(end.collected,false);
 assert.match(leak.finalNote,/경사판 끝/);
});
