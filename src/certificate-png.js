// 인증서 PNG 저장(2026-11-22). 화면의 인증서 종이를 그대로 캔버스에 옮긴다: 테두리 그림, 글자(낱말마다 화면 위치),
// 빈칸 밑줄, 도장. 새 의존성 없이 화면 배치를 읽어 그리므로 화면·PNG 모양이 같다. 긴 변 2400px, A4 가로 비율.
const W = 2400, H = Math.round(2400 * 210 / 297);

function svgImage(svg, color) {
  const copy = svg.cloneNode(true);
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('color', color); copy.style.color = color;
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy));
  return img.decode().then(() => img);
}

function drawText(ctx, node, box, s) {
  const el = node.parentElement, cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none') return;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * s}px ${cs.fontFamily}`;
  ctx.fillStyle = cs.color; ctx.textBaseline = 'middle';
  const outline = parseFloat(cs.getPropertyValue('-webkit-text-stroke-width')) || 0;
  if (outline) { ctx.lineWidth = outline * s; ctx.strokeStyle = cs.getPropertyValue('-webkit-text-stroke-color') || cs.color; }
  if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : `${parseFloat(cs.letterSpacing) * s}px`;
  const text = node.textContent, range = document.createRange();
  // 낱말마다 화면의 줄 상자를 읽어 같은 자리에 쓴다(줄바꿈·가운데 정렬이 화면과 같아진다).
  for (const m of text.matchAll(/\S+/g)) {
    range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
    const r = [...range.getClientRects()].find(x => x.width > 0);
    if (r) {
      const x = (r.left - box.left) * s, y = (r.top - box.top + r.height / 2) * s;
      if (outline) ctx.strokeText(m[0], x, y);
      ctx.fillText(m[0], x, y);
    }
  }
}

export async function saveCertificatePng(paper, fileName = '물방울-연구원-인증서.png') {
  await document.fonts?.ready;
  // 등장 연출(종이 올라옴·도장 찍힘) 중이면 끝난 모습으로 맞춘 뒤 잰다.
  for (const an of paper.getAnimations({ subtree: true })) an.finish();
  const box = paper.getBoundingClientRect(), s = W / box.width;
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const frame = paper.querySelector('.cert-frame');
  if (!frame.complete) await frame.decode();
  ctx.drawImage(frame, 0, 0, W, H);
  // 도장: 동그라미 바탕과 테두리
  for (const el of paper.querySelectorAll('.cert-stamp')) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el), cx = (r.left - box.left + r.width / 2) * s, cy = (r.top - box.top + r.height / 2) * s;
    ctx.save(); ctx.translate(cx, cy);
    ctx.beginPath(); ctx.arc(0, 0, r.width / 2 * s * 0.98, 0, Math.PI * 2); ctx.fillStyle = cs.backgroundColor; ctx.fill();
    ctx.lineWidth = parseFloat(cs.borderTopWidth) * s; ctx.strokeStyle = cs.borderTopColor; ctx.stroke();
    ctx.restore();
  }
  // 빈칸 밑줄
  for (const el of paper.querySelectorAll('.cert-blank')) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el), y = (r.bottom - box.top) * s;
    ctx.strokeStyle = cs.borderBottomColor; ctx.lineWidth = Math.max(1, parseFloat(cs.borderBottomWidth) * s);
    ctx.beginPath(); ctx.moveTo((r.left - box.left) * s, y); ctx.lineTo((r.right - box.left) * s, y); ctx.stroke();
  }
  // 아이콘(도장 속 잎)
  for (const svg of paper.querySelectorAll('.cert-content svg')) {
    const r = svg.getBoundingClientRect(), img = await svgImage(svg, getComputedStyle(svg).color);
    ctx.drawImage(img, (r.left - box.left) * s, (r.top - box.top) * s, r.width * s, r.height * s);
  }
  // 글자
  const walker = document.createTreeWalker(paper.querySelector('.cert-content'), NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim()) drawText(ctx, n, box, s);
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = fileName; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { width: W, height: H, bytes: blob.size };
}
