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
| G6 | `v2/journey-map.webp`, `equipment-atlas.webp`, `workshop-atlas.webp` | 3 | OpenAI 이미지 생성 도구 | 2026-10-15. 프롬프트 `docs/reviews/ASSET-GENERATION-2026-10-15.md`, `docs/reviews/WORLD-ASSETS-2026-10-15.md` | OpenAI 공통 근거(계정·요금제 기록 없음) | `public/assets/CREDITS.md` 70~90행 | 근거 약함 |
| G7 | `v2/story-repair.webp`, `v2/rescue-reward.webp` | 2 | OpenAI 이미지 생성 도구 (방울이·연구섬 참조) | 2026-10-21. `docs/reviews/ASSET-GENERATION-2026-10-21.md` | OpenAI 공통 근거 | `public/assets/CREDITS.md` 30~31행 | 근거 약함 |
| G8 | `v2/research-island-v4.webp`, `learning/scale.webp`, `learning/condenser-plate.webp` | 3 | 내장 OpenAI `image_gen` | 2026-10-24. 프롬프트 원문 `docs/reviews/ASSET-GENERATION-20261024.md`, 원본 `image/generated-learning/` | OpenAI 공통 근거 | `public/assets/CREDITS.md` 107~114행 | 근거 약함 |
| G9 | `stages/spring-terrace·winter-waterworks·sun-courtyard·dew-greenhouse·water-search·drink-bottle.webp` | 6 | 내장 OpenAI `image_gen` | 2026-10-25. `docs/reviews/ASSET-GENERATION-20261025.md`, `docs/reviews/STAGE-IMAGES-20261025.md`. 원본 `image/generated-stage-experience/` | OpenAI 공통 근거 | `public/assets/CREDITS.md` 116~122행 | 근거 약함 |
| G10 | `v2/resident-1.webp` ~ `resident-10.webp` | 10 | 내장 OpenAI 이미지 생성 도구 | 2026-11-02. 원본 `image/research-island-residents/`. 프롬프트 기록 없음 | OpenAI 공통 근거 | `public/assets/CREDITS.md` 183~185행 | 근거 약함 |
| G11 | `v2/bangul-walk.webp`, `v2/pouring-glass.webp`, `v2/pouring-jug.webp`, `learning/real-cloth·real-ice·real-painting·real-dew·real-tools.webp` | 8 | 내장 OpenAI 이미지 생성 도구 (`bangul-walk`은 타이틀 방울이 참고, 11-06 로컬 색 보정) | 2026-11-03. 프롬프트 원문이 CREDITS 안에 있음 | OpenAI 공통 근거. `bangul-walk`은 방울이 원본 권리 문제도 같이 걸림 | `public/assets/CREDITS.md` 171~235행 | 근거 약함 |
| G12 | `learning/heat-plate-guide.webp`, `cold-plate-guide.webp`, `cold-plate-dry.webp`, `water-material.webp` | 4 | Codex 내장 ImageGen | 2026-11-05. 프롬프트 `docs/reviews/ASSET-UPDATE-20261105.md`. 원본 `.tmp/visual-qa/generated-originals/` | OpenAI 공통 근거 | `public/assets/CREDITS.md` 237~240행 | 근거 약함 |
| G13 | `learning/experiment-props-20261107/` 전체 | 22 | OpenAI imagegen. 컵·금속판·물 받이·냉각팩은 `real-dew`·`real-tools`·`workshop-atlas`에서 잘라냄 | 2026-11-07. 프롬프트 `assets/source-media/experiment-props-20261107/provenance.json`(git 제외) | OpenAI 공통 근거 | `public/assets/CREDITS.md` 267~270행 | 근거 약함 |
| G14 | `learning/ending-collector-20261108/` (1), `learning/ice-tray-20261108/` (2), `learning/freeze-props-20261108/` (4), `learning/overnight-20261108/` (1) | 8 | OpenAI 기본 imagegen / `image_gen` | 2026-11-08. `assets/source-media/ending-collector-20261108/manifest.json`·`PROMPTS.md`, `ice-tray-20261108/generation.json`, `freeze-props-20261108/PROMPTS.md`, `docs/design/ICE-TRAY-20261108.md`. `overnight` 원본 PNG는 git 추적 | OpenAI 공통 근거 | `public/assets/CREDITS.md` 275~294행 | 근거 약함 |
| G15 | `v2/map-villain-mole.webp`, `v2/bangul-combat-sheet.webp`, `v2/valve-mole-sheet.webp` | 3 | OpenAI GPT Image (다른 작업 세션, 제작자 확인). `map-villain-mole`은 `valve-mole-sheet`를 로컬 정리한 것 | 2026-11-09. 프롬프트 원문 남아 있지 않음 | OpenAI 공통 근거. `valve-mole-sheet.webp`는 앱 표시 안 함 | `public/assets/CREDITS.md` 296~300행 | 근거 약함 |
| G16 | `learning/adventure-20261111/` (8), `learning/bangul-hit-20261111/bangul-hit.webp` (1) | 9 | Codex 내장 `image_gen` (`bangul-hit`은 `bangul-title` 참고) | 2026-11-11. `assets/source-media/adventure-20261111/prompts.json`, `bangul-hit-20261111/prompt.json`(git 제외) | OpenAI 공통 근거 | `public/assets/CREDITS.md` 330~343행 | 근거 약함 |
| G17 | `v2/parang-neutral·parang-think·parang-happy.webp` (3), `npc-expressions/resident-{2,4,6,8,10}-{neutral,think,happy}.webp` (15) | 18 | Codex 내장 `image_gen` (기존 주민 그림 참조) | 2026-11-12. 원본 `_scratch/npc-dialogue-plan-20261112/generated-parang/`, `output/npc-dialogue-expanded-20261112/` | OpenAI 공통 근거 | `public/assets/CREDITS.md` 349~358행 | 근거 약함 |
| G18 | `run-stage/` 전체 (원경, 길·벽 타일, 열판·냉각판, 물·얼음 달리기, 장식 9종) | 16 | `gpt-imagegen`(ChatGPT 앱의 Codex 내장 GPT 이미지) | 2026-11-17. 프롬프트 전문 `docs/RUN-STAGE-3D-PLAN-20261117.md` 165~267행. 원본 `assets/source-media/run-stage-20261117/`(git 제외). 첫 커밋 `9603468`·`8272213` 2026-11-17. **CREDITS에 항목 없음** | OpenAI 공통 근거 | `docs/RUN-STAGE-3D-PLAN-20261117.md` | 근거 약함 |
| G19 | `reward-cards/card-*`, `thumb-*` | 10 | ChatGPT 앱의 Codex 내장 이미지 도구(GPT 이미지) | 2026-11-18. 원본 `_scratch/reward-cards-20261118/gen/06/` | OpenAI 공통 근거 | `public/assets/CREDITS.md` 373~377행 | 근거 약함 |
| G20 | `v2/buddy-poses-clean.webp`(방울이 16포즈), `v2/lab-workshop.webp`, `v2/lab-core.webp` | 3 | 사용자가 작업 폴더에 준 ChatGPT 생성 이미지(`image/ChatGPT Image 2026년 9월 23일 …png`, `image/chatgpt_generated_035.png`) | 원본 파일 이름의 날짜 2026-09-23. 첫 커밋 `dab7cb1`·`224a381` | **생성한 사람·계정·요금제 기록 없음.** CREDITS가 "방울이가 주인공이라 우선 확인"으로 표시 | `public/assets/CREDITS.md` 17·43·55~90행 | 근거 약함 (주인공 캐릭터 원본, 최우선) |
| G21 | `icons/icon-192.png`, `icons/icon-512.png`, `icons/og-image-v1.jpg` | 3 | 새 생성 없음. 앱 아이콘은 `rescue-reward`(G7)·`buddy-poses-clean`(G20)을 로컬 PIL로 자름. 공유 그림은 G1·G2 세 장을 sharp로 합성 | 2026-10-25(아이콘), 2026-10-29(공유 그림) | 원본 그림의 상태를 따름. G20 방울이 권리가 걸림 | `public/assets/CREDITS.md` 134·160행 | 근거 약함 |
| G22 | `learning/weight-100g.webp`, `ice-pop-soft.webp`, `ice-pop-frozen.webp`, `pipe-water.webp`, `pipe-burst.webp` (`learning/` 바로 아래) | 5 | 프로젝트 코드로 직접 그림(`scripts/learning-art/freeze-props.mjs`가 SVG → WebP) | 2026-11-06 | 자체 제작. 외부 자료 없음 | `public/assets/CREDITS.md` 247~256행, `scripts/learning-art/freeze-props.mjs` | 확인됨 |
| G23 | `icons/bangul-loader.webp` | 1 | 기록 없음 | 첫 커밋 `46038cf` 2026-10-25(커밋 메시지에 그림 설명 없음) | 기록 없음. 앱 표시 안 함 | — | **출처 미확인** |
| G24 | `v2/experiment-table-v3.webp` | 1 | 기록 없음. CREDITS는 "이전 작업에서 생성해 둔"이라고만 적고 "생성 도구부터 확인해야 한다"고 표시 | 첫 커밋 `dab7cb1` 2026-10-18 | 기록 없음. `src/experience.css`·`src/tablet.css`가 사용 | `public/assets/CREDITS.md` 16·96행 | **출처 미확인** |
| G25 | `learning/time-clock-face.webp`, `time-clock.webp`, `time-wand.webp`, `time-wand-tap.webp` | 4 | 기록 없음. 외장 원본 `assets/source-media/time-magic-20261110/clock.png`·`wand.png`(git 제외)만 있고 도구·프롬프트 파일 없음 | 첫 커밋 `d0d906a` 2026-11-10(메시지는 "실험 관찰과 코어 복구 흐름 개선 및 CC0 물소리 적용") | 기록 없음. `src/time-dial.js`가 사용 | — | **출처 미확인** |
| G26 | `learning/ice-texture.webp`, `learning/water-texture.webp`, `learning/pipe-burst-photo.webp` | 3 | 기록 없음. 원본 파일도 찾지 못함. `pipe-burst-photo`는 이름에 'photo'가 있어 실사 사진인지부터 확인해야 함 | 첫 커밋 `d0d906a` 2026-11-10 | 기록 없음. `pipe-burst-photo`는 `src/freeze-measure.js`가 사용, 두 텍스처는 앱 표시 안 함 | — | **출처 미확인** |
| G27 | `learning/condensation-20261108/bottle-wet.webp`, `cold-plate-wet.webp`, `collector-cold-dry.webp`, `collector-cold-wet.webp`, `room-bench.webp` | 5 | 기록 없음. 원본 `assets/source-media/condensation-20261108/*-generated.png`(git 추적)의 이름에 'generated'만 있음 | 첫 커밋 `7ae28c7` 2026-11-09 | 기록 없음. `src/inquiry.js`·`phaser-scenes.js`·`transform-process.js`·`greenhouse-cycle.js`가 사용 | — | **출처 미확인** |

