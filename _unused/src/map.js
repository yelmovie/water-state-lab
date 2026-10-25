// A deliberately low-resolution isometric world. Only the stage map uses this view.
export const mapPoints=[{x:25,y:35},{x:66,y:27},{x:83,y:54},{x:54,y:77},{x:20,y:66}];
export function drawMap(canvas,completed,restored){
  const c=canvas.getContext('2d');canvas.width=640;canvas.height=400;c.imageSmoothingEnabled=false;
  const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
  const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
  const iso=(i,j)=>[320+(i-j)*24,55+(i+j)*12];
  const tile=(x,y,color)=>poly([[x,y],[x+24,y+12],[x,y+24],[x-24,y+12]],color);
  c.fillStyle='#d6eef1';c.fillRect(0,0,640,400);
  for(let i=0;i<70;i++){const x=(i*137+19)%640,y=(i*59+43)%400;rect(x,y,14,2,'#eaf9f7');rect(x+3,y+4,6,1,'#bce1e8');}
  // Raised island edges and grass tiles.
  for(let sum=0;sum<=20;sum++)for(let i=0;i<=10;i++){let j=sum-i;if(j<0||j>10)continue;let[x,y]=iso(i,j);if(i===10)poly([[x,y+24],[x+24,y+12],[x+24,y+34],[x,y+46]],'#6d9686');if(j===10)poly([[x-24,y+12],[x,y+24],[x,y+46],[x-24,y+34]],'#87ad93');tile(x,y,['#a8ccb0','#afd0b5','#bad5b7'][(i*7+j*3)%3]);if((i*9+j*7)%4===0){rect(x+4,y+10,2,4,'#76aa8b');rect(x+7,y+13,2,3,'#83b494');}}
  // Paths meeting at the core plaza.
  poly([[147,134],[161,126],[325,195],[491,155],[508,166],[329,218]],'#e8e3c5');
  poly([[174,251],[186,238],[329,201],[436,278],[422,290],[324,224]],'#e8e3c5');
  poly([[390,91],[406,100],[334,210],[316,204]],'#e8e3c5');
  for(let i=0;i<34;i++){let x=181+(i*31)%280,y=142+(i*29)%129;rect(x,y,6,2,'#c4caaa');}
  // Canal with visible restoration per mission.
  const nodes=[[161,140],[422,108],[531,216],[346,308],[128,264]];
  nodes.forEach(([x,y],i)=>{poly([[x,y],[x+5,y-4],[325,211],[319,216]],completed.includes(i+1)?'#4eacc1':'#90aaa5');if(completed.includes(i+1)){for(let k=1;k<7;k++){let t=k/7;rect(x+(320-x)*t,y+(213-y)*t,5,2,'#b3f1ea');}}});
  const tree=(x,y,s=1)=>{rect(x-2,y-1,4,13,'#8b8967');poly([[x,y-36*s],[x+16*s,y-12],[x+11*s,y-12],[x+20*s,y+2],[x-20*s,y+2],[x-12*s,y-12],[x-17*s,y-12]],'#598f7e');poly([[x,y-36*s],[x+3,y-9],[x-15*s,y-5],[x-10*s,y-16]],'#81b194');rect(x-7,y-7,6,3,'#95c2a0');};
  [[84,183],[121,199],[240,90],[276,67],[477,127],[540,180],[498,269],[448,309],[259,323],[224,304],[84,230]].forEach(([x,y],i)=>tree(x,y,.7+i%3*.15));
  const building=(x,y,i)=>{const live=completed.includes(i+1),colors=['#56b3b9','#799cd2','#d4a261','#ab91c6','#69a890'],col=colors[i];
    poly([[x-49,y+12],[x,y-11],[x+57,y+13],[x+5,y+40]],'#89a896');
    poly([[x-39,y-14],[x,y+4],[x,y+29],[x-39,y+11]],'#d9e8dd');poly([[x,y+4],[x+40,y-15],[x+40,y+10],[x,y+29]],'#aac8c4');
    poly([[x-45,y-17],[x,y-40],[x+46,y-17],[x,y+6]],col);poly([[x-42,y-20],[x,y-53],[x+44,y-20],[x,y+1]],col);
    poly([[x-42,y-20],[x,y-53],[x,y-3]],'#ffffff35');
    rect(x-27,y-5,12,15,live?'#fff5b5':'#598998');rect(x+11,y-5,11,16,live?'#c8fcf1':'#588592');rect(x-5,y+8,10,18,'#38667a');
    rect(x-2,y-67,3,20,'#f3e8be');rect(x+1,y-67,17,9,col);rect(x+1,y-66,11,2,'#ffffff70');
    if(i===1){poly([[x-31,y-28],[x-26,y-49],[x-15,y-29]],'#ddf9ff');rect(x+17,y-40,8,19,'#cee9ef');}
    if(i===2){rect(x+17,y-53,11,27,'#a77e58');rect(x+15,y-55,15,5,'#dcba82');}
    if(i===3){rect(x-32,y-21,10,21,'#a8e4e6');rect(x-30,y-18,3,15,'#e4fcf6');}
    if(i===4){rect(x+24,y,16,12,'#b09261');rect(x+27,y+2,9,3,'#e6d3a5');}
  };
  nodes.forEach(([x,y],i)=>building(x,y,i));
  // Central core, shown as an observatory rather than a sixth mission.
  poly([[274,208],[320,183],[369,208],[321,235]],'#b7cbd0');poly([[282,205],[320,186],[358,205],[320,224]],'#f0e9d0');
  rect(307,171,27,38,'#658b9c');rect(312,167,17,35,restored?'#85f0e1':'#a7d0dc');rect(313,166,5,34,'#d7f5ef');
  poly([[298,172],[320,134],[343,172],[320,185]],restored?'#55c9d5':'#78a8c5');poly([[298,172],[320,134],[320,179]],'#b9e8ea');
  rect(304,206,33,6,'#d3b977');rect(292,212,55,4,'#719399');
  // Foreground garden lights and flower pixels.
  for(let i=0;i<21;i++){const x=175+(i*67)%280,y=274+(i*13)%43;rect(x,y,2,5,'#689f7b');rect(x-2,y-2,5,3,i%2?'#f0d596':'#f4ebe1');}
}
