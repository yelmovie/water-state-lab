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
function castMagic(magic){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduce-motion'))return;
 // Keep the hands still until the wand has tapped and faded away.
 magic.style.setProperty('--time-start-minute',magic.style.getPropertyValue('--time-minute')||'0deg');
 magic.style.setProperty('--time-start-hour',magic.style.getPropertyValue('--time-hour')||'0deg');
 magic.classList.add('is-casting');
}
function paintMagic(stage){
 const magic=stage.querySelector('[data-time-magic]'),source=sourceFor(stage);
 if(!magic||!source)return;
 const {range,wait,max,value}=source;
 const running=!!wait?.disabled||stage.dataset.magicPlaying==='true';
 const done=value>=max;
 if(running)magic.dataset.cueSeen="true";
 magic.classList.toggle("needs-attention",!running&&!done&&magic.dataset.cueSeen!=="true");
 if(running&&!done&&!magic.classList.contains('is-running'))castMagic(magic);
 if(!running||done)magic.classList.remove('is-casting');
 magic.style.setProperty('--time-minute',value/max*1440+'deg');
 magic.style.setProperty('--time-hour',value/max*120+'deg');
 magic.classList.toggle('is-running',running&&!done);
 magic.disabled=done;
 const label=done?'관찰 완료':running?'시간이 흐르는 중':'시계를 톡 눌러 봐!';
 const status=magic.querySelector('.time-magic-label');
 if(status.textContent!==label)status.textContent=label;
 magic.setAttribute('aria-label',done?'시간 관찰 완료':running?'시간 관찰 멈추기':'시계를 눌러 시간 관찰 시작');
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
  magic.innerHTML='<span class="time-tap-cue" aria-hidden="true"><b>여기 톡!</b><svg viewBox="0 0 32 30" focusable="false"><path d="M11 2h10v13h8L16 28 3 15h8Z"/></svg></span><span class="time-magic-art" aria-hidden="true"><img class="time-face" src="/assets/learning/time-clock-face.webp" alt="" draggable="false"><i class="time-hour"></i><i class="time-minute"></i><i class="time-pivot"></i><img class="time-tap-wand" src="/assets/learning/time-wand-tap.webp" alt="" draggable="false"><span class="time-spark"></span></span><span class="time-magic-label">시계를 톡 눌러 봐!</span><output>0%</output>';
  stage.append(magic);
  magic.addEventListener('animationend',event=>{
   if(event.animationName==='time-wand-tap')magic.classList.remove('is-casting');
  });
  magic.addEventListener('click',()=>{
   const current=sourceFor(stage);if(!current||magic.disabled||document.hidden||document.querySelector('dialog[open]'))return;
   magic.dataset.cueSeen="true";magic.classList.remove("needs-attention");
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
