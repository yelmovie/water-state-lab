// Learning state and intentionally simplified, unit-free classroom simulations.
export const limit=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
export function initialActivities(){return {
 version:1,
 observe:{step:0,pours:[],iceMoved:false,clothWet:false,time:0,records:[]},
 sort:{placed:{},selected:'',hidden:{placed:{},tries:{}}},
 freeze:{onScale:false,prediction:66,phase:'water',records:[],predicted:false,compared:false,challenge:{amount:0,prediction:0,trials:[]}},
 pipe:{fill:95,trials:[],chosen:-1,marked:false},
 draw:{strokes:[],time:0,records:[],faster:'',destination:''},
 compare:{heat:0,time:0,baseline:false,records:[],pins:[],destination:''},
 dew:{wiped:[],sealed:false,time:0,records:[],rewiped:false,againTime:0,again:false},
 explain:{evidence:[],chain:[],bottleWiped:false,time:0,transfer:false}
};}
export function heatingTrial(heat,time){
 heat=limit(heat);time=limit(time);
 const warming=heat*time/100;
 const boiling=warming>=55;
 const room=70-time*.1;
 // With no heater both otherwise identical cups lose exactly the same amount.
 const heated=70-time*(.1+heat/100*.1)-(boiling?(warming-55)*.3:0);
 return {heat,time,room:Math.round(room*10)/10,heated:Math.round(heated*10)/10,boiling};
}
export function pipeTrial(fill){fill=limit(fill,40,100);const expanded=Math.round(fill*1.09*10)/10;return {fill,expanded,space:Math.max(0,Math.round((100-expanded)*10)/10),safe:expanded<=95,risk:expanded>100?'높음':expanded>95?'보통':'낮음'};}
export const pipeGoals={reserve:'학습 모형 목표 · 얼음 위 빈 공간 5% 이상',capacity:'이번 의뢰 목표 · 얼음이 통 밖으로 넘치지 않기'};
export function pipeAssessment(fill,goal='reserve'){
 const trial=pipeTrial(fill),fits=trial.expanded<=100;
 return {...trial,fits,extraReserve:trial.safe,goal,met:goal==='capacity'?fits:trial.safe};
}
export function pipeFinding(fill){const t=pipeAssessment(fill);return `얼음 ${t.expanded}% · 빈 공간 ${t.space}% · ${t.fits?'넘치지 않음':'통 밖으로 넘침'} · 추가 5% 여유 ${t.extraReserve?'충족':'미달'}`;}
export function dryTrace(thickness,time){return limit(1-time/(thickness==='thin'?60:110),0,1);}
export function dewTrial(time,cold=true){return {time:limit(time),cold,drops:cold?Math.floor(limit(time)/5):0,mass:cold?250+limit(time)/50:250};}
export const sortCards=[
 {id:'ice',name:'옮긴 얼음',type:'solid',art:'ice',proof:'접시를 바꿔도 모양이 그대로야.',source:'실험 기록'},
 {id:'water',name:'옮겨 담은 물',type:'liquid',art:'jug',proof:'담긴 그릇에 맞게 모양이 바뀌었어.',source:'실험 기록'},
 {id:'vapor',name:'마른 천에서 공기로 간 물',type:'gas',art:'cloth',proof:'물은 보이지 않는 수증기로 변했어. 천 자체를 분류하는 게 아니야.',source:'실험 기록'},
 {id:'frost',name:'냉동실의 얼음',type:'solid',art:'ice',proof:'얼음은 고체 상태의 물이야.',source:'새로운 생활 장면'},
 {id:'rain',name:'화분에 주는 물',type:'liquid',art:'seedling',proof:'흐르고 그릇에 담기는 물은 액체야.',source:'새로운 생활 장면'},
 {id:'laundry',name:'빨래에서 공기로 간 물',type:'gas',art:'cloth',proof:'빨래의 물은 증발해 눈에 보이지 않는 수증기가 돼.',source:'새로운 생활 장면'}
];
// Optional replay goals after a stage is finished. Both bonus scenes tempt a "gas" answer but are visible liquid water.
export const hiddenScenes=[
 {id:'mist',name:'폭포 옆 하얀 물보라',type:'liquid',site:[327,72],proof:'눈에 보이는 하얀 물보라는 아주 작은 물방울이야. 수증기는 눈에 보이지 않아.',clue:'하얗게 보이는 것은 눈으로 볼 수 있어. 수증기도 눈에 보일까?'},
 {id:'drip',name:'수건 끝에서 떨어지는 물방울',type:'liquid',site:[452,236],proof:'떨어지는 물방울은 아직 액체야. 마르면서 공기로 간 물만 수증기야.',clue:'아직 마르지 않고 떨어지는 물이야. 흐르고 모양이 바뀌는 상태를 떠올려 봐.'}
];
export function hiddenSceneTry(sort,id,type){const card=hiddenScenes.find(c=>c.id===id);if(!card||sort.hidden.placed[id])return {ok:false,card,repeat:!!card};const ok=card.type===type;if(ok)sort.hidden.placed[id]=type;else sort.hidden.tries[id]=Math.min(99,(sort.hidden.tries[id]||0)+1);return {ok,card};}
// Transfer challenge for stage 3: predict a new amount from the first measurement (60 → 65.4, the same ×1.09 model).
export const freezeAmounts=[40,50,70,80];
export function freezeChallengeTrial(amount,prediction){amount=limit(amount,40,80);prediction=limit(prediction,amount,amount+15);const actual=Math.round(amount*1.09*10)/10,error=Math.round(Math.abs(prediction-actual)*10)/10;return {amount,prediction,actual,error,close:error<=1};}
export const bestFreezeChallenge=trials=>trials.length?trials.reduce((b,t)=>t.error<b.error?t:b):null;
export function activityReady(n,a){switch(n){
 case 1:return a.observe.pours.length===2&&a.observe.iceMoved&&a.observe.records.some(r=>r.kind==='cloth'&&r.time>=80);
 case 2:return sortCards.every(c=>a.sort.placed[c.id]===c.type);
 case 3:return ['water','ice','melt'].every(k=>a.freeze.records.some(r=>r.kind===k))&&a.freeze.compared;
 case 4:return a.pipe.trials.length>=2&&Math.max(...a.pipe.trials.map(t=>t.fill))-Math.min(...a.pipe.trials.map(t=>t.fill))>0&&a.pipe.trials[a.pipe.chosen]?.safe&&a.pipe.marked;
 case 5:return a.draw.strokes.some(s=>s.length>=3)&&[0,1,2].every(b=>a.draw.records.some(r=>r.band===b))&&a.draw.faster==='thin'&&a.draw.destination==='air';
 case 6:return a.compare.baseline&&a.compare.records.some(r=>r.boiling)&&['surface','inside','level'].every(k=>a.compare.pins.includes(k))&&a.compare.destination==='air';
 case 7:return a.dew.records.length>=2&&a.dew.rewiped&&a.dew.again;
 case 8:return a.explain.evidence.length>=2&&a.explain.chain.join(',')==='air,cold,drops'&&a.explain.transfer&&activityReady(7,a);
 default:return false;
}}
export function validateActivities(value){
 if(!value||value.version!==1)return false;
 const template=initialActivities();
 function shape(v,t){if(Array.isArray(t))return Array.isArray(v);if(t&&typeof t==='object')return v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(t).every(k=>shape(v[k],t[k]));return typeof v===typeof t&&(typeof t!=='number'||Number.isFinite(v));}
 if(!shape(value,template))return false;
 if(!value.draw.strokes.every(s=>Array.isArray(s)&&s.length<=700&&s.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))))return false;
 if(value.draw.strokes.length>40)return false;
 for(const key of ['observe','freeze','draw','compare','dew'])if(!value[key].records.every(r=>r&&typeof r==='object'))return false;
 if(!value.pipe.trials.every(t=>t&&Number.isFinite(t.fill)&&Number.isFinite(t.expanded)&&typeof t.safe==='boolean'))return false;
 if(!value.observe.pours.every(x=>['tall','wide'].includes(x))||!value.compare.pins.every(x=>['surface','inside','level'].includes(x)))return false;
 if(!Number.isInteger(value.observe.step)||value.observe.step<0||value.observe.step>2)return false;
 if(!Object.entries(value.sort.placed).every(([id,type])=>sortCards.some(c=>c.id===id&&c.type===type)))return false;
 if(!value.freeze.records.every(r=>['water','ice','melt'].includes(r.kind)&&Number.isFinite(r.level)&&Number.isFinite(r.mass)))return false;
 if(!Object.entries(value.sort.hidden.placed).every(([id,type])=>hiddenScenes.some(c=>c.id===id&&c.type===type))||!Object.entries(value.sort.hidden.tries).every(([id,n])=>hiddenScenes.some(c=>c.id===id)&&Number.isInteger(n)&&n>=0&&n<100))return false;
 if(value.freeze.challenge.trials.length>20||!value.freeze.challenge.trials.every(t=>t&&['amount','prediction','actual','error'].every(k=>Number.isFinite(t[k]))))return false;
 if(!value.draw.records.every(r=>[0,1,2].includes(r.band)&&['time','thin','thick'].every(k=>Number.isFinite(r[k]))))return false;
 if(!value.compare.records.every(r=>['heat','time','room','heated'].every(k=>Number.isFinite(r[k]))&&typeof r.boiling==='boolean'))return false;
 const measurement=v=>v&&['time','drops','mass'].every(k=>Number.isFinite(v[k]))&&typeof v.cold==='boolean';
 if(!value.dew.records.every(r=>['before','after'].includes(r.kind)&&measurement(r.cold)&&measurement(r.room)&&r.sealed===true))return false;
 if(!value.dew.wiped.every(k=>['cold','room'].includes(k)))return false;
 return value.explain.evidence.every(x=>['sealed','contrast','again'].includes(x))&&value.explain.chain.every(x=>['air','cold','drops'].includes(x));
}
