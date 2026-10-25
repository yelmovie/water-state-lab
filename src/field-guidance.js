import {fieldMissions,fieldReady,coolingBaseline} from './fieldwork-model.js';

// The visible instruction and the hint refer to the same remaining criterion.
export function fieldTask(n,c){
 const done=fieldReady(n,c),before=coolingBaseline(c);
 let instruction=fieldMissions[n].goal;
 if(n===1){const missing=['water-tall','water-wide','ice-tall','ice-wide'].find(k=>!c.marks.includes(k));if(missing){const [item,target]=missing.split('-');instruction=`${item==='water'?'물':'얼음'}을 ${target==='tall'?'길쭉한':'넓은'} 그릇에 옮겨 모양을 비교해 봐.`;}}
 if(n===2){const missing=['freeze','melt','evaporate','condense'].find(k=>!c.marks.includes(k));instruction=missing?`${({freeze:'물 → 얼음',melt:'얼음 → 물',evaporate:'물 → 수증기',condense:'수증기 → 물'})[missing]} 길에 조건 도구를 놓고 시험해 봐.`:instruction;}
 if(n===3)instruction=c.moves.water!=='first'?'처음 물 사진을 ‘처음’ 칸에 옮겨 줘.':c.moves.ice!=='middle'?'얼린 뒤 사진을 가운데 칸에 놓아 봐.':c.moves.melt!=='last'?'녹인 뒤 사진을 마지막 칸에 놓아 봐.':c.moves.weight!=='balance'?'100 g 추를 저울에 놓고 같은 무게인지 비교해 봐.':instruction;
 if(n===4)instruction=!c.tested.some(t=>!t.ok)?'가득 채운 조건도 얼려서 통 밖으로 넘치는지 비교해 봐.':!c.tested.some(t=>t.ok)?'물을 덜 담고 얼려서 넘치지 않는 조건을 찾아봐.':c.tested.at(-1)?.value!==c.setting||!c.tested.at(-1)?.ok?'현재 고른 양으로 다시 얼려서 넘치지 않는지 확인해 봐.':instruction;
 if(n===5)instruction=c.spread.length<12?`B 바닥을 12칸 이상 펼쳐 줘. 지금 ${c.spread.length}/12칸이야.`:c.tested.at(-1)?.spread!==c.spread.length||!c.tested.at(-1)?.ok?'같은 시간 뒤 비교하기로 두 자국의 변화를 확인해 봐.':c.moves.destination!=='air'?'줄어든 물을 공기 중으로 연결해 봐.':instruction;
 if(n===6){const missing=['surface','inside','level'].find(k=>!c.marks.includes(k));instruction=missing?`돋보기로 ${({surface:'A의 표면',inside:'B의 물속',level:'두 수위'})[missing]}을 관찰해 봐.`:c.moves.A!=='air'?'A에서 줄어든 물을 공기 중으로 이어 봐.':c.moves.B!=='air'?'B에서 줄어든 물도 공기 중으로 이어 봐.':instruction;}
 if(n===7)instruction=!c.tested.some(t=>t.cold===0)?'냉각팩을 A컵에 붙이고 같은 시간 뒤 비교해 봐.':!c.tested.some(t=>t.cold===1)?'냉각팩을 B컵으로 옮기고 다시 비교해 봐.':c.moves.condition!=='cold'?'두 기록에서 같았던 조건을 ‘차가운 표면’에 연결해 봐.':instruction;
 if(n===8)instruction=c.moves.tray!=='under'?'물 받이를 판 아래에 놓아 줘. 두 시험에서 같은 자리에 둘 거야.':!before&&c.moves.cold==='plate'?'냉각팩을 떼고 먼저 냉각 없이 시험해 봐.':!before?'받이는 그대로 두고 냉각 없이 먼저 시험해 봐.':c.moves.cold!=='plate'?'이번에는 냉각팩을 판에 붙여 줘. 받이는 그대로 두자.':!c.tested.at(-1)?.ok?'같은 시간 뒤 물이 모이는지 다시 시험해 봐.':instruction;
 if(n===9){const missing=['0-1','1-2','2-3','3-4'].find(k=>!c.lines.includes(k));instruction=missing?`${['냉각판','경사판','깔때기','연결관'][Number(missing[0])]}에서 다음 입구까지 아래로 이어 봐.`:instruction;}
 if(n===10){const missing=['evaporate','condense'].find(k=>!c.marks.includes(k));instruction=missing==='evaporate'?'물 → 수증기 길에 시간을 보내는 도구를 연결해 봐.':missing?'수증기 → 물 길에 차갑게 하는 도구를 연결해 봐.':instruction;}
 return {done,instruction:done?'의뢰를 해결했어. 개념 영상 · 도장 받기로 발견을 남겨 줘.':instruction,result:c.message||'아직 시험 결과가 없어. 물체를 옮기면 변화가 여기 남아.',beforeCooling:before,afterCooling:c.tested.some(t=>t.cold===1&&t.ok)};
}
