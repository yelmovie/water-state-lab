// Pure markup helpers for activities.js (moved 2026-11-21 for file size only; bodies unchanged).
import {esc} from './ui.js';
export const button=(label,action,disabled=false,cls='')=>`<button class="activity-button ${cls}" data-action="act-${action}" ${disabled?'disabled':''}>${label}</button>`;
export const moveable=(token,body,label)=>`<button class="activity-object" data-activity-drag="${token}" data-action="act-pick-${token}" aria-label="${esc(label)}">${body}<span>${label}</span></button>`;
export const target=(token,body,label,cls='')=>`<div class="activity-target ${cls}" data-activity-drop="${token}" role="button" tabindex="0" aria-label="${esc(label)}">${body}</div>`;
export const slider=(id,label,value,min=0,max=100,step=1)=>`<label class="activity-range" for="${id}"><span>${label}</span><output>${value}</output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
export const status=text=>`<p class="activity-status" aria-live="polite">${text}</p>`;
export const help=text=>`<details class="science-detail"><summary>알아두기</summary><p>${text}</p></details>`;
export const alternatives=html=>`<details class="activity-alternative essential-controls"><summary>버튼으로 조작하기</summary><div>${html}</div></details>`;
export const shell=(n,main,tools)=>`<section class="activity activity-${n}"><div class="activity-scene">${main}</div><aside class="activity-tools">${tools}</aside></section>`;
export const records=(list,draw)=>`<div class="activity-records">${list.map(draw).join('')}</div>`;
export const stamp=(label,body)=>`<figure class="activity-record"><div>${body}</div><figcaption>${label}</figcaption></figure>`;
