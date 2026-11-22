# 6번 방울이의 물길 탐험 · 운영 빌드 권리 장부 (2026-11-21)

운영 빌드(`dist/`)에 들어가는 그림·영상·음악·효과음·목소리·글꼴·3D 모델이 어디서 왔고 어떤 조건으로 쓰는지, 저장소 안 기록만으로 정리한 장부다. 법률 판단이 아니라 **기록이 있는지**를 따진 것이다. 근거가 없는 칸은 추측으로 채우지 않았다.

## 기준

- 기준 커밋: `3e682dd`(2026-11-21 06:36). 대조한 빌드: `dist/build-info.json` `builtAt 2026-11-20T21:26:22Z`, 파일 608개(`._*` 제외). `scripts/build.mjs`가 복사하는 `public/assets/` 폴더별 개수와 `dist/assets/` 개수가 모두 같았다.
- 빌드가 복사하는 것(`scripts/build.mjs`): `src/` 전체(점 파일, `collector-figure-*.js` 3개, `colorfigures` 폴더 제외) · `public/assets/vendor`·`fonts` · `audio, story, concepts, learning, stages, village, icons, models, npc-expressions, run-stage, reward-cards` 폴더 통째 · `public/assets/v2/*.webp`만(PNG 원본 제외) · `CREDITS.md`, `manifest.webmanifest`, `index.html`, `update.html`, 생성 파일 `build-info.json`·`sw.js`.
- `vendor/colorfigures/`는 빌드 필터로 빠진다. 배포본에 없으므로 이 장부에 넣지 않았다.
- 파일을 줄마다 빠짐없이 나눴는지는 `.tmp/stage31/classify.mjs`로 확인했다(608개 중 분류 안 된 파일 0).
- 「앱 재생·표시 안 함」은 `src/`·`index.html`·`update.html`·`manifest.webmanifest`에서 경로 문자열 검색 결과가 0인 것이다. 배포본에는 들어 있다.

### 상태 기준

- **확인됨**: 만든 도구·출처와 이용 조건(라이선스·요금제·약관 근거)이 문서에 적혀 있다.
- **근거 약함**: 도구·날짜는 있으나 이용 조건(생성 계정의 명의·요금제, 도구 라이선스)이 기록에 없거나, 원본 캐릭터의 권리가 확인 전이다.
- **출처 미확인**: 어떤 도구·출처로 만들었는지 저장소 기록에 없다.

### 공통으로 쓰인 이용 조건 근거

- **OpenAI 이미지 생성(내장 `image_gen`, Codex 내장 ImageGen, `gpt-imagegen`)**: `public/assets/CREDITS.md` 16행(맨 위 표 OpenAI 줄). OpenAI 이용약관 '콘텐츠 소유권'(출력 권리를 이용자에게 양도) 인용, 2026-10-25 검색 결과로 확인했고 원문은 403으로 직접 열지 못했다. **생성 계정의 명의·요금제 기록 없음**, CREDITS 판정 '확인 필요'. `_shared/RUN-STAGE-3D-PLAN-20261117.md`·`_shared/SCORE-110-PLAN-20261121.md`에는 "ChatGPT 구독 사용량이 든다"는 문장만 있고 요금제 이름은 없다. 그래서 OpenAI 생성 그림은 모두 「근거 약함」이다.
- **Higgsfield · GPT Image 2.5**: `public/assets/CREDITS.md` 18행(맨 위 표 Higgsfield 줄). Basic 유료 요금제 계정, Higgsfield 약관 4.4(출력 소유권 주장 없음·상업 이용 제한 없음) 2026-10-25 확인. CREDITS 판정 '조건부 PASS · 확인 필요'(공급사 조건, 요금제 페이지 직접 확인, 워터마크·C2PA, 학습 제외 4가지가 남음). 이 근거는 2026-10-25·10-29 생성분에만 해당한다.
- **ElevenLabs**: `_shared/voice-provenance-20261118.md` 요금제 표. 2026-11-17까지 Starter(유료), 2026-11-18 생성분은 Creator(유료). 사용자 확인 2026-11-18. 실제 사람 목소리 복제 없음.
- **Suno**: `public/assets/CREDITS.md` 12행과 `_shared/voice-provenance-20261118.md`. Premier 요금제(2026-11-18 사용자 확인), 상업 이용 가능(2026-11-04 기획자 확인).

