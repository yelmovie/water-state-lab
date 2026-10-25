# 에셋 정리 기록 · 2026-10-25

`public/assets` 80개 파일을 하나씩 확인했다. 어디에서도 참조하지 않는 6개만 `_unused/public-assets/`의 같은 상대 경로로 `git mv` 했다. **삭제한 파일은 없다.** 되돌릴 때는 `git mv _unused/public-assets/<경로> public/assets/<경로>`를 쓴다.

## 검사 방법과 한계

- 참조 검색: 파일 이름 문자열을 `src/*.js`, `src/*.css`, `index.html`, `scripts/build.mjs`에서 찾고, 이동 직전에 `scripts/`(파이썬 검사 포함)·`tests/`·`package.json`까지 다시 찾았다.
- 동적 경로: `${…}.webp` 꼴은 `src/concepts.js`·`src/settings.js`의 `concepts/stage-${n}`뿐이다. `lab-${…}`, `v2/${…}` 같은 조합 경로는 없다.
- 빌드: `scripts/build.mjs`는 `vendor`·`fonts`·`audio`·`concepts`·`learning`·`stages` 폴더와 `v2/*.webp`, `CREDITS.md`만 복사한다. `public/assets` 루트 PNG와 `v2/*.png`는 배포본에 들어가지 않는다.
- 중복: 2026-10-25 SHA-256 재계산 결과 내용이 같은 파일은 0개다.
- 이 판정은 **정적 검색 결과**다. 이동 뒤 브라우저 실행 확인은 이번 작업에 포함하지 않았다.

## 이번에 옮긴 파일 (참조 0건)

| 원래 경로 (`public/assets/`) | 크기 | 쓰지 않는다는 근거 | 배포본 영향 |
|---|---:|---|---|
| v2/lab-observe.webp | 178,188 B | 참조 0건. 2026-10-15 실험 배경으로 넣은 사용자 제공 배경의 변환본. 현재 실험 배경은 `stages/*.webp`와 `experiment-table-v3.webp` | 빠짐 |
| v2/lab-cold.webp | 251,096 B | 참조 0건. 위와 같은 사용자 제공 배경 변환본 | 빠짐 |
| v2/lab-compare.webp | 217,512 B | 참조 0건. 위와 같음 | 빠짐 |
| v2/lab-detective.webp | 213,844 B | 참조 0건. 위와 같음 | 빠짐 |
| v2/buddy-poses.webp | 334,072 B | 참조 0건. 2026-10-25 이미지 점검에서 `fieldwork.js`가 `buddy-poses-clean.webp`로 통일됨(`docs/reviews/STAGE-IMAGES-20261025.md`). 재배치 스크립트 `prepare-buddy-sprites.py`는 `image/chatgpt_generated_035.png`를 읽으므로 이 파일과 무관 | 빠짐 |
| logo.png | 1,391,064 B | 참조 0건. 초기 MVP 이미지. 원래부터 빌드에서 제외 | 없음 |

- 저장소 기준 이동 합계: **2,585,776 B**.
- 다음 빌드부터 배포본에서 빠지는 양: **1,194,712 B** (v2 WebP 5개. `build.mjs`가 `v2/*.webp`를 모두 복사하기 때문).
- 옮긴 파일의 출처 기록은 `public/assets/CREDITS.md`의 2026-10-15 표에 이동 사실과 함께 남겼다.

## 아직 옮기지 않은 후보

