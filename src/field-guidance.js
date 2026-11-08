import {cycleTask} from './greenhouse-cycle.js';
import {fieldMissions,fieldReady,coolingBaseline} from './fieldwork-model.js';
import {move} from './stage-guide.js';

const test='[data-action="field-test"]',canvas='#field-canvas';
const parts=['냉각판','경사판','깔때기','연결관','물통'];
// The active gesture, the text and the canvas cues describe the same task.
export function fieldTask(n,c){
 const done=fieldReady(n,c),before=coolingBaseline(c),last=c.tested.at(-1);
 const after=c.tested.some(t=>t.cold===1&&t.ok);
 let step=move('tap','지금 필요한 도구를 골라 봐',fieldMissions[n].goal,canvas), items=[], targets=[], zones=[];
 if(n===1){
  const key=['water','ice'].find(item=>!['tall','wide'].some(target=>c.marks.includes(item+'-'+target)));
  step=move('drag',key==='ice'?'이번에는 얼음을 옮겨 봐':'물병을 새 그릇으로 옮겨 봐','왼쪽에서 잡고 원하는 그릇에 놓아 봐. 먼저 누르고 그릇을 눌러도 돼.',canvas);
  items=[key];targets=['tall','wide'];
 }
 if(n===2)step=c.marks.includes('freeze')?move('tap','준비하고 관찰한 뒤 비교해 봐','화면에 표시된 순서대로 준비하고, 시간이 지난 모습을 비교하자.','[data-process-action],[data-transform-next]'):move('tap','얼음틀과 냉동고로 물을 얼려 봐','물을 틀에 붓고, 냉동고에 넣어 충분히 얼린 뒤 꺼내 비교하자.','[data-tray-action]');
 if(n===3){
  const slot=[['water','first','① 냉각팩을 대기 전','냉각팩이 어디 있는지 봐. 아직 쓰지 않은 사진은 뭘까?'],['ice','middle','② 냉각팩을 댄 뒤','물 윗면과 빨간 선을 비교해 봐. 어떤 사진이 달라 보여?'],['melt','last','③ 따뜻하게 한 뒤','비커 아래를 봐. 따뜻한 받침이 있는 사진은 뭘까?']].find(([photo,dest])=>c.moves[photo]!==dest);
  const sample=[['water','처음 물'],['ice','얼음'],['melt','녹인 물']].find(([key])=>!c.marks.includes('weigh-'+key));
  if(!c.marks.includes('order')){
   if(slot){const [,dest,label,clue]=slot;step=move('drag',`‘${label}’ 칸의 사진을 찾아 봐`,clue,canvas);targets=[dest];items=['water','ice','melt'];}
   else step=move('test','사진 순서를 확인해 봐','세 사진을 놓았어. 네가 찾은 순서가 맞는지 눌러 봐.',test);
  }
  else if(!c.selected)step=move('tap','얼음이 되면 무게는 어떻게 될까?','높이가 올라갔으니 무거워졌을까? 네 생각을 골라 봐.','[data-action^="field-weigh-guess-"]');
  else if(c.moves.weight!=='balance'){step=move('drag','100 g 추를 오른쪽 접시에 올려 봐','이 추가 비교 기준이야. 왼쪽에 올린 것과 무게가 같으면 저울이 수평이 돼.',canvas);items=['weight'];targets=['balance'];}
  else if(sample){const [key,label]=sample;step=move('drag',`${label}을 왼쪽 접시에 올려 봐`,'양팔저울이 수평이 되면 100 g 추와 무게가 같은 거야.',canvas);items=[key];targets=['pan'];}
 }
 if(n===6){
  if(c.spread.length<12){step=move('brush','B판의 물을 넓게 펴 봐','오른쪽 B판을 손가락으로 문질러 12칸 이상 넓혀 봐. A판은 그대로 두자.',canvas);zones=[[540,188,302,210]];}
  else step=move('compare','같은 시간 뒤 두 물자국을 비교해 봐','기다린 뒤 A와 B 중 어느 쪽 물자국이 더 옅어졌는지 살펴봐.',test);
 }
 if(n===5){
  const key=c.moves.A==='air'?'B':'A',selected=c.selected===key;
  step=selected?move('tap',`${key}에서 줄어든 물은 어디로 갔을까?`,'물높이가 낮아진 이유를 생각하며 도착할 곳을 골라 봐.','[data-action^="field-destination-"]'):move('tap',`${key}에서 줄어든 물을 살펴봐`,key==='A'?'가열하지 않아도 물높이가 낮아졌어. A를 눌러 행방을 찾아 봐.':'B는 물속에 기포가 생기며 끓었어. B를 눌러 행방을 찾아 봐.',`[data-action="field-water-${key}"]`);
  items=[key];if(selected)targets=['air'];
 }
 if(n===7){
  const missing=[0,1].find(k=>!c.tested.some(t=>t.cold===k)),cup=missing===0?'A':'B';
  if(missing!==undefined){
   if(c.selected===cup)step=move('compare',`${cup}컵에 냉각팩을 붙인 채 기다려 봐`,'같은 시간 뒤 어느 컵의 겉면이 달라지는지 봐.',test);
   else{step=move('drag',`냉각팩을 ${cup}컵에 붙여 봐`,'파란 냉각팩을 옮겨 어느 쪽에서 물방울이 생기는지 확인해 봐.',canvas);items=['pack'];targets=[cup];}
  }else{step=move('tap','두 번의 실험에서 같았던 조건을 골라 봐','컵 이름과 표면의 차가움 중 무엇이 물방울과 관련 있는지 생각해 봐.','[data-action^="field-condition-"]');items=['condition'];targets=['identity','cold'];}
 }
 if(n===8){
  if(c.moves.tray!=='under'){step=move('drag','물 받이를 금속판 아래에 놓아 봐','물이 떨어지는 자리 바로 아래에 받이를 옮겨 봐.',canvas);items=['tray'];targets=['under'];}
  else if(!before&&c.moves.cold==='plate')step=move('tap','냉각팩을 잠깐 떼어 봐','받이는 그대로 두고 먼저 냉각하지 않은 상태부터 살펴봐.','[data-action="field-remove-cold"]');
  else if(!before)step=move('test','판을 차갑게 하지 않고 시험해 봐','받이에 물이 모이는지 먼저 살펴봐.',test);
  else if(c.moves.cold!=='plate'){step=move('drag','금속판에 냉각팩을 붙여 봐','받이 자리는 그대로 두고 판만 차갑게 만들어 봐.',canvas);items=['cold'];targets=['plate'];}
  else step=move('compare','차가운 판에서 물이 모이는지 봐','앞 시험과 같은 시간 동안 기다려 차이를 비교해 봐.',test);
 }
 if(n===9){
  const i=parts.findIndex((_,k)=>k<4&&!c.lines.includes(k+'-'+(k+1)));
  if(i>=0)step=move('connect',`${parts[i]}에서 다음 부품까지 이어 봐`,'물을 받을 바로 아래 부품을 찾아 선을 그어 봐. 두 부품을 차례로 눌러도 돼.',canvas);
  if(i>=0)zones=[[[165,55],[300,135],[450,210],[450,280],[450,350]][i].concat([80,78])];
 }
 if(n===10)step=move('tap',cycleTask(c),'준비하고, 기다리고, 관찰한 뒤 다음 과정으로 이어 봐.','[data-cycle-action]');
 if(done)step=move('next','주민의 부탁을 해결했어!','이번 구역에서 알아낸 것을 영상으로 정리해 봐.','[data-action="field-finish"]');
 return {...step,done,items,targets,zones,result:c.message,beforeCooling:before,afterCooling:after};
}
