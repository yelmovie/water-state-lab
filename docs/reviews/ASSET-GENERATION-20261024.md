# 실험 소품·연구섬 지도 생성 기록

2026-10-24 · 물방울 연구실. 단순 도형으로 표현하던 중요한 실험 기구 3종과 사용자가 별도로 요청한 초기 지도 1종을 새로 생성해 적용했다. 아래에는 실제 프로젝트에 적용한 4개 결과만 기록한다.

## 생성·보관 방식

- 생성 도구: 내장 OpenAI `image_gen`. 별도 API·CLI 생성 경로를 사용하지 않았다.
- 각 결과는 개별 이미지 생성 요청으로 만들었다. 소품 3종에는 `transparent_background: true`, 지도에는 `transparent_background: false`를 지정했다. 이 4개 요청에는 별도 참조 이미지 경로를 전달하지 않았다.
- 생성 원본 PNG는 `image/generated-learning/`에 보존하고 실행용 WebP를 `public/assets/`에 저장했다. 소품은 생성된 알파 채널을 그대로 유지했다. 알파값 40 초과인 영역의 경계로 바깥 투명 여백만 잘랐으며, 남은 픽셀의 알파를 흰색이나 단색으로 바꾸지 않았다.
- WebP 내보내기 설정은 Pillow `quality=90`, `method=4`다. 지도는 생성 출력 크기를 유지해 변환했다.
- 프롬프트에서 요청한 캔버스 크기와 실제 생성·내보내기 크기는 다르다. 아래 표는 실제 파일을 읽어 측정한 값이다.

## 최종 파일과 적용 위치

| 대상 | 생성 원본 PNG | 실행용 WebP | 실제 실행 크기 | 실행 용량 | 적용 |
|---|---|---|---|---:|---|
| 전자저울 | `image/generated-learning/scale.png` · 1774×887 | `public/assets/learning/scale.webp` | 1735×559 · RGBA | 118,286 B | 3단계 얼리기 전후 무게 비교 실험·현장 의뢰 |
| 관찰 탱크 테두리 | `image/generated-learning/tank-frame.png` · 1122×1402 | `public/assets/learning/tank-frame.webp` | 1004×1292 · RGBA | 122,538 B | 4단계 물높이와 얼음이 차지할 공간 비교 실험·현장 의뢰 |
| 응결 금속판 | `image/generated-learning/condenser-plate.png` · 1774×887 | `public/assets/learning/condenser-plate.webp` | 1699×366 · RGBA | 131,852 B | 8단계 현장 의뢰의 냉각판·응결·물 모으기 |
| 연구섬 지도 | `image/generated-learning/research-island-v4.png` · 1672×941 | `public/assets/v2/research-island-v4.webp` | 1672×941 · RGB | 626,736 B | 시작·연구섬 화면의 5개 탐험 구역 |

실행용 4개 파일 합계는 **999,412 B**다. 원본 PNG는 재작업용이며 실행용 WebP와 별도로 보존한다.

소품을 연결하는 코드는 `src/phaser-scenes.js`와 `src/fieldwork.js`, 지도 이미지를 연결하는 코드는 `src/journey.js`다. 지도 보행 좌표는 `src/scene-model.js`에서 별도로 다룬다. 저울의 측정값, 탱크의 물높이·눈금·얼음 변화, 금속판 아래의 물방울은 이미지에 고정하지 않고 학습 상태에 따라 동적으로 표시한다. 기능 아이콘·글자·버튼과 정확한 입력 영역도 코드로 유지한다.

## 파일 검증과 확인 범위

- 최종 소품 3개는 RGBA이며 알파 범위가 각각 0–255다. `tank-frame.webp`의 중앙 좌표 알파값은 0으로 확인했다. 지도는 RGB 불투명 이미지다.
- 지도 v4는 로컬 소스 서버에서 1280×800, 768×1024, 375×812 크기로 로드했다. 세 크기 모두 이미지 고유 크기 1672×941, `display: block`, `opacity: 1`, 이미지와 지도 컨테이너 경계 일치를 확인했다. 페이지 가로 넘침과 실행 오류는 없었다. 375px에서는 기존 지도 내부 가로 탐색을 유지한다.
- 1280×800·768×1024 지도 캡처를 직접 확인했다. 이 지도 확인만으로 소품의 모든 실험 상태나 실제 태블릿 조작까지 검증했다고 판단하지 않는다. 전체 상호작용·통합 검증은 별도 최종 검토 기록을 따른다.
- 생성 도구의 계정 요금제, 특정 모델 식별자, 생성물의 법적 권리 범위는 이 기록에서 확인하지 않았으며 추정하지 않는다. 기존 출처·라이선스 기록은 `public/assets/CREDITS.md`에 보존한다.

## 최종 생성 프롬프트 원문

아래는 실제 내장 도구 호출에 전달한 영문 프롬프트 원문이다. 요청된 숫자·비율은 생성 지시이며 최종 파일의 실제 크기를 뜻하지 않는다.

