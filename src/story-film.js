import {setMusicQuiet} from './sound.js';

const films = {
 intro: {src:'/assets/story/intro.mp4', captions:'/assets/story/intro.vtt', title:'방울이의 부탁', poster:'/assets/story/intro.webp',
  summary:'연구섬의 물길이 멈췄어. 물과 얼음을 관찰하고, 네 장치로 온실에 물을 보내 줘!'},
 final: {src:'/assets/story/final.mp4', captions:'/assets/story/final.vtt', title:'연구섬에 물이 돌아왔어!', poster:'/assets/story/final.webp',
  summary:'네가 차가운 판에 맺힌 물을 모으고 새는 곳을 고친 덕분에 온실과 물레가 다시 움직여.'}
};

export function playStoryFilm(kind,{muted=false,onFinish}={}) {
 const film=films[kind];
 if(!film||document.querySelector('.story-film[open]'))return;
 const opener=document.activeElement,dialog=document.createElement('dialog');
 dialog.className='story-film story-film--full';dialog.setAttribute('aria-labelledby','film-title');
 dialog.style.setProperty('--film-poster',`url("${film.poster}")`);
 dialog.innerHTML=`<header class="film-heading"><h2 id="film-title">${film.title}</h2><div class="film-actions"><button type="button" class="btn secondary" data-film="restart">다시 보기</button><button type="button" class="btn secondary" data-film="skip">건너뛰기</button></div></header>
 <video playsinline preload="metadata" poster="${film.poster}" aria-label="${film.title} 영상" aria-describedby="film-summary"><track kind="captions" srclang="ko" label="한국어" src="${film.captions}"></video>
 <p class="film-summary sr-only" id="film-summary">${film.summary}</p>
 <p class="film-status" role="status" hidden></p>`;
 document.body.append(dialog);
 const video=dialog.querySelector('video'),status=dialog.querySelector('.film-status');
 let closed=false;
 // The player bar would cover the burned-in captions, so it only appears when someone needs it.
 video.controls=document.documentElement.classList.contains('reduce-motion');
 function message(text){status.textContent=text;status.hidden=!text;}
 function start(){
  message('');
  void video.play().catch(error=>{
   if(!closed&&!video.error&&error.name!=='AbortError'){video.controls=true;message('영상의 재생 버튼을 눌러 줘.');}
  });
 }
 function finish(){
  if(closed)return;
  closed=true;
  document.removeEventListener('visibilitychange',onVisibility);
  video.pause();video.removeAttribute('src');video.load();
  if(dialog.open)dialog.close();
  dialog.remove();setMusicQuiet(false);
  if(opener?.isConnected)opener.focus({preventScroll:true});
  onFinish?.();
 }
 function onVisibility(){if(document.hidden)video.pause();}
 dialog.querySelector('[data-film="skip"]').onclick=finish;
 dialog.querySelector('[data-film="restart"]').onclick=()=>{
  if(video.error)video.load();else video.currentTime=0;
  start();
 };
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('close',finish,{once:true});
 video.addEventListener('ended',finish,{once:true});
 video.addEventListener('playing',()=>message(''));
 video.addEventListener('error',()=>{if(!closed)message('영상을 불러오지 못했어. 다시 보거나 건너뛸 수 있어.');});
 document.addEventListener('visibilitychange',onVisibility);
 setMusicQuiet(true);video.muted=muted;video.src=film.src;
 dialog.showModal();dialog.querySelector('[data-film="skip"]').focus({preventScroll:true});start();
}