## 2. 영상

| # | 파일(묶음) | 개수 | 만든 곳 | 만든 날 · 기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---:|---|---|---|---|---|
| M1 | `story/intro.mp4`, `story/intro.webp`, `story/final.mp4`, `story/final.webp` | 4 | 원본 영상: **기록 없음**. 기획자 제공 영상에 `scripts/render-film.mjs`로 색 보정·나눔스퀘어네오 자막·Suno 배경음·CC0 효과음을 입힘. 시작 장면 그림은 ChatGPT 페이지에서 만든 것으로 보임(`video-prompts-20261101.json`의 `page_url`이 chatgpt.com) | 2026-11-01 계획, 첫 커밋 `ca12f5b` 2026-11-04. 원본 `assets/source-media/video/intro.mp4`·`final.mp4`(git 추적) | CREDITS가 "원본 영상의 제작 도구와 권리는 기록에 없다", 판정 '확인 필요'. 영상 속 원본 주변음 출처도 기록 없음(`_shared/AUDIO-FIX4-BRIEF-20261120.md` 84행 "원본 주변음에 말소리가 없는지는 귀로 미확인") | `public/assets/CREDITS.md` 14행, `docs/video/VIDEO-PLAN-20261101.md`, `docs/video/video-prompts-20261101.json` | **출처 미확인** |
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
| 확인됨 | 19 | 251 |
| 근거 약함 | 24 | 238 |
| **출처 미확인** | 6 | 18 |
| 합계(장부 대상) | 49 | 507 |
| 장부 밖(자체 코드·기록) | 1 | 101 |
| 배포본 전체 | | 608 |