### 전자저울 · `scale.png`

`transparent_background: true`

```text
Create ONE isolated game sprite: a real scientific electronic weighing scale, not an icon or flat vector. Transparent background with real alpha. Refined illustrated 3D children's science-adventure art for ages 9-12, polished silver steel weighing platform over a compact deep-teal base, warm brass edge accents, physically believable materials and tactile volume. Front view, shallow slightly elevated angle, very wide low profile, top weighing pan horizontal and empty. Body centered, approximately 90% of image width and 55% height. One large EMPTY pale ivory rectangular LCD window on the front, dead center, no digits, no markings, no words. Four small sturdy feet. High clarity at small screen size. No vessel on top, no water, no shadows outside the sprite, no ground, no backdrop, no scenery, no border, no extra props. 2:1 landscape canvas, 1024x512. Single apparatus only, no collage. This replaces a primitive CSS/Canvas rectangle in an actual interactive mass-measurement experiment; exact measured numeric text will be drawn by code.
```

### 관찰 탱크 테두리 · `tank-frame.png`

`transparent_background: true`

```text
Create ONE isolated orthographic scientific game sprite with truly transparent background AND truly transparent central window. A tall empty rectangular glass observation tank frame viewed straight on. Premium illustrated 3D materials: thin pale aqua glass side edges, subtle silver metal corners, tiny warm brass clips, transparent glass rim at top, thin sturdy pale-teal base. This is an OUTER FRAME only, like a window cutout: central rectangle from 10% to 90% width, 10% to 90% height must be COMPLETELY transparent alpha, not white, not tinted, not checkerboard. All rendered material is restricted to the narrow perimeter. Body extends from 4% to96% width and4% to96% height. 4:5 portrait canvas 1024x1280. No perspective taper, no water, no ice, no numbers, no markings, no gradients or fill across the central opening, no background, no floor or shadow, no lettering. Single object, not a collage. It will overlay animated water and freezing expansion drawn accurately by program code, so the middle must be perfectly clear. Elegant scientific apparatus for an ages9-12 educational game, not flat vector.
```

### 응결 금속판 · `condenser-plate.png`

`transparent_background: true`

```text
Create ONE isolated transparent game sprite of a metallic CONDENSATION PLATE. A broad horizontal polished aluminum cooling plate with a thin turquoise rim, four tiny brass corner fasteners, softly rounded corners, slight isometric depth but mostly front-facing so the bottom edge is horizontal. Premium hand-painted 3D science-adventure illustration, smooth believable cool metal, clear object silhouette. A compact row of aluminum cooling fins is visible just beneath the slab but does not protrude much. The plate is empty and DRY. It will be placed above a collecting bowl and water droplets will be animated by code BELOW it, so do not draw droplets, water, ice, steam, tubes, a bowl, stand legs, arrows, text, symbols, or a surrounding scene. Horizontal 2:1 canvas 1024x512, plate fills85% width and35%height at canvas center, real alpha background, no ground shadow. Single practical scientific object, not a UI button or icon.
```

### 연구섬 지도 · `research-island-v4.png`

`transparent_background: false`

```text
Create ONE cohesive 16:9 landscape fantasy science-adventure island MAP BACKGROUND for a polished Korean elementary science tablet game about water changing state. This is an actual game background, not a UI mockup. No text, no labels, no buttons, no numbers, no border, no characters. Rich hand-painted storybook game art with luminous turquoise sea, warm ivory stone, sage green plants, teal glass and muted brass laboratory details. Clear large silhouettes, charming and believable, sophisticated rather than babyish. Camera high three-quarter isometric overlook, an entire connected island fully visible, generous calm pale-blue sky across top 12% and sandy shoreline foreground bottom 12% for separately rendered UI. Five distinct science landmarks must be positioned at EXACT approximate normalized centers to align with the existing tappable map: (1) x21%,y65% a small spring pavilion with transparent bowls and a still circular water basin; (2) x30.6%,y29.7% an icy bridge and compact crystal-glass freezing lab on snow, broken water channel with small ice blocks, visually distinct; (3) x51.5%,y57.2% a warm sunny open courtyard with wet cloths hanging, two dark drawing slates and gentle brass heater; (4) x68%,y29% a cool dew garden greenhouse with a blue chilled cylinder, leaves with dewdrops and narrow shaded garden canal; (5) x84%,y59.5% a practical water-collection workshop with sloped silver condenser panel, funnel, copper pipe and wooden waterwheel. A single broad warm sand footpath connects landmark1 to2 to3 to4 to5 with gentle clear bends and small bridges. Narrow turquoise waterways connect districts but a few small dry/broken canal sections suggest a repair adventure; no disaster or scary elements. Main path and ground around landmarks spacious enough for game markers. Visual hierarchy focus on five learning areas, avoid tiny clutter, overcrowding, castles and decorative machinery unrelated to water. Texture like polished illustrated adventure game environment. ONE continuous scene fills entire frame. Output landscape 16:9.
```
