import {collectorTrial} from './collector-model.js';
export const missions = [
  {id:1,name:'같은 물, 다른 모습',short:'상태 판별실',subtitle:'관찰로 찾는 물의 세 가지 모습',reward:'상태 관찰 기록',world:'상태 판별실의 불빛이 켜졌어.',screens:[1,2],color:'#38b1ba'},
  {id:2,name:'얼음 배관의 이상',short:'얼음 실험실',subtitle:'얼기 전과 후, 무엇이 달라질까?',reward:'얼기 전후 측정 데이터',world:'냉각 배관에 물이 다시 흐르기 시작했어.',screens:[3,4],color:'#668fde'},
  {id:3,name:'줄어드는 물의 흔적',short:'시간 관찰실',subtitle:'사라진 물의 행방을 찾아서',reward:'증발·끓음 비교 기록',world:'가열 장치와 시간 관찰기가 다시 움직여.',screens:[5,6],color:'#d99a43'},
  {id:4,name:'컵 밖 물방울 사건',short:'물방울 분석실',subtitle:'물방울은 어디에서 왔을까?',reward:'응결 증거 보고서',world:'응결 수집판에 물방울이 모이기 시작했어.',screens:[7,8],color:'#9b7cc8'},
  {id:5,name:'마지막 물길을 설계하라',short:'물길 설계 공방',subtitle:'네 설계로 연구실을 다시 움직여',reward:'물 수집 장치 설계도',world:'마지막 설계 기록 완성! 이제 코어를 연결하자.',screens:[9,10],color:'#399b7b'}
];
export const screenNames=['','그릇을 바꾸면 어떻게 될까?','어떤 물의 모습일까?','얼면 높이와 무게가 달라질까?','얼음이 커질 자리를 남겨 볼까?','내 물그림은 어떻게 달라질까?','끓지 않아도 물은 줄어들까?','닦은 자리에 또 생길까?','내 증거로 설명해 볼까?','어디를 고치면 물이 더 모일까?','물이 도착하지 않는 이유는 뭘까?'];
export const observations=[
  {name:'물 붓기',label:'물',evidence:'다른 용기에 부으니 용기에 맞게 모양이 달라졌어.',type:'액체'},
  {name:'얼음 옮기기',label:'얼음',evidence:'다른 곳으로 옮겨도 얼음의 모양은 유지됐어.',type:'고체'},
  {name:'젖은 천 관찰',label:'천을 적신 물',evidence:'시간이 지나자 젖은 자국이 옅어졌어. 물이 수증기로 변했어.',type:'기체'},
  {name:'차가운 캔 닦기',label:'캔 바깥 물방울',evidence:'표면을 닦고 기다리니 액체 물방울이 다시 생겼어.',type:'액체'}
];
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function freezeTrial(fill){const expanded=fill*1.09;return {fill,expanded:Math.round(expanded*10)/10,risk:expanded>100?'높음':expanded>95?'보통':'낮음'};}
export function opacityAt(water,time){return clamp(1-time/(water===1?60:110),0,1);}
export const defaultParts=()=>({plate:{x:110,y:80},ramp:{x:220,y:190},funnel:{x:470,y:180},tube:{x:580,y:270},bucket:{x:140,y:340}});
export const targetParts={plate:{x:230,y:70},ramp:{x:230,y:170},funnel:{x:420,y:215},tube:{x:420,y:300},bucket:{x:420,y:390}};
export function testCollector(parts,cold,angle){return collectorTrial(parts,cold,angle);}
export function canFinishCollector(trials){return trials.length>=2&&trials.at(-1).ok&&new Set(trials.map(t=>t.signature)).size>=2;}
export function currentTrialValid(workshop){const last=workshop.trials.at(-1);return !!last&&canFinishCollector(workshop.trials)&&last.signature===testCollector(workshop.parts,workshop.cold,workshop.angle).signature;}
export function confirmedWorkshop(evidence){if(!evidence?.parts||!evidence.result)return null;return {parts:evidence.parts,cold:evidence.cold,angle:evidence.angle,trials:[evidence.result],selected:''};}
export function canEnter(screen,state){if(!Number.isInteger(screen)||screen<1||screen>10)return false;if(state.settings?.adminUnlock)return true;const m=Math.ceil(screen/2);if(m>1&&!state.completed.includes(m-1))return false;if(screen%2===0&&!state.pages.includes(screen-1))return false;return true;}
export function researchStyle(state){const counts={ '끈질긴 실험가':(state.activities?.pipe.trials.length||state.lab.pipe.trials.length),'창의적 설계자':state.lab.workshop.trials.length*2,'꼼꼼한 관찰자':(state.activities?.compare.pins.length||state.lab.compare.pins.length)+(state.activities?.dew.records.length||state.lab.condensation.snapshots.length)};return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];}

export function previousRoute(route){return route==='home'?null:route==='map'?'home':route==='ending'?10:route===1?'map':route-1;}
