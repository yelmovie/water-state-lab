// A learning model, not a simulation of real time or scale.
export const expeditions=[
 {title:'좁은 물길을 건너라',lab:1,start:'ice',gates:[{phase:'water',name:'좁은 수로',scene:'channel',hint:'얼음의 모양을 바꾸려면 열을 어떻게 해야 할까?',proof:'얼음이 열을 얻어 녹으면 물이 되어 수로를 따라 흘러.'},{phase:'ice',name:'얼음 운반대',scene:'cooling',hint:'물을 고정된 모양의 틀에 담아 차갑게 해 봐.',proof:'물이 충분히 열을 잃으면 얼음이 돼. 운반대는 게임 장치야.'}]},
 {title:'꽉 찬 배관의 비밀',lab:3,start:'water',gates:[{phase:'ice',name:'냉각 관찰대',scene:'cooling',hint:'차갑게 만들기 전에 얼 공간을 남겨 줘.',space:true,proof:'물은 얼 때 부피가 늘어나. 화면의 여유 공간은 그 변화를 표현해.'},{phase:'water',name:'출구 수로',scene:'channel',hint:'얼음을 다시 녹여 물길로 보내 줘.',proof:'얼음이 녹으면 다시 물이 돼. 물질이 사라진 것이 아니야.'}]},
 {title:'햇빛 온실로 올라가자',lab:5,start:'water',gates:[{phase:'vapor',name:'공기 통로',scene:'air',hint:'물에 열을 주고 변화를 살펴봐.',proof:'물은 증발해 눈에 보이지 않는 수증기가 될 수 있어. 끓지 않아도 증발해.'},{phase:'water',name:'차가운 지붕',scene:'condenser',hint:'수증기가 차가운 판에서 열을 잃으면?',proof:'수증기가 응결해 물방울이 돼. 올라가는 길은 게임 속 표현이야.'}]},
 {title:'물방울 배달 작전',lab:7,start:'vapor',gates:[{phase:'water',name:'차가운 수집판',scene:'condenser',hint:'차가운 판을 이용해 물방울을 모아 봐.',proof:'공기 중 수증기가 차가운 표면에서 응결한 물방울이야.'},{phase:'ice',name:'냉각 보관함',scene:'cooling',hint:'모은 물을 얼려 다음 곳으로 옮겨 봐.',proof:'응결과 얼기는 달라. 수증기→물은 응결, 물→얼음은 얼기야.'}]},
 {title:'마지막 물길 연결',lab:9,start:'ice',gates:[{phase:'water',name:'첫 수로',scene:'channel',hint:'물처럼 흐를 수 있는 모습이 필요해.',proof:'얼음이 녹아 물이 되어 흐르기 시작했어.'},{phase:'vapor',name:'온실 공기길',scene:'air',hint:'물이 공기 중으로 이동할 방법을 찾아 봐.',proof:'물은 증발해 수증기가 되었어.'},{phase:'water',name:'수집 지붕',scene:'condenser',hint:'차가운 판에서 물방울을 모아 줘.',proof:'수증기가 응결해 모인 물로 마지막 물길을 연결했어.'}]}
];
export const phaseName={ice:'얼음',water:'물',vapor:'수증기'};
export function freshAdventure(chapter=0){return {chapter,gate:0,phase:expeditions[chapter].start,space:false,heat:0,steps:0,done:false,log:[],message:'방울이의 모습을 바꿔 길을 찾아 줘.',mistakes:0};}
export function restoreAdventure(raw){if(!raw||!Number.isInteger(raw.chapter)||raw.chapter<0||raw.chapter>=expeditions.length)return freshAdventure();const s=freshAdventure(raw.chapter);if(!Object.hasOwn(phaseName,raw.phase)||!Number.isInteger(raw.gate)||raw.gate<0||raw.gate>expeditions[raw.chapter].gates.length)return s;return {...s,...raw,heat:Math.max(-1,Math.min(1,Number(raw.heat)||0)),log:Array.isArray(raw.log)?raw.log.filter(x=>typeof x==='string').slice(-20):[],done:raw.gate===expeditions[raw.chapter].gates.length};}
export function adventureMove(source,action){const s=restoreAdventure(source),mission=expeditions[s.chapter],gate=mission.gates[s.gate];if(action==='retry')return freshAdventure(s.chapter);if(action==='next'&&s.done)return freshAdventure((s.chapter+1)%expeditions.length);if(s.done)return s;
 if(action==='space'){s.space=!s.space;s.message=s.space?'얼 때 늘어날 공간을 남겼어.':'여유 공간을 다시 닫았어.';return s;}
 if(action==='warm'||action==='cool'){
 const sign=action==='warm'?1:-1;s.heat=s.heat===sign?sign*2:sign;s.steps++;
 if(Math.abs(s.heat)<2){s.message=action==='warm'?'열을 얻는 중이야. 한 번 더 조절해 봐.':'열을 잃는 중이야. 한 번 더 조절해 봐.';return s;}
 const next=action==='warm'?{ice:'water',water:'vapor',vapor:'vapor'}:{vapor:'water',water:'ice',ice:'ice'};
 if(next[s.phase]==='ice'&&gate.space&&!s.space){s.heat=0;s.mistakes++;s.message='물이 얼면서 부피가 늘어나! 먼저 여유 공간을 남겨 줘.';return s;}
 const before=s.phase;s.phase=next[s.phase];s.heat=0;s.message=before===s.phase?'이 모습은 그대로야. 필요한 길을 살펴봐.':`${phaseName[before]} → ${phaseName[s.phase]}! 이제 이동할 길을 눌러 봐.`;return s;
 }
 if(action==='move'){
 if(s.phase!==gate.phase){s.mistakes++;s.message=gate.hint;return s;}
 s.log.push(gate.proof);s.gate++;s.steps++;s.done=s.gate===mission.gates.length;s.message=s.done?'물길을 통과했어! 네가 바꾼 모습을 살펴봐.':gate.proof;
 }return s;
}
