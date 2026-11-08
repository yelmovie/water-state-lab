import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterState,fieldAction} from '../src/fieldwork-model.js';
import {trayFillLevels,cupWaterSurface} from '../src/freeze-tray.js';

test('a partially poured tray resumes without refilling the cup or advancing into the freezer',()=>{
 let c=chapterState(2);const pour=time=>c=fieldAction(2,c,'freeze-tray',{step:'fill',time});
 pour(35);assert.equal(c.moves.freezeFill,'35');assert.notEqual(c.moves.freezeTray,'water');
 c=fieldAction(2,c,'freeze-tray',{step:'load'});assert.notEqual(c.moves.freezeTray,'cooling');
 for(const time of [20,-1,101,NaN,Infinity])pour(time);
 assert.equal(c.moves.freezeFill,'35');
 pour(70);pour(100);assert.equal(c.moves.freezeTray,'water');assert.equal(c.moves.freezeFill,'100');
 c=fieldAction(2,c,'freeze-tray',{step:'load'});assert.equal(c.moves.freezeTray,'cooling');
});

test('water leaves the cup only as it enters the six wells, each well fills before the next',()=>{
 for(const amount of [0,10,25,50,75,99,100]){
  const levels=trayFillLevels(amount);
  assert.equal(levels.length,6);assert.ok(levels.every(x=>x>=0&&x<=1));
  assert.ok(Math.abs(levels.reduce((a,b)=>a+b,0)-amount/100*6)<1e-9);
  assert.ok(levels.every((x,i)=>!i||levels[i-1]===1||x===0));
 }
});

test('the cup water surface stays within the tilted glass and falls as water is poured out',()=>{
 for(const angle of [0,35,60,70]){
  const top=cupWaterSurface(100,angle),half=cupWaterSurface(50,angle),bottom=cupWaterSurface(0,angle);
  assert.ok(top<half&&half<bottom);assert.ok(Number.isFinite(half));
 }
 assert.ok(Math.abs(cupWaterSurface(50,0)-153)<3);
});
