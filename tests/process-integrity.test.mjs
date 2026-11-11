import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities,activityReady,validateActivities,prepareHeatingComparison} from '../src/activity-model.js';
import {measureAction,measureStatus} from '../src/freeze-measure.js';
import {chapterState,fieldAction,fieldReady,cleanFieldwork,initialFieldwork} from '../src/fieldwork-model.js';
import {nightTrial} from '../src/cold-night-model.js';
import {newDiagnosis,collectorTrial,diagnosisResolved} from '../src/collector-model.js';
import {targetParts} from '../src/domain.js';
import {drawingSVG} from '../src/inquiry-model.js';
import {drawWaterStroke} from '../src/study-materials.js';

test('the little-water brush is thinner and darker in both live and recorded views',()=>{
 const strokes=[[[20,30],[120,140],[240,40]]];
 const width=amount=>drawingSVG(strokes,1,amount).match(/stroke-width="([^"]+)/)[1];
 assert.ok(Number(width(1))<Number(width(2)));
 const live=amount=>{const passes=[],ctx={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){passes.push({width:this.lineWidth,opacity:this.globalAlpha});}};drawWaterStroke(ctx,strokes,{left:0,top:0,width:320,height:230,amount,time:0});return passes[0];};
 assert.ok(live(1).width<live(2).width);assert.ok(live(1).opacity>live(2).opacity);
 for(const amount of [1,2])assert.equal(live(amount).width,Number(width(amount))*320/500,'recordings use the same scaled stroke width');
});

test('heating comparison explicitly prepares a new equal-water trial without erasing the unheated record',()=>{
 const c=initialActivities().compare;
 assert.equal(prepareHeatingComparison(c),true);
 assert.equal(c.baseline,true);assert.equal(c.records[0].time,0);assert.equal(c.records[0].room,c.records[0].heated);
 c.batchPrepared=false;c.baseline=true;c.time=100;c.records=[{heat:0,time:100,room:60,heated:60,boiling:false}];
 assert.equal(prepareHeatingComparison(c),true);assert.equal(c.time,0);assert.equal(c.batchPrepared,true);
 assert.equal(c.records[0].room,60);assert.equal(prepareHeatingComparison(c),false);
});

test('a new repair needs an observed fault before comparing the repaired device',()=>{
 const design={parts:structuredClone(targetParts),cold:true,angle:20};
 for(const fault of ['cooling','connection']){
  const d=newDiagnosis(design,fault),bad=collectorTrial(d.working.parts,d.working.cold,d.working.angle),good=collectorTrial(design.parts,true,20);
  d.hypothesis=fault;d.evidence=fault==='cooling'?4:5;
  assert.equal(diagnosisResolved(d,good),false,'a guessed fix without a before observation is incomplete');
  d.tests.push(bad,good);assert.equal(diagnosisResolved(d,good),true);
 }
});

test('ice protruding above an open tub does not magically lose all its water',()=>{
 const t=nightTrial(1,[100]);assert.equal(t.vessels[0].outcome,'raised');
 assert.equal(t.kept,100);assert.equal(t.safe,true);
 assert.equal(nightTrial(2,[85,100]).safe,false,'a closed vessel has a different constraint');
});

test('freezing measurements require prediction, elapsed cooling, removal and separate weighing',()=>{
 const a=initialActivities(),f=a.freeze,act=(step,time)=>measureAction(f,step,time);
 act('load');assert.equal(measureStatus(f).stage,'start');
 act('measure');act('load');assert.equal(measureStatus(f).stage,'measured');
 f.predicted=true;act('load');assert.equal(f.onScale,false);assert.equal(f.records.length,1);
 act('take');act('measure-ice');assert.equal(f.records.length,1);
 act('wait',60);act('wait',20);assert.equal(measureStatus(f).time,60);
 for(const time of [NaN,Infinity,101,-1])act('wait',time);
 assert.equal(measureStatus(f).time,60);
 act('wait',100);act('take');assert.equal(f.onScale,false);
 act('measure-ice');assert.equal(f.onScale,true);assert.equal(f.records[1].level,65.4);
 act('rest');assert.equal(f.onScale,false);act('measure-melt');assert.equal(f.records.length,2);
 act('wait',100);act('measure-melt');assert.equal(activityReady(3,a),false);
 act('compare');assert.equal(activityReady(3,a),true);
 assert.deepEqual(f.records.map(r=>r.mass),[100,100,100]);
 assert.deepEqual(f.records.map(r=>r.kind),['water','ice','melt']);
});

test('old measured work remains usable without replaying completed observations',()=>{
 const f=initialActivities().freeze;
 f.onScale=true;f.predicted=true;f.phase='ice';f.records=[{kind:'water',level:60,mass:100},{kind:'ice',level:65.4,mass:100}];
 assert.equal(measureStatus(f).stage,'ice-measured');
 measureAction(f,'rest');measureAction(f,'wait',100);measureAction(f,'measure-melt');measureAction(f,'compare');
 assert.equal(f.compared,true);
});

test('saved measurement process rejects impossible stages and clocks',()=>{
 const a=initialActivities();a.freeze.processStage='cooling';a.freeze.processTime=44;
 assert.equal(validateActivities(a),true);
 a.freeze.processTime=Infinity;assert.equal(validateActivities(a),false);
 a.freeze.processTime=44;a.freeze.processStage='invented';assert.equal(validateActivities(a),false);
});

test('greenhouse needs evaporation, a receiver, cold surface, elapsed condensation and comparison',()=>{
 let c=chapterState(10);
 const act=(step,time)=>c=fieldAction(10,c,'greenhouse-cycle',{step,time});
 act('cool');act('collect');act('compare');assert.equal(fieldReady(10,c),false);
 c=fieldAction(10,c,'run-cycle',{step:'evaporate',time:100});
 c=fieldAction(10,c,'run-cycle',{step:'condense'});
 assert.equal(fieldReady(10,c),false,'old instant buttons cannot complete a new mission');
 act('prepare');act('observe');assert.deepEqual(c.marks,[]);
 act('wait',70);act('wait',20);assert.equal(c.moves.cycleTime,'70');
 act('wait',100);act('observe');assert.deepEqual(c.marks,['evaporate']);
 act('cool');assert.equal(c.moves.cycleStage,'observed','receiver comes before cooling');
 act('receiver');act('cool');act('collect');assert.equal(fieldReady(10,c),false);
 act('wait',100);act('collect');assert.equal(fieldReady(10,c),false);
 act('compare');assert.equal(fieldReady(10,c),true);
 const raw=initialFieldwork();raw.chapters[10]=c;
 assert.equal(fieldReady(10,cleanFieldwork(JSON.parse(JSON.stringify(raw))).chapters[10]),true);
});

test('a completed old greenhouse keeps its stamp',()=>{
 const raw=initialFieldwork();raw.chapters[10]={...chapterState(10),marks:['evaporate','condense'],done:true};
 assert.equal(fieldReady(10,cleanFieldwork(raw).chapters[10]),true);
});


test('one sealed-cup observation unlocks its summary without a second wipe or bottle trial',()=>{
 const a=initialActivities();
 a.dew.wiped=['cold','room'];a.dew.sealed=true;
 a.dew.records=[{time:0,cold:{drops:0}},{time:100,cold:{drops:20}}];
 assert.equal(activityReady(7,a),true);
 assert.equal(activityReady(8,a),false);
 a.explain.summarySeen=true;
 assert.equal(activityReady(8,a),true);
 assert.equal(a.dew.again,false);assert.equal(a.explain.transfer,false);
});
