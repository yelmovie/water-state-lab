import {initialInquiry,sanitizeInquiry} from './inquiry-model.js';
import {initialActivities,validateActivities} from './activity-model.js';
import {defaultParts,canEnter} from './domain.js';
import {initialFieldwork,cleanFieldwork} from './fieldwork-model.js';
import {restoreDrawingMetadata} from './drawing-records.js';
export const KEY='water-drop-lab:v1';
export function initialState(){return {schemaVersion:2,fieldwork:initialFieldwork(),inquiry:initialInquiry(),activities:initialActivities(),route:'home',lastScreen:1,completed:[],pages:[],evidence:{},restored:false,settings:{reduced:false,sound:true,bgm:false,sfx:true,bgmVolume:35,adminUnlock:false},lab:{
  observe:{selected:0,seen:[],pour:0,ice:false,cloth:0,wipe:0,canTime:0},
  classify:{current:0,records:[],type:'',proof:false},
  freeze:{initial:false,tare:false,prediction:65,phase:'water',measured:false,melted:false,compared:false},
  pipe:{fill:95,trials:[],selected:-1,reason:''},
  draw:{waterA:1,waterB:2,strokes:[],time:0,recorded:false,answer:''},
  compare:{heat:0,time:0,pins:[],conclusion:''},
  condensation:{wiped:false,sealed:false,tare:false,initial:false,time:0,later:false,snapshots:[]},
  evidence:{chain:[],selected:[],transfer:''},
  workshop:{parts:defaultParts(),selected:'plate',cold:false,angle:0,trials:[]},
  final:{submitted:[],connected:false,valve:0,tested:false,lever:0,cooling:false}
}};}
function matches(value,template){if(Array.isArray(template))return Array.isArray(value);if(template&&typeof template==='object')return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(template).every(k=>matches(value[k],template[k]));return typeof value===typeof template&&(typeof value!=='number'||Number.isFinite(value));}
function preservesSource(source,clean,derivedDone=false){
 if(source===null||typeof source!=='object')return source===clean;
 if(Array.isArray(source))return Array.isArray(clean)&&source.length===clean.length&&source.every((value,i)=>preservesSource(value,clean[i],derivedDone));
 return !!clean&&typeof clean==='object'&&Object.keys(source).every(key=>derivedDone&&key==='done'||preservesSource(source[key],clean[key],derivedDone));
}
function loadState(storage){
 const fallback=initialState();
 let source=null;
 const result=(value,code='ready')=>({value,source,code});
 try{
  storage ??= globalThis.localStorage;
  source=storage.getItem(KEY);
  if(source===null)return result(fallback);
  let raw;try{raw=JSON.parse(source);}catch{return result(fallback,'damaged');}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return result(fallback,'damaged');
  if(![1,2].includes(raw.schemaVersion))return result(fallback,'unsupported');
  if(!raw.lab||typeof raw.lab!=='object'||Array.isArray(raw.lab)||!Array.isArray(raw.completed)||!Array.isArray(raw.pages)||!raw.evidence||typeof raw.evidence!=='object'||Array.isArray(raw.evidence))return result(fallback,'damaged');
  let repaired=false;
  const s={...fallback,...raw,settings:{...fallback.settings,...raw.settings},lab:{...fallback.lab}};
  s.schemaVersion=2;s.inquiry=sanitizeInquiry(raw.inquiry);s.fieldwork=cleanFieldwork(raw.fieldwork);
  // Sanitized data can be shown, but rejected observations must not replace their source.
  if(raw.inquiry!==undefined&&!preservesSource(raw.inquiry,s.inquiry)||raw.fieldwork!==undefined&&!preservesSource(raw.fieldwork,s.fieldwork,true))repaired=true;
  s.settings.sfx=typeof raw.settings?.sfx==='boolean'?raw.settings.sfx:s.settings.sound;
  s.settings.bgmVolume=Number.isFinite(s.settings.bgmVolume)?Math.max(0,Math.min(100,s.settings.bgmVolume)):35;
  s.activities={...fallback.activities,...raw.activities};
  for(const k of Object.keys(fallback.activities)){if(typeof fallback.activities[k]==='object')s.activities[k]={...fallback.activities[k],...raw.activities?.[k]};}
  if(!validateActivities(s.activities)){s.activities=initialActivities();repaired=true;}
  if(!Object.hasOwn(raw.inquiry||{},'drawPredictionLocked'))restoreDrawingMetadata(s.inquiry,s.activities.draw);
  for(const k of Object.keys(s.lab))s.lab[k]={...fallback.lab[k],...raw.lab[k]};
  if(!matches(s.lab,fallback.lab)||!matches(s.settings,fallback.settings)||!Array.isArray(s.completed)||!Array.isArray(s.pages)||!s.evidence||typeof s.evidence!=='object'||Array.isArray(s.evidence)||typeof s.restored!=='boolean')return result(fallback,'damaged');
  // Teacher preview is a session-only copy, never a saved permission or progress.
  s.settings.adminUnlock=false;
  const parts=s.lab.workshop.parts;
  if(!Object.hasOwn(parts,s.lab.workshop.selected)||s.lab.observe.selected<0||s.lab.observe.selected>3||s.lab.classify.current<0||s.lab.classify.current>3)return result(fallback,'damaged');
  if(!s.completed.every(n=>Number.isInteger(n)&&n>=1&&n<=5)||!s.pages.every(n=>Number.isInteger(n)&&n>=1&&n<=10))return result(fallback,'damaged');
  if(!s.lab.draw.strokes.every(stroke=>Array.isArray(stroke)&&stroke.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))))return result(fallback,'damaged');
  if(!s.lab.workshop.trials.every(t=>t&&Array.isArray(t.steps)&&t.steps.every(v=>v&&Number.isFinite(v.point?.x)&&Number.isFinite(v.point?.y))))return result(fallback,'damaged');
  const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  const validLinks=t=>t.links===undefined||(Array.isArray(t.links)&&t.links.every(l=>l&&validPoint(l.from)&&validPoint(l.to)&&['incoming','outgoing','lost','factor'].every(k=>Number.isFinite(l[k]))));
  const validDesign=d=>d&&typeof d.cold==='boolean'&&Number.isFinite(d.angle)&&matches(d.parts,fallback.lab.workshop.parts);
  const trials=s.lab.workshop.trials.filter(t=>(!t.design||validDesign(t.design))&&validLinks(t));
  if(trials.length!==s.lab.workshop.trials.length)repaired=true;s.lab.workshop.trials=trials;
  const diagnosis=s.lab.final.diagnosis;
  if(diagnosis&&(!['cooling','connection'].includes(diagnosis.fault)||!validDesign(diagnosis.working)||!Array.isArray(diagnosis.tests)||!diagnosis.tests.every(t=>t&&Array.isArray(t.steps)&&Array.isArray(t.links)&&validLinks(t)&&validDesign(t.design)))){s.lab.final=fallback.lab.final;repaired=true;}
  if(s.evidence[1]&&!Array.isArray(s.evidence[1].records)||s.evidence[2]&&!Array.isArray(s.evidence[2].trials)||s.evidence[3]&&!Array.isArray(s.evidence[3].observations)||s.evidence[4]&&!Array.isArray(s.evidence[4].chain))return result(fallback,'damaged');
  if(s.evidence[5]&&(!matches(s.evidence[5].parts,parts)||!s.evidence[5].result)){delete s.evidence[5];s.completed=s.completed.filter(n=>n!==5);s.pages=s.pages.filter(n=>n<9);s.lab.final=fallback.lab.final;s.restored=false;repaired=true;}
  if(typeof s.route==='number'&&!canEnter(s.route,s))s.route='map';
  if(!['home','map','ending'].includes(s.route)&&typeof s.route!=='number')s.route='home';
  if(s.route==='ending'&&!s.restored&&!s.settings.adminUnlock)s.route='map';
  return result(s,repaired?'damaged':'ready');
 }catch{return result(fallback,source===null?'unavailable':'damaged');}
}
export function readState(storage){return loadState(storage).value;}
const loaded=loadState();
export let state=loaded.value;
let lastSource=loaded.source,storageCode=loaded.code;
let readStatus=loaded.code==='unavailable'?'failed':'ok',writeStatus='not-attempted';
let protectedCode=['damaged','unsupported','conflict'].includes(loaded.code)?loaded.code:null;
const resetTokens=new WeakSet();
const messages={
 ready:'',
 damaged:'저장 기록을 온전히 읽지 못해 원본을 보호하고 있어요. 새 활동은 저장되지 않아요. 현재 화면을 남기고 선생님께 알려 주세요.',
 unsupported:'다른 버전의 저장 기록을 보호하고 있어요. 새 활동은 저장되지 않아요. 이 기록을 만든 버전에서 다시 열어 주세요.',
 unavailable:'이 브라우저의 저장 공간에 접근하지 못해요. 새 활동은 저장되지 않아요. 창을 닫기 전에 현재 화면을 남기고 선생님께 알려 주세요.',
 conflict:'다른 창에서 기록이 바뀌어 덮어쓰기를 멈췄어요. 현재 화면을 남긴 뒤 새로고침해 최신 기록을 열어 주세요.',
 full:'기록을 저장하지 못했어요. 마지막 저장본은 남아 있어요. 창을 닫기 전에 현재 화면을 남기고 선생님께 알려 주세요.',
 preview:'교사 시연 중에는 학생 기록을 지울 수 없어요. 시연을 종료한 뒤 다시 선택해 주세요.',
 confirmation:'초기화 확인이 만료됐어요. 기록 초기화를 다시 눌러 주세요.'
};
export function getStorageStatus(){const code=protectedCode||storageCode;return {code,message:messages[code]??messages.unavailable,read:readStatus,write:writeStatus,conflict:protectedCode==='conflict',protected:!!protectedCode,preview:!!previewStudent};}
function emitStorageStatus(){if(typeof document!=='undefined'&&typeof CustomEvent==='function')document.dispatchEvent?.(new CustomEvent('storage-status',{detail:getStorageStatus()}));}
function fail(code){
 storageCode=code;if(['damaged','unsupported','conflict'].includes(code))protectedCode=code;
 if(code==='unavailable')readStatus='failed';
 if(code==='full')writeStatus='failed';
 else if(protectedCode||code==='unavailable')writeStatus='blocked';
 if(typeof document!=='undefined'){const notice=document.querySelector('#toast');if(notice){notice.textContent=messages[code];notice.classList.add('show');}}
 emitStorageStatus();
 return false;
}
function currentSource(){try{const storage=globalThis.localStorage,raw=storage.getItem(KEY);readStatus='ok';return {storage,raw};}catch{fail('unavailable');return null;}}
function unchanged(current){if(!current)return false;if(current.raw!==lastSource)return fail('conflict');return true;}
let previewStudent=null;
export function setPreviewMode(enabled){
 if(enabled&&!previewStudent){previewStudent=structuredClone(Object.fromEntries(Object.entries(state).filter(([k])=>k!=='settings')));}
 if(!enabled&&previewStudent){Object.assign(state,previewStudent);previewStudent=null;}
}
export function save(){
 if(protectedCode)return fail(protectedCode);
 const current=currentSource();if(!unchanged(current))return false;
 try{
  const saved={...(previewStudent||state),settings:{...state.settings,adminUnlock:false}};
  const serialized=JSON.stringify(saved);current.storage.setItem(KEY,serialized);lastSource=serialized;storageCode='ready';writeStatus='saved';emitStorageStatus();return true;
 }catch{return fail('full');}
}
export function captureResetToken(){
 if(previewStudent||state.settings.adminUnlock){fail('preview');return null;}
 if(protectedCode==='conflict'){storageCode=protectedCode;return null;}
 const current=currentSource();if(!unchanged(current))return null;
 const token={raw:current.raw};resetTokens.add(token);return token;
}
export function reset(token){
 if(previewStudent||state.settings.adminUnlock)return fail('preview');
 if(!token||!resetTokens.has(token))return fail('confirmation');
 resetTokens.delete(token);
 const current=currentSource();if(!unchanged(current)||current.raw!==token.raw)return fail(current?'conflict':'unavailable');
 const next=initialState();
 for(const key of ['sound','bgm','sfx','bgmVolume','reduced'])next.settings[key]=state.settings[key];
 try{const serialized=JSON.stringify(next);current.storage.setItem(KEY,serialized);lastSource=serialized;storageCode='ready';protectedCode=null;writeStatus='saved';state=next;emitStorageStatus();return true;}catch{return fail('full');}
}
