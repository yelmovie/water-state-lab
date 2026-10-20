import {initialInquiry,sanitizeInquiry} from './inquiry-model.js';
import {initialActivities,validateActivities} from './activity-model.js';
import {defaultParts,canEnter} from './domain.js';
import {initialFieldwork,cleanFieldwork} from './fieldwork-model.js';
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
export function readState(storage){
 const fallback=initialState();
 try{
  storage ??= globalThis.localStorage;
  const raw=JSON.parse(storage.getItem(KEY));
  if(!raw||![1,2].includes(raw.schemaVersion)||!raw.lab)return fallback;
  const s={...fallback,...raw,settings:{...fallback.settings,...raw.settings},lab:{...fallback.lab}};
  s.schemaVersion=2;s.inquiry=sanitizeInquiry(raw.inquiry);s.fieldwork=cleanFieldwork(raw.fieldwork);
  s.settings.sfx=typeof raw.settings?.sfx==='boolean'?raw.settings.sfx:s.settings.sound;
  s.settings.bgmVolume=Number.isFinite(s.settings.bgmVolume)?Math.max(0,Math.min(100,s.settings.bgmVolume)):35;
  s.activities={...fallback.activities,...raw.activities};
  for(const k of Object.keys(fallback.activities)){if(typeof fallback.activities[k]==='object')s.activities[k]={...fallback.activities[k],...raw.activities?.[k]};}
  if(!validateActivities(s.activities))s.activities=initialActivities();
  for(const k of Object.keys(s.lab))s.lab[k]={...fallback.lab[k],...raw.lab[k]};
  if(!matches(s.lab,fallback.lab)||!matches(s.settings,fallback.settings)||!Array.isArray(s.completed)||!Array.isArray(s.pages)||!s.evidence||typeof s.evidence!=='object')return fallback;
  const parts=s.lab.workshop.parts;
  if(!Object.hasOwn(parts,s.lab.workshop.selected)||s.lab.observe.selected<0||s.lab.observe.selected>3||s.lab.classify.current<0||s.lab.classify.current>3)return fallback;
  if(!s.completed.every(n=>Number.isInteger(n)&&n>=1&&n<=5)||!s.pages.every(n=>Number.isInteger(n)&&n>=1&&n<=10))return fallback;
  if(!s.lab.draw.strokes.every(stroke=>Array.isArray(stroke)&&stroke.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))))return fallback;
  if(!s.lab.workshop.trials.every(t=>t&&Array.isArray(t.steps)&&t.steps.every(v=>v&&Number.isFinite(v.point?.x)&&Number.isFinite(v.point?.y))))return fallback;
  const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  const validLinks=t=>t.links===undefined||(Array.isArray(t.links)&&t.links.every(l=>l&&validPoint(l.from)&&validPoint(l.to)&&['incoming','outgoing','lost','factor'].every(k=>Number.isFinite(l[k]))));
  const validDesign=d=>d&&typeof d.cold==='boolean'&&Number.isFinite(d.angle)&&matches(d.parts,fallback.lab.workshop.parts);
  s.lab.workshop.trials=s.lab.workshop.trials.filter(t=>(!t.design||validDesign(t.design))&&validLinks(t));
  const diagnosis=s.lab.final.diagnosis;
  if(diagnosis&&(!['cooling','connection'].includes(diagnosis.fault)||!validDesign(diagnosis.working)||!Array.isArray(diagnosis.tests)||!diagnosis.tests.every(t=>t&&Array.isArray(t.steps)&&Array.isArray(t.links)&&validLinks(t)&&validDesign(t.design)))){s.lab.final=fallback.lab.final;}
  if(s.evidence[1]&&!Array.isArray(s.evidence[1].records)||s.evidence[2]&&!Array.isArray(s.evidence[2].trials)||s.evidence[3]&&!Array.isArray(s.evidence[3].observations)||s.evidence[4]&&!Array.isArray(s.evidence[4].chain))return fallback;
  if(s.evidence[5]&&(!matches(s.evidence[5].parts,parts)||!s.evidence[5].result)){delete s.evidence[5];s.completed=s.completed.filter(n=>n!==5);s.pages=s.pages.filter(n=>n<9);s.lab.final=fallback.lab.final;s.restored=false;}
  if(typeof s.route==='number'&&!canEnter(s.route,s))s.route='map';
  if(!['home','map','ending'].includes(s.route)&&typeof s.route!=='number')s.route='home';
  if(s.route==='ending'&&!s.restored&&!s.settings.adminUnlock)s.route='map';
  return s;
 }catch{return fallback;}
}
export let state=readState();
let previewStudent=null;
export function setPreviewMode(enabled){
 if(enabled&&!previewStudent){previewStudent=structuredClone(Object.fromEntries(Object.entries(state).filter(([k])=>k!=='settings')));}
 if(!enabled&&previewStudent){Object.assign(state,previewStudent);previewStudent=null;}
}
export function save(){try{const saved=previewStudent?{...previewStudent,settings:state.settings}:state;globalThis.localStorage.setItem(KEY,JSON.stringify(saved));return true;}catch{if(typeof document!=='undefined'){const el=document.querySelector('#toast');if(el){el.textContent='이 기기에 저장하지 못했어. 창을 닫기 전에 선생님께 알려 줘.';el.classList.add('show');}}return false;}}
export function reset(){const audio={sound:state.settings.sound,bgm:state.settings.bgm,sfx:state.settings.sfx,bgmVolume:state.settings.bgmVolume};previewStudent=null;state=initialState();Object.assign(state.settings,audio);save();}
