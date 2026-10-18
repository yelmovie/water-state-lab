# 장비 아틀라스 생성 기록 — 2026-10-15

이 문서는 장비 아틀라스 한 장만 기록한다. 지도·캐릭터 생성 기록과 구현 검증은 포함하지 않는다.

## 결과 파일

- 원본: `public/assets/v2/equipment-atlas.png` — 1,121,993 bytes.
- 서비스용: `public/assets/v2/equipment-atlas.webp` — 779,766 bytes, lossless WebP.
- 1254 × 1254 px, RGBA, 실제 alpha 포함. 완전 투명 픽셀 987,256개.
- 내장 `image_gen` 사용, `transparent_background: true`. 외부 API/CLI 사용 없음.
- 내장 생성 도구의 기본 보관본을 D: 프로젝트에 복사했다. C: 보관본은 삭제하지 않았다.
- 생성 원본: `C:/Users/bongb/.codex/generated_images/01a13fa3-8fcc-7f81-b8a9-ee876b251657/exec-260f9020-ecfb-43a5-a6d4-4b74d09d6543.png`.
- 포맷 최적화에만 기존 설치된 sharp를 사용했다. 그림의 구성·픽셀 편집은 하지 않았다.

## 셀 배치

정확한 균등 셀 크기는 418 × 418 px다. 아래 경계는 alpha > 128 픽셀 기준, 이미지 좌상단 원점의 절대 좌표다. 낮은 alpha의 부드러운 가장자리는 이 범위를 벗어날 수 있다.

| 셀 | 물체 | CSS 배경 위치 | 가시 영역 x1,y1–x2,y2 |
|---|---|---|---|
| 1 | 빈 투명 비커 | 0% 0% | 87,64–337,376 |
| 2 | 기울인 물 주전자 | 50% 0% | 486,62–792,371 |
| 3 | 얼음 세 조각 | 100% 0% | 911,107–1191,359 |
| 4 | 분홍색 수건 | 0% 50% | 48,517–381,759 |
| 5 | 밀봉된 은색 캔 | 50% 50% | 533,455–718,787 |
| 6 | 파란 냉각팩 | 100% 50% | 933,467–1173,785 |
| 7 | 숫자 없는 온도계 | 0% 100% | 158,845–278,1194 |
| 8 | 돋보기 | 50% 100% | 480,855–784,1194 |
| 9 | 시든 새싹 화분 | 100% 100% | 937,872–1170,1190 |

CSS 사용 시 정사각형 요소에 `background-size: 300% 300%`와 위 위치를 적용한다. 아틀라스 자체를 9개 파일로 분할하지 않았다.

## 확인한 내용과 한계

- 생성 PNG와 WebP를 `view_image`로 직접 확인했다. 요청한 9종 물체의 순서·개수·전체 형상·서로 분리된 배치를 확인했다.
- 주요 물체의 셀 넘침이나 잘림은 없다. 모든 셀의 15% 여백 요청은 정확히 충족하지 않았고, 일부 가장자리는 약 9~14%다.
- 최초 손실 WebP 시안은 가장자리 색 손실이 보여 같은 출력 경로를 lossless WebP로 교체했다.
- 최종 PNG/WebP raw 비교 결과 alpha 차이 픽셀 0개, alpha > 0인 영역 RGB 차이 픽셀 0개다.
- 게임 화면 적용·드래그 조작·실제 배경 위 가독성은 이 생성 lane에서 검증하지 않았다.

## 최종 생성 프롬프트

```text
Use case: scientific-educational. Asset type: one unified square 3-by-3 game equipment sprite atlas for a children's water science adventure. Generate a SINGLE square image with a genuinely transparent alpha background. The atlas is divided into EXACTLY 3 equal columns and 3 equal rows, no visible gridlines. Each of the 9 equal square cells contains exactly ONE centered complete object with generous transparent margin of at least 15% on all four sides. Objects must never cross their cell boundaries, touch, overlap, or be cropped. Identical high-quality friendly toy-like 3D rendering, soft bright studio lighting, readable large silhouettes, sky-blue and ivory palette with subtle warm gold accents, smooth ceramic and clear glass materials, consistent elevated three-quarter camera angle. Row 1 from left to right: (1) one empty clear glass laboratory beaker with a subtle cyan rim, no numeric markings; (2) one tilted clear pouring jug with pale blue water visible inside, spout facing down-right but no water stream outside; (3) a compact cluster of exactly three translucent pale blue ice cubes. Row 2 from left to right: (4) one softly folded pink cleaning cloth; (5) one plain sealed cylindrical silver can with pale cyan highlight, no logo and no droplets on it; (6) one compact rectangular blue gel ice pack with rounded edges and a small capped neck. Row 3 from left to right: (7) one simple upright analog thermometer, white casing, cyan edges, red liquid bulb and stem, no digits or text; (8) one magnifying glass with clear lens and a cyan-and-ivory handle; (9) one small drooping seedling with two soft green leaves in an ivory ceramic planter. No extra objects, no labels, no text, no numbers, no UI, no border, no backdrop, no white or checkerboard background. Transparent only outside the objects, clean alpha edges. Each item has the same approximate visual footprint within its own grid cell. This is a production sprite atlas for CSS cropping, so exact equal-cell 3x3 organization and centered objects are critical.
```