## 1. 그림

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| G1 | `v2/title-island.webp`, `v2/title-logo.webp` | 2 | Higgsfield · GPT Image 2.5 (medium, 1K), Basic 유료 계정 | 2026-10-29. CREDITS 「2026-10-29 생성 이미지」 표. 원본 `image/generated-20261029/`(저장소 제외) | Higgsfield 약관 4.4, 위 공통 근거 | `public/assets/CREDITS.md` 18·124~134행 | 확인됨 (CREDITS 판정은 조건부) |
| G2 | `v2/bangul-title.webp` | 1 | Higgsfield · GPT Image 2.5, `v2/buddy-poses-clean.webp` 첫 포즈를 참고 | 2026-10-29. 같은 표 | 생성 조건은 G1과 같지만 CREDITS가 "방울이 원본 권리 확인은 '사용자 제공 ChatGPT 생성 이미지' 행과 같음"이라 적음 | `public/assets/CREDITS.md` 17·133행 | 근거 약함 |
| G3 | `stages/field-spring·field-winter·field-sun·field-dew·field-lab.webp` | 5 | Higgsfield · GPT Image 2.5 (high, 2K), Basic 유료 계정 | 2026-10-25. CREDITS 「2026-10-25 생성 이미지」 표. 원본 `image/generated-20261025/`(저장소 제외). 첫 커밋 `46038cf` 2026-10-25 | Higgsfield 약관 4.4 | `public/assets/CREDITS.md` 136~152행 | 확인됨 (CREDITS 판정은 조건부) |
| G4 | `learning/hotplate.webp`, `drawing-board.webp`, `water-core.webp` | 3 | Higgsfield · GPT Image 2.5 | 2026-10-25. 같은 표 | 같음 | `public/assets/CREDITS.md` 148~150행 | 확인됨 (CREDITS 판정은 조건부) |
| G5 | `learning/coldnight-20261109/` (`jar-cracked`, `bottle-cracked`), `learning/freeze-props-20261109/` (`ice-pop-soft`, `ice-pop-frozen`) | 4 | Higgsfield · GPT Image 2.6 (작업 ID 기록 있음) | 2026-11-09. 프롬프트·작업 ID: `assets/source-media/coldnight-cracked-20261109/PROMPTS.md`, `assets/source-media/freeze-props-20261109/PROMPTS.md`(둘 다 git 추적). 첫 커밋 `85746bc` 2026-11-09 | 2026-11-09 시점 요금제 기록 없음. 10-25 약관 검토는 GPT Image 2.5 대상 | 위 PROMPTS.md 2개, `public/assets/CREDITS.md` 313~315행 | 근거 약함 |
| G6 | `v2/journey-map.webp`, `equipment-atlas.webp`, `workshop-atlas.webp` | 3 | OpenAI 이미지 생성 도구 | 2026-10-15. 프롬프트 `docs/reviews/ASSET-GENERATION-2026-10-15.md`, `docs/reviews/WORLD-ASSETS-2026-10-15.md` | OpenAI 공통 근거(계정·요금제 기록 없음) · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 70~90행 | 확인됨(사용자 확인) |
| G7 | `v2/story-repair.webp`, `v2/rescue-reward.webp` | 2 | OpenAI 이미지 생성 도구 (방울이·연구섬 참조) | 2026-10-21. `docs/reviews/ASSET-GENERATION-2026-10-21.md` | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 30~31행 | 확인됨(사용자 확인) |
| G8 | `v2/research-island-v4.webp`, `learning/scale.webp`, `learning/condenser-plate.webp` | 3 | 내장 OpenAI `image_gen` | 2026-10-24. 프롬프트 원문 `docs/reviews/ASSET-GENERATION-20261024.md`, 원본 `image/generated-learning/` | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 107~114행 | 확인됨(사용자 확인) |
| G9 | `stages/spring-terrace·winter-waterworks·sun-courtyard·dew-greenhouse·water-search·drink-bottle.webp` | 6 | 내장 OpenAI `image_gen` | 2026-10-25. `docs/reviews/ASSET-GENERATION-20261025.md`, `docs/reviews/STAGE-IMAGES-20261025.md`. 원본 `image/generated-stage-experience/` | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 116~122행 | 확인됨(사용자 확인) |
| G10 | `v2/resident-1.webp` ~ `resident-10.webp` | 10 | 내장 OpenAI 이미지 생성 도구 | 2026-11-02. 원본 `image/research-island-residents/`. 프롬프트 기록 없음 | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 183~185행 | 확인됨(사용자 확인) |
| G11 | `v2/bangul-walk.webp`, `v2/pouring-glass.webp`, `v2/pouring-jug.webp`, `learning/real-cloth·real-ice·real-painting·real-dew·real-tools.webp` | 8 | 내장 OpenAI 이미지 생성 도구 (`bangul-walk`은 타이틀 방울이 참고, 11-06 로컬 색 보정) | 2026-11-03. 프롬프트 원문이 CREDITS 안에 있음 | OpenAI 공통 근거. `bangul-walk`은 방울이 원본 권리 문제도 같이 걸림 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 171~235행 | 확인됨(사용자 확인) |
| G12 | `learning/heat-plate-guide.webp`, `cold-plate-guide.webp`, `cold-plate-dry.webp`, `water-material.webp` | 4 | Codex 내장 ImageGen | 2026-11-05. 프롬프트 `docs/reviews/ASSET-UPDATE-20261105.md`. 원본 `.tmp/visual-qa/generated-originals/` | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 237~240행 | 확인됨(사용자 확인) |
| G13 | `learning/experiment-props-20261107/` 전체 | 22 | OpenAI imagegen. 컵·금속판·물 받이·냉각팩은 `real-dew`·`real-tools`·`workshop-atlas`에서 잘라냄 | 2026-11-07. 프롬프트 `assets/source-media/experiment-props-20261107/provenance.json`(git 제외) | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 267~270행 | 확인됨(사용자 확인) |
| G14 | `learning/ending-collector-20261108/` (1), `learning/ice-tray-20261108/` (2), `learning/freeze-props-20261108/` (4), `learning/overnight-20261108/` (1) | 8 | OpenAI 기본 imagegen / `image_gen` | 2026-11-08. `assets/source-media/ending-collector-20261108/manifest.json`·`PROMPTS.md`, `ice-tray-20261108/generation.json`, `freeze-props-20261108/PROMPTS.md`, `docs/design/ICE-TRAY-20261108.md`. `overnight` 원본 PNG는 git 추적 | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 275~294행 | 확인됨(사용자 확인) |
| G15 | `v2/map-villain-mole.webp`, `v2/bangul-combat-sheet.webp`, `v2/valve-mole-sheet.webp` | 3 | OpenAI GPT Image (다른 작업 세션, 제작자 확인). `map-villain-mole`은 `valve-mole-sheet`를 로컬 정리한 것 | 2026-11-09. 프롬프트 원문 남아 있지 않음 | OpenAI 공통 근거. `valve-mole-sheet.webp`는 앱 표시 안 함 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 296~300행 | 확인됨(사용자 확인) |
| G16 | `learning/adventure-20261111/` (8), `learning/bangul-hit-20261111/bangul-hit.webp` (1) | 9 | Codex 내장 `image_gen` (`bangul-hit`은 `bangul-title` 참고) | 2026-11-11. `assets/source-media/adventure-20261111/prompts.json`, `bangul-hit-20261111/prompt.json`(git 제외) | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 330~343행 | 확인됨(사용자 확인) |
| G17 | `v2/parang-neutral·parang-think·parang-happy.webp` (3), `npc-expressions/resident-{2,4,6,8,10}-{neutral,think,happy}.webp` (15) | 18 | Codex 내장 `image_gen` (기존 주민 그림 참조) | 2026-11-12. 원본 `_scratch/npc-dialogue-plan-20261112/generated-parang/`, `output/npc-dialogue-expanded-20261112/` | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 349~358행 | 확인됨(사용자 확인) |
| G18 | `run-stage/` 전체 (원경, 길·벽 타일, 열판·냉각판, 물·얼음 달리기, 장식 9종) | 16 | `gpt-imagegen`(ChatGPT 앱의 Codex 내장 GPT 이미지) | 2026-11-17. 프롬프트 전문 `docs/RUN-STAGE-3D-PLAN-20261117.md` 165~267행. 원본 `assets/source-media/run-stage-20261117/`(git 제외). 첫 커밋 `9603468`·`8272213` 2026-11-17. **CREDITS에 항목 없음** | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `docs/RUN-STAGE-3D-PLAN-20261117.md` | 확인됨(사용자 확인) |
| G19 | `reward-cards/card-*`, `thumb-*` | 10 | ChatGPT 앱의 Codex 내장 이미지 도구(GPT 이미지) | 2026-11-18. 원본 `_scratch/reward-cards-20261118/gen/06/` | OpenAI 공통 근거 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 373~377행 | 확인됨(사용자 확인) |
| G20 | `v2/buddy-poses-clean.webp`(방울이 16포즈), `v2/lab-workshop.webp`, `v2/lab-core.webp` | 3 | 사용자가 작업 폴더에 준 ChatGPT 생성 이미지(`image/ChatGPT Image 2026년 9월 23일 …png`, `image/chatgpt_generated_035.png`). 만든 곳: ChatGPT(GPT 이미지) — 사용자 확인 | 원본 파일 이름의 날짜 2026-09-23. 첫 커밋 `dab7cb1`·`224a381` | **생성한 사람·계정·요금제 기록 없음.** CREDITS가 "방울이가 주인공이라 우선 확인"으로 표시 · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | `public/assets/CREDITS.md` 17·43·55~90행 | 확인됨(사용자 확인). 주인공 캐릭터 원본이라 납품 계약의 저작권 귀속 조항은 따로 확인 권장 |
| G21 | `icons/icon-192.png`, `icons/icon-512.png`, `icons/og-image-v1.jpg` | 3 | 새 생성 없음. 앱 아이콘은 `rescue-reward`(G7)·`buddy-poses-clean`(G20)을 로컬 PIL로 자름. 공유 그림은 G1·G2 세 장을 sharp로 합성 | 2026-10-25(아이콘), 2026-10-29(공유 그림) | 원본 그림의 상태를 따름. G20 방울이 권리가 걸림 | `public/assets/CREDITS.md` 134·160행 | 근거 약함 |
| G22 | `learning/weight-100g.webp`, `ice-pop-soft.webp`, `ice-pop-frozen.webp`, `pipe-water.webp`, `pipe-burst.webp` (`learning/` 바로 아래) | 5 | 프로젝트 코드로 직접 그림(`scripts/learning-art/freeze-props.mjs`가 SVG → WebP) | 2026-11-06 | 자체 제작. 외부 자료 없음 | `public/assets/CREDITS.md` 247~256행, `scripts/learning-art/freeze-props.mjs` | 확인됨 |
| G23 | `icons/bangul-loader.webp` | 1 | Codex(GPT 이미지) — 사용자 확인 | 첫 커밋 `46038cf` 2026-10-25. 이 맥의 Codex 생성 기록(2026-11-05부터) 이전이라 생성 로그 없음 | ChatGPT 유료 요금제(사용자 확인). 앱 표시 안 함 | 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md` | 확인됨(사용자 확인) |
| G24 | `v2/experiment-table-v3.webp` | 1 | Codex(GPT 이미지) — 사용자 확인. CREDITS의 「이전 작업에서 생성해 둔」과 어긋나지 않음 | 첫 커밋 `dab7cb1` 2026-10-18. 이 맥의 Codex 생성 기록(2026-11-05부터) 이전이라 생성 로그 없음 | ChatGPT 유료 요금제(사용자 확인). `src/experience.css`·`src/tablet.css`가 사용 | 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`, `public/assets/CREDITS.md` 16·96행 | 확인됨(사용자 확인) |
| G25 | `learning/time-clock-face.webp`, `time-clock.webp`, `time-wand.webp`, `time-wand-tap.webp` | 4 | Codex 내장 이미지 도구(`image_gen`) | 2026-11-10. Codex 세션 `rollout-2026-11-10T18-50-06-01a1c4dd…` 10:07 UTC 「one round antique tabletop clock dial」·「one short narrow magical wand」 → 같은 세션 변환 명령이 `exec-f12a615d…`·`exec-1c61863e…`를 `time-clock.webp`(300px)·`time-wand.webp`로 만듦. 세션 `rollout-2026-11-10T19-24-01-01a1c4fc…` 10:43·10:44 UTC 「single isolated magical wand」·「front-facing circular clock dial」 → `exec-1e20c1e5…`·`exec-95bd6a27…`를 `assets/source-media/time-magic-20261110/wand.png`·`clock.png`로 복사, ffmpeg로 `time-wand-tap.webp`·`time-clock-face.webp`(384px). 커밋 `d0d906a` | OpenAI 공통 근거(계정 명의·요금제 기록 없음) · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | 생성 기록 색인 `_shared/codex-image-records-20261121/index.jsonl`(방법 `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 확인됨(사용자 확인) |
| G26 | `learning/ice-texture.webp`, `learning/water-texture.webp`, `learning/pipe-burst-photo.webp` | 3 | Codex 내장 이미지 도구(`image_gen`). **실사 사진을 내려받은 것이 아니라 생성 그림** | 2026-11-10. Codex 세션 `rollout-2026-11-10T18-50-06-01a1c4dd…` 09:57 UTC 「photoreal isolated 3D product photograph … galvanized steel water pipe」(`exec-107328e5…` → ffmpeg 자르기·1500px → `pipe-burst-photo.webp`), 10:01 「rectangular raster material for the body of clear water」(`exec-084945ab…` → `water-texture.webp`), 10:02 「photoreal raster material for the INSIDE of a solid block of frozen water」(`exec-9da9eed4…` → `ice-texture.webp`). 커밋 `d0d906a` | OpenAI 공통 근거(계정 명의·요금제 기록 없음) · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | 생성 기록 색인 `_shared/codex-image-records-20261121/index.jsonl`(방법 `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 확인됨(사용자 확인) |
| G27 | `learning/condensation-20261108/bottle-wet.webp`, `cold-plate-wet.webp`, `collector-cold-dry.webp`, `collector-cold-wet.webp`, `room-bench.webp` | 5 | Codex 내장 이미지 도구(`image_gen`, 기존 그림 편집 포함) | 2026-11-08. Codex 세션 `rollout-2026-11-08T20-26-25-01a1bae8…` 12:17~12:28 UTC: 「Edit the supplied image … about condensation」(`exec-44466767…` → `cold-plate-wet-generated.png`), 「Edit the supplied single water-bottle game asset」(`exec-6333ceb9…` → `bottle-wet-generated.png`), 「Edit this supplied single round metal condenser plate」(`exec-54a63b69…` → `collector-cold-dry-generated.png`), 「Precise object edit of the supplied DRY round metal condenser」(`exec-4fa99042…` → `collector-cold-wet-generated.png`), 「ONE empty room-temperature laboratory preparation bench」(`exec-22ba2d6d…` → `room-bench-generated.png`). 같은 세션 sharp 명령이 `public/assets/learning/condensation-20261108/*.webp` 4장을 씀. 커밋 `7ae28c7` | OpenAI 공통 근거(계정 명의·요금제 기록 없음) · **유료 요금제: 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md`** | 생성 기록 색인 `_shared/codex-image-records-20261121/index.jsonl`(방법 `_shared/CODEX-IMAGE-RECORDS-20261121.md`), 원본 `assets/source-media/condensation-20261108/*-generated.png` | 확인됨(사용자 확인) |

## 2. 영상

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| M1 | `story/intro.mp4`, `story/intro.webp`, `story/final.mp4`, `story/final.webp` | 4 | 원본 영상: 제미나이(영상 생성) — 사용자 확인. 기획자 제공 영상에 `scripts/render-film.mjs`로 색 보정·나눔스퀘어네오 자막·Suno 배경음·CC0 효과음을 입힘. 시작 장면 그림은 ChatGPT 페이지에서 만든 것으로 보임(`video-prompts-20261101.json`의 `page_url`이 chatgpt.com) | 2026-11-01 계획, 첫 커밋 `ca12f5b` 2026-11-04. 원본 `assets/source-media/video/intro.mp4`·`final.mp4`(git 추적) | CREDITS가 "원본 영상의 제작 도구와 권리는 기록에 없다", 판정 '확인 필요'. 영상 속 원본 주변음 출처도 기록 없음(`_shared/AUDIO-FIX4-BRIEF-20261120.md` 84행 "원본 주변음에 말소리가 없는지는 귀로 미확인") · **원본 영상: 제미나이 유료 요금제(사용자 확인)**. 영상 속 원본 주변음은 소리 문서 범위라 이 확인으로 덮지 않음 | `public/assets/CREDITS.md` 14행, `docs/video/VIDEO-PLAN-20261101.md`, `docs/video/video-prompts-20261101.json`, 사용자 확인 2026-11-21 09:25(「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」), `_shared/CODEX-IMAGE-RECORDS-20261121.md` | 확인됨(사용자 확인) |
| M2 | `story/intro.vtt`, `story/final.vtt` | 2 | 프로젝트가 직접 쓴 자막 | 2026-11-04. `docs/video/intro-subtitles.srt`, `final-subtitles.srt` | 자체 작성 글 | `docs/video/VIDEO-PLAN-20261101.md` | 확인됨 |
| M3 | `concepts/zone-1~5.mp4`, `zone-1~5.webp` | 10 | HyperFrames 0.9.26으로 렌더(HTML·게임 그림 잘라 쓰기·Kenney/rubberduck CC0 효과음, 음악 없음). 자막은 2026-11-18 다시 합성 | 2026-11-09. `docs/reviews/UPGRADE-RESULT-20261109.md`, `films/SPEC.md`, `films/REVIEW.md`, `docs/concept-captions-20261118/`, `_shared/FULLSCREEN-CAPTION-CONCEPTS-20261118.md` | **HyperFrames(및 애니메이션 라이브러리) 이용 조건 기록 없음.** 화면에 쓴 게임 그림은 G6~G20의 상태를 따름. CREDITS는 아직 옛 `concepts/stage-1~10` 자체 SVG 영상으로 적혀 있어 현재 파일과 다름 | 위 문서들, `public/assets/CREDITS.md` 15·41·102행(옛 기록) | 근거 약함 |
| M4 | `village/stage-1~10-on.webp`, `stage-1~10-idle.webp` | 20 | `scripts/map-clips`의 Remotion 4.0.541 코드로 직접 그린 벡터 애니메이션. 외부 이미지·음원 없음 | 2026-11-06 | Remotion 라이선스: 개인·소규모 조직 무료, **직원 4명 이상 회사는 회사 라이선스 필요**(CREDITS 기록). 제작 주체가 어느 쪽인지 기록 없음 | `public/assets/CREDITS.md` 260~264행 | 근거 약함 |

## 3. 3D 모델

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| D1 | `models/*.glb` (물통·냉각판·깔때기·경사판·연결관·섬 디오라마·물방울 코어·물레 받침·물레 바퀴) | 9 | 사용자가 Meshy Image to 3D로 변환, Blender 5.2 스크립트로 다듬음. 기준 그림은 Higgsfield 생성분과 `workshop-atlas`(G6)·물방울 코어(G4) | 2026-10-25. 프롬프트 `docs/3d/MESHY-3D-PROMPTS.md`. 원본 GLB는 `_scratch/waterchange-3d/raw/`. 첫 커밋 `46038cf` | CREDITS: "Meshy 출력의 상업 이용 조건은 사용 계정의 요금제 약관을 따른다." **요금제 기록 없음** | `public/assets/CREDITS.md` 154~159행, `docs/3d/MESHY-3D-PROMPTS.md` | 근거 약함 |

## 4. 음악

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| B1 | `audio/music/main-theme.mp3`(「섬의 탐험」), `ending-theme.mp3`(「물바퀴의 노래」) | 2 | 기획자가 Suno로 생성(파일 메타데이터 `made with suno`) | 2026-11-01. 프롬프트 `docs/audio/SUNO-PROMPTS.md`, `docs/video/suno-main-prompt.txt`·`suno-final-prompt.txt`. 원본 `assets/source-media/audio/`(git 추적) | Suno Premier, 상업 이용 가능(2026-11-04 기획자 확인, 요금제 2026-11-18 사용자 확인) | `public/assets/CREDITS.md` 12행, `_shared/voice-provenance-20261118.md` | 확인됨 |

## 5. 효과음

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| S1 | `audio/click_003`, `drop_003`, `confirmation_001`·`002`, `error_001`, `question_002`, `switch_002` (.ogg) + `Kenney-LICENSE.txt` | 8 | Kenney Interface Sounds | 2026-10-22 공식 사이트에서 받음 | CC0 1.0, 원문 동봉 | `public/assets/CREDITS.md` 11·100~104행, `public/assets/audio/sources.json`, `audio/Kenney-LICENSE.txt` | 확인됨 |
| S2 | `audio/bookFlip1`, `cloth1`, `metalLatch` (.ogg) + `Kenney-RPG-LICENSE.txt` | 4 | Kenney RPG Audio | 2026-11-02 | CC0 1.0, 원문 동봉 | `public/assets/CREDITS.md` 162~169행, `audio/Kenney-RPG-LICENSE.txt` | 확인됨 |
| S3 | `audio/impactMetal_medium_000`, `impactPunch_heavy_000`, `impactSoft_heavy_000` (.ogg) + `Kenney-Impact-LICENSE.txt` | 4 | Kenney Impact Sounds 1.0 (4번 프로젝트에 받아 둔 묶음에서 복사) | 2026-11-09 | CC0 1.0, 원문 동봉 | `public/assets/CREDITS.md` 302~311행, `audio/Kenney-Impact-LICENSE.txt` | 확인됨 |
| S4 | `audio/splash_09.ogg`, `audio/bubble_02.ogg` | 2 | rubberduck · Water, Splash & Slime SFX (OpenGameArt) | 2026-11-02 (2026-11-17에 11-09 표의 'Kenney' 오기 바로잡음) | CC0 1.0. 동봉 원문·`sources.json` 항목은 없음 | `public/assets/CREDITS.md` 166·169·371행 | 확인됨 |
| S5 | `audio/water-pour.mp3`, `water-drop.mp3`, `water-bubble.mp3` + `WATER-CC0-LICENSE.txt` | 4 | qubodup(Freesound), AngeloYazar·BMacZero(OpenGameArt) 원본을 짧게 편집 | 2026-11-10 게시 페이지 확인. 편집 내용 `sources.json` | CC0 1.0, 전문 동봉 | `public/assets/CREDITS.md` 317~324행, `audio/sources.json` `waterSounds` | 확인됨 |
| S6 | `audio/bubble-01`, `bubble-03`, `victory-jingle-01`, `victory-jingle-04`, `wind-whoosh-03`, `reward-01`, `reward-03`, `pickup-01`, `step-01`, `step-02` (.mp3) | 10 | 과학34 공용 효과음 라이브러리에서 복사(원본 Freesound 제작자 이름·주소 CREDITS에 있음) | 2026-11-17·18·19. 라이브러리 2026-11-17 라이선스 재확인. 이번에 10개 모두 라이브러리 파일과 SHA-256 일치 확인 | CC0 1.0. 라이브러리 `manifest.json` `license: CC0`, `license_rechecked: true` | `public/assets/CREDITS.md` 361~403행, `_shared/sfx-library-20261117/manifest.json`·`CREDITS.md`·`README.md`, `audio/sources.json`(3개만 기록) | 확인됨 |

- 효과음이 안 나올 때 쓰는 대체음은 `src/sound.js`의 Web Audio 합성이다(파일 없음, CREDITS 13행).

## 6. 목소리

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| V1 | `story/voice/*.mp3` (방울이 95, 밸브 두더지 11, 주민 '오늘 알게 된 것' 10) | 116 | ElevenLabs `eleven_v4` 한국어 라이브러리 음성(방울이 Aria, 두더지 Harry - Character, 주민 각자 기존 음성) | 2026-11-18. 줄마다 목소리 ID·생성 ID·원문·받아쓰기·SHA-256 `docs/VOICE-FILL-20261118.json` | ElevenLabs Creator(유료, 상업 이용 가능). 실존 인물 음성 복제 없음 | `docs/VOICE-FILL-20261118.json`(`plan` 칸), `public/assets/CREDITS.md` 389~394행, `_shared/voice-provenance-20261118.md` | 확인됨 |
| V2 | `audio/npc-elevenlabs/*.mp3` 23개 + `manifest.json` | 24 | ElevenLabs v4 한국어 라이브러리 음성(파랑 Klamon, 뚝딱 oki, 느티 Rowan, 보리 Jisun, 송이 Rumi) | 2026-11-12. 캐릭터별 voice ID·원문·생성 ID `manifest.json` | ElevenLabs Starter(유료, 상업 이용 가능, 2026-11-18 사용자 확인) | `public/assets/CREDITS.md` 359행, `audio/npc-elevenlabs/manifest.json`, `_shared/voice-provenance-20261118.md` | 확인됨 |
| V3 | `audio/npc-momo-20261110/*.mp3` 25개 + `MOMO-SOURCE.txt`, `momo-manifest-20261110.json` | 27 | 로컬 모모 경유 Qwen3-TTS-12Hz-1.7B-VoiceDesign, 가상 캐릭터 프리셋 | 2026-11-10. 줄마다 프리셋·시드·받아쓰기·SHA-256 `momo-manifest-20261110.json`. 첫 커밋 `c1cf657`. **CREDITS에 항목 없음** | 모델 Apache-2.0(파일에 명시). 실존 인물 음성 복제 없음. 모델 라이선스와 생성 음성의 저작권 지위는 별개(`docs/AUDIO-PROVENANCE-20261109.md`) | `audio/npc-momo-20261110/MOMO-SOURCE.txt`, `momo-manifest-20261110.json` | 확인됨 (앱 재생 안 함) |
| V4 | `audio/npc-sohee-20261108/*.mp3` | 23 | Qwen3-TTS 공식 Python API(12Hz-1.7B-CustomVoice, 커밋 `0c0e305…`), Sohee 음색, Apple AVAudioUnitTimePitch로 높낮이 보정 | 2026-11-08. `assets/source-media/npc-qwen-sohee-20261108/`(`model-source.json`, `manifest.json`, 재현 스크립트) | 모델 Apache-2.0. 실존 인물 음성 복제 없음 | `public/assets/CREDITS.md` 285~289행, `docs/AUDIO-PROVENANCE-20261109.md` | 확인됨 (앱 재생 안 함) |
| V5 | `audio/npc-20261107/*.m4a` | 33 | 모모 도구 프리셋 음성(preset-05·07 등, 시드 기록) | 2026-11-07. `assets/source-media/npc-voice-20261107/manifest.json`(git 제외) | **쓴 음성 엔진·모델 라이선스가 파일 기록에 없음.** 공용 문서에는 "모모 로컬 음성 = Qwen3-TTS Apache-2.0"이라는 일반 설명만 있음 | `public/assets/CREDITS.md` 271행, `_shared/voice-provenance-20261118.md` 요금제 표 | 근거 약함 (앱 재생 안 함) |
| V6 | `audio/npc-cute-20261107/*.m4a` | 23 | 모모 도구 어린이 프리셋 `preset-01`·`02`로 V5 일부를 다시 생성 | 2026-11-07. `assets/source-media/npc-voice-cute-20261107/manifest.json`(git 제외) | V5와 같음(엔진·라이선스 기록 없음) | `public/assets/CREDITS.md` 272행 | 근거 약함 (앱 재생 안 함) |
| V7 | `audio/briefings/resident-01~10.m4a` | 10 | 모모 자비스 기본 음성 프리셋 | 2026-11-05. 생성 기록 파일 없음 | 엔진·라이선스 기록 없음 | `public/assets/CREDITS.md` 240행 | 근거 약함 (앱 재생 안 함) |

- V3~V7(116개 파일)은 지금 앱이 재생하지 않는 옛 목소리다. `src/npc-audio.js`는 `npc-elevenlabs/`만, `src/voice-lines-data.js`는 `story/voice/`만 쓴다. `_shared/voice-provenance-20261118.md`도 6번에서 지금 재생되는 목소리를 ElevenLabs뿐으로 적었다.

## 7. 글꼴 · 라이브러리

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| F1 | `fonts/NanumSquareNeoTTF-bRg.woff2`, `NanumSquareNeoTTF-cBd.woff2` + `NanumSquareNeo-OFL.txt`, `NanumSquareNeo-SOURCE.json` | 4 | NAVER 나눔스퀘어 네오 | 2026-10-25 검토, 2026-11-10 현재 파일. 출처·해시 `SOURCE.json` | SIL OFL 1.1, 전문 동봉 | `public/assets/CREDITS.md` 10·36·326~328행 | 확인됨 |
| L1 | `vendor/phaser.min.js` + `PHASER-LICENSE.md` | 2 | Phaser 3.90.0 (2026-11-11 리스너 정리 로컬 수정) | 2026-10-18 | MIT, 전문 동봉 | `public/assets/CREDITS.md` 9·37·98·345~347행 | 확인됨 |
| L2 | `vendor/three/three.module.min.js`, `GLTFLoader.js`, `BufferGeometryUtils.js` + `THREE-LICENSE.txt` | 4 | Three.js 0.170.0 (로더 import 경로만 수정) | 2026-10-25 | MIT, 전문 동봉 | `public/assets/CREDITS.md` 156행 | 확인됨 |

## 8. 장부 밖 (자체 코드·페이지)

`src/` 94개(JS·CSS), `index.html`, `update.html`, `manifest.webmanifest`, `sw.js`, `build-info.json`, `assets/CREDITS.md`, `audio/sources.json` — 101개. 프로젝트가 직접 쓴 코드와 기록 파일이라 상태를 매기지 않았다. SVG 아이콘·눈금·물높이 같은 코드 그림도 여기 속한다(CREDITS 42·63행, `docs/icon-prompts.md`).

## 요약

| 상태 | 줄 수 | 파일 수 |
|---|---:|---:|
| 확인됨 | 40 | 394 |
| 근거 약함 | 9 | 113 |
| **출처 미확인** | 0 | 0 |
| 합계(장부 대상) | 49 | 507 |
| 장부 밖(자체 코드·기록) | 1 | 101 |
| 배포본 전체 | | 608 |

- 근거 약함 238개 가운데 그림이 133개(OpenAI 생성분 G6~G19 122, Higgsfield 11-09분 G5 4, 방울이 원본·파생 G2·G20·G21 7)다. **OpenAI 생성 계정의 요금제 하나만 확인되면 G6~G19 14줄(122개)이 한꺼번에 「확인됨」으로 올라간다.**
- 근거 약함 가운데 V5·V6·V7 목소리 66개는 앱이 재생하지 않는다. 확인됨인 V3·V4 50개도 재생하지 않는다. 납품본에서 빼면 장부가 116개 줄어든다(빼는 결정은 이 문서 범위 밖).
- 앱에서 쓰지 않는데 배포되는 그림: `icons/bangul-loader.webp`(출처 미확인), `learning/ice-texture.webp`·`water-texture.webp`·`time-clock.webp`·`time-wand.webp`(근거 약함), `v2/valve-mole-sheet.webp`(근거 약함).
- **사용자 확인 반영(2026-11-21 09:25):** 조율 세션 질문 「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제로 만든 게 맞아?」에 사용자가 「전부 맞아」. `_shared/CODEX-IMAGE-RECORDS-20261121.md` 「16곳 전체 확인」의 쓰는 법대로 G23·G24·M1(출처 미확인)과, 요금제 기록만 빠져 있던 OpenAI·Codex 그림 줄 G6~G20·G25~G27을 「확인됨(사용자 확인)」으로 바꿨다(21줄·143개).
- **확인과 어긋나서 그대로 둔 줄:** G1~G5(15개)는 저장소 기록이 Higgsfield(GPT Image 2.5·2.6)라고 적고 있어 「전부 Codex」와 다르다. 증거대로 Higgsfield로 두었다(G1·G3·G4 확인됨, G2·G5 근거 약함). G21(아이콘·공유 그림)은 G2 등에서 만든 파생본이라 G2와 함께 근거 약함으로 둔다.
- **이 확인 범위 밖이라 그대로인 줄:** M3 HyperFrames·M4 Remotion(코드로 렌더한 영상, 도구 라이선스 문제), D1 Meshy 3D 모델, V5~V7 모모 목소리(재생 안 함).
- **3-2a 보강(2026-11-21):** `_shared/CODEX-IMAGE-RECORDS-20261121.md` 방법으로 Codex 생성 기록(이 맥은 2026-11-05부터)과 대조해 G25·G26·G27 12장의 생성 기록·변환 명령을 찾았다. 계정 요금제 기록은 다른 OpenAI 줄처럼 아직 없어서 「근거 약함」으로 올렸다. G23(10-25)·G24(10-18)는 기록 시작일 전이라 기록이 없고, 사용자 말(「이미지는 다 코덱스로 만들었어」)은 이 프로젝트에 다시 확인받지 않아 쓰지 않았다. M1 영상도 같은 이유로 그대로 둔다.

### CREDITS와 현재 파일이 어긋나는 곳

1. `concepts/`: CREDITS는 `stage-1~10` 자체 SVG 영상으로 적었지만 현재 배포본은 `zone-1~5` HyperFrames 영상이다.
2. CREDITS에 항목이 없는 배포 파일: `run-stage/` 16개(기록은 `docs/RUN-STAGE-3D-PLAN-20261117.md`에만), `audio/npc-momo-20261110/` 27개(폴더 안 기록만), G23~G27 그림 14개.
3. `audio/sources.json`에는 S1·S5와 S6 중 3개만 있고 S2·S3·S4와 S6 나머지 7개가 없다(CREDITS 본문에는 있음).
4. 공개 배포되는 `assets/CREDITS.md`에 '확인 필요' 판정, 계정 요금제, 외장 SSD 절대 경로(`/Volumes/T7 Shield/...`) 같은 내부 메모가 그대로 들어 있다.

## 사용자가 줘야 하는 자료

1. **OpenAI(ChatGPT·Codex 내장 이미지) 생성 계정 근거** — (2026-11-21 사용자 확인으로 장부는 채움. 아래 캡처는 **납품 증빙용**) 2026-10-15부터 11-18까지 그림을 만든 계정의 명의(개인 옐샘인지 회사인지)와 요금제가 보이는 ChatGPT 설정·구독 화면 캡처 또는 결제 영수증. 같은 날짜 범위의 OpenAI 이용약관 '콘텐츠 소유권' 조항 원문 화면(2026-10-25에는 원문을 직접 열지 못함). 대상: G6~G19.
2. **방울이 원본과 실험실 배경 3장(G20)** — (2026-11-21 사용자 확인으로 「ChatGPT(GPT 이미지)·유료」 장부는 채움. 다른 사람이 준 파일이 아니라면 납품 계약의 저작권 귀속만 확인) 2026-09-23 `ChatGPT Image …png`·`chatgpt_generated_035.png`를 누가 어느 계정으로 만들었는지, 다른 사람(회사·동료)이 준 파일이면 받은 메일이나 이용 허락 문구. 방울이 캐릭터 저작권을 옐샘과 아이스크림미디어 중 누구에게 두는지 정한 문서. G2·G11의 `bangul-walk`·G16의 `bangul-hit`·G21 아이콘이 모두 이 원본에 기댄다.
3. **Higgsfield** — 2026-10-25·10-29 Basic 요금제 결제 화면, 2026-11-09 GPT Image 2.6 생성 시점의 요금제 화면, GPT Image 2.5·2.6 공급사 조건이 적힌 화면(CREDITS 남은 확인 ①②).
4. **Meshy** — 2026-10-25 Image to 3D 변환에 쓴 계정의 요금제 화면(무료였는지 유료였는지)과 그때의 출력 이용 조건 화면. 대상: D1 모델 9개.
5. **도입·엔딩 영상 원본(M1)** — (2026-11-21 사용자 확인으로 「제미나이·유료」 장부는 채움. 요금제 캡처는 납품 증빙용, 영상 속 주변음 출처는 그대로 남은 질문) 원본 영상을 만든 도구 이름, 계정·요금제, 생성 날짜(2026-11-01~04 무렵), 그 도구의 상업 이용 조건 화면. 시작 장면 그림을 만든 ChatGPT 계정. 영상 속 주변음의 출처.
6. **Remotion(M4)** — 제작 주체가 Remotion 무료 라이선스 대상(개인 또는 직원 3명 이하 조직)인지에 대한 확인. 회사 라이선스가 필요하면 구매 내역.
7. **HyperFrames(M3)** — 쓴 HyperFrames 0.9.26의 라이선스 파일이나 이용 조건 화면(무료판인지 Pro인지), 함께 쓴 애니메이션 라이브러리 조건.
8. **출처 미확인 그림 2개(G23 `icons/bangul-loader.webp`, G24 `v2/experiment-table-v3.webp`)의 생성 기록**(3-2a에서 G25~G27 12개는 Codex 기록으로 찾음) — (**끝**: 2026-11-21 사용자 확인으로 G23·G24 「Codex(GPT 이미지)·유료」로 채움) 그 날짜(2026-10-25, 10-18)의 생성 대화나 원본 파일이 남아 있으면 도구 이름과 프롬프트. 이 맥의 Codex 기록은 11-05부터라 여기서는 찾을 수 없다. 없으면 다시 만들 그림 목록으로 넘긴다(`pipe-burst-photo`는 생성 그림으로 확인됨).
9. **ElevenLabs** — 2026-11-12 Starter, 2026-11-18 Creator 구독 결제 영수증이나 구독 화면 캡처(지금은 사용자 구두 확인만 기록됨). 쓴 라이브러리 음성(Aria, Harry - Character, Klamon, oki, Rowan, Jisun, Rumi)의 상업 이용 조건이 보이는 화면.
10. **Suno** — 2026-11-01 생성 시점에 Premier(또는 유료) 구독 중이었다는 결제 화면. 지금은 사용자 확인 문장만 있음.
11. **모모 음성(V5·V6·V7)** — 2026-11-05·11-07에 쓴 음성 엔진(Qwen3-TTS인지 다른 모델인지). 또는 앱이 재생하지 않으니 납품본에서 빼기로 한 결정.
12. **성우·목소리 동의** — 기록상 실제 사람 목소리를 녹음하거나 복제한 파일은 없다. 따로 받을 동의서는 없으며, 사람 녹음이 있었다면 알려 달라.
13. **아이스크림미디어 납품 계약** — 결과물 저작권 귀속, AI 생성물 사용 허용 여부, 제3자 CC0·오픈 라이선스 자료 사용 허용 조항, 크레딧 문구(`기획·제작: 옐샘 & ⓒ 아이스크림미디어`) 합의가 담긴 계약서나 메일.

## 2026-11-22 판매 준비 점검 (문서만, 장부 줄은 고치지 않음)

- 줄 수 49(장부 대상). 빈 칸·「미확인」·「확인 대기」·「출처 미확인」 줄 0. 확인됨(사용자 확인 포함) 40줄, 근거 약함 9줄이다.
- 2026-11-21 사용자 확인(그림 전부 Codex·GPT, 이야기 영상 구글 제미나이, 모두 유료)으로 새로 채울 수 있는 줄은 없었다. 남은 9줄은 저장소 기록이 다른 출처를 가리키거나(G2·G5·G21 Higgsfield와 그 파생, D1 Meshy) 도구 라이선스 확인이 필요하거나(M3 HyperFrames, M4 Remotion) 앱이 재생하지 않는 파일(V5~V7)이라 증거대로 두었다.
- 사용자 자료 대기: Higgsfield 요금제·공급사 조건 화면(G2·G5), Meshy 요금제 화면(D1), Remotion 무료 라이선스 대상 확인(M4), HyperFrames 라이선스 확인(M3), 모모 음성 엔진 확인 또는 납품본에서 빼기 결정(V5~V7), OpenAI·Gemini·ElevenLabs·Suno 요금제 화면, 아이스크림미디어 납품 계약의 AI 생성물 허용·귀속 조건.
- 06번 인트로·엔딩 영상(M1)은 2026-11-22에 영상 장면이 바뀐 9~16번에 들어 있지 않아 「임시 판」 표기는 없다.

## 2026-11-22 인증서 테두리 추가

| ID | 자료 | 제작·출처 | 생성 기록 | 판정 |
|---|---|---|---|---|
| IMG-CERT-06 | `public/assets/certificate-frame-20261122.webp`(1800×1273,189272바이트),원본 `assets/source/certificate-20261122/certificate-frame.png` | Codex 기본 이미지 생성 도구(GPT 이미지),프로젝트 자체 생성,2026-11-22 | `assets/source/certificate-20261122/PROMPT-06.txt`;생성1회. 물방울·얼음 결정·수증기 구름·실험기구·작은 방울이,중앙 빈 종이,글자·로고 없음. | 확인됨(사용자 그림 제작 도구 지시와 이번 생성 기록) |
