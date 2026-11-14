// Renders the intro/final story films from assets/source-media: grades the source clip, burns in NanumSquare Neo captions and
// motion graphics drawn frame by frame in headless Chrome, mixes the project's themes and effects, and writes public/assets/story/.
// Usage: PW_PATH=<path to playwright-core> node scripts/render-film.mjs [intro|final]   (FFMPEG_PATH overrides the ffmpeg binary)
import {spawn,spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';

const ffmpeg=process.env.FFMPEG_PATH||(existsSync('D:/DevCaches/tools/ffmpeg/bin/ffmpeg.exe')?'D:/DevCaches/tools/ffmpeg/bin/ffmpeg.exe':'ffmpeg');
if(!process.env.PW_PATH)throw Error('Set PW_PATH to a playwright-core folder; this project installs no dependencies.');
const {chromium}=createRequire(import.meta.url)(process.env.PW_PATH);
const FPS=30,SOURCE='assets/source-media',OUT='public/assets/story';
const GRADE='eq=contrast=1.05:saturation=1.1,vignette=angle=PI/5';
const films={
 intro:{
  // The source closes on an iris to black by 15.2s; the mission card plays after it.
  srcEnd:15.2,total:20.6,poster:2.2,
  grade:",colorbalance=rs=-.07:bs=.12:rm=-.04:bm=.07:enable='between(t,4.3,7.7)'",
  music:{file:'main-theme',from:0,volume:"if(lt(t,14.6),.3,.3+.2*min((t-14.6)/1.2,1))"},
  cues:[
   [1,3.6,'[물레]가 멈추고, 연구섬의 물길이 끊겼어!'],
   [4.4,7.4,'배관 속 물이 꽁꽁 언 [얼음]이 되어 막혀 있어!'],
   [7.9,10.6,'물은 왜 얼고, 마르고, 다시 맺힐까?'],
   [10.8,13.6,'네가 [관찰]한 [증거]로 물길을 되살려 줘!'],
   [16,17.6,'연구 기록 다섯 개를 모아 물길을 깨워요'],
   [18.4,20.6,'탐험 시작!']
  ],
  sfx:[['metalLatch',4.5,.5],['bubble_02',10.9,.3],...[0,1,2,3,4].map(i=>['drop_003',16.4+i*.24,.5]),['confirmation_002',18.4,.55]]
 },
 final:{
  // The source smears from 16.87s on, so motion stops at 16.8s and the celebration holds Bangul's biggest smile (12.4s).
  srcEnd:16.8,total:23.2,poster:21.2,hold:true,freezeFrom:12.4,grade:'',
  // The theme's last 23.2s: its closing phrase resolves as the film ends, and the ending screen then plays it from the top.
  music:{file:'ending-theme',from:44.4,volume:"if(lt(t,16.3),.26,.26+.2*min((t-16.3)/1.2,1))"},
  cues:[
   [.9,3.2,'차가운 판에 [물방울]이 맺혔어!'],
   [3.4,5.8,'공기 속 수증기가 물로 변한 거야.'],
   [6.6,9,'네가 고친 장치로 모은 물이'],
   [9.2,11.6,'[코어]까지 힘차게 흘러갔어!'],
   [12.1,14.4,'멈췄던 [물레]가 다시 돌아가!'],
   [14.6,16.7,'관찰하고, 비교하고, 고쳐서 해냈어!'],
   [17.5,20,'네 [증거]가 연구섬을 깨웠어!'],
   [20.3,23.2,'이제 나도 물 탐험 연구원!']
  ],
  sfx:[['bubble_02',1,.3],['confirmation_001',9.3,.5],['splash_09',12.1,.4],...[...Array(10).keys()].map(i=>['drop_003',12.6+i*.3,.42]),['metalLatch',17.3,.55],['confirmation_002',17.4,.55],...[...Array(10).keys()].map(i=>['drop_003',20.7+i*.12,.34])]
 }
};

const dataUrl=(path,type)=>`data:${type};base64,${readFileSync(path).toString('base64')}`;
function freezeFrame(film,t){
 mkdirSync('.tmp',{recursive:true});const file=`.tmp/${film}-hold.png`;
 const r=spawnSync(ffmpeg,['-y','-v','error','-ss',String(t),'-i',`${SOURCE}/video/${film}.mp4`,'-frames:v','1','-vf',GRADE,file]);
 if(r.status)throw Error(String(r.stderr));
 return file;
}

// Everything below this function runs in the page. t is seconds on the output timeline.
function overlayProgram(name,cues,total,freezeAt){
 const W=1920,H=1080,BAR=96;
 const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
 const img=id=>document.getElementById(id);
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const span=(t,a,b)=>clamp((t-a)/(b-a));
 const out=v=>1-Math.pow(1-v,3);
 const back=v=>{const c=1.70158;return 1+(c+1)*Math.pow(v-1,3)+c*Math.pow(v-1,2);};
 const rand=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const font=size=>`700 ${size}px NanumSquareNeo,"Malgun Gothic",sans-serif`;
 const bars=h=>{if(h<=0)return;g.fillStyle='#000';g.fillRect(0,0,W,h);g.fillRect(0,H-h,W,h);};
 function caption(t,a,b,text,y=H-BAR/2,size=50){
  const alpha=Math.min(span(t,a,a+.25),1-span(t,b-.25,b));if(alpha<=0)return;
  const parts=text.split(/(\[[^\]]+\])/).filter(Boolean).map(p=>p[0]==='['?[p.slice(1,-1),true]:[p,false]);
  g.save();g.globalAlpha=alpha;g.font=font(size);g.textBaseline='middle';
  const width=parts.reduce((s,[p])=>s+g.measureText(p).width,0);
  const lift=(1-out(span(t,a,a+.3)))*12,x0=(W-width)/2;
  g.fillStyle='rgba(6,28,48,.7)';g.beginPath();g.roundRect(x0-36,y-44+lift,width+72,84,42);g.fill();
  let x=x0;for(const [p,hot] of parts){g.fillStyle=hot?'#ffd35c':'#f4fbff';g.fillText(p,x,y+2+lift);x+=g.measureText(p).width;}
  g.restore();
 }
 function chip(t,a,b,text,color,blink=false,fill=0){
  const alpha=Math.min(span(t,a,a+.2),1-span(t,b-.2,b));if(alpha<=0)return;
  g.save();g.globalAlpha=alpha;g.font=font(36);g.textBaseline='middle';
  const w=g.measureText(text).width+92,x=(W-w)/2,y=BAR/2;
  g.fillStyle='rgba(6,28,48,.8)';g.strokeStyle=color;g.lineWidth=3;g.beginPath();g.roundRect(x,y-34,w,68,34);g.fill();
  if(fill>0){g.save();g.clip();g.globalAlpha=alpha*.35;g.fillStyle=color;g.fillRect(x,y-34,w*fill,68);g.restore();}
  g.stroke();
  if(!blink||Math.floor(t*5)%2===0){g.fillStyle=color;g.beginPath();g.arc(x+36,y,10,0,7);g.fill();}
  g.fillStyle='#f4fbff';g.fillText(text,x+60,y+2);g.restore();
 }
 function centered(text,y,size,color,alpha=1,scale=1,stroke){
  g.save();g.globalAlpha=alpha;g.translate(W/2,y);g.scale(scale,scale);g.font=font(size);g.textAlign='center';g.textBaseline='middle';
  if(stroke){g.lineJoin='round';g.lineWidth=size*.2;g.strokeStyle=stroke;g.strokeText(text,0,0);}
  g.fillStyle=color;g.fillText(text,0,0);g.restore();
 }
 function drop(x,y,r){
  const body=g.createLinearGradient(x,y-r*1.4,x,y+r);body.addColorStop(0,'#bff1ff');body.addColorStop(1,'#1f9fe6');
  g.fillStyle=body;g.strokeStyle='#fff8e7';g.lineWidth=Math.max(3,r*.1);
  g.beginPath();g.moveTo(x,y-r*1.45);g.bezierCurveTo(x+r*.25,y-r*.95,x+r,y-r*.45,x+r,y+r*.08);g.arc(x,y+r*.08,r,0,Math.PI);g.bezierCurveTo(x-r,y-r*.45,x-r*.25,y-r*.95,x,y-r*1.45);g.closePath();g.fill();g.stroke();
  g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(x-r*.36,y-r*.12,r*.16,r*.28,.5,0,7);g.fill();
 }
 function drops(t,start,step,y,count,r,gap){
  const row=(count-1)*(r*2+gap);
  for(let i=0;i<count;i++){
   const at=start+i*step,v=span(t,at,at+.35);if(v<=0)continue;
   const cx=(W-row)/2+i*(r*2+gap),ring=span(t,at,at+.55);
   if(ring<1){g.save();g.globalAlpha=(1-ring)*.8;g.strokeStyle='#ffd35c';g.lineWidth=6;g.beginPath();g.arc(cx,y,r*(1+ring*1.3),0,7);g.stroke();g.restore();}
   drop(cx,y,r*back(v));
  }
 }
 const bubbles=[...Array(46)].map((_,i)=>{const r=rand(i*97+11);return {x:r()*W,y:r()*H,s:3+r()*9,v:30+r()*70,p:r()*7};});
 const snow=[...Array(120)].map((_,i)=>{const r=rand(i*61+29);return {x:r()*W,y:r()*H,s:2+r()*5,v:60+r()*120,p:r()*7};});
 const sparks=[...Array(36)].map((_,i)=>{const r=rand(i*43+17);return {a:r()*6.28,v:60+r()*170,s:3+r()*6,d:r()*2.4,l:.9+r()*.9};});
 function intro(t){
  const opening=1-span(t,0,.7);
  bars(BAR*out(span(t,.2,1.3)));
  // Frozen pipe: dim everything but the blocked pipe, then let snow drift over it.
  const frozen=Math.min(span(t,4.3,4.9),1-span(t,7.1,7.7));
  if(frozen>0){
   const spot=g.createRadialGradient(640,500,380,640,500,1400);spot.addColorStop(0,'rgba(6,30,70,0)');spot.addColorStop(1,`rgba(6,30,70,${.62*frozen})`);g.fillStyle=spot;g.fillRect(0,0,W,H);
   for(const s of snow){const y=(s.y+t*s.v)%H,x=s.x+Math.sin(t+s.p)*26;g.globalAlpha=frozen*.75;g.fillStyle='#f2fbff';g.beginPath();g.arc(x,y,s.s,0,7);g.fill();}
   g.globalAlpha=1;
  }
  chip(t,4.4,7.5,'물길 정지 · 얼음 막힘','#6fd0ff',true);
  chip(t,10.8,13.6,'새 연구원 임무 도착!','#ffd35c');
  // Bangul's open hand passes the mission to the player.
  if(t>10.9&&t<13.7)for(const s of sparks){const age=(t-10.9-s.d+3)%3;if(age>s.l)continue;const k=age/s.l,d=s.v*age;g.globalAlpha=(1-k)*.9;g.fillStyle='#ffe58a';g.beginPath();g.arc(1170+Math.cos(s.a)*d,660+Math.sin(s.a)*d-age*age*40,s.s,0,7);g.fill();}
  g.globalAlpha=1;
  for(const [a,b,text] of cues.slice(0,4))caption(t,a,b,text);
  const card=span(t,15.1,15.7);
  if(card>0){
   g.save();g.globalAlpha=card;g.fillStyle='#062a4a';g.fillRect(0,0,W,H);
   const pulse=.5+.5*Math.sin(t*2.2),glow=g.createRadialGradient(W/2,430,40,W/2,430,860);
   glow.addColorStop(0,`rgba(70,190,255,${.34+pulse*.14})`);glow.addColorStop(1,'rgba(6,42,74,0)');g.fillStyle=glow;g.fillRect(0,0,W,H);
   for(const p of bubbles){const y=((p.y-t*p.v)%H+H)%H;g.globalAlpha=card*(.2+.4*Math.abs(Math.sin(t+p.p)));g.strokeStyle='#bfeaff';g.lineWidth=2;g.beginPath();g.arc(p.x,y,p.s,0,7);g.stroke();}
   g.restore();
   const logo=img('logo'),v=span(t,15.6,16.15);
   if(v>0){const h=400*back(v),w=h*logo.naturalWidth/logo.naturalHeight;g.save();g.globalAlpha=clamp(v*2);g.drawImage(logo,(W-w)/2,280-h/2,w,h);g.restore();}
   centered(cues[4][2],545,62,'#f4fbff',span(t,16,16.3));
   drops(t,16.4,.24,715,5,58,70);
   const go=span(t,18.4,18.8);if(go>0)centered(cues[5][2],905,120,'#ffd35c',clamp(go*2),back(go)*(1+.025*Math.sin((t-18.4)*5)),'#07365c');
  }
  const closing=span(t,total-.4,total),black=Math.max(opening,closing);
  if(black>0){g.fillStyle=`rgba(0,0,0,${black})`;g.fillRect(0,0,W,H);}
 }
 const CORE=[1270,480];
 const motes=[...Array(90)].map((_,i)=>{const r=rand(i*131+3);return {a:r()*6.28,v:90+r()*240,s:2+r()*6,d:r()*1.6,l:1.2+r()*1.4};});
 const confetti=[...Array(190)].map((_,i)=>{const r=rand(i*173+5);return {x:r()*W,vx:(r()-.5)*170,y:-40-r()*560,v:230+r()*260,w:10+r()*12,h:6+r()*9,spin:(r()-.5)*11,p:r()*7,c:['#ffd35c','#ff9db0','#7fe3ff','#4bb8f2','#fff3c4'][i%5],at:17.3+r()*1.1};});
 function final(t){
  const opening=1-span(t,0,.6);
  if(t>=freezeAt){
   const warm=g.createRadialGradient(W/2,120,60,W/2,120,1100);warm.addColorStop(0,`rgba(255,226,150,${.3*span(t,17.3,18.1)})`);warm.addColorStop(1,'rgba(255,226,150,0)');g.fillStyle=warm;g.fillRect(0,0,W,H);
  }
  bars(BAR*out(span(t,.2,1.2))*(1-out(span(t,16.5,17.3))));
  chip(t,6.8,11.6,`코어 복구 ${Math.round(100*span(t,7,9.3))}%`,'#7fe3ff',false,span(t,7,9.3));
  if(t>12.4&&t<15.8)chip(t,12.4,15.8,`실험 탐구 ${clamp(Math.floor((t-12.6)/.3)+1,1,10)}/10`,'#ffd35c');
  if(t>9.1&&t<10.8){
   const v=span(t,9.2,9.45),decay=1-span(t,9.45,10.7),power=Math.min(v,decay);
   const flash=g.createRadialGradient(CORE[0],CORE[1],20,CORE[0],CORE[1],1250);
   flash.addColorStop(0,`rgba(255,255,255,${.9*power})`);flash.addColorStop(.35,`rgba(150,230,255,${.5*power})`);flash.addColorStop(1,'rgba(120,220,255,0)');
   g.fillStyle=flash;g.fillRect(0,0,W,H);
   for(const delay of [0,.22]){const r=span(t,9.3+delay,10.3+delay);if(r>0&&r<1){g.save();g.globalAlpha=(1-r)*.75;g.strokeStyle='#dff6ff';g.lineWidth=14*(1-r)+2;g.beginPath();g.arc(CORE[0],CORE[1],90+r*900,0,7);g.stroke();g.restore();}}
  }
  if(t>9.3&&t<12.6)for(const m of motes){const age=t-9.3-m.d;if(age<0||age>m.l)continue;const k=age/m.l,d=m.v*age;g.globalAlpha=(1-k)*.9;g.fillStyle='#d6f5ff';g.beginPath();g.arc(CORE[0]+Math.cos(m.a)*d,CORE[1]+Math.sin(m.a)*d-age*age*30,m.s,0,7);g.fill();}
  g.globalAlpha=1;
  for(const [a,b,text] of cues.slice(0,7))caption(t,a,b,text,t>16.9?H-74:H-BAR/2);
  if(t>=17.3){
   for(const c of confetti){const age=t-c.at;if(age<0)continue;const y=c.y+c.v*age,x=c.x+c.vx*age+Math.sin(age*2+c.p)*34;if(y>H+30)continue;g.save();g.translate(x,y);g.rotate(c.p+age*c.spin);g.fillStyle=c.c;g.fillRect(-c.w/2,-c.h/2,c.w,c.h);g.restore();}
   const hit=span(t,17.3,17.52);
   g.save();g.translate(1540,190);g.rotate(-.1);const s=1+(1-out(hit))*1.5;g.scale(s,s);g.globalAlpha=clamp(hit*2.4);
   g.fillStyle='rgba(255,250,232,.96)';g.strokeStyle='#1f7fc4';g.lineWidth=9;g.beginPath();g.roundRect(-225,-68,450,136,26);g.fill();g.stroke();
   g.lineWidth=3;g.beginPath();g.roundRect(-211,-54,422,108,18);g.stroke();
   g.font=font(52);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#1f7fc4';g.fillText('물길 복구 완료',0,3);g.restore();
  }
  const finale=span(t,20.2,20.7);
  if(finale>0){
   const scrim=g.createLinearGradient(0,660,0,H);scrim.addColorStop(0,'rgba(6,42,74,0)');scrim.addColorStop(.45,`rgba(6,42,74,${.82*finale})`);scrim.addColorStop(1,`rgba(6,42,74,${.92*finale})`);g.fillStyle=scrim;g.fillRect(0,660,W,H-660);
   centered(cues[7][2],840,100,'#ffd35c',clamp(finale*2),back(finale),'#07365c');
   drops(t,20.7,.12,985,10,34,40);
  }
  if(opening>0){g.fillStyle=`rgba(0,0,0,${opening})`;g.fillRect(0,0,W,H);}
  const closing=span(t,total-.5,total);if(closing>0){g.fillStyle=`rgba(255,250,235,${closing})`;g.fillRect(0,0,W,H);}
 }
 window.drawFrame=t=>{g.clearRect(0,0,W,H);(name==='intro'?intro:final)(t);return canvas.toDataURL('image/png').slice(22);};
}

