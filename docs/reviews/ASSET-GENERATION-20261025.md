# 구역별 에셋 생성 기록 · 2026-10-25

도구: 내장 OpenAI image_gen. 원본은 image/generated-stage-experience/에 보관하고 실행에는 WebP를 사용한다. 새 캐릭터·지도·문항을 만들지 않았다. 그림 안에 학습 수치·문구·정답을 고정하지 않았다.

| 실행 파일 | 크기 | 바이트 | 알파 |
|---|---|---:|---|
| dew-greenhouse.webp | 1672×941 | 322248 | 불투명 |
| drink-bottle.webp | 1024×1536 | 656428 | 보존 |
| spring-terrace.webp | 1672×941 | 337628 | 불투명 |
| sun-courtyard.webp | 1672×941 | 269040 | 불투명 |
| water-search.webp | 1672×941 | 420830 | 불투명 |
| winter-waterworks.webp | 1672×941 | 405832 | 불투명 |

## 제작 의도 요약

- spring-terrace: 물가의 밝은 석조 탐구 공간. 1·2장 샘터 배경.
- winter-waterworks: 겨울 물길·얼음 다리의 빈 관찰 공간. 3·4장.
- sun-courtyard: 따뜻한 햇살·돌바닥의 물그림 탐구 마당. 5·6장.
- dew-greenhouse: 차가운 색의 유리 온실·가장자리 식물과 이슬. 7·8장.
- water-search: 단일 정원 안의 여섯 생활 장면. 처음 생성된 서리·빗물·바닥 자국을 기존 문항과 맞게 냉동실 얼음·화분 물주기·마르는 천으로 수정했다. 최종 원본은 water-search-corrected.png, 첫 생성본도 유지.
- drink-bottle: 투명 배경의 파란 뚜껑 음료병. 컵 실험과 다른 생활 장면에 적용. 물방울과 조건 표시는 코드로 겹쳐 그린다.

위 항목은 최초 제작 의도 요약이며, 최초 프롬프트의 축자 기록으로 주장하지 않는다.

## 생활 장면 최종 수정 프롬프트 원문

```text
Edit this single coherent 16:9 painterly science-adventure garden illustration. Preserve its composition, warm sunlight, Mediterranean island setting, perspective and all six clearly separated specimen positions. Make exactly these three educational prop corrections: upper right drying wet patch must instead be a simple damp cream cloth lying flat on the stone, drying naturally, with no steam or visible gas; lower left frost-glass panel must instead be a small open countertop freezer containing unmistakable solid ice cubes, no snowflakes in air; lower center raindrop-glass panel must instead be a healthy leafy potted plant being watered by a small tilted transparent watering jug, a few clear liquid streams. Keep the upper left bowl of solid ice cubes, upper center clear water pitcher, and lower right drying blue laundry. No people, characters, text, letters, labels, numbers, symbols, UI, arrows, vapor clouds or collage borders. Keep each prop fully visible and isolated in its current approximate position.
```

참조 이미지: 최초 water-search 생성본. 수정 출력은 육안 확인 후 WebP로 변환했다. 파일별 SHA-256은 STAGE-ASSETS-20261025.json에 보관한다. 권리·계정 요금제에 관한 별도 보장은 하지 않는다.


## 최종점검 고도화 생성분 (2026-10-25 오후)

- 도구: Higgsfield `gpt_image_2_5` (quality high, resolution 2k). 한 장당 2.75크레딧, 8장 22크레딧. 동시 요청은 속도 제한(429)으로 실패해 한 장씩 다시 보냈다. 실패 요청은 과금되지 않았다.
- 화풍 참고 이미지: 기존 `stages/spring-terrace`, `winter-waterworks`, `sun-courtyard`, `dew-greenhouse`, `v2/lab-workshop`, `v2/equipment-atlas`를 JPG로 줄여 업로드했다.
- 원본 PNG: `image/generated-20261025/` (2688×1520 배경 5장, 투명 PNG 3장). 실행본은 PIL로 줄이고 투명 여백을 잘라 WebP로 저장했다. 가열판은 손잡이 아래를 잘라 윗면·금테만 쓴다.

| 실행 파일 | 크기 | SHA-256 앞 16자 |
|---|---:|---|
| `public/assets/stages/field-spring.webp` | 230,458 B | `59e5cf8feb56f7e4…` |
| `public/assets/stages/field-winter.webp` | 168,062 B | `e502918fb4b5cb47…` |
| `public/assets/stages/field-sun.webp` | 155,440 B | `52c9b450090112c8…` |
| `public/assets/stages/field-dew.webp` | 237,552 B | `629bd5450dbc53aa…` |
| `public/assets/stages/field-lab.webp` | 83,622 B | `96c9caef68f32728…` |
| `public/assets/learning/hotplate.webp` | 20,968 B | `fe1faca95432ad5e…` |
| `public/assets/learning/drawing-board.webp` | 46,954 B | `10be2af038345aab…` |
| `public/assets/learning/water-core.webp` | 107,020 B | `13f2386ea84f27c4…` |

### 프롬프트 요지

- 현장 작업대 5장(16:9): "Children's educational science game background, painted in exactly the same … style and palette as the reference image. Three-quarter top-down view of a field research worktable … The central 75% of the tabletop is completely empty, evenly and softly lit, low contrast … Decoration only along the outer edges: (구역별 소품) … No text, no letters, no UI, no characters, no people."
  - 샘터: 연한 석회암 탁자, 왼쪽 위 작은 샘, 이끼·수국·담쟁이, 젖은 조약돌
  - 얼음 다리: 옅은 얼음빛 돌 탁자와 얇은 서리, 눈더미·고드름, 오른쪽 위 황동 배관과 밸브, 얼음 조각
  - 햇살 마당: 따뜻한 사암 탁자, 가장자리 잎 그림자, 테라코타 화분, 접힌 면 수건, 빨래집게
  - 이슬 정원: 연한 민트 대리석 작업대, 고사리, 이슬 맺힌 유리병, 김 서린 온실 유리
  - 연구실: 흰색·연하늘 조립대와 금테, 물빛 유리관, 황동 부품, 말린 설계도
- 가열판(3:2, 투명): 둥근 짙은 회색 세라믹 가열면, 크림색 몸체와 금테, 큰 다이얼과 꺼진 표시등, 비커를 올릴 수 있는 평평한 윗면, 꺼진 상태.
- 그림판(4:3, 투명): 마른 밝은 사암 판, 꿀색 나무틀과 황동 모서리, 비어 있고 고르게 밝음.
- 물방울 코어(3:4, 투명): 세로 유리 캡슐 안의 물방울 모양 수정, 금·흰색 고리 틀, 둥근 받침, 왼쪽 아래 짧은 황동 유입관, 빛나지 않는 꺼진 상태, 물 1/4.

육안 확인: 글자·사람·캐릭터가 들어간 출력은 없었다. 권리·요금제 범위는 CREDITS 맨 위 표의 판정을 따른다.
