import {createRewardCards} from './reward-cards.js';
import {clearedMapVillains} from './map-villains.js';
import {missions} from './domain.js';
import {playCue} from './sound.js';

// One achievement card per map villain, in island order (map-villains.js records clears by island index 0-4).
// The star count rises with the island number. Places are the island names on the map (journey.js islandNames).
const CARDS=[['물모양 샘터','물의 세 모습 탐정'],['얼음 다리','꽁꽁 얼음 측정 박사'],['햇살 마당','증발 흔적 추적왕'],['이슬 정원','이슬 응결 수사대장'],['물길 공방','물길 살린 전설 영웅']];
export const REWARD_CARDS=CARDS.map(([stage,title],index)=>{
 const id=String(missions[index].id),file=`${index+1}-${id}.webp`;
 return {id,title,stage,art:`/assets/reward-cards/card-${file}`,thumb:`/assets/reward-cards/thumb-${file}`};
});
/** A card is owned once its island's villain is cleared for the current run. Nothing extra is saved. */
export const ownedRewardCards=(state,storage)=>clearedMapVillains(state,storage);
export function mapCardStatus(remaining){
 const total=REWARD_CARDS.length;
 return `성취 카드 ${total-remaining}/${total} · ${remaining?`남은 밸브 두더지 ${remaining}마리`:'수집 완료'}`;
}

// Cue names in sound.js, so the cards follow the sound switch and the effects setting.
const SOUNDS={whoosh:'cardWhoosh',reveal:'cardReveal',epic:'cardEpic',slot:'cardSlot',complete:'cardComplete'};
// Built on first use: tests load this module without a browser.
let instance;
function rewards(){
 return instance??=createRewardCards({
  setName:'물방울 연구실 성취 카드',
  cards:REWARD_CARDS,
  theme:{accent:'#dfb764',accent2:'#137da7',glow:'#ffe8a8',ink:'#173e54'},
  particles:['drop','bubble','snow','spark'],
  colors:['#46b6c5','#137da7','#ffe8a8','#cee0e4','#668fde','#ffffff'],
  // The water drop of the app icon (index.html).
  emblem:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2C15 12 5 20 5 27a15 15 0 0030 0C35 20 25 12 20 2" fill="currentColor"/><path d="M12 27a8 8 0 0 0 6 7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
  sound:name=>void playCue(SOUNDS[name]),
  inertRoot:()=>document.querySelector('#app'),
 });
}

// A card on its way to a slot stays empty in the header until it lands, even if the header is redrawn in between.
const flying=new Set();
export const rewardSlotsHtml=state=>rewards().slotsHtml(ownedRewardCards(state).map((owned,index)=>owned&&!flying.has(index)));
/**
 * Shows the card of the villain just cleared on island `index` (map-villains.js onCleared, after its exit has played),
 * flying in from where the villain stood. Resolves once the card sits in its slot, or at once when no card was won
 * (the teacher preview keeps no clear record).
 */
export function revealRewardCard(index,state){
 const owned=ownedRewardCards(state);
 if(!owned[index]||flying.has(index))return Promise.resolve();
 const spot=document.querySelector(`.mv-target[data-stage="${index}"]`),box=spot?.getClientRects().length?spot.getBoundingClientRect():null;
 flying.add(index);
 return rewards().reveal(index,box?{x:box.left+box.width/2,y:box.top+box.height/2}:undefined,owned).finally(()=>flying.delete(index));
}