- 근거 약함 238개 가운데 그림이 133개(OpenAI 생성분 G6~G19 122, Higgsfield 11-09분 G5 4, 방울이 원본·파생 G2·G20·G21 7)다. **OpenAI 생성 계정의 요금제 하나만 확인되면 G6~G19 14줄(122개)이 한꺼번에 「확인됨」으로 올라간다.**
- 근거 약함 가운데 V5·V6·V7 목소리 66개는 앱이 재생하지 않는다. 확인됨인 V3·V4 50개도 재생하지 않는다. 납품본에서 빼면 장부가 116개 줄어든다(빼는 결정은 이 문서 범위 밖).
- 앱에서 쓰지 않는데 배포되는 그림: `icons/bangul-loader.webp`(출처 미확인), `learning/ice-texture.webp`·`water-texture.webp`(출처 미확인), `v2/valve-mole-sheet.webp`(근거 약함).

### CREDITS와 현재 파일이 어긋나는 곳

1. `concepts/`: CREDITS는 `stage-1~10` 자체 SVG 영상으로 적었지만 현재 배포본은 `zone-1~5` HyperFrames 영상이다.
2. CREDITS에 항목이 없는 배포 파일: `run-stage/` 16개(기록은 `docs/RUN-STAGE-3D-PLAN-20261117.md`에만), `audio/npc-momo-20261110/` 27개(폴더 안 기록만), G23~G27 그림 14개.
3. `audio/sources.json`에는 S1·S5와 S6 중 3개만 있고 S2·S3·S4와 S6 나머지 7개가 없다(CREDITS 본문에는 있음).
4. 공개 배포되는 `assets/CREDITS.md`에 '확인 필요' 판정, 계정 요금제, 외장 SSD 절대 경로(`/Volumes/T7 Shield/...`) 같은 내부 메모가 그대로 들어 있다.

