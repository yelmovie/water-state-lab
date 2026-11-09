// 「방울이의 실험 노트」 공통 움직임 (films/SPEC.md MOTION). 모든 값은 타임라인 시간의 함수다.
window.kit=function(tl){
 const k={};
 // 방울이 자세 바뀜: 0.12 s 찌그러짐 → 새 자세 → 0.25 s 복귀(back.out 1.6)
 k.pose=(name,t)=>{
  tl.to('#bangul',{scaleY:.92,scaleX:1.05,duration:.12,ease:'power2.in'},t);
  tl.set('#bangul img',{opacity:0},t+.12);tl.set('#b-'+name,{opacity:1},t+.12);
  tl.to('#bangul',{scaleY:1,scaleX:1,duration:.25,ease:'back.out(1.6)'},t+.12);
 };
 k.enter=(sel,t,from)=>tl.fromTo(sel,{x:from?.x||0,y:from?.y||0,opacity:0},{x:0,y:0,opacity:1,duration:.5,ease:'expo.out'},t);
 k.leave=(sel,t,to)=>tl.to(sel,{x:to?.x||0,y:to?.y||0,opacity:0,duration:.3,ease:'power3.in'},t);
 // 말풍선·큰 줄: 낱말마다 0.08 s 간격으로 흐림 → 선명, 내려앉은 뒤에는 움직이지 않는다
 k.words=(sel,t,gap=.08)=>{tl.fromTo(sel+' .w',{opacity:0,filter:'blur(6px)'},{opacity:1,filter:'blur(0px)',duration:.13,stagger:gap,ease:'power2.out'},t);};
 k.bubble=(sel,t)=>{tl.fromTo(sel,{opacity:0,scale:.7},{opacity:1,scale:1,duration:.4,ease:'back.out(1.6)'},t);k.words(sel,t+.2);};
 // 이름표: 지시선이 먼저 0.2 s 그려지고, 카드가 0.3 s 튀어나옴
 k.tag=(sel,t)=>{tl.set(sel,{opacity:1},t);tl.fromTo(sel+' .lead',{scaleY:0},{scaleY:1,duration:.2,ease:'power2.out'},t);tl.fromTo(sel+' .card',{opacity:0,scale:.6},{opacity:1,scale:1,duration:.3,ease:'back.out(1.6)'},t+.2);};
 k.untag=(sel,t)=>tl.to(sel,{opacity:0,duration:.25,ease:'power3.in'},t);
 // 아래에서 위로 물이 드러남(같은 그림의 빈 것/찬 것 겹침)
 k.fill=(sel,t,d=1.4)=>tl.fromTo(sel,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:d,ease:'power1.inOut'},t);
 k.drain=(sel,t,d=1)=>tl.fromTo(sel,{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(100% 0% 0% 0%)',duration:d,ease:'power1.inOut'},t);
 // 점선 수증기: 위로 자라며 올라감(길이만 바뀜, 반짝임 없음)
 k.rise=(sel,t,d=1.2)=>tl.fromTo(sel,{opacity:0,scaleY:0},{opacity:1,scaleY:1,duration:d,ease:'power1.out',stagger:.18},t);
 return k;
};
// 낱말 나누기: data-words 가 있는 요소의 글자를 <span class="w"> 로 감싼다(렌더 전에 한 번, 시간과 무관)
document.querySelectorAll('[data-words]').forEach(e=>{e.innerHTML=e.innerHTML.split(/(<b>.*?<\/b>|\s+)/).filter(Boolean).map(p=>/^\s+$/.test(p)?' ':`<span class="w">${p}</span>`).join('');});
