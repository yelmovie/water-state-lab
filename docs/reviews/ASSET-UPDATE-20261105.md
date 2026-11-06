# 2026-11-05 실험 도구와 물 표현 이미지

Codex 내장 ImageGen으로 생성했다. 원본은 외장 SSD의 이 프로젝트 `.tmp/visual-qa/generated-originals/`에 보관했다. 투명도는 유지하고 WebP로 줄여 사용한다. 수위, 기포의 위치, 응결 전후, 시간 변화는 코드가 결정한다.

## 가열판

- 사용본: `public/assets/learning/heat-plate-guide.webp`

> Use case: scientific-educational. Create one standalone transparent-background game object: a child-friendly electric lab hot plate for a fourth-grade Korean water science game. Single compact, stable rounded enamel unit, cool teal base, dark gray flat circular ceramic heating surface with a restrained amber ring inset into the plate, and one large clearly visible orange adjustment knob on the front. Front-facing with a little top visible, centered at a believable angle, entire silhouette with 12% clear margin. Clean hand-painted 2.5D storybook game art, crisp legible shapes at small screen size, neutral daylight, materials have gentle texture and simple dimensional shading. Isolated actual alpha background; do not add any floor, scenery, glass or water, open flame, steam, text, letters, numbers, logo, watermark, character, sprite sheet, or extra props.

## 물방울이 맺힌 냉각판

- 사용본: `public/assets/learning/cold-plate-guide.webp`

> Use case: scientific-educational. One standalone transparent-background game object: a small cold condensation collector used to show children how water droplets form. It is a single brushed silver rectangular metal panel with rounded corners, tilted slightly forward on a simple teal bracket, front face flat and entirely visible, with three to five small clear beads of water on the lower half, crisp at small size. This is a child-friendly 2.5D hand-painted game prop matching a bright Korean elementary adventure, neutral daylight, material shading, minimal uncluttered shape. Centered front three-quarter view, entire object with margin, actual alpha background. No fog or mist (water vapor is invisible), no rain, no glass, no separate objects, no complex pipes, no labels, no letters, no numbers, no logo, no watermark, no scenery, no sprite sheet.

## 물 질감

- 사용본: `public/assets/learning/water-material.webp`

> Use case: scientific-educational. Make one continuous watercolor material texture of shallow clear turquoise water for a bright fourth-grade Korean science adventure game. Entire image edge-to-edge is a close-up, restrained aqua water material with fine luminous caustic threads, smooth pale cyan ripples and small bright refractions, neutral daylight, gently hand-painted 2.5D storybook aesthetic, enough contrast to read at small sizes but calm enough behind water-height marks. Uniform square tile-like composition, no waterline, shore, container, background scenery, isolated shapes, outlines, bubble or steam symbols, gradients into blank borders, text, labels, or watermark. It will be clipped by live water masks to show the actual water level.

## 응결 전 마른 냉각판

- 사용본: `public/assets/learning/cold-plate-dry.webp`
- 원본: `.tmp/visual-qa/generated-originals/cold-plate-dry.png`
- 물방울이 맺힌 판의 원본을 참조해 같은 조명과 구도로 물방울만 제거했다. 2·8·10장 현장 의뢰의 응결 전후 비교에 사용한다.

> Precisely edit the provided transparent game asset in place. Make a DRY BEFORE state of this exact condensation experiment panel: remove only the little visible beads and streaks of water on the front metal surface. Patch these tiny spots using the adjacent brushed silver texture and lighting. Preserve exact framing, position and scale, all edges and silhouette, teal stand, perspective, material, lighting, opacity, and the original transparent alpha background. The clean panel should register against the supplied wet panel in a before/after comparison. No text, no extra elements, no background.