## 사용자가 줘야 하는 자료

1. **OpenAI(ChatGPT·Codex 내장 이미지) 생성 계정 근거** — 2026-10-15부터 11-18까지 그림을 만든 계정의 명의(개인 옐샘인지 회사인지)와 요금제가 보이는 ChatGPT 설정·구독 화면 캡처 또는 결제 영수증. 같은 날짜 범위의 OpenAI 이용약관 '콘텐츠 소유권' 조항 원문 화면(2026-10-25에는 원문을 직접 열지 못함). 대상: G6~G19.
2. **방울이 원본과 실험실 배경 3장(G20)** — 2026-09-23 `ChatGPT Image …png`·`chatgpt_generated_035.png`를 누가 어느 계정으로 만들었는지, 다른 사람(회사·동료)이 준 파일이면 받은 메일이나 이용 허락 문구. 방울이 캐릭터 저작권을 옐샘과 아이스크림미디어 중 누구에게 두는지 정한 문서. G2·G11의 `bangul-walk`·G16의 `bangul-hit`·G21 아이콘이 모두 이 원본에 기댄다.
3. **Higgsfield** — 2026-10-25·10-29 Basic 요금제 결제 화면, 2026-11-09 GPT Image 2.6 생성 시점의 요금제 화면, GPT Image 2.5·2.6 공급사 조건이 적힌 화면(CREDITS 남은 확인 ①②).
4. **Meshy** — 2026-10-25 Image to 3D 변환에 쓴 계정의 요금제 화면(무료였는지 유료였는지)과 그때의 출력 이용 조건 화면. 대상: D1 모델 9개.
5. **도입·엔딩 영상 원본(M1)** — 원본 영상을 만든 도구 이름, 계정·요금제, 생성 날짜(2026-11-01~04 무렵), 그 도구의 상업 이용 조건 화면. 시작 장면 그림을 만든 ChatGPT 계정. 영상 속 주변음의 출처.
6. **Remotion(M4)** — 제작 주체가 Remotion 무료 라이선스 대상(개인 또는 직원 3명 이하 조직)인지에 대한 확인. 회사 라이선스가 필요하면 구매 내역.
7. **HyperFrames(M3)** — 쓴 HyperFrames 0.9.26의 라이선스 파일이나 이용 조건 화면(무료판인지 Pro인지), 함께 쓴 애니메이션 라이브러리 조건.
8. **출처 미확인 그림 14개(G23~G27)의 생성 기록** — 그 날짜(2026-10-25, 10-18, 11-09, 11-10)의 생성 대화나 원본 파일이 남아 있으면 도구 이름과 프롬프트. 없으면 다시 만들 그림 목록으로 넘긴다. `learning/pipe-burst-photo.webp`는 실사 사진을 내려받은 것인지 꼭 확인.
9. **ElevenLabs** — 2026-11-12 Starter, 2026-11-18 Creator 구독 결제 영수증이나 구독 화면 캡처(지금은 사용자 구두 확인만 기록됨). 쓴 라이브러리 음성(Aria, Harry - Character, Klamon, oki, Rowan, Jisun, Rumi)의 상업 이용 조건이 보이는 화면.
10. **Suno** — 2026-11-01 생성 시점에 Premier(또는 유료) 구독 중이었다는 결제 화면. 지금은 사용자 확인 문장만 있음.
11. **모모 음성(V5·V6·V7)** — 2026-11-05·11-07에 쓴 음성 엔진(Qwen3-TTS인지 다른 모델인지). 또는 앱이 재생하지 않으니 납품본에서 빼기로 한 결정.
12. **성우·목소리 동의** — 기록상 실제 사람 목소리를 녹음하거나 복제한 파일은 없다. 따로 받을 동의서는 없으며, 사람 녹음이 있었다면 알려 달라.
13. **아이스크림미디어 납품 계약** — 결과물 저작권 귀속, AI 생성물 사용 허용 여부, 제3자 CC0·오픈 라이선스 자료 사용 허용 조항, 크레딧 문구(`기획·제작: 옐샘 & ⓒ 아이스크림미디어`) 합의가 담긴 계약서나 메일.
