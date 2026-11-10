// After the measured experiment, the learner carries the finding into daily life and the broken pipe.
// Pure logic: no renderer, clock or DOM dependency.
export const startLevel=60,iceLevel=65.4;
export const pipeChoices=[
 {id:'burst',label:'얼음이 밀어서 배관이 깨져',ok:true,hint:''},
 {id:'shrink',label:'물이 줄어서 배관이 헐거워져',ok:false,hint:'비커를 떠올려 봐. 얼면서 윗면이 빨간 선보다 내려갔어, 올라갔어?'},
 {id:'same',label:'아무 일도 안 생겨',ok:false,hint:'쭈쭈바 봉지는 그대로였어? 얼고 나서 어떻게 달라졌는지 떠올려 봐.'}
];
export const talkDone=f=>f.talk>=3;
export function freezeLevelText(level){
 const gap=Math.round((level-startLevel)*10)/10;
 return gap>0?`빨간 선보다 ${gap} 위`:'빨간 선과 같아';
}
/** Applies one talk step and returns what 방울이 says. An out-of-order step changes nothing. */
export function freezeTalk(f,cmd){
 if(cmd==='talk-pop-yes'||cmd==='talk-pop-no'){
  if(f.talk!==0)return '';
  f.popSeen=cmd.slice(9);f.talk=1;
  return f.popSeen==='yes'?'봤구나! 왜 빵빵해졌는지 직접 얼려서 확인해 보자.':'괜찮아! 지금 같이 얼려 보면 돼.';
 }
 if(cmd==='talk-chill'){
  if(f.talk!==1)return '';
  f.talk=2;
  return '봉지에 아무것도 더 넣지 않았는데 빵빵해졌어!';
 }
 if(cmd.startsWith('talk-pipe-')){
  const choice=pipeChoices.find(c=>c.id===cmd.slice(10));
  if(f.talk!==2||!choice)return '';
  f.pipeTry=choice.id;
  if(!choice.ok)return choice.hint;
  f.talk=3;
  return '맞아! 얼음이 커질 자리가 없으니 배관을 밀어낸 거야.';
 }
 return '';
}