| 경로 (`public/assets/`) | 크기 | 지금 상태 | 권고 |
|---|---:|---|---|
| lab-main.png | 1,922,547 B | `src/style.css` 3곳에서 배경으로 참조. 그런데 빌드가 루트 PNG를 복사하지 않아 **빌드본에서는 `/assets/lab-main.png` 요청이 404**다(현재 `dist/src/style.css`에도 남아 있음). 다른 작업에서 참조를 지우는 중 | 참조 제거를 확인한 뒤 이동 |
| lab-room.png | 2,002,488 B | `src/style.css` 1곳 참조. 위와 같은 404 | 참조 제거를 확인한 뒤 이동 |
| v2/research-island-v3.webp | 624,236 B | `src/tablet.css`·`src/v2.css` 참조. 현재 지도는 v4. 다른 작업에서 참조를 지우는 중 | 참조 제거 확인 뒤 이동. 재작업 원본 `research-island-v3.png`는 보존 |
| v2/journey-map.webp | 458,462 B | `src/journey.js`의 `legacyJourneyView`에서만 참조. 현재 화면 진입 경로는 없음(2026-10-24 기록) | 레거시 지도 코드를 정리할 때 함께 이동 |
| v2/lab-workshop.webp | 261,194 B | 현재 참조 0건. 곧 사용할 예정이라 유지 | 끝내 쓰지 않으면 이동 |
| v2/lab-core.webp | 297,814 B | 현재 참조 0건. 곧 사용할 예정이라 유지 | 끝내 쓰지 않으면 이동 |
| v2/*.png 7개 | 합계 16,594,330 B | WebP의 재작업 원본. 빌드 제외 | 보존. 짝 WebP를 옮길 때 함께 옮길지는 사용자가 정한다 |
| src/map.js | 4,191 B | import 0건. 이전 지도 구현 | 같은 날 다른 작업에서 `_unused/src/map.js`로 `git mv` 됨 |
| src/experiments.js | 23,531 B | import 0건. 이전 실험 구현 | 같은 날 다른 작업에서 `_unused/src/experiments.js`로 `git mv` 됨 |

## 규칙상 옮기지 않는 것

- `fonts/`, `vendor/`, `audio/`: 실행 파일과 라이선스 원문(`Jua-OFL.txt`, `PHASER-LICENSE.md`, `Kenney-LICENSE.txt`, `sources.json`)은 코드 참조가 없어도 함께 배포해야 한다.
- `concepts/`: `stage-${n}` 동적 경로로 쓰인다.
- `CREDITS.md`: 설정 화면이 안내하고 빌드가 복사한다.

## 현황 (이동 후 74개)

아래 수치와 전체 목록은 이동 직후 스냅샷이다. 같은 날 병행 작업에서 새로 추가 중인 파일(`icons/` 3개, `learning/drawing-board·hotplate·water-core.webp`, `stages/field-*.webp` 5개)은 포함하지 않았다. 이 파일들의 출처는 `public/assets/CREDITS.md`의 `2026-10-25 생성 이미지` 절에 기록한다.

| 종류 | 개수 | 용량 | 가장 큰 파일 |
|---|---:|---:|---|
| WebP 이미지 | 30 | 7,914,882 B | v2/equipment-atlas.webp 779,766 B |
| PNG 이미지 (배포 제외) | 9 | 20,519,365 B | v2/research-island-v3.png 3,483,264 B |
| MP4 영상 | 10 | 808,558 B | concepts/stage-6.mp4 103,692 B |
| WebM 영상 | 10 | 1,090,108 B | concepts/stage-3.webm 161,249 B |
| Ogg 효과음 | 7 | 57,721 B | audio/confirmation_002.ogg 14,169 B |
| WOFF2 글꼴 | 2 | 384,792 B | fonts/jua-korean-400.woff2 368,172 B |
| JS | 1 | 1,196,122 B | vendor/phaser.min.js |
| 문서·라이선스 (md·txt·json) | 5 | 17,946 B | CREDITS.md |
| 합계 | 74 | 31,989,494 B | 배포에 들어가는 몫은 PNG를 뺀 11,470,129 B |

## 발견 사항

- **P0 깨진 경로**: 빌드본의 `lab-main.png`·`lab-room.png` 404. 그라데이션 위 배경이라 화면이 비지는 않지만 요청은 실패한다. 다른 작업에서 참조 제거 중.
- **P1 용량**: 배포 파일 중 1MB 이상은 `phaser.min.js`(엔진, 필수)뿐이다. `stages/drink-bottle.webp`는 1024×1536·656,428 B로 다른 소품보다 크다. 실제 렌더 크기와 비교하지는 않았다.
- **P2 미사용**: 위 이동 6개와 후보 표.
- **P3 이름·기록**: 이름은 kebab-case로 일관된다. `-v3`·`-v4`·`-clean` 같은 판 구분 접미사가 있고 `final`류 이름은 없다. 라이선스 검토 결과는 `public/assets/CREDITS.md` 맨 위 표에 있다.

## 이동 후 전체 목록

참조 위치는 `src/*.js`·`src/*.css`·`index.html`의 파일 이름 검색 결과다. `-`는 문자열 참조가 없다는 뜻이며, 위 "규칙상 옮기지 않는 것"과 후보 표에 이유를 적었다.

| 경로 (`public/assets/`) | 바이트 | 참조 위치 |
|---|---:|---|
| CREDITS.md | 11,287 (작성 전 값) | settings-content.js, build.mjs |
| audio/Kenney-LICENSE.txt | 574 | - |
| audio/click_003.ogg | 4,371 | sound.js |
| audio/confirmation_001.ogg | 8,968 | sound.js |
| audio/confirmation_002.ogg | 14,169 | sound.js |
| audio/drop_003.ogg | 6,288 | sound.js |
| audio/error_001.ogg | 7,373 | sound.js |
| audio/question_002.ogg | 9,455 | sound.js |
| audio/sources.json | 491 | - |
| audio/switch_002.ogg | 7,097 | sound.js |
| concepts/stage-1~10.mp4 (10개) | 808,558 | concepts.js 동적 경로 |
| concepts/stage-1~10.webm (10개) | 1,090,108 | concepts.js 동적 경로 |
| concepts/stage-1~10.webp (10개) | 69,412 | concepts.js·settings.js 동적 경로 |
| fonts/Jua-OFL.txt | 4,474 | - |
| fonts/jua-korean-400.woff2 | 368,172 | v2.css, index.html |
| fonts/jua-latin-400.woff2 | 16,620 | v2.css |
| lab-main.png | 1,922,547 | style.css (빌드본 404) |
| lab-room.png | 2,002,488 | style.css (빌드본 404) |
| learning/condenser-plate.webp | 131,852 | fieldwork.js |
| learning/scale.webp | 118,286 | fieldwork.js, phaser-scenes.js |
| learning/tank-frame.webp | 122,538 | fieldwork.js, phaser-scenes.js |
| stages/dew-greenhouse.webp | 322,248 | experience.css |
| stages/drink-bottle.webp | 656,428 | inquiry.js, phaser-scenes.js |
| stages/spring-terrace.webp | 337,628 | experience.css |
| stages/sun-courtyard.webp | 269,040 | experience.css |
| stages/water-search.webp | 420,830 | phaser-scenes.js |
| stages/winter-waterworks.webp | 405,832 | experience.css |
| v2/buddy-poses-clean.webp | 743,714 | fieldwork.js, phaser-scenes.js, v2.css |
| v2/equipment-atlas.png | 1,121,993 | - (재작업 원본) |
| v2/equipment-atlas.webp | 779,766 | fieldwork.js, phaser-scenes.js, v2.css |
| v2/experiment-table-v3.png | 2,385,097 | - (재작업 원본) |
| v2/experiment-table-v3.webp | 312,120 | experience.css, tablet.css |
| v2/journey-map.png | 2,950,048 | - (재작업 원본) |
| v2/journey-map.webp | 458,462 | journey.js (레거시 화면) |
| v2/lab-core.webp | 297,814 | - (사용 예정) |
| v2/lab-workshop.webp | 261,194 | - (사용 예정) |
| v2/rescue-reward.png | 1,690,922 | - (재작업 원본) |
| v2/rescue-reward.webp | 291,550 | app.js |
| v2/research-island-v3.png | 3,483,264 | - (재작업 원본) |
| v2/research-island-v3.webp | 624,236 | tablet.css, v2.css (제거 중) |
| v2/research-island-v4.webp | 626,736 | journey.js |
| v2/story-repair.png | 3,090,019 | - (재작업 원본) |
| v2/story-repair.webp | 466,248 | app.js |
| v2/workshop-atlas.png | 1,872,987 | - (재작업 원본) |
| v2/workshop-atlas.webp | 198,948 | fieldwork.js, phaser-scenes.js, workshop.js, v2.css |
| vendor/PHASER-LICENSE.md | 1,120 | - |
| vendor/phaser.min.js | 1,196,122 | index.html |

---

## 이전 기록 · 2026-10-24 (당시 상태 그대로 보존)

당시에는 삭제·이동을 하지 않았다.

| 경로 | 크기 | 근거·처리 |
|---|---:|---|
| src/map.js | 4,191 B | 현재 src 모듈에서 import 참조 없음. 이전 지도 구현 보관 |
| src/experiments.js | 23,531 B | 현재 src 모듈에서 import 참조 없음. 이전 실험 구현 보관 |
| public/assets/v2/journey-map.webp | 458,462 B | `legacyJourneyView`에서만 참조. 현재 앱은 `journeyView`의 research-island-v3 사용. 단순 문자열 검색의 ‘미참조’ 판정은 아님 |
| public/assets/logo.png | 1,391,064 B | 초기 MVP 이미지. 현재 빌드는 assets/v2의 WebP만 복사하므로 배포본에 없음 |
| public/assets/lab-main.png | 1,922,547 B | 초기 MVP 이미지. 현재 빌드에서 제외 |
| public/assets/lab-room.png | 2,002,488 B | 초기 MVP 이미지. 현재 빌드에서 제외 |
| public/assets/v2/*.png | 합계 16,594,330 B | WebP의 재작업 원본. **현재 보존 필요**, dist에는 PNG 0개. 삭제 권고 아님 |

2026-10-24 `public/assets` 전체 69개 파일의 SHA-256을 비교했으며 내용이 완전히 같은 중복 파일은 0개였다. 최종 고도화 QA의 전체 파일·크기·참조·해시 목록은 `docs/reviews/screenshots/upgrade-20261024/final/asset-results.json`에 있다.

2026-10-24 지도 교체 후: `public/assets/v2/research-island-v3.webp`는 비교·롤백 원본으로 보존했다(현재 지도는 v4).
