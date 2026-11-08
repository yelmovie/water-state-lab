import test from 'node:test';
import assert from 'node:assert/strict';
import {canArt} from '../src/ui.js';
import {existsSync} from 'node:fs';
test('generated can retains exact dry and wet observation states',()=>{
 for(const count of [0,1,10,24])assert.equal((canArt(count).match(/data-condensation-drop/g)||[]).length,count);
 assert.match(canArt(0),/마른 표면/);assert.match(canArt(10),/물방울 10개/);
 assert.ok(existsSync(new URL('../public/assets/learning/overnight-20261108/condensation-can.webp',import.meta.url)));
});
test('invalid counts never invent condensation or create unbounded markup',()=>{
 for(const v of [-4,NaN,Infinity])assert.equal((canArt(v).match(/data-condensation-drop/g)||[]).length,0);
 assert.equal((canArt(500).match(/data-condensation-drop/g)||[]).length,24);
});