async function render(name){
 const film=films[name];mkdirSync(OUT,{recursive:true});
 const extra=film.total-film.srcEnd,frames=Math.round(film.total*FPS);
 const html=`<!doctype html><style>
 @font-face{font-family:NanumSquareNeo;src:url(${dataUrl('public/assets/fonts/NanumSquareNeoTTF-cBd.woff2','font/woff2')}) format('woff2');font-weight:700;font-style:normal}
 img{display:none}</style><canvas width="1920" height="1080"></canvas>
 <img id="logo" src="${dataUrl('public/assets/v2/title-logo.webp','image/webp')}">`;
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
 const browser=await chromium.launch({...(executablePath?{executablePath}:{channel:'chrome'}),headless:true,args:['--disable-crash-reporter','--disable-breakpad','--use-mock-keychain']});const page=await browser.newPage();
 await page.setContent(html,{waitUntil:'load'});
 await page.evaluate(async()=>{
  const [fonts]=await Promise.all([document.fonts.load('700 50px NanumSquareNeo','물길 1/5'),...[...document.images].map(i=>i.decode())]);
  if(!fonts.length||fonts.some(face=>face.status!=='loaded'))throw Error('NanumSquare Neo did not load');
 });
 await page.evaluate(`(${overlayProgram})(${JSON.stringify(name)},${JSON.stringify(film.cues)},${film.total},${film.srcEnd})`);

 // The hold is one fixed picture dissolved in here: a moving photo would change every pixel of every frame and triple the file size.
 const still=film.freezeFrom===undefined?[]:['-loop','1','-framerate',String(FPS),'-t',String(film.total),'-i',freezeFrame(name,film.freezeFrom)];
 const sounds=film.sfx.map(([file])=>['-i',`public/assets/audio/${file}.ogg`]).flat();
 const firstSound=still.length?4:3;
 const mix=film.sfx.map(([,at,gain],i)=>`[${i+firstSound}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${Math.round(at*1000)}:all=1,volume=${gain}[s${i}]`);
 const graph=[
  `[0:v]trim=end=${film.srcEnd},setpts=PTS-STARTPTS,fps=${FPS},${GRADE}${film.grade},tpad=stop_mode=${film.hold?'clone':'add'}:stop_duration=${extra}:color=black[${still.length?'clip':'base'}]`,
  ...(still.length?[`[3:v]format=yuva420p,fade=t=in:st=${film.srcEnd}:d=0.6:alpha=1[still]`,`[clip][still]overlay=0:0:eof_action=pass[base]`]:[]),
  `[1:v]scale=out_color_matrix=bt709,format=yuva420p[ui]`,
  `[base][ui]overlay=0:0:eof_action=endall,scale=1280:720,format=yuv420p[v]`,
  `[0:a]atrim=end=${film.srcEnd},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,volume=7dB[amb]`,
  `[2:a]aformat=sample_rates=44100:channel_layouts=stereo,volume='${film.music.volume}':eval=frame,afade=t=in:d=1.2[music]`,
  ...mix,
  `[amb][music]${film.sfx.map((_,i)=>`[s${i}]`).join('')}amix=inputs=${film.sfx.length+2}:normalize=0:duration=longest,alimiter=limit=0.7:level=0,apad,atrim=end=${film.total},afade=t=out:st=${film.total-.6}:d=0.6[a]`
 ].join(';');
 const encoder=spawn(ffmpeg,['-y','-hide_banner','-loglevel','error','-i',`${SOURCE}/video/${name}.mp4`,'-f','image2pipe','-framerate',String(FPS),'-c:v','png','-i','pipe:0','-ss',String(film.music.from),'-t',String(film.total),'-i',`${SOURCE}/audio/${film.music.file}.mp3`,...still,...sounds,'-filter_complex',graph,'-map','[v]','-map','[a]','-frames:v',String(frames),'-c:v','libx264','-preset','slow','-crf','24','-profile:v','high','-level','4.1','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','160k','-map_metadata','-1','-movflags','+faststart',`${OUT}/${name}.mp4`],{stdio:['pipe','inherit','inherit']});
 const done=new Promise((ok,fail)=>encoder.on('close',code=>code?fail(Error(`ffmpeg exited ${code}`)):ok()));
 for(let frame=0;frame<frames;frame++){
  const png=Buffer.from(await page.evaluate(t=>window.drawFrame(t),frame/FPS),'base64');
  if(!encoder.stdin.write(png))await new Promise(ok=>encoder.stdin.once('drain',ok));
  if(frame%150===0)console.log(`${name} ${frame}/${frames}`);
 }
 encoder.stdin.end();await done;

 const stamp=s=>{const m=Math.floor(s/60),r=(s%60).toFixed(3).padStart(6,'0');return `00:${String(m).padStart(2,'0')}:${r}`;};
 writeFileSync(`${OUT}/${name}.vtt`,`WEBVTT\n\n${film.cues.map(([a,b,text])=>`${stamp(a)} --> ${stamp(b)}\n${text.replace(/[[\]]/g,'')}`).join('\n\n')}\n`);
 // Chrome also encodes the poster, so FFmpeg builds without libwebp work.
 const poster=spawnSync(ffmpeg,['-v','error','-ss',String(film.poster),'-i',`${OUT}/${name}.mp4`,'-frames:v','1','-vf','scale=1280:-2','-f','image2pipe','-c:v','png','pipe:1'],{maxBuffer:16*1024*1024});
 if(poster.status){await browser.close();throw Error(String(poster.stderr));}
 const webp=await page.evaluate(async png=>{
  const picture=new Image();picture.src='data:image/png;base64,'+png;await picture.decode();
  const posterCanvas=document.createElement('canvas');posterCanvas.width=picture.width;posterCanvas.height=picture.height;
  posterCanvas.getContext('2d').drawImage(picture,0,0);
  return posterCanvas.toDataURL('image/webp',.8).split(',')[1];
 },poster.stdout.toString('base64'));
 writeFileSync(`${OUT}/${name}.webp`,Buffer.from(webp,'base64'));await browser.close();
}

for(const name of process.argv[2]?[process.argv[2]]:Object.keys(films))await render(name);
