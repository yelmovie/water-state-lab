import test from 'node:test';
import assert from 'node:assert/strict';
import {spritesTouch} from '../src/map-villains.js';
const box=(left,top,width=60,height=60)=>({left,top,width,height});
test('sprite contact uses the visible bodies and ignores surrounding transparent corners',()=>{
 assert.equal(spritesTouch(box(100,100),box(125,105)),true);
 assert.equal(spritesTouch(box(100,100),box(180,100)),false);
 assert.equal(spritesTouch(box(100,100),box(145,145)),false);
 assert.equal(spritesTouch(box(100,100),box(100,180)),false);
 assert.equal(spritesTouch(box(100,100,0,0),box(100,100)),false);
});
test('sprite contact follows rendered sizes consistently when the map scale changes',()=>{
 assert.equal(spritesTouch(box(100,100),box(125,105)),spritesTouch(box(200,200,120,120),box(250,210,120,120)));
});
