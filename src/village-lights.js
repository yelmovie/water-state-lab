import {villageClips} from './village-clips.js';

// Coordinates follow the windows, lamps and equipment in research-island-v4.webp.
const lamps=[
 {x:315,y:451,rx:100,ry:30,cool:true,art:'<ellipse class="water-ring" cx="315" cy="454" rx="56" ry="12"/><ellipse class="water-ring" cx="315" cy="454" rx="34" ry="7"/><path class="water-jet" d="M299 451 Q310 420 315 449 Q323 423 333 452"/>'},
 {x:245,y:373,rx:76,ry:63,art:'<path class="lit-glass" d="M202 403v-38q7-24 15-4v40z M252 407v-45q9-29 19-8v50z"/>'},
 {x:508,y:136,rx:48,ry:60,cool:true,art:'<path class="cool-glass" d="M486 106q20-10 45 0v60q-23 9-45 0z"/><path class="gauge" d="M491 118h10m-10 11h6m-6 11h10m-10 11h6"/>'},
 {x:587,y:223,rx:92,ry:38,art:'<path class="lit-glass" d="M537 238v-17q6-13 12-1v15z M571 245v-19q8-14 15 0v15z M613 250v-20q8-13 15 1v16z"/>'},
 {x:790,y:347,rx:77,ry:27,art:'<path class="garland-cord" d="M724 356 Q784 371 859 329"/><path fill="#edb853" d="m737 360 10 1-5 11z"/><path fill="#58b9ae" d="m760 361 11-1-4 12z"/><path fill="#e88c67" d="m786 357 11-2-2 12z"/><path fill="#efc868" d="m814 347 11-4-1 13z"/><path fill="#6cbda6" d="m839 338 10-5v12z"/>'},
 {x:919,y:429,rx:46,ry:51,art:'<path class="lit-glass" d="M910 437v-14q9-18 18 0v14z"/><path fill="#fff9b5" d="M918 435q-5-4 2-15 0 7 3 9 2 5-5 6z"/>'},
 {x:1226,y:203,rx:45,ry:58,cool:true,art:'<path class="cool-glass" d="M1208 171q16-6 36 0v59q-18 7-36 0z"/><path class="gauge" d="M1214 180h9m-9 12h6m-6 12h9"/>'},
 {x:1164,y:141,rx:98,ry:78,art:'<path class="lit-glass" d="M1119 185v-36q11-17 19-15v51z M1149 178v-45q9-13 17-11v56z M1175 171v-49q11-6 19-4v51z"/>'},
 {x:1368,y:493,rx:45,ry:70,cool:true,art:'<path class="cool-glass" d="M1344 452q25-7 51-1l-21 29-2 37h-5l-2-37z"/><ellipse class="water-ring" cx="1368" cy="532" rx="25" ry="5"/>'},
 {x:1516,y:526,rx:71,ry:80,art:'<path class="wheel-light" d="M1472 540q9-63 53-64 45 1 35 60"/><circle class="lamp-core" cx="1515" cy="527" r="6"/><path class="water-jet" d="M1494 569q5 20 1 30m11-21q5 14 3 23"/>'}
];
const pennantColors=['#f3bf57','#5cbfb2','#e98a66'];
// Original isometric features sit above the calmer building silhouettes at rest.
const sites=[
 [232,384,170,132], [545,177,151,120], [808,422,178,132],
 [1165,165,151,124], [1458,461,190,132]
];
function festivalFlags(){
 const flags=Array.from({length:7},(_,i)=>{
  const t=(i+1)/8,x=541+155*t,y=554+26*t+36*t*(1-t);
  return `<path fill="${pennantColors[i%3]}" d="M${x-7} ${y-1}l14 2-7 15z"/>`;
 }).join('');
 return `<g class="village-festival"><path class="garland-cord" d="M541 554Q618 585 696 580"/>${flags}</g>`;
}
function clipMarkup(returned,fresh){
 const place=([x,y,w,h])=>`left:${x/16.72}%;top:${y/9.41}%;width:${w/16.72}%;height:${h/9.41}%`;
 return `<div class="village-clips" aria-hidden="true">${returned.map(({stage})=>{
  const isNew=fresh.includes(stage),{box}=villageClips.find(c=>c.id===stage);
  return `<div class="village-clip${isNew?' is-new':''}" style="${place(box)}">${isNew?`<img class="clip-on" src="/assets/village/stage-${stage}-on.webp" alt="">`:''}<img class="clip-idle" src="/assets/village/stage-${stage}-idle.webp" alt="" decoding="async"></div>`;
 }).join('')}</div>`;
}
export function villageLights(returned,fresh,festival,motion=true){
 // One representative now signs off both discoveries in a building. Legacy odd-place records still work.
 const restored=new Set(returned.flatMap(({stage})=>stage%2?[stage]:[stage-1,stage]));
 returned=[...restored].sort((a,b)=>a-b).map(stage=>({stage}));
 fresh=[...new Set(fresh.flatMap(stage=>stage%2?[stage]:[stage-1,stage]))];
 const count=sites.filter((_,i)=>restored.has(i*2+2)).length;
 const facades=sites.map(([x,y,rx,ry],i)=>{
  const stage=i*2+2;
  if(restored.has(stage)&&!(motion&&fresh.includes(stage)))return '';
  return `<ellipse class="village-facade${restored.has(stage)?' is-waking':''}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#village-facade)"/>`;
 }).join('');
 const dormant=lamps.map(({x,y,rx,ry},i)=>returned.some(r=>r.stage===i+1)?'':`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#village-sleep)"/>`).join('');
 const lights=returned.map(({stage})=>{
  const {x,y,rx,ry,cool,art}=lamps[stage-1];
  return `<g class="village-upgrade${fresh.includes(stage)?' is-new':''}" data-upgrade="${stage}">
   <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#village-${cool?'aqua':'amber'})"/>
   <g class="village-art">${art}</g>${motion&&fresh.includes(stage)?`<ellipse class="lighting-ring" cx="${x}" cy="${y}" rx="${rx*.72}" ry="${ry*.72}"/>`:''}</g>`;
 }).join('');
 return `<svg class="village-lights${motion?' has-clips':''}" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true">
  <defs><radialGradient id="village-facade"><stop stop-color="#254654" stop-opacity=".48"/><stop offset=".52" stop-color="#355868" stop-opacity=".33"/><stop offset="1" stop-color="#486674" stop-opacity="0"/></radialGradient><radialGradient id="village-sleep"><stop stop-color="#29404f" stop-opacity=".48"/><stop offset=".55" stop-color="#425763" stop-opacity=".32"/><stop offset="1" stop-color="#425763" stop-opacity="0"/></radialGradient><radialGradient id="village-amber"><stop stop-color="#ffeaa1" stop-opacity=".85"/><stop offset=".48" stop-color="#ffc962" stop-opacity=".52"/><stop offset="1" stop-color="#ffb545" stop-opacity="0"/></radialGradient>
  <radialGradient id="village-aqua"><stop stop-color="#e2ffff" stop-opacity=".85"/><stop offset=".52" stop-color="#75f4e9" stop-opacity=".53"/><stop offset="1" stop-color="#61e9f1" stop-opacity="0"/></radialGradient></defs>
  <rect width="1672" height="941" fill="#345864" opacity="${(.10*(1-count/sites.length)).toFixed(3)}"/>
  ${facades}${dormant}${lights}
  ${count===sites.length?'<g class="village-complete-beacon"><ellipse cx="652" cy="552" rx="58" ry="24" fill="url(#village-aqua)"/><path d="M652 530q-24 26-12 36a16 16 0 0 0 24 0q12-10-12-36Z" fill="#79dbd7" stroke="#f1ffed" stroke-width="3"/><path d="M648 546q-8 10-4 16" fill="none" stroke="#effff9" stroke-linecap="round" stroke-width="3"/></g>':''}
  <g class="festival-ropes" visibility="${festival?'visible':'hidden'}">${festivalFlags()}</g></svg>${motion?clipMarkup(returned,fresh):''}`;
}

