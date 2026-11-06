import {iceVolume} from './activity-model.js';
// Three freezing nights at the ice bridge. Amounts are unit-free comparison values, like the rest of chapter 4.
export const vessels={
 tub:{name:'나무 물통',closed:false},
 jar:{name:'뚜껑 닫은 유리병',closed:true},
 bottle:{name:'목이 좁은 병',closed:true,neck:{volume:88,height:.7}}
};
export const nights=[
 {id:1,name:'첫째 밤',need:70,vessels:['tub']},
 {id:2,name:'둘째 밤',need:150,vessels:['tub','jar']},
 {id:3,name:'셋째 밤',need:240,vessels:['tub','jar','bottle']}
];
export const reasons=[
 {id:'dry',label:'물이 빨리 마르게 하려고 비워 둬.',hint:'아침에 통 속 물이 줄어들었니? 얼음 윗면이 어떻게 됐는지 떠올려 봐.'},
 {id:'grow',label:'물이 얼면 커지니까 자리가 필요해.',ok:true},
 {id:'heavy',label:'얼면 무거워지니까 덜 담아야 해.',hint:'3장 저울을 떠올려 봐. 얼어도 무게는 같았어. 달라진 건 무엇이었지?'}
];
const nightOf=id=>nights.find(n=>n.id===id);
const fillKey=(night,index)=>`fill-${night}-${index}`;
export const currentNight=c=>nights.find(n=>!c.marks.includes('night-'+n.id));
export const nightFills=(c,night)=>night.vessels.map((_,i)=>Number(c.moves[fillKey(night.id,i)])||0);
export const coldNightsDone=c=>!currentNight(c)&&c.marks.includes('reason');
/** Share of the vessel's height that a volume reaches. A narrow neck climbs fast for very little water. */
export function levelHeight(kind,volume){
 const v=Math.max(0,Math.min(100,volume)),neck=vessels[kind].neck;
 if(!neck)return v/100;
 return v<=neck.volume?v/neck.volume*neck.height:neck.height+(v-neck.volume)/(100-neck.volume)*(1-neck.height);
}
export function vesselTrial(kind,fill){
 const ice=iceVolume(fill),fits=ice<=100;
 return {kind,fill,ice,outcome:fits?'ok':vessels[kind].closed?'crack':'overflow'};
}
export function nightTrial(id,fills){
 const night=nightOf(id),list=night.vessels.map((kind,i)=>vesselTrial(kind,fills[i]||0));
 const kept=list.reduce((sum,v)=>sum+(v.outcome==='ok'?v.fill:0),0),safe=list.every(v=>v.outcome==='ok'),enough=kept>=night.need;
 return {night:id,need:night.need,vessels:list,kept,safe,enough,ok:safe&&enough};
}
export function nightMessage(trial){
 if(trial.ok)return trial.night===3?'세 번째 아침이야! 통이 모두 멀쩡하고 물도 넉넉해.':'아침이 왔어! 통이 멀쩡하고 물도 넉넉해.';
 const cracked=trial.vessels.some(v=>v.outcome==='crack'),spilled=trial.vessels.some(v=>v.outcome==='overflow');
 if(cracked&&spilled)return '얼음이 통 위로 넘쳤고, 닫힌 병은 쩍 갈라졌어! 얼면서 자리가 모자랐어.';
 if(cracked)return '쩍! 얼음이 안에서 밀어서 병이 갈라졌어. 닫힌 병은 얼음이 갈 곳이 없어.';
 if(spilled)return '얼음이 통 위로 넘쳤어! 물이 얼면서 자리가 모자랐어.';
 return '통은 멀쩡해! 그런데 마을이 쓰기엔 물이 모자라.';
}
/** Only after two tries, and only as a place to look. */
export function retryHint(trial,failures){
 if(failures<2||trial.ok)return '';
 if(trial.vessels.some(v=>v.kind==='bottle'&&v.outcome!=='ok'))return '병목은 좁아서 물높이가 빨리 올라. 위가 비어 보여도 자리는 적어.';
 if(!trial.safe)return '얼음이 닿은 점선을 봐. 그 얼음이 통 안에 들어갈 만큼만 담아 봐.';
 return '통 위쪽에 아직 자리가 있어. 물을 조금 더 담아 봐.';
}
/** Commands for the chapter 4 mission. `c` is already a private copy. */
export function coldNightAction(c,action,payload){
 const night=currentNight(c);
 if(action==='fill'){
  const {index,value}=payload;
  if(payload.night===night?.id&&Number.isInteger(index)&&index>=0&&index<night.vessels.length)c.moves[fillKey(night.id,index)]=String(Math.max(0,Math.min(100,Math.round(Number(value)||0))));
 }
 if(action==='freeze-night'&&payload.night===night?.id){
  const fills=nightFills(c,night);
  if(!fills.some(Boolean)){c.message='먼저 수도꼭지를 눌러 통에 물을 담아 봐.';return;}
  const trial=nightTrial(night.id,fills);
  c.tested.push({value:night.id,amount:trial.kept,ok:trial.ok});
  c.message=nightMessage(trial);
  if(trial.ok)c.marks=[...new Set([...c.marks,'night-'+night.id])];
 }
 if(action==='reason'&&!night){
  const reason=reasons.find(r=>r.id===payload.choice);
  if(!reason)return;
  c.selected=reason.id;
  if(reason.ok){c.marks=[...new Set([...c.marks,'reason'])];c.message='맞아! 얼음이 커질 자리를 남겨서 사흘을 버텼어.';}
  else c.message=reason.hint;
 }
}
