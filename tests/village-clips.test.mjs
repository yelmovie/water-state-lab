import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {villageLights} from '../src/village-lights.js';
import {villageClips} from '../src/village-clips.js';

const residents=[{stage:3},{stage:1}];
const asset=name=>new URL('../public/assets/village/'+name,import.meta.url);

test('every restored place has a reveal clip and a looping clip inside the island painting',()=>{
 assert.deepEqual(villageClips.map(c=>c.id),[1,2,3,4,5,6,7,8,9,10]);
 for(const {id,box:[x,y,w,h]} of villageClips){
  assert.ok(existsSync(asset(`stage-${id}-on.webp`)),'reveal '+id);
  assert.ok(existsSync(asset(`stage-${id}-idle.webp`)),'loop '+id);
  assert.ok(x>=0&&y>=0&&x+w<=1672&&y+h<=941,'box '+id);
 }
});

test('only the place restored just now plays its reveal',()=>{
 const html=villageLights(residents,[3],false,true);
 assert.match(html,/stage-3-on\.webp/);
 assert.match(html,/stage-3-idle\.webp/);
 assert.match(html,/stage-1-idle\.webp/);
 assert.doesNotMatch(html,/stage-1-on\.webp/);
 assert.doesNotMatch(html,/stage-2-/,'a place that is not restored stays still');
});

test('reduced motion keeps the still art and loads no clips',()=>{
 const html=villageLights(residents,[3],false,false);
 assert.doesNotMatch(html,/assets\/village/);
 assert.match(html,/village-art/);
 assert.doesNotMatch(html,/has-clips/);
});

test('a building guide restores both places in its building without duplicate effects',()=>{
 const html=villageLights([{stage:1},{stage:2},{stage:4}],[4],false,true);
 for(const n of [1,2,3,4])assert.equal((html.match(new RegExp(`stage-${n}-idle\\.webp`,'g'))||[]).length,1,'one loop for place '+n);
 assert.match(html,/stage-3-on\.webp/);
 assert.match(html,/stage-4-on\.webp/);
 assert.doesNotMatch(html,/stage-1-on\.webp/);
 assert.doesNotMatch(html,/stage-5-/);
});
