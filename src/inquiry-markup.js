// Pure markup helpers for inquiry.js (moved 2026-11-21 for file size only; bodies unchanged).
import {btn,propArt} from './ui.js';
import {state} from './state.js';
import {hiddenScenes,dryTrace} from './activity-model.js';
import {drawingSVG,visibleDew} from './inquiry-model.js';
import {vesselGeometry,pourServing,pourWaterHeight} from './scene-model.js';
const q=()=>state.inquiry;
export const b=(label,action,disabled=false,cls='')=>btn(label,'ix-'+action,cls,disabled);
// A chosen prediction folds into one line; it can be changed only until the experiment starts.
export const chosen=(key,label,canChange)=>`<div class="inquiry-options prediction-chosen"><span>내 예상 · <b>${label||''}</b></span>${canChange?b('바꾸기',key+'-change'):''}</div>`;
export const options=(items,key,selected)=>`<div class="inquiry-options">${items.map(([k,v])=>b(v,`${key}-${k}`,false,k===selected?'selected':'').replace('aria-pressed="true"','').replace('<button ',`<button aria-pressed="${k===selected}" `)).join('')}</div>`;
export const shell=(n,main,tools)=>`<section class="activity activity-${n}"><div class="activity-scene">${main}</div><aside class="activity-tools">${tools}</aside></section>`;
export const status=text=>`<p class="activity-status" aria-live="polite">${text}</p>`;
export const science=text=>`<details class="science-detail"><summary>알아두기</summary><p>${text}</p></details>`;
// Optional after-completion goal: two more water scenes hidden in the stage-2 picture.
export const sortBonus=s=>{const h=s.sort.hidden,found=hiddenScenes.filter(c=>h.placed[c.id]).length,clean=hiddenScenes.filter(c=>h.placed[c.id]&&!h.tries[c.id]).length,active=hiddenScenes.find(c=>c.id===q().hiddenProof&&!h.placed[c.id]);return `<section class="replay-challenge" aria-label="숨은 물 찾기 도전"><h3>도전 · 숨은 물 찾기</h3><p>그림 속에 물이 ${hiddenScenes.length}곳 더 숨어 있어. 장면을 고르고 상태를 골라 봐.</p>${found<hiddenScenes.length?options(hiddenScenes.filter(c=>!h.placed[c.id]).map(c=>[c.id,c.name]),'hidden-card',active?.id):''}${active?`<p class="replay-focus">${active.name}은 어떤 상태일까?</p>${options([['solid','고체'],['liquid','액체'],['gas','기체']],'hidden-place','')}`:''}${status(found===hiddenScenes.length?`숨은 물 ${found}곳을 모두 찾았어! 한 번에 맞힌 곳 ${clean}곳`:`${found} / ${hiddenScenes.length}곳 찾음`)}</section>`;};
export function graphDraw(strokes,time){return `<div class="record-pair"><div><b>A · 물이 적음</b>${drawingSVG(strokes,dryTrace('thin',time))}</div><div><b>B · 물이 많음</b>${drawingSVG(strokes,dryTrace('thick',time),2)}</div></div>`;}
export function drawCards(s){return `<div class="picture-records">${s.records.map((r,i)=>`<button data-action="ix-draw-view-${i}" class="picture-record">${graphDraw(s.strokes,r.time)}<span>${['처음','중간','나중'][r.band]} 모습</span></button>`).join('')}</div>`;}
let dewPictureId=0;
export function dewPicture(time,removed=[],cold=true,bottle=false,preexisting=false){
 if(bottle){const wet=cold||preexisting?Math.max(0,Math.min(1,time/100)):0;return `<svg viewBox="0 0 240 300" class="can-art dew-photo drink-bottle" role="img" aria-label="${cold?'차가운':'실온'} 음료병의 겉면"><image href="/assets/stages/drink-bottle.webp" x="27" y="0" width="186" height="290"/>${wet?`<image href="/assets/learning/condensation-20261108/bottle-wet.webp" x="27" y="0" width="186" height="290" opacity="${wet}"/>`:''}</svg>`;}
 const drops=visibleDew(time,removed,cold||preexisting),source=bottle?'/assets/stages/drink-bottle.webp':`/assets/learning/experiment-props-20261107/${cold?'cup-cold':'cup-sealed'}.webp`;
 const id='dew-photo-'+(++dewPictureId),layer=!bottle&&cold?`<defs><clipPath id="${id}">${drops.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="24"/>`).join('')}</clipPath></defs><image href="/assets/learning/experiment-props-20261107/cup-wet.webp" x="-17" y="0" width="275" height="290" clip-path="url(#${id})"/>`:drops.map(p=>{const r=2.5+p.id%2;return `<image data-droplet="${p.id}" href="/assets/learning/experiment-props-20261107/dew.webp" x="${p.x-r}" y="${p.y-r}" width="${r*2}" height="${r*2.5}" opacity=".6"/>`;}).join('');
 return `<svg viewBox="0 0 240 300" class="can-art dew-photo ${bottle?'drink-bottle':''}" role="img" aria-label="${cold?'차가운':'실온'} ${bottle?'음료병':'컵'}의 겉면"><image href="${source}" x="${bottle?27:-17}" y="0" width="${bottle?186:275}" height="290"/>${layer}</svg>`;
}
export function pourVesselGraphic(key,amount){
 const {width,height}=vesselGeometry[key],left=110-width/2,top=215-height,level=pourWaterHeight(amount,width);
 return `<svg viewBox="0 0 220 240" role="img" aria-label="담긴 물"><path d="M${left-3} ${top}V217H${left+width+3}V${top}" fill="#eff8f7" stroke="#719fac" stroke-width="5"/><rect class="pour-water" x="${left}" y="${215-level}" width="${width}" height="${level}" fill="#66c4d8"/><path class="pour-stream" d="M110 0V215" stroke="#61bdd3" stroke-width="8" opacity="0"/></svg>`;
}
export function recordIllustration(id){if(id==='water')return `<svg viewBox="0 0 400 180" class="shape-proof" aria-label="같은 양의 물을 담은 길쭉한 그릇과 넓은 그릇">${['tall','wide'].map((k,j)=>{const {width,height}=vesselGeometry[k],x=j?270:86,w=width*.64,l=x-w/2,top=152-height*.64,level=pourWaterHeight(pourServing,width)*.64;return `<path d="M${l-2} ${top}V154H${l+w+2}V${top}" fill="#f2f9f6" stroke="#6d9799" stroke-width="4"/><rect x="${l}" y="${152-level}" width="${w}" height="${level}" fill="#6dc7da"/><text x="${x}" y="176" text-anchor="middle">${j?'넓은 그릇':'길쭉한 그릇'}</text>`;}).join('')}</svg>`;
if(id==='ice'||id==='frost')return `<div class="record-pair">${propArt('ice')}${propArt('ice')}</div>`;if(id==='vapor'||id==='laundry')return `<div class="trace-pair"><span class="wet-trace">젖은 자국</span><span>시간이 지난 뒤<br>마른 자국</span></div>`;return propArt('seedling');}
