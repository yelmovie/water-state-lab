import {setMusicQuiet} from './sound.js';

const films = {
 intro: {src:'/intro.mp4', title:'방울이의 부탁', poster:'/assets/v2/story-repair.webp',
  summary:'연구섬의 물길이 멈췄어. 물과 얼음을 관찰하고, 네 장치로 온실에 물을 보내 줘!'},
 final: {src:'/final.mp4', title:'연구섬에 물이 돌아왔어!', poster:'/assets/v2/rescue-reward.webp',
  summary:'네가 차가운 판에 맺힌 물을 모으고 새는 곳을 고친 덕분에 온실과 물레가 다시 움직여.'}
};

export function playStoryFilm(kind,{muted=false,onFinish}={}) {
 const film=films[kind];
 if(!film||document.querySelector('.story-film[open]'))return;
 const opener=document.activeElement,dialog=document.createElement('dialog');
 dialog.className='story-film';dialog.setAttribute('aria-labelledby','film-title');
 dialog.innerHTML=`<header class="film-heading"><h2 id="film-title">${film.title}</h2><button type="button" class="btn secondary" data-film="skip">건너뛰기</button></header>
 <video controls playsinline preload="metadata" poster="${film.poster}" aria-label="${film.title} 영상" aria-describedby="film-summary"></video>
 <div class="film-footer"><p class="film-summary" id="film-summary">${film.summary}</p><button type="button" class="btn secondary" data-film="restart">다시 보기</button></div>
 <p class="film-status" role="status" hidden></p>`;
 document.body.append(dialog);
 const video=dialog.querySelector('video'),status=dialog.querySelector('.film-status');
 let closed=false;
 function message(text){status.textContent=text;status.hidden=!text;}
 function start(){
  message('');
  void video.play().catch(error=>{
   if(!closed&&!video.error&&error.name!=='AbortError')message('영상의 재생 버튼을 눌러 줘.');
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

