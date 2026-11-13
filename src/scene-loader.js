const engineUrl='/assets/vendor/phaser.min.js';
let pending,failedOnce=false;

export function canvasTarget(route,state,root){
 if(route==='map'){
  const anchor=root.querySelector('.journey-world');
  return anchor&&{anchor,hidden:[...anchor.querySelectorAll('.journey-paths')],mode:route};
 }
 if(route===5&&state.inquiry.drawMode==='record')return null;
 const selectors={1:['.pour-workspace','.activity-ice-play','.activity-cloth'][state.activities.observe.step],2:'.inquiry-cardbank,.sort-observation,.sort-choices',5:'.activity-drawing-pair',6:'.activity-heating-pair',7:'.activity-dew-pair',8:'.evidence-pictures,.bottle-observation',9:'#workbench',10:'#workbench'};
 const selector=selectors[route];
 if(!selector)return null;
 const hidden=[...root.querySelectorAll(selector)];
 return hidden.length?{anchor:hidden[0].parentElement,hidden,mode:route}:null;
}

export function loadSceneEngine(retry=false){
 if(window.Phaser?.Game)return Promise.resolve();
 if(pending)return pending;
 if(failedOnce&&!retry)return Promise.reject(new Error('Phaser failed to load'));
 pending=new Promise((resolve,reject)=>{
  const script=document.createElement('script'),controlled=navigator.serviceWorker?.controller;
  const finish=ok=>{
   clearTimeout(timeout);script.onload=script.onerror=null;
   if(!ok){failedOnce=true;script.remove();reject(new Error('Phaser failed to load'));return;}
   failedOnce=false;resolve();
   // The first visit may start before the offline worker takes control.
   if(!controlled)navigator.serviceWorker?.ready.then(reg=>reg.active?.postMessage('save-scene-engine')).catch(()=>{});
  };
  const timeout=setTimeout(()=>finish(false),8000);
  script.onload=()=>finish(!!window.Phaser?.Game);
  script.onerror=()=>finish(false);
  script.src=engineUrl;document.head.append(script);
 }).finally(()=>{pending=null;});
 return pending;
}
