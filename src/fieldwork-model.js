// Field applications follow an observed experiment. No speed, precision or click-count score.
export const experimentTitles=['','옮겨 담기','생활 속 세 상태','얼기·녹기','얼 때의 공간','물그림 마르기','증발과 끓음','컵 바깥 물방울','내 증거로 설명','물 모으는 장치','마지막 물길 복구'];
export const experimentQuestions=['','물과 얼음의 모양은 어떻게 달라질까?','생활 속 물은 어떤 상태일까?','얼고 녹으면 높이와 무게는?','물이 얼 때 공간이 충분할까?','물의 양이 다르면 마르는 순서는?','증발과 끓음은 무엇이 같을까?','컵 바깥 물방울은 어디서 왔을까?','내 증거로 물방울을 설명할까?','어떻게 고치면 물이 모일까?','내 기록과 장치로 물길을 고칠까?'];
export const fieldMissions=[null,
 {title:'방울이의 이삿짐',problem:'새 그릇으로 옮기면 물과 얼음은 어떤 모습일까?',goal:'물과 얼음을 각각 옮긴 뒤, 그릇을 바꿔 다시 비교해 봐.',type:'transfer',reward:'모양 관찰 도장',ability:'같은 물도 상태에 따라 모양이 다름을 설명할 수 있어',next:'내 관찰로 생활 속 물을 찾아요',standard:'4과10-01'},
 {title:'네 갈래 변신길',problem:'얼음·물·수증기를 다시 이어 줄 수 있을까?',goal:'변화시킬 도구를 길 위에 놓고 결과를 확인해 봐.',type:'routes',reward:'관찰 돋보기',ability:'물의 세 상태와 생활 속 예를 연결할 수 있어',next:'돋보기로 얼기 전후의 눈금을 살펴봐요',standard:'4과10-01'},
 {title:'뒤섞인 실험 사진',problem:'어떤 순서였지? 얼음이 커지면 더 무거워질까?',goal:'내 측정 사진을 시간순으로 놓고 같은 무게의 추를 올려 봐.',type:'records',reward:'얼기·녹기 도장',ability:'높이와 무게를 따로 비교할 수 있어',next:'얼음이 커질 빈 공간을 찾아요',standard:'4과10-02'},
 {title:'겨울 물통 수리',problem:'물을 가득 담은 통을 얼리면 공간이 충분할까?',goal:'가득 채운 통과 여유를 둔 통을 둘 다 얼려 비교해 봐.',type:'pipe',reward:'배관 안전 기록',ability:'얼 때 커질 자리를 남겨 설계할 수 있어',next:'안전하게 고친 물길로 다음 구역을 열어요',standard:'4과10-02'},
 {title:'물자국 펼치기',problem:'같은 물을 넓게 펴면 어떻게 마를까?',goal:'A는 그대로, B의 물자국만 손가락으로 넓혀 같은 시간 뒤를 비교해 봐.',type:'spread',reward:'물자국 관찰 도장',ability:'한 조건만 바꾸어 증발을 비교할 수 있어',next:'이 기록으로 가열한 물도 비교해요',standard:'4과10-02'},
 {title:'보이지 않는 물의 행방',problem:'끓지 않은 물과 끓는 물은 무엇이 같을까?',goal:'돋보기를 세 관찰 지점으로 옮기고 두 물의 행방을 이어 봐.',type:'lens',reward:'시간 관찰 기록',ability:'증발과 끓음 모두 물이 수증기로 변함을 설명할 수 있어',next:'공기 중으로 간 물을 다시 모을 방법을 찾아요',standard:'4과10-02'},
 {title:'냉각팩 자리 바꾸기',problem:'물방울은 A컵을 좋아할까, 차가운 표면을 좋아할까?',goal:'냉각팩을 A와 B에 번갈아 놓고 같은 시간 비교한 뒤, 찾은 조건을 연결해 봐.',type:'swap',reward:'응결 증거 도장',ability:'차가운 정도를 바꾸어 물방울의 조건을 조사할 수 있어',next:'이 증거로 이슬받이를 만들어요',standard:'4과10-02'},
 {title:'작은 이슬받이',problem:'공기 중의 수증기를 물로 모을 수 있을까?',goal:'판을 차갑게 하고, 떨어지는 물방울 아래에 받이를 놓아 비교 시험해 봐.',type:'collector',reward:'응결 냉각판',ability:'응결을 이용하는 수집 장치를 구상할 수 있어',next:'얻은 냉각판을 물길 공방에서 직접 써요',standard:'4과10-03'},
 {title:'물방울 길 안내',problem:'연결만 하면 물이 위쪽으로도 갈까?',goal:'냉각판에서 물통까지, 아래로 이어지는 길을 손가락으로 연결해 봐.',type:'connect',reward:'물길 설계 도장',ability:'물이 흐르는 방향을 생각하며 연결을 고칠 수 있어',next:'내가 시험한 설계로 마지막 코어를 깨워요',standard:'4과10-03'},
 {title:'마지막 순환 회로',problem:'물이 모자란 온실에 물을 다시 보낼 수 있을까?',goal:'물 → 수증기 → 물방울의 길에 알맞은 도구를 연결해 봐.',type:'final',reward:'연구섬 복구 코어',ability:'증발과 응결을 이용한 물 수집 방법을 설명할 수 있어',next:'내 연구 기록과 복구 인증서가 남아요',standard:'4과10-03'}
];
export function initialFieldwork(){return {version:1,introSeen:false,active:0,pending:'',chapters:{},ability:''};}
export function chapterState(n){return {moves:{},tested:[],marks:[],lines:[],spread:[],setting:100,selected:'',message:'',done:false};}
const clone=v=>JSON.parse(JSON.stringify(v));
export function cleanFieldwork(raw){
 const f=initialFieldwork();if(!raw||typeof raw!=='object')return f;
 f.introSeen=raw.introSeen===true;f.active=Number.isInteger(raw.active)&&raw.active>=1&&raw.active<=10?raw.active:0;
 f.pending=typeof raw.pending==='string'&&/^(act-(next-[1357]|complete-[1234])|complete-5|field-ending)$/.test(raw.pending)?raw.pending:'';
 f.ability=['observe','compare','design'].includes(raw.ability)?raw.ability:'';
 for(let n=1;n<=10;n++){
  const c=raw.chapters?.[n];if(!c||typeof c!=='object')continue;
  const next=chapterState(n);next.setting=Number.isFinite(c.setting)?Math.max(40,Math.min(100,c.setting)):95;
  next.selected=typeof c.selected==='string'?c.selected.slice(0,40):'';
  next.message=typeof c.message==='string'?c.message.slice(0,200):'';
  for(const key of ['marks','spread'])if(Array.isArray(c[key]))next[key]=[...new Set(c[key].filter(v=>key==='marks'?typeof v==='string'&&v.length<40:Number.isInteger(v)&&v>=0&&v<48))].slice(0,48);
  if(Array.isArray(c.lines))next.lines=c.lines.filter(v=>typeof v==='string'&&/^\d-\d$/.test(v)).slice(0,8);
  if(c.moves&&typeof c.moves==='object'&&!Array.isArray(c.moves))for(const [key,val] of Object.entries(c.moves).slice(0,12))if(typeof val==='string'&&key.length<30&&val.length<30)next.moves[key]=val;
  if(Array.isArray(c.tested))next.tested=c.tested.filter(t=>t&&typeof t==='object'&&['value','cold','amount','spread'].every(k=>t[k]===undefined||Number.isFinite(t[k]))&&typeof t.ok==='boolean').slice(-8).map(t=>({value:t.value,cold:t.cold,amount:t.amount,spread:t.spread,ok:t.ok}));
  next.done=fieldReady(n,next);f.chapters[n]=next;
 }
 return f;
}
export function fieldReady(n,c){
 if(!c)return false;
 switch(n){
 case 1:return ['water-tall','water-wide','ice-tall','ice-wide'].every(k=>c.marks.includes(k));
 case 2:return ['freeze','melt','evaporate','condense'].every(k=>c.marks.includes(k));
 case 3:return c.moves.water==='first'&&c.moves.ice==='middle'&&c.moves.melt==='last'&&c.moves.weight==='balance';
 case 4:return c.tested.some(t=>!t.ok)&&c.tested.some(t=>t.ok)&&c.tested.at(-1)?.ok===true&&c.tested.at(-1)?.value===c.setting;
 case 5:return c.spread.length>=12&&c.tested.at(-1)?.spread===c.spread.length&&c.tested.at(-1)?.ok===true&&c.moves.destination==='air';
 case 6:return ['surface','inside','level'].every(k=>c.marks.includes(k))&&c.moves.A==='air'&&c.moves.B==='air';
 case 7:return [0,1].every(k=>c.tested.some(t=>t.cold===k))&&c.moves.condition==='cold';
 case 8:return c.tested.some(t=>!t.ok)&&c.tested.at(-1)?.ok===true&&c.moves.cold==='plate'&&c.moves.tray==='under';
 case 9:return ['0-1','1-2','2-3','3-4'].every(k=>c.lines.includes(k));
 case 10:return ['evaporate','condense'].every(k=>c.marks.includes(k));
 default:return false;
 }
}
export function fieldProgress(n,c){
 if(!c)return [0,1];let checks=[];
 if(n===1)checks=['water-tall','water-wide','ice-tall','ice-wide'].map(k=>c.marks.includes(k));
 if(n===2)checks=['freeze','melt','evaporate','condense'].map(k=>c.marks.includes(k));
 if(n===3)checks=[c.moves.water==='first',c.moves.ice==='middle',c.moves.melt==='last',c.moves.weight==='balance'];
 if(n===4)checks=[c.tested.some(t=>!t.ok),c.tested.some(t=>t.ok),c.tested.at(-1)?.value===c.setting&&c.tested.at(-1)?.ok];
 if(n===5)checks=[c.spread.length>=12,c.tested.at(-1)?.spread===c.spread.length&&c.tested.at(-1)?.ok,c.moves.destination==='air'];
 if(n===6)checks=['surface','inside','level'].map(k=>c.marks.includes(k)).concat(c.moves.A==='air',c.moves.B==='air');
 if(n===7)checks=[c.tested.some(t=>t.cold===0),c.tested.some(t=>t.cold===1),c.moves.condition==='cold'];
 if(n===8)checks=[c.tested.some(t=>!t.ok),c.moves.cold==='plate'&&c.moves.tray==='under',c.tested.at(-1)?.ok];
 if(n===9)checks=['0-1','1-2','2-3','3-4'].map(k=>c.lines.includes(k));
 if(n===10)checks=['evaporate','condense'].map(k=>c.marks.includes(k));
 return [checks.filter(Boolean).length,checks.length];
}
const routes={freeze:['cold'],melt:['warm'],evaporate:['time','warm'],condense:['cold']};
export function fieldAction(n,current,action,payload={}){
 const c=clone(current||chapterState(n));c.message='';
 if(action==='place'){
  const {item,target}=payload;
  if(typeof item!=='string'||typeof target!=='string')return c;
  c.moves[item]=target;
  if(n===1&&['water','ice'].includes(item)&&['tall','wide'].includes(target)){c.marks=[...new Set([...c.marks,item+'-'+target])];c.message=item==='water'?'물은 새 그릇의 모양에 맞게 담겨. 같은 양이야.':'얼음은 새 그릇에서도 모양을 유지해.';}
  if([2,10].includes(n)&&Object.hasOwn(routes,target)){c.moves[target]=item;c.marks=c.marks.filter(k=>k!==target);}
  if(n===3)c.message=item==='weight'?'같은 물을 흘리지 않았다면 무게를 비교해 보자.':'사진 속 높이와 무게를 함께 살펴봐.';
  if(n===7&&item==='pack'&&['A','B'].includes(target)){c.selected=target;c.message='새 조건을 준비했어. 두 표면을 닦고 같은 시간 동안 비교하자.';}
  if(n===7&&item==='condition')c.message=target==='cold'?'컵 이름을 바꿔도 차가운 표면에 물방울이 생겼어.':'냉각팩을 옮기면 물방울이 생긴 컵도 바뀌었어. 두 기록의 같은 조건을 찾아봐.';
  if(n===8)c.message='배치를 바꿨어. 앞 시험과 같은 조건에서 다시 관찰하자.';
 }
 if(action==='setting'&&Number.isFinite(payload.value))c.setting=Math.max(40,Math.min(100,Math.round(payload.value)));
 if(action==='spread'&&Number.isInteger(payload.cell)&&payload.cell>=0&&payload.cell<48)c.spread=[...new Set([...c.spread,payload.cell])];
 if(action==='inspect'&&['surface','inside','level'].includes(payload.site))c.marks=[...new Set([...c.marks,payload.site])];
 if(action==='connect'){
  const {from,to}=payload;
  if(Number.isInteger(from)&&Number.isInteger(to)&&from>=0&&from<5&&to>=0&&to<5){
   if(to===from+1){c.lines=[...new Set([...c.lines,from+'-'+to])];c.message='물이 아래쪽의 다음 입구까지 이어졌어.';}
   else c.message=to<from?'물은 이 장치에서 저절로 위로 올라가지 않아. 아래쪽 입구를 찾아봐.':'중간의 받는 곳을 건너뛰면 물이 새어. 다음 입구부터 이어 보자.';
  }
 }
 if(action==='test'){
  if([2,10].includes(n)){
   const keys=n===2?Object.keys(routes):['evaporate','condense'];
   c.marks=keys.filter(k=>routes[k].includes(c.moves[k]));c.message=c.marks.length===keys.length?'상태가 바뀌는 길이 이어졌어! 가열하지 않아도 물은 증발해. 수증기는 눈에 보이지 않아.':'어느 길에서 멈췄는지 봐. 결과를 보고 도구를 바꿔 다시 시험해.';
  }
  if(n===4){const expanded=c.setting*1.09,ok=expanded<=100;c.tested.push({value:c.setting,amount:Math.round(expanded*10)/10,ok});c.message=ok?'얼음이 차지할 자리가 통 안에 남아 있어. 가득 담은 시험과 비교해 봐.':'얼음이 차지할 공간이 통보다 커졌어. 물의 양을 줄여서 다시 비교해 봐.';}
  if(n===5){c.tested.push({spread:c.spread.length,ok:c.spread.length>=12});c.message=c.spread.length>=12?'같은 양을 넓게 편 B의 물자국이 더 많이 옅어졌어. 물은 어디로 갔을까?':'B의 물자국이 아직 좁아. 손가락을 움직여 더 넓게 펴 보자.';}
  if(n===7){if(!['A','B'].includes(c.selected)){c.message='먼저 냉각팩을 한 컵에 붙여 줘.';return c;}c.tested.push({cold:c.selected==='A'?0:1,amount:20,ok:true});c.message=`닦아 준비한 같은 시간 비교: ${c.selected}컵 바깥에 물방울이 생겼어. 냉각팩을 다른 컵으로 옮겨 봐.`;}
  if(n===8){const ok=c.moves.cold==='plate'&&c.moves.tray==='under';c.tested.push({cold:c.moves.cold==='plate'?1:0,amount:ok?20:0,ok});c.message=ok?'공기 중 수증기가 찬 판에서 물방울이 되어 받이에 모였어.':'물이 어디서 멈췄을까? 판이 차가운지, 받이가 아래에 있는지 살펴봐.';}
  if(n===6)c.message=fieldReady(6,c)?'두 물 모두 눈에 보이지 않는 수증기로 변했어. 끓는 물속에서는 기포도 보였지.':'세 곳을 확대하고, 줄어든 두 물의 행방을 각각 연결해 줘.';
  if(n===3)c.message=fieldReady(3,c)?'얼면 높이는 올라가고, 녹으면 돌아와. 같은 물의 무게는 같았어.':'사진의 시간 순서와 저울의 무게를 다시 비교해 봐.';
 }
 c.tested=c.tested.slice(-8);c.done=fieldReady(n,c);return c;
}
