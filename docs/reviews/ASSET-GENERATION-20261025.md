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
