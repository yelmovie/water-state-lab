import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document??={addEventListener(){},querySelector(){return null;},getElementById(){return null;},documentElement:{classList:{contains(){return false;}}}};
const {passportView,certificateView}=await import('../src/achievement.js');
const {state,initialState}=await import('../src/state.js');
const {chapterState,fieldAction}=await import('../src/fieldwork-model.js');

const earnSpring=()=>{let c=chapterState(2);for(const step of ['fill','load','wait','take','compare'])c=fieldAction(2,c,'freeze-tray',{step,time:100});for(const [kind,steps] of Object.entries({melt:['place','wait','compare'],evaporate:['fill','heat','wait','stop','compare'],condense:['dry','cool','wait','wipe','wait','compare']}))for(const step of steps)c=fieldAction(2,c,'phase-process',{kind,step,time:100});state.fieldwork.chapters[2]=c;};

test('the passport shows one page per area and counts what is left',()=>{
 Object.assign(state,initialState());
 let html=passportView();
 assert.equal(html.match(/class="stamp-page /g).length,5);
 assert.doesNotMatch(html,/stamp-page area-\d earned/);
 assert.match(html,/첫 도장/);
 earnSpring();html=passportView();
 assert.equal(html.match(/stamp-page area-\d earned/g).length,1);
 assert.match(html,/도장 4개만 더/);
 assert.match(html,/resident-2\.webp/);
});
test('the certificate names what was learned, and the nickname field stays out of its markup',()=>{
 const html=certificateView('<b>');
 assert.match(html,/우리 주변의 예/);assert.match(html,/관찰했어요/);assert.match(html,/장치를 설계했어요/);
 assert.equal(html.match(/class="seal"/g).length,5);
 assert.match(html,/&lt;b&gt;/);
 assert.doesNotMatch(html,/student-name/);
 for(const label of ['학교','반','번호','이름'])assert.ok(html.includes(`aria-label="${label} 쓰는 빈칸"`));
 assert.match(html,/탐구 완료 인증 도장/);assert.doesNotMatch(html,/<input|<textarea/);
});
