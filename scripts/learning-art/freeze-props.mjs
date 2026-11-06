// Vector props for the freezing lesson. Run: SHARP_PATH=<sharp folder> node scripts/learning-art/freeze-props.mjs
// No words are baked in: labels stay live text so they can scale and be read aloud.
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)(process.env.SHARP_PATH||'sharp');
const out=fileURLToPath(new URL('../../public/assets/learning/',import.meta.url));
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const brass=`<linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="#8a5a16"/><stop offset=".18" stop-color="#e9bd57"/><stop offset=".36" stop-color="#fff0b8"/><stop offset=".58" stop-color="#d8a23d"/><stop offset="1" stop-color="#7c4f12"/></linearGradient>`;
const weight=svg(400,480,`<defs>${brass}<radialGradient id="k" cx=".38" cy=".3"><stop offset="0" stop-color="#fff3c2"/><stop offset=".5" stop-color="#deaa45"/><stop offset="1" stop-color="#83551a"/></radialGradient></defs>
<ellipse cx="200" cy="448" rx="150" ry="20" fill="#2b4a55" opacity=".18"/>
<rect x="60" y="176" width="280" height="262" rx="26" fill="url(#b)"/>
<ellipse cx="200" cy="178" rx="140" ry="30" fill="#f6d98a" stroke="#b98a2e" stroke-width="4"/>
<path d="M60 392q140 50 280 0" fill="none" stroke="#8f611d" stroke-width="5" opacity=".55"/>
<path d="M150 170q-6-40-30-58h160q-24 18-30 58z" fill="url(#b)"/>
<circle cx="200" cy="74" r="56" fill="url(#k)"/><ellipse cx="180" cy="52" rx="18" ry="11" fill="#fff" opacity=".7"/>
<rect x="104" y="214" width="24" height="196" rx="12" fill="#fff" opacity=".28"/>`);
// One pouch outline per state. The sealed ends stay the same size, so only the body changes.
const pouch=(frozen)=>{
 const body=frozen?'M112 74C70 150 56 260 62 366C66 452 84 520 112 566H208C236 520 254 452 258 366C264 260 250 150 208 74Z':'M116 74C112 150 138 214 128 296C120 366 96 450 112 566H208C206 460 228 372 216 296C206 214 214 150 204 74Z';
 const fill=frozen?body:'M126 200C136 240 134 262 128 296C120 366 96 450 112 566H208C206 460 228 372 216 296C210 258 208 232 212 200Q170 214 126 200Z';
 const crimp=y=>`<path d="M100 ${y}${Array.from({length:12},(_,i)=>`l10 ${i%2?-9:9}`).join('')}V${y+26}H100Z" fill="#fdf6e6" stroke="#c9a56b" stroke-width="3"/>`;
 return svg(320,640,`<defs><linearGradient id="p" x1="0" x2="1"><stop offset="0" stop-color="#ef8a3c"/><stop offset=".3" stop-color="#ffc27a"/><stop offset=".7" stop-color="#ffad5c"/><stop offset="1" stop-color="#df7428"/></linearGradient><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#f3a765"/><stop offset=".32" stop-color="#ffe2bb"/><stop offset=".7" stop-color="#ffcf99"/><stop offset="1" stop-color="#e88f4a"/></linearGradient></defs>
 <path d="${body}" fill="#fff8ea" fill-opacity=".72" stroke="#c98d4b" stroke-width="5"/>
 <path d="${fill}" fill="url(#${frozen?'f':'p'})"/>
 ${frozen?`<g stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".75" fill="none"><path d="M112 190l28 34-16 48M140 224l42-26 26 40"/><path d="M116 370l40 26 42-34M156 396l-8 60M198 362l18 54"/></g><path d="M96 120C80 200 74 300 80 380" stroke="#fff" stroke-width="12" stroke-linecap="round" fill="none" opacity=".6"/>`
 :`<g stroke="#b9682a" stroke-width="4" stroke-linecap="round" fill="none" opacity=".5"><path d="M140 110q14 20 4 44"/><path d="M186 96q-10 26 6 52"/><path d="M122 322q22 16 40 6"/><path d="M196 420q-18 10-30-4"/></g><path d="M150 214q34 12 58-2" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>`}
 ${crimp(50)}${crimp(562)}`);
};
const pipe=(burst)=>svg(760,420,`<defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7f88"/><stop offset=".18" stop-color="#d4dfe2"/><stop offset=".5" stop-color="#9cb0b6"/><stop offset="1" stop-color="#55686f"/></linearGradient><linearGradient id="i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f9ff"/><stop offset="1" stop-color="#a9def2"/></linearGradient><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fdcf2"/><stop offset="1" stop-color="#2a9fce"/></linearGradient></defs>
 <rect x="30" y="110" width="700" height="200" rx="22" fill="url(#m)"/>
 <rect x="30" y="146" width="700" height="128" fill="url(#${burst?'i':'w'})"/>
 ${[120,640].map(x=>`<rect x="${x-34}" y="92" width="68" height="236" rx="12" fill="url(#m)" stroke="#4b5d63" stroke-width="3"/>`).join('')}
 ${burst?`<g stroke="#fff" stroke-width="6" fill="none" opacity=".85" stroke-linecap="round"><path d="M200 170l50 40-30 44M250 210l70-30M420 160l-40 60 60 34M380 220l-50 30M560 180l-46 30 26 50"/></g>
 <path d="M318 112L340 92 356 108 380 78 398 104 424 90 446 112 382 150Z" fill="url(#i)" stroke="#6fb8d3" stroke-width="4"/>
 <path d="M382 110l-16 12 18 11-12 13" fill="none" stroke="#21383f" stroke-width="7" stroke-linejoin="round"/>
 <path d="M320 274l14 11-12 12 12 12M440 274l-12 11 12 12-9 12" fill="none" stroke="#21383f" stroke-width="6" stroke-linejoin="round"/>`
 :`<g fill="#fff" opacity=".5"><ellipse cx="240" cy="190" rx="42" ry="7"/><ellipse cx="470" cy="226" rx="56" ry="8"/></g>`}`);
const items=[['weight-100g',weight,320],['ice-pop-soft',pouch(false),320],['ice-pop-frozen',pouch(true),320],['pipe-water',pipe(false),760],['pipe-burst',pipe(true),760]];
for(const [name,source,width] of items){await sharp(Buffer.from(source)).resize({width}).webp({quality:90,alphaQuality:100}).toFile(path.join(out,name+'.webp'));console.log(name);}
