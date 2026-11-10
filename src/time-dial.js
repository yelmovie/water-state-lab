// Each magic button invokes the experiment's existing time control and reads its progress.
const waitSelector='[data-tray-action="wait"],[data-process-action="wait"],[data-measure-action="wait"],[data-cycle-action="wait"]';
const rangeSelector='[data-inquiry-time],#tray-freeze-time,#process-time,#record-scrub,#field-cycle-time';
function sourceFor(stage){
 const range=stage.querySelector(rangeSelector),wait=stage.querySelector(waitSelector);
 const progress=stage.querySelector('[data-measure-progress],[data-cycle-progress],[data-tray-progress],[data-process-progress]');
 if(!range&&!wait)return null;
 const max=Number(range?.max)||100,value=Number(range?.value??progress?.value)||0;
 return {range,wait,max,value};
}
export function paintTimeDial(range){
 const stage=range?.closest('.workspace-stage');
 if(stage)paintMagic(stage);
}
function paintMagic(stage){
 const magic=stage.querySelector('[data-time-magic]'),source=sourceFor(stage);
 if(!magic||!source)return;
 const {range,wait,max,value}=source;
 const running=!!wait?.disabled||stage.dataset.magicPlaying==='true';
 const done=value>=max;
 magic.style.setProperty('--time-minute',value/max*1440+'deg');
 magic.style.setProperty('--time-hour',value/max*120+'deg');
 magic.classList.toggle('is-running',running&&!done);
 magic.disabled=done;
 const label=done?'관찰 완료':running?'시간이 흐르는 중':'마법봉으로 시간을 돌려 봐!';
 const status=magic.querySelector('.time-magic-label');
 if(status.textContent!==label)status.textContent=label;
 magic.setAttribute('aria-label',done?'시간 관찰 완료':running?'시간 관찰 멈추기':'마법봉으로 시간을 돌려 봐');
 const output=magic.querySelector('output'),percent=Math.round(value/max*100)+'%';
 if(output.textContent!==percent)output.textContent=percent;
 if(range)range.classList.add('time-native-range');
}
export function mountTimeTools(stage,playInquiry,isInquiryPlaying){
 const source=sourceFor(stage);
 let magic=stage.querySelector('[data-time-magic]');
 stage.classList.toggle('has-time-magic',!!source);
 if(!source){magic?.remove();return;}
 if(!magic){
  magic=document.createElement('button');magic.type='button';magic.className='time-magic';magic.dataset.timeMagic='';
  magic.innerHTML='<span class="time-magic-art" aria-hidden="true"><img class="time-face" src="/assets/learning/time-clock-face.webp" alt="" draggable="false"><i class="time-hour"></i><i class="time-minute"></i><i class="time-pivot"></i><img class="time-tap-wand" src="/assets/learning/time-wand-tap.webp" alt="" draggable="false"><span class="time-spark"></span></span><span class="time-magic-label">마법봉으로 시간을 돌려 봐!</span><output>0%</output>';
  stage.append(magic);
  magic.addEventListener('click',()=>{
   const current=sourceFor(stage);if(!current||magic.disabled)return;
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('reduce-motion')){
    magic.querySelector('.time-tap-wand').animate([{transform:'rotate(-90deg)'},{transform:'rotate(-120deg)',offset:.38},{transform:'rotate(-80deg)',offset:.58},{transform:'rotate(-90deg)'}],{duration:550,easing:'ease-out'});
    magic.querySelector('.time-spark').animate([{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(1)',offset:.55},{opacity:0,transform:'scale(1.6)'}],{duration:650});
   }
   if(current.wait){
    if(current.wait.disabled)document.dispatchEvent(new Event('observation-stop'));
    else current.wait.click();
   }else if(current.range?.hasAttribute('data-inquiry-time'))playInquiry();
   else{
    // Saved observation review keeps its original input/change handlers.
    const range=current.range;
    range.value=Math.min(current.max,current.value+(Number(range.step)||1)*25);
    range.dispatchEvent(new Event('input',{bubbles:true}));
    if(range.isConnected)range.dispatchEvent(new Event('change',{bubbles:true}));
   }
   if(stage.isConnected){stage.dataset.magicPlaying=String(isInquiryPlaying());paintMagic(stage);}
  });
 }
 stage.dataset.magicPlaying=String(isInquiryPlaying());
 paintMagic(stage);
}
