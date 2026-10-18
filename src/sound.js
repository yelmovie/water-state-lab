let context;
let enabled=true;
export function setSoundEnabled(value){
 enabled=value;
 if(!enabled&&context)context.suspend().catch(()=>{});
}
export function playClick(){return playCue('click');}
export async function playCue(kind='click'){
 if(!enabled)return;
 try{
  const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!AudioContext)return;
  context??=new AudioContext();
  if(context.state==='suspended')await context.resume();
  if(!enabled||context.state!=='running')return;
  const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
  oscillator.type='sine';const tones={click:[660,440],drop:[420,780],success:[523,1047],discover:[440,880],error:[270,180]};const [from,to]=tones[kind]||tones.click;oscillator.frequency.setValueAtTime(from,now);oscillator.frequency.exponentialRampToValueAtTime(to,now+.065);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.035,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.08);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(now);oscillator.stop(now+.09);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }catch{/* Audio availability must never block navigation. */}
}
