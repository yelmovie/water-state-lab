import {cycleAction} from './greenhouse-cycle.js';
import {heatingTrial} from './activity-model.js';
import {coldNightAction,coldNightsDone,nights} from './cold-night-model.js';
// Field applications follow an observed experiment. No speed, precision or click-count score.
export const experimentTitles=['','옮겨 담기','생활 속 세 상태','얼기·녹기','얼 때의 공간','물그림 마르기','증발과 끓음','컵 바깥 물방울','관찰결과 확인','물 모으는 장치','마지막 물길 복구'];
export const experimentQuestions=['','물과 얼음의 모양은 어떻게 달라질까?','생활 속 물은 어떤 상태일까?','얼고 녹으면 높이와 무게는?','물이 얼 때 공간이 충분할까?','물의 양이 다르면 마르는 순서는?','증발과 끓음은 무엇이 같을까?','컵 바깥 물방울은 어디서 왔을까?','컵에서 관찰한 결과는 무엇일까?','어떻게 고치면 물이 모일까?','내 기록과 장치로 물길을 고칠까?'];
// One request closes each area. Odd stages lead straight on to the second experiment of the area.
export const fieldStages=[2,4,10];
export const areaStages=[2,4,6,8,10];
export const fieldMissions=[null,
 null,
 {title:'네 갈래 변신길',problem:'얼음·물·수증기를 다시 이어 줄 수 있을까?',goal:'얼음틀과 냉동고로 물을 얼려 보고, 다른 변화도 차례로 관찰해 봐.',type:'routes',reward:'관찰 돋보기',ability:'물의 세 상태와 생활 속 예를 연결할 수 있어',next:'돋보기로 얼기 전후의 눈금을 살펴봐요',standard:'4과10-01'},
 null,
 {title:'한파가 온다',problem:'사흘 밤 동안 쓸 물을 통이 터지지 않게 담을 수 있을까?',goal:'수도꼭지로 통을 채우고 레버를 당겨 밤을 보내 봐. 마을이 쓸 물은 넉넉하게, 얼음이 커질 자리도 남겨 봐.',type:'nights',reward:'배관 안전 기록',ability:'얼 때 커질 자리를 남겨 설계할 수 있어',next:'안전하게 고친 물길로 다음 구역을 열어요',standard:'4과10-02'},
 null,
 null,
 null,
 null,
 null,
 {title:'마지막 순환 회로',problem:'물이 모자란 온실에 물을 다시 보낼 수 있을까?',goal:'물 → 수증기 → 물방울의 길에 알맞은 도구를 연결해 봐.',type:'final',reward:'연구섬 복구 코어',ability:'증발과 응결을 이용한 물 수집 방법을 설명할 수 있어',next:'내 연구 기록과 복구 인증서가 남아요',standard:'4과10-03'}
];
export function initialFieldwork(){return {version:2,introSeen:false,active:0,pending:'',briefed:[],chapters:{},ability:''};}
export function chapterState(n){return {rulesVersion:2,moves:{},tested:[],marks:[],lines:[],spread:[],setting:100,selected:'',message:'',done:false};}
const clone=v=>JSON.parse(JSON.stringify(v));
// Version 1 had a request on every stage. The drying request moved from chapter 5 to chapter 6, where it now ends the area.
export function migrateFieldwork(raw){
 if(!raw||typeof raw!=='object')return raw;
 if(raw.version===2)return [6,8].includes(raw.active)?{...raw,active:0,pending:''}:raw;
 const chapters={...raw.chapters},drying=chapters[5],lens=chapters[6];
 delete chapters[5];delete chapters[6];if(drying)chapters[6]=drying;if(lens)chapters[5]=lens;
 return {...raw,version:2,chapters,active:fieldStages.includes(raw.active)?raw.active:0,pending:/^act-complete-[1234]$|^field-ending$/.test(raw.pending)?raw.pending:''};
}
export function cleanFieldwork(raw){
 const f=initialFieldwork();if(!raw||typeof raw!=='object')return f;
 f.introSeen=raw.introSeen===true;f.active=Number.isInteger(raw.active)&&fieldStages.includes(raw.active)?raw.active:0;
 f.pending=typeof raw.pending==='string'&&/^(act-complete-[1234]|field-ending)$/.test(raw.pending)?raw.pending:'';
 f.briefed=Array.isArray(raw.briefed)?[...new Set(raw.briefed.filter(n=>Number.isInteger(n)&&n>=1&&n<=10))]:[];
 f.ability=['observe','compare','design'].includes(raw.ability)?raw.ability:'';
 for(let n=1;n<=10;n++){
  const c=raw.chapters?.[n];if(!c||typeof c!=='object')continue;
  const next=chapterState(n);next.rulesVersion=c.rulesVersion===2?2:1;next.setting=Number.isFinite(c.setting)?Math.max(40,Math.min(100,c.setting)):95;
  next.selected=typeof c.selected==='string'?c.selected.slice(0,40):'';
  next.message=typeof c.message==='string'?c.message.slice(0,200):'';
  for(const key of ['marks','spread'])if(Array.isArray(c[key]))next[key]=[...new Set(c[key].filter(v=>key==='marks'?typeof v==='string'&&v.length<40:Number.isInteger(v)&&v>=0&&v<48))].slice(0,48);
  if(Array.isArray(c.lines))next.lines=c.lines.filter(v=>typeof v==='string'&&/^\d-\d$/.test(v)).slice(0,8);
  if(c.moves&&typeof c.moves==='object'&&!Array.isArray(c.moves))for(const [key,val] of Object.entries(c.moves).slice(0,n===2?24:12))if(typeof val==='string'&&key.length<30&&val.length<30)next.moves[key]=val;
  if(Array.isArray(c.tested))next.tested=c.tested.filter(t=>t&&typeof t==='object'&&['value','cold','amount','spread'].every(k=>t[k]===undefined||Number.isFinite(t[k]))&&typeof t.ok==='boolean').slice(-8).map(t=>({value:t.value,cold:t.cold,amount:t.amount,spread:t.spread,ok:t.ok,source:t.source==='buddy'&&n===4&&t.value===100&&!t.ok?'buddy':undefined}));
  next.done=c.done===true;next.done=fieldReady(n,next);f.chapters[n]=next;
 }
 return f;
}
export function coolingBaseline(c){return c.tested.some(t=>t.cold===0&&!t.ok)||(c.rulesVersion===1&&c.done&&c.tested.some(t=>!t.ok));}
// Saves from the single-tank mission keep their stamp. Night trials use values 1-3, which that test never produced.
const oldTankDone=c=>c.tested.some(t=>t.value>=40&&!t.ok)&&c.tested.at(-1)?.ok===true&&c.tested.at(-1)?.value===c.setting;
// Earlier discoveries stay valid; the new freezer flow needs its actual comparison.
const freezingObserved=c=>c.marks.includes('freeze')&&(c.moves.freeze!=='freezer'||c.moves.freezeTray==='compared'&&c.moves.freezeTime==='100');
export const phaseProcesses={
 melt:{stage:'meltStage',clock:'meltTime',source:'room-time',previous:'freeze'},
 evaporate:{stage:'boilStage',clock:'boilTime',source:'hotplate-process',previous:'melt'},
 condense:{stage:'dewStage',clock:'dewTime',source:'cold-surface-process',previous:'evaporate'}
};
export function phaseStatus(kind,c){const p=phaseProcesses[kind];return {stage:c.moves[p.stage]||'start',time:Math.max(0,Math.min(100,Number(c.moves[p.clock])||0))};}
export function transformationObserved(c,key){
 if(key==='freeze')return freezingObserved(c);
 const p=phaseProcesses[key];
 return !!p&&c.marks.includes(key)&&(c.moves[key]!==p.source||c.moves[p.stage]==='compared'&&c.moves[p.clock]==='100');
}
export function fieldReady(n,c){
 if(!c)return false;
 switch(n){
 case 1:return ['water','ice'].every(item=>['tall','wide'].some(target=>c.marks.includes(item+'-'+target)));
 case 2:return ['freeze','melt','evaporate','condense'].every(k=>transformationObserved(c,k));
 case 3:return photosInOrder(c)&&c.moves.weight==='balance'&&(weighSamples.every(k=>c.marks.includes('weigh-'+k))||c.done===true&&!c.marks.length);
 case 4:return coldNightsDone(c)||oldTankDone(c);
 case 6:return c.spread.length>=12&&c.tested.at(-1)?.spread===c.spread.length&&c.tested.at(-1)?.ok===true;
 case 5:return c.moves.A==='air'&&c.moves.B==='air';
 case 7:return [0,1].every(k=>c.tested.some(t=>t.cold===k))&&c.moves.condition==='cold';
 case 8:return coolingBaseline(c)&&c.tested.at(-1)?.ok===true&&c.moves.cold==='plate'&&c.moves.tray==='under';
 case 9:return ['0-1','1-2','2-3','3-4'].every(k=>c.lines.includes(k));
 case 10:return ['evaporate','condense'].every(k=>c.marks.includes(k))&&(c.moves.cycleSource!=='process'||c.moves.cycleStage==='compared'&&c.moves.cycleTime==='100');
 default:return false;
 }
}
export const weighSamples=['water','ice','melt'];
const sampleNames={water:'처음 물',ice:'얼음',melt:'녹인 물'};
const photosInOrder=c=>c.moves.water==='first'&&c.moves.ice==='middle'&&c.moves.melt==='last';
// The balance only answers once the learner has committed to a prediction and the 100 g weight is on it.
function weighSample(c,item){
 if(!weighSamples.includes(item)||!c.marks.includes('order'))return;
 if(!c.selected){c.message='먼저 네 예상을 골라 봐.';return;}
 if(c.moves.weight!=='balance'){c.message='먼저 100 g 추를 오른쪽 접시에 올려 봐.';return;}
 c.moves.pan=item;c.marks=[...new Set([...c.marks,'weigh-'+item])];
 const left=weighSamples.filter(k=>!c.marks.includes('weigh-'+k));
 if(left.length)c.message=`${sampleNames[item]}도 100 g 추와 수평이야. 다음 것도 올려 봐.`;
 else c.message=`${c.selected==='same'?'네 예상이 맞았어!':'예상과 달랐지?'} 세 번 모두 수평이야. 높이는 달라져도 무게는 100 g 그대로야.`;
}
// Each clue names evidence inside the photo, so a retry is a second look and not a guess.
function photoOrderClue(c){
 if(c.moves.water!=='first')return '①번에는 냉각팩을 쓰기 전 사진이 와야 해. 냉각팩이 아직 옆에 놓인 사진을 찾아봐.';
 if(c.moves.ice!=='middle')return '②번은 냉각팩을 댄 뒤야. 물 윗면이 빨간 선보다 올라간 사진을 찾아봐.';
 if(c.moves.melt!=='last')return '③번은 따뜻한 받침에 올린 뒤야. 받침 위에 있는 사진을 찾아봐.';
 return '사진을 세 칸에 모두 놓아 봐.';
}
export function fieldProgress(n,c){
 if(!c)return [0,1];let checks=[];
 if(n===1)checks=['water','ice'].map(item=>['tall','wide'].some(target=>c.marks.includes(item+'-'+target)));
 if(n===2)checks=['freeze','melt','evaporate','condense'].map(k=>transformationObserved(c,k));
 if(n===3)checks=[c.marks.includes('order'),c.moves.weight==='balance',...weighSamples.map(k=>c.marks.includes('weigh-'+k))].map(v=>v||c.done);
 if(n===4)checks=[...nights.map(night=>c.marks.includes('night-'+night.id)),c.marks.includes('reason')].map(v=>v||oldTankDone(c));
 if(n===6)checks=[c.spread.length>=12,c.tested.at(-1)?.spread===c.spread.length&&c.tested.at(-1)?.ok];
 if(n===5)checks=[c.moves.A==='air',c.moves.B==='air'];
 if(n===7)checks=[c.tested.some(t=>t.cold===0),c.tested.some(t=>t.cold===1),c.moves.condition==='cold'];
 if(n===8)checks=[coolingBaseline(c),c.moves.cold==='plate'&&c.moves.tray==='under',c.tested.at(-1)?.ok];
 if(n===9)checks=['0-1','1-2','2-3','3-4'].map(k=>c.lines.includes(k));
 if(n===10)checks=['evaporate','condense'].map(k=>c.marks.includes(k));
 return [checks.filter(Boolean).length,checks.length];
}
const routes={freeze:['cold'],melt:['warm'],evaporate:['time','warm'],condense:['cold']};
function freezeTrayAction(c,{step,time}){
 if(c.marks.includes('freeze'))return;
 const stage=c.moves.freezeTray||'empty';
 if(step==='fill'&&stage==='empty'){
  const amount=time===undefined?100:time;
  if(!Number.isFinite(amount)||amount<Number(c.moves.freezeFill||0)||amount<0||amount>100)return;
  c.moves.freezeFill=String(amount);
  if(amount<100){c.message=`컵의 물을 얼음틀에 나누어 담고 있어. 여섯 칸 중 ${Math.floor(amount*6/100)}칸을 채웠어.`;return;}
  c.moves.freezeTray='water';c.message='물을 얼음틀의 여섯 칸에 나누어 담았어. 이제 냉동고에 넣어 보자.';
 }else if(step==='load'&&stage==='water'){
  c.moves.freezeTray='cooling';c.moves.freezeTime='0';c.message='물 든 얼음틀을 넣고 냉동고 문을 닫았어. 물이 얼 때까지 기다려 보자.';
 }else if(step==='wait'&&stage==='cooling'&&Number.isFinite(time)&&time>=Number(c.moves.freezeTime||0)&&time<=100){
  c.moves.freezeTime=String(time);
  if(time===100){c.moves.freezeTray='frozen';c.message='충분히 차가운 냉동고에서 시간이 지났어. 문을 열고 얼음틀을 꺼내 보자.';}
  else c.message='냉동고 안에서 물이 차가워지고 있어. 얼음이 되려면 더 기다려야 해.';
 }else if(step==='take'&&stage==='frozen'){
  c.moves.freezeTray='taken';c.message='틀의 여섯 칸 모양대로 얼음이 생겼어. 같은 얼음틀의 처음 물과 비교해 봐.';
 }else if(step==='compare'&&stage==='taken'){
  c.moves.freezeTray='compared';c.moves.freeze='freezer';c.marks.push('freeze');
  c.message='얼음틀 속 물이 충분히 차가운 냉동고에서 얼었어. 물이 얼음이 되는 변화를 얼기라고 해.';
 }
}
function phaseProcessAction(c,{kind,step,time}){
 const p=phaseProcesses[kind];if(!p||c.marks.includes(kind)||!transformationObserved(c,p.previous))return;
 const {stage}=phaseStatus(kind,c),set=(next,message)=>{c.moves[p.stage]=next;c.message=message;};
 if(kind==='melt'&&step==='place'&&stage==='start'){
  c.moves[p.clock]='0';set('resting','방금 얼린 틀을 실온 준비대에 놓았어. 시간이 지나면 얼음이 어떻게 될까?');
 }
 if(kind==='evaporate'){
  if(step==='fill'&&stage==='start'){c.moves[p.clock]='0';set('ready','같은 두 컵에 같은 양의 물을 담았어. A는 그대로 두고 B만 가열해 보자.');}
  if(step==='heat'&&stage==='ready')set('heating','B만 가열하는 중이야. 같은 시간 동안 두 컵의 물높이와 물속을 살펴봐.');
  if(step==='stop'&&stage==='boiling')set('observed','가열을 멈추고 같은 시간 뒤의 모습을 기록했어. B 물속 기포와 두 물높이를 비교해 봐.');
 }
 if(kind==='condense'){
  if(step==='dry'&&stage==='start'){c.moves[p.clock]='0';set('dry','두 판에 남아 있던 물기를 모두 닦았어. 이제 B판 뒷면만 차갑게 해 보자.');}
  if(step==='cool'&&stage==='dry')set('cooling','냉각팩은 B판 뒷면에 있어. 같은 공기와 닿는 두 판의 앞면을 지켜봐.');
  if(step==='wipe'&&stage==='wet'){c.moves[p.clock]='0';set('rewiped','B판 앞면을 다시 닦았어. 냉각팩은 그대로 둔 채 기다려도 새 물방울이 생길까?');}
 }
 if(step==='wait'&&Number.isFinite(time)&&time>=0&&time<=100&&time>=Number(c.moves[p.clock]||0)){
  const waiting=kind==='melt'?stage==='resting':kind==='evaporate'?stage==='heating':['cooling','rewiped'].includes(stage);
  if(waiting){
   c.moves[p.clock]=String(time);
   if(kind==='melt')set(time===100?'melted':'resting',time===100?'같은 얼음틀 안에서 얼음이 모두 녹아 물이 됐어. 처음과 나중을 비교해 보자.':'실온에서도 시간이 지나면 얼음은 작아지고 녹은 물은 늘어나.');
   if(kind==='evaporate')set(time===100?'boiling':'heating',time===100?'B 물속에서 기포가 계속 올라와. 물이 남아 있어도 끓을 수 있어. 가열을 멈추고 기록을 비교하자.':heatingTrial(100,time).boiling?'B 물속에 기포가 생겼어. 두 컵을 같은 시간 동안 더 지켜보자.':'아직 끓기 전이야. A에서도 표면 증발은 일어나고 있어.');
   if(kind==='condense')set(time===100?(stage==='rewiped'?'again':'wet'):stage,time===100?(stage==='rewiped'?'닦은 B판 앞면에 물방울이 다시 맺혔어! 차가운 표면과 닿은 공기 중 수증기가 물방울이 된 거야.':'A는 마른 채인데 B판 앞면에는 새 물방울이 생겼어. 한 번 더 닦아서 확인해 보자.'):'같은 시간 동안 기다리는 중이야. 차가운 B판 앞면에서 무엇이 달라지는지 봐.');
  }
 }
 if(step==='compare'&&stage===({melt:'melted',evaporate:'observed',condense:'again'})[kind]){
  c.moves[kind]=p.source;c.marks.push(kind);
  set('compared',({melt:'얼음이 실온에서 시간이 지나 물로 녹았어. 같은 틀 안에서 고체가 액체로 바뀌었지.',evaporate:'A도 표면에서 증발했고, B는 물속에서도 기포가 생기며 끓었어. 두 경우 모두 눈에 보이지 않는 수증기로 바뀌어.',condense:'냉각팩은 뒷면에 있고 물방울은 닦은 앞면에 다시 생겼어. 공기 중 수증기가 차가운 판에서 물방울이 되는 변화가 응결이야.'})[kind]);
 }
}
export function fieldAction(n,current,action,payload={}){
 const c=clone(current||chapterState(n));if(!c.done)c.rulesVersion=2;
 if(n===10&&action==='greenhouse-cycle')cycleAction(c,payload);
 if(n===2&&action==='freeze-tray')freezeTrayAction(c,payload);
 if(n===2&&action==='phase-process')phaseProcessAction(c,payload);
 if(action==='place'){
  const {item,target}=payload;
  if(typeof item!=='string'||typeof target!=='string')return c;
  if(n===3&&target==='pan'){weighSample(c,item);c.done=fieldReady(3,c);return c;}
  c.moves[item]=target;
  if(n===1&&['water','ice'].includes(item)&&['tall','wide'].includes(target)){c.marks=[...new Set([...c.marks,item+'-'+target])];c.message=item==='water'?'물은 새 그릇의 모양에 맞게 담겨. 같은 양이야.':'얼음은 새 그릇에서도 모양을 유지해.';}
  if(n===2&&Object.hasOwn(routes,target)){c.moves[target]=item;c.marks=c.marks.filter(k=>k!==target);}
  if(n===5&&['A','B'].includes(item)&&target==='air')c.message='두 물 모두 보이지 않는 수증기가 되어 공기 중으로 가. 끓을 때는 물속에서도 기포가 생겼지.';
  if(n===3)c.message=item==='weight'?'오른쪽 접시만 무거워서 추 쪽으로 기울었어. 왼쪽 접시에 물을 올려 봐.':'사진 속 도구와 빨간 선을 단서로 살펴봐.';
  if(n===7&&item==='pack'&&['A','B'].includes(target)){c.selected=target;c.message='새 조건을 준비했어. 두 표면을 닦고 같은 시간 동안 비교하자.';}
  if(n===7&&item==='condition')c.message=target==='cold'?'컵 이름을 바꿔도 차가운 표면에 물방울이 생겼어.':'냉각팩을 옮기면 물방울이 생긴 컵도 바뀌었어. 두 기록의 같은 조건을 찾아봐.';
  if(n===8)c.message='배치를 바꿨어. 앞 시험과 같은 조건에서 다시 관찰하자.';
 }
 if(n===5&&action==='select-water'&&['A','B'].includes(payload.cup)&&c.moves[payload.cup]!=='air'){c.selected=payload.cup;c.message='';}
 if(n===5&&action==='trace-water'&&['A','B'].includes(c.selected)&&['air','cup','floor'].includes(payload.destination)){
  const cup=c.selected,destination=payload.destination;
  if(destination==='air'){
   c.moves[cup]='air';c.selected='';
   c.message=cup==='A'?'가열하지 않은 물도 표면에서 증발해, 눈에 보이지 않는 수증기가 됐어.':'끓을 때는 물속의 기포에도 수증기가 있어. 두 경우 모두 물이 수증기로 바뀌었어.';
  }else c.message=destination==='floor'?'컵 주변에 흘린 물은 없어. 물이 상태를 바꾸었을 수도 있을까?':'컵에 남은 물은 조금 줄었어. 줄어든 물은 다른 모습이 되었을까?';
 }
 if(n===3&&action==='guess-weight'&&c.marks.includes('order')&&['heavier','same','lighter'].includes(payload.guess)){c.selected=payload.guess;c.message='좋아, 이제 양팔저울로 확인해 보자.';}
 if(action==='spread'&&Number.isInteger(payload.cell)&&payload.cell>=0&&payload.cell<48){c.spread=[...new Set([...c.spread,payload.cell])];c.message=`B를 ${c.spread.length}칸으로 펼쳤어. 같은 시간 뒤 비교하기로 변화를 시험해 봐.`;}
 if(action==='inspect'&&['surface','inside','level'].includes(payload.site))c.marks=[...new Set([...c.marks,payload.site])];
 if(action==='connect'){
  const {from,to}=payload;
  if(Number.isInteger(from)&&Number.isInteger(to)&&from>=0&&from<5&&to>=0&&to<5){
   if(to===from+1){c.lines=[...new Set([...c.lines,from+'-'+to])];c.message='물이 아래쪽의 다음 입구까지 이어졌어.';}
   else c.message=to<from?'물은 이 장치에서 저절로 위로 올라가지 않아. 아래쪽 입구를 찾아봐.':'중간의 받는 곳을 건너뛰면 물이 새어. 다음 입구부터 이어 보자.';
  }
 }
 if(n===2&&action==='try-route'){
  const {target,item}=payload;
  if(!Object.hasOwn(routes,target)||!['warm','time','cold'].includes(item)||c.marks.includes(target))return c;
  c.message='준비와 시간 관찰을 거친 뒤 전과 뒤를 비교해 보자. 도구만 고르면 발견이 생기지는 않아.';
 }
 if(action==='test'){
  if(n===6){c.tested.push({spread:c.spread.length,ok:c.spread.length>=12});c.message=c.spread.length>=12?'같은 양을 넓게 편 B의 물자국이 더 많이 옅어졌어. 물은 보이지 않는 수증기가 되어 공기 중으로 갔어.':'B의 물자국이 아직 좁아. 손가락을 움직여 더 넓게 펴 보자.';}
  if(n===7){if(!['A','B'].includes(c.selected)){c.message='먼저 냉각팩을 한 컵에 붙여 줘.';return c;}c.tested.push({cold:c.selected==='A'?0:1,amount:20,ok:true});c.message=`닦아 준비한 같은 시간 비교: ${c.selected}컵 바깥에 물방울이 생겼어. 냉각팩을 다른 컵으로 옮겨 봐.`;}
   if(n===8){if(c.moves.tray!=='under'){c.message='두 조건을 비교하려면 물 받이를 먼저 판 아래에 놓아 줘.';return c;}if(!coolingBaseline(c)&&c.moves.cold==='plate'){c.message='아직 냉각 전 기록이 없어. 냉각팩을 떼고 받이는 그대로 둔 채 먼저 시험해 줘.';return c;}const ok=c.moves.cold==='plate';c.tested.push({cold:ok?1:0,amount:ok?20:0,ok});c.message=ok?'받이는 같은 자리야. 판을 차갑게 하자 물방울이 받이에 모였어.':'냉각 전에는 받이가 있어도 새 물방울이 모이지 않았어. 이번에는 냉각팩을 붙여 봐.';}
  if(n===5)c.message=fieldReady(6,c)?'두 물 모두 눈에 보이지 않는 수증기로 변했어. 끓는 물속에서는 기포도 보였지.':'줄어든 두 물의 행방을 각각 연결해 줘.';
  if(n===3){if(photosInOrder(c)){c.marks=[...new Set([...c.marks,'order'])];c.message='순서를 찾았어! 높이는 달라졌네. 그럼 무게도 달라졌을까?';}else c.message=photoOrderClue(c);}
 }
 if(n===4)coldNightAction(c,action,payload);
 c.tested=c.tested.slice(-8);c.done=fieldReady(n,c);return c;
}
