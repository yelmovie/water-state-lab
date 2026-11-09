# 에셋 출처

## 도구·라이선스 검토 (2026-10-25)

상업 배포물(옐샘 & 아이스크림미디어) 기준으로 검토했다. 법률 자문이 아니며, 라이선스·약관은 바뀔 수 있으므로 배포 전에 원문을 다시 본다. 웹 약관은 아래 날짜에 확인한 내용이다.

| 도구·자료 | 쓰는 곳 | 라이선스·조건 (확인 근거) | 판정 | 조치 |
|---|---|---|---|---|
| Phaser 3.90.0 | `vendor/phaser.min.js`. 지도·실험 Canvas. 배포 포함 | MIT. 전문 `vendor/PHASER-LICENSE.md`(Copyright (c) 2024 Richard Davey, Phaser Studio Inc.) 동봉, 빌드에 함께 복사. 버전은 파일 안 `VERSION:"3.90.0"`으로 확인 | PASS | 설정 > 자료 출처의 저작권자 표기(Photon Storm)를 라이선스 파일 표기와 맞추면 좋다 |
| Jua 글꼴 | `fonts/jua-korean-400.woff2`, `jua-latin-400.woff2`. 제목 글꼴. 배포 포함 | SIL OFL 1.1. `fonts/Jua-OFL.txt`에 저작권 줄(Woowahan Brothers, Reserved Font Name "Jua", Google Fonts 배포)과 OFL 1.1 전문이 끝까지 들어 있음. 배민 자체 약관판 '주아체'가 아니라 OFL판으로 기록됨 | PASS | 두 서브셋 파일을 처음 받은 배포처(Google Fonts 등)는 기록에 없다. 알면 이 칸에 보강 |
| Kenney Interface Sounds 7종 | `audio/*.ogg`. 효과음. 배포 포함 | CC0 1.0. `audio/Kenney-LICENSE.txt` 원문(개인·교육·상업 프로젝트 사용 가능, 크레딧 선택)과 `audio/sources.json`(출처·다운로드 주소·파일 대응) 동봉 | PASS | 없음 |
| 배경 음악 2곡 | `audio/music/main-theme.mp3`(「섬의 탐험」), `ending-theme.mp3`(「물바퀴의 노래」). 원본 `assets/source-media/audio/` | 기획자가 Suno로 생성해 제공(파일 메타데이터 `made with suno`, 2026-11-01). 프롬프트 `docs/audio/SUNO-PROMPTS.md`. 재인코딩 없이 표지 그림과 메타데이터를 빼고, 메인은 끝 무음 1초를 잘랐다 | PASS | 2026-11-04 기획자가 생성 계정의 상업적 이용 가능을 확인했다. 요금제 이름은 알면 이 칸에 보강 |
| 대체 효과음 | `src/sound.js` | 프로젝트 코드의 Web Audio 합성. 내려받은 음원 없음 | PASS | 없음 |
| 도입·엔딩 영상 | `story/intro.*`, `final.*`(MP4·VTT·WebP). 원본 `assets/source-media/video/` | 기획자 제공 영상에 `scripts/render-film.mjs`로 색 보정, Jua 자막, 캔버스 연출, 위 배경 음악, CC0 효과음을 입혀 H.264/AAC로 인코딩 | 확인 필요 | 원본 영상의 제작 도구와 권리는 기록에 없다. 알면 이 칸에 보강 |
| 개념 영상 렌더 도구 | `scripts/concept-clips/render.mjs`, `scenes.mjs` → `concepts/stage-1~10` MP4·WebM·WebP | 자체 SVG 장면을 sharp로 RGBA 변환해 FFmpeg(libx264, libvpx-vp9)로 인코딩. import는 Node 내장 모듈·`src/concept-data.js`·`scenes.mjs`·sharp뿐. 저장소의 package.json 2개(루트, `files/` 보관 사본)에 의존성 없음. Remotion·Highcharts·ag-Grid·Handsontable·Spine·유료 아이콘 패키지 검색 0건 | PASS | sharp·FFmpeg는 개발 도구로만 실행하고 배포 번들에 넣지 않는다 |
| 내장 OpenAI `image_gen` (2026-10-15·21·24·25 생성분) | `v2/equipment-atlas`, `workshop-atlas`, `journey-map`, `story-repair`, `rescue-reward`, `research-island-v4`, `learning/*`, `stages/*` | OpenAI 이용약관 '콘텐츠 소유권': 법이 허용하는 범위에서 이용자가 출력을 소유하고 OpenAI는 출력에 대한 권리를 이용자에게 양도한다. 비슷한 출력이 다른 이용자에게 나올 수 있다. 2026-10-25 검색 결과의 약관 인용으로 확인(원문 https://openai.com/policies/terms-of-use/ 는 이번 접속에서 403으로 직접 열지 못함) | 확인 필요 | 생성에 쓴 계정의 명의·요금제가 기록에 없다. 회사 결과물에 넣는 데 문제가 없는지 회사 담당자 확인. 사용 중인 `v2/experiment-table-v3.webp`(와 교체 중인 `research-island-v3.webp`)는 2026-10-18 기록에 '이전 작업에서 생성'으로만 적혀 있어 생성 도구부터 확인해야 한다 |
| 사용자 제공 ChatGPT 생성 이미지 | `v2/buddy-poses-clean.webp`(방울이), `lab-main.png`, `lab-room.png`, 사용 예정 `v2/lab-workshop.webp`·`lab-core.webp` | 생성한 사람·계정·요금제 기록 없음. 이전 기록대로 공개·상업 배포 권리는 소유자 확인 전 | 확인 필요 | 방울이가 주인공이라 우선 확인. 확인되면 이 칸과 설정 고지 첫 줄을 고친다 |
| Higgsfield · GPT Image 2.5 (2026-10-25 생성분, Basic 유료 요금제 계정) | 아래 `2026-10-25 생성 이미지` 절에 기록할 파일 | Higgsfield Terms of Use(https://higgsfield.ai/terms-of-use-agreement, 문서 표시 'Last updated: October 23, 2026', 2026-10-25 확인): 4.4 회사는 입력·출력의 소유권을 주장하지 않고 출력의 상업적 이용을 제한하지 않는다. 출력은 회사 모델 학습에 쓰일 수 있고, 다른 이용자가 비슷하거나 같은 출력을 받을 수 있으며 고유성·독점성은 보장하지 않는다. 8조: 일부 모델은 외부 제공사가 공급하며 제공사 정책이 더 엄격하면 그 조건이 적용된다. 5.2(i)는 서비스 자체의 재판매·상업적 이용을 금지(출력이 아님). 도움말 'Who owns my generations and can I use them commercially?'(https://higgsfield.ai/creator-hub/help-center/account-and-privacy/who-owns-my-generations-and-can-i-use-them-commercially, 2026-09-12 수정): 상업적 이용 권리는 요금제와 관계없이 약관에서 나오며 유료 요금제는 워터마크 없는 다운로드를 포함 | 조건부 PASS · 확인 필요 | 아직 확인하지 못한 것: ① GPT Image 2.5 공급사 조건이 Higgsfield 경유 출력에 어떻게 적용되는지(약관에 공급사 이름 없음) ② 요금제 페이지(https://higgsfield.ai/pricing)가 스크립트로 그려져 Basic 요금제 문구를 직접 읽지 못함 ③ 받은 파일에 워터마크·C2PA 등 메타데이터가 있는지 ④ 학습 제외는 엔터프라이즈 계약에서만 안내됨 |

- 판정 기준: `commercial-license-audit`(iscream-settings). FAIL은 0건. '확인 필요' 3건은 계약·계정 기록 문제라 회사 담당자 확인이 필요하다.
- AI 생성물 자체가 저작물로 보호되는 범위는 나라별 법에 따르며 이 표에서 판단하지 않는다. 설정의 '자체 제작 일러스트 무단 복제 금지' 문구의 범위는 회사 확인 대상이다.
- 이 파일은 빌드 때 배포본(`/assets/CREDITS.md`)에 복사되어 공개된다.

## 현재 사용분 · 물길 탐험 3.0 · 2026-10-24

기획·제작 표기: 옐샘 & 아이스크림미디어. 앱 화면 캡처·자체 제작 일러스트·자체 제작 음원은 무단 복제·재배포·전용·상업적 이용을 금한다. 외부 자료·라이브러리·폰트는 각 원저작자의 라이선스와 이용 조건을 따른다. 이 문구는 외부 자료의 권리를 새로 주장하지 않는다.

| 현재 자료 | 출처·처리·조건 |
|---|---|
| v2/story-repair.webp / .png | OpenAI 이미지 생성 도구로 2026-10-21 새로 제작한 도입. 기존 방울이·연구섬을 참조. WebP 실행본, PNG 재작업 원본 |
| v2/rescue-reward.webp / .png | 같은 도구로 새로 제작한 투명 복구 보상 그림. 과학 장치의 실측 제작도가 아닌 이야기 연출 |
| learning/scale.webp | 2026-10-24 내장 OpenAI image_gen으로 생성한 전자저울 외형. LCD 숫자는 그림에 넣지 않고 실험 상태에 따라 코드로 표시 |
| learning/tank-frame.webp | 같은 도구로 생성한 투명 관찰 탱크 테두리. 2026-11-06부터 쓰지 않아 `_unused/public-assets/learning/`로 옮겼고 빌드에 포함하지 않음 |
| learning/condenser-plate.webp | 같은 도구로 생성한 응결 금속판. 물방울과 물 수집 결과는 코드로 표시 |
| v2/research-island-v4.webp | 같은 도구로 생성한 물 탐험 5개 구역 지도. 지도 글자·단계 선택·이동 경로·캐릭터는 별도 코드로 표시 |
| fonts/jua-korean-400.woff2, jua-latin-400.woff2 | Jua, Woowahan Brothers. SIL Open Font License 1.1. 기존 사용자 프로젝트의 로컬 파일을 원본 그대로 사용. 라이선스 전문은 fonts/Jua-OFL.txt에 동봉 |
| vendor/phaser.min.js | Phaser, MIT. 전문 vendor/PHASER-LICENSE.md 동봉 |
| 배경 음악 | 기획자가 Suno로 만든 2곡. 위 표의 배경 음악 2곡 참조 |
| 대체 효과음 | 프로젝트의 src/sound.js가 Web Audio로 직접 합성 |
| 기본 효과음 7종 | Kenney Interface Sounds, CC0 1.0. audio/sources.json의 파일·출처 기록과 audio/Kenney-LICENSE.txt의 원문 동봉. 아래 2026-10-22 기록 참조 |
| 개념 영상 10편·끝 장면 | 프로젝트 자체 SVG 모션 그래픽. concepts/stage-1~10의 MP4·WebM·WebP. 외부 영상 클립을 내려받아 사용하지 않음 |
| 기능 아이콘 | 프로젝트 SVG 경로. 별·집·화살표·잠금·스피커·톱니 등은 벡터로 표시 |
| 기존 방울이·배경·지도·도구 | 아래 2026-10-15/18 목록. 생성형 AI 이미지 포함. 사용자 제공 원본의 상업 배포 권리는 이 작업에서 입증하지 못했으며 공개 전 소유자의 확인 필요 |

교육 내용 원문: 교육부 2022 개정 과학과 교육과정 [4과10-01]~[4과10-03]. 경기도교육청 공개 PDF의 인쇄 77쪽(PDF 76쪽)과 대조했다. 문서 주소: https://www.goe.go.kr/resource/old/BBSMSTR_000000030136/BBS_202411110127574203.pdf . 앱의 출처 목록에는 기관명·도메인만 표시한다. 외부 교과서 페이지·사진은 앱에 복제하지 않았다.

새 그림의 제작 요청 요약·참조·사용 위치·용량은 `docs/reviews/ASSET-GENERATION-2026-10-21.md`에 기록했다. 이 문서는 법적 배포 허락을 대신하지 않는다.

2026-10-24 전체 페이지 고도화에서는 새 이미지·음원·영상을 생성하거나 추가하지 않았다. 위 로컬 라이선스 파일의 존재와 현재 자산 경로를 다시 검사했다. 사용자가 제공한 초기 이미지의 배포 권리 확인 여부는 이전 기록 그대로이며, 이번 점검으로 새 허락을 추정하지 않는다.

위 문장은 2026-10-24 **1차 UI 고도화 시점**의 기록이다. 이후 같은 날 사용자의 추가 요청으로 실험 소품 3종과 연구섬 지도 1종을 생성·적용했다. 최종 사용 파일은 위 표와 아래 추가 기록에 반영했다.

## 초기 MVP 기록 (현재 사용 목록은 위 표와 아래 개편 기록 참조)

사용자가 작업 폴더에 제공한 ChatGPT 생성 이미지 중 아래 3개만 실행 파일에 사용했다. 원본은 이동·삭제하지 않았다.

| 서비스 파일 | 제공된 원본 |
|---|---|
| logo.png | ChatGPT Image 2026년 9월 23일 오후 11_30_01.png (2026-10-25 미사용, `_unused/public-assets/`로 이동) |
| lab-main.png | ChatGPT Image 2026년 9월 23일 오후 11_30_40 (1).png |
| lab-room.png | ChatGPT Image 2026년 9월 23일 오후 11_30_41 (2).png |

지도·실험기구·UI 아이콘·MVP 방울이는 프로젝트 내 Canvas/SVG 코드로 작성했다. 외부 사진, 아이콘 라이브러리, 원격 폰트, 음원은 사용하지 않는다. 글꼴은 기기 설치 글꼴을 사용한다.

원본 샘플의 로봇·구름형 수증기 캐릭터와 글자가 포함된 전체 페이지 이미지는 재사용하지 않았다. 사용자 제공 원본의 외부 배포 권리 확인은 정식 공개 시 별도로 필요하다. 이 기록은 독점 저작권이나 배포 허락을 새로 주장하지 않는다.

교육 내용은 사용자 제공 「물방울 연구실 심화 설계안 v2.0」 및 PRD의 [4과10-01]~[4과10-03]을 기반으로 했다. 원문 교육과정 대조와 교과 검수는 정식 출시 전에 진행한다.


## 탐구 여정 2.0 · 2026-10-15

위 내용은 초기 MVP의 기록이다. 현재 앱에서는 아래 자료를 사용한다.

| 서비스 파일 | 출처·처리 |
|---|---|
| v2/journey-map.webp | 이번 작업에서 OpenAI 이미지 생성 도구로 새로 생성한 연구섬 지도 |
| v2/equipment-atlas.webp | 새로 생성한 3×3 실험 도구, 투명 WebP 무손실 변환 |
| v2/workshop-atlas.webp | 새로 생성한 3×2 장치 부품, 투명 WebP 변환 |
| v2/buddy-poses.webp | 사용자 제공 image/chatgpt_generated_035.png의 형식 변환, 4×4 포즈. 2026-10-25 미사용 확인 후 `_unused/public-assets/v2/`로 이동 |
| v2/buddy-poses-clean.webp | 같은 원본의 16개 포즈를 실제 윤곽별로 분리하고 투명 여백을 두어 재배치. scripts/prepare-buddy-sprites.py로 생성. 원본 그림 유지 |
| v2/lab-observe.webp | 사용자 제공 2026-09-23 오후 11_30_40 (1).png. 2026-10-25 미사용, `_unused/public-assets/v2/`로 이동 |
| v2/lab-cold.webp | 사용자 제공 2026-09-23 오후 11_30_41 (3).png. 2026-10-25 미사용, 이동 |
| v2/lab-compare.webp | 사용자 제공 2026-09-23 오후 11_30_42 (5).png. 2026-10-25 미사용, 이동 |
| v2/lab-detective.webp | 사용자 제공 2026-09-23 오후 11_30_43 (7).png. 2026-10-25 미사용, 이동 |
| v2/lab-workshop.webp | 사용자 제공 2026-09-23 오후 11_30_45 (9).png |
| v2/lab-core.webp | 사용자 제공 2026-09-23 오후 11_30_46 (10).png |

사용자 제공 배경의 정확한 원본 파일명은 `image/ChatGPT Image ` 접두사를 포함한다. 제공 원본은 삭제하지 않았다. 재사용한 배경·캐릭터와 새 지도·장비는 생성형 AI 이미지다. 눈금·물높이·기포·물방울·조작 UI는 상태를 정확히 표현하기 위해 프로젝트 코드로 그린다. 대체 효과음은 Web Audio 합성이며, 기본 효과음은 아래 Kenney CC0 음원을 사용한다. 원격 폰트 요청은 없다.

생성 프롬프트와 시각 점검은 `docs/reviews/ASSET-GENERATION-2026-10-15.md`, `docs/reviews/WORLD-ASSETS-2026-10-15.md`에 기록했다. 사용자 제공 자료의 공개·상업 배포 권리와 제작자 표기는 정식 배포 전 소유자가 확정해야 한다. 이 문서는 확인되지 않은 이용 허락이나 독점 권리를 새로 주장하지 않는다.

교육 내용 대조: 교육부 2022 개정 과학과 교육과정 [4과10-01]~[4과10-03], 충청북도교육청 공개 자료 `pain.cbe.go.kr`의 2025년 편찬 자료 p.93. 수집 장치는 가상 설계·시험이며 성취기준의 실제 만들기 활동은 별도 교실 활동으로 연결한다.

## 태블릿 실험 무대 · 2026-10-18

`v2/research-island-v3.webp`와 `v2/experiment-table-v3.webp`는 이전 작업에서 생성해 둔 연구섬·작업대 이미지다. 재작업용 PNG를 함께 보존하고, 실행에는 WebP를 사용한다.

2D 실험 렌더러는 저장소에 포함한 Phaser를 사용한다. 저작권 표기와 MIT 라이선스 전문은 `vendor/PHASER-LICENSE.md`에 보존하며 빌드에도 포함한다. 외부 CDN에서 스크립트를 내려받지 않는다.

## 개념 영상·효과음 · 2026-10-22

- `concepts/stage-1`~`stage-10`: 프로젝트 자체 SVG 모션 그래픽, 960×540·24fps·9초. MP4(H.264)·WebM(VP9)와 마지막 장면 WebP. FFmpeg는 제작 도구로만 사용하며 배포하지 않는다. 한글 설명은 DOM에서 표시한다.
- 효과음 제작자: **Kenney**, [Interface Sounds](https://kenney.nl/assets/interface-sounds), **CC0 1.0**. 원본 라이선스는 `audio/Kenney-LICENSE.txt`, 다운로드 출처와 사용 파일은 `audio/sources.json`에 보존한다. 2026-10-22 공식 사이트에서 다운로드했다.
- 사용 효과음: `click_003.ogg`, `drop_003.ogg`, `confirmation_002.ogg`, `confirmation_001.ogg`, `error_001.ogg`, `question_002.ogg`, `switch_002.ogg`.
- 모든 영상·효과음은 앱 내부에 보관한다. 게임 실행 중 외부 음원 사이트에 접속하지 않는다.

## 실험 소품·연구섬 지도 추가 · 2026-10-24

- 생성 도구: 내장 OpenAI `image_gen`. 별도 API·CLI 생성 경로는 사용하지 않았다.
- 실행 파일: `learning/scale.webp`, `learning/condenser-plate.webp`, `v2/research-island-v4.webp`.
- 생성 원본: 프로젝트의 `image/generated-learning/scale.png`, `tank-frame.png`, `condenser-plate.png`, `research-island-v4.png`. 실행에는 WebP를 사용하며 원본 PNG를 보존한다.
- 실험 소품은 생성된 알파를 보존하고 바깥 투명 여백을 잘라 WebP로 내보냈다. 지도는 불투명 배경 이미지다. 측정 숫자·수위·기포·물방울·정확한 눈금과 조작 영역은 이미지에 고정하지 않고 기존 코드와 상태 모델로 표시한다.
- 최종 프롬프트 원문, 출력 크기·용량·알파 확인, 적용 위치는 [2026-10-24 에셋 생성 기록](../../docs/reviews/ASSET-GENERATION-20261024.md)에 기록했다.
- 생성 도구의 계정 요금제와 생성물의 법적 권리 범위는 이 작업에서 별도로 확인하지 않았으며 추정하지 않는다. 이 출처 기록은 확인되지 않은 독점 권리나 새로운 배포 허락을 주장하지 않는다.

## 구역별 실험 배경·생활 장면 · 2026-10-25

- 생성 도구: 내장 OpenAI `image_gen`. 기존 방울이와 소품 아틀라스는 유지한다.
- 실행 파일: `stages/spring-terrace.webp`, `winter-waterworks.webp`, `sun-courtyard.webp`, `dew-greenhouse.webp`, `water-search.webp`, `drink-bottle.webp`.
- 원본 PNG는 프로젝트 `image/generated-stage-experience/`에 보존한다. 생활 장면의 최종 원본은 `water-search-corrected.png`이며 첫 생성본도 보존한다. 배포 산출물에는 실행용 WebP만 복사한다.
- 배경은 불투명 16:9 그림이고 음료병은 알파를 보존했다. 학습 수치, 물높이, 물방울, 선택 상태와 판정은 이미지에 고정하지 않고 기존 코드가 표시한다.
- 용도·생성 기록·파일 검증은 `docs/reviews/ASSET-GENERATION-20261025.md`에 남긴다. 생성물의 법적 권리 범위에 관한 새로운 보장은 하지 않는다.

## 2026-10-29 생성 이미지 · 첫 화면(타이틀)

- 도구: Higgsfield · GPT Image 2.5 (quality medium, 1K). Basic 유료 계정. 검토 결과는 맨 위 표의 Higgsfield 행 참조.
- 원본 PNG는 `image/generated-20261029/`(저장소 제외)에 보존한다. 로고·방울이는 투명 배경으로 생성한 뒤 여백만 잘랐다.

| 실행 파일 | 용도 | 원본 | 크기 | 참고 이미지 |
|---|---|---|---:|---|
| `v2/title-island.webp` | 첫 화면 배경 (연구섬 전망대). 사람·캐릭터·글자 없음 | `title-island.png` | 244 KB | `v2/research-island-v4.webp` |
| `v2/title-logo.webp` | 첫 화면 제목 글자 '방울이의 물길 탐험'. 화면에서는 `alt`로 같은 제목을 제공 | `title-logo.png` | 115 KB | 같은 시리즈 '초록정원 연구기지' 로고(화풍만 참고) |
| `v2/bangul-title.webp` | 첫 화면 방울이 (손 흔들기·돋보기) | `bangul-title.png` | 84 KB | `v2/buddy-poses-clean.webp` 첫 포즈. 방울이 원본 권리 확인은 위 표 '사용자 제공 ChatGPT 생성 이미지' 행과 같음 |
| `icons/og-image-v1.jpg` | 링크 공유 미리보기(1200×630). 위 세 그림을 sharp로 합성, 새 생성 없음 | 위 세 원본 | 154 KB | — |

## 2026-10-25 생성 이미지

- 도구: Higgsfield · GPT Image 2.5 (quality high, 2K). Basic 유료 계정. 검토 결과는 맨 위 표의 Higgsfield 행 참조.
- 기존 그림을 참고 이미지로 넣어 화풍을 맞췄다. 사람·캐릭터·글자는 넣지 않았다. 원본 PNG는 `image/generated-20261025/`(저장소 제외)에 보존한다.

| 실행 파일 | 용도 | 원본 | 크기 | 화풍 참고 |
|---|---|---|---:|---|
| `stages/field-spring.webp` | 현장 의뢰 1·2 작업대 (샘터) | `field-spring.png` | 225 KB | `stages/spring-terrace.webp` |
| `stages/field-winter.webp` | 현장 의뢰 3·4 작업대 (얼음 다리) | `field-winter.png` | 164 KB | `stages/winter-waterworks.webp` |
| `stages/field-sun.webp` | 현장 의뢰 5·6 작업대 (햇살 마당) | `field-sun.png` | 151 KB | `stages/sun-courtyard.webp` |
| `stages/field-dew.webp` | 현장 의뢰 7·8 작업대 (이슬 정원) | `field-dew.png` | 231 KB | `stages/dew-greenhouse.webp` |
| `stages/field-lab.webp` | 현장 의뢰 9·10 작업대 (연구실) | `field-lab.png` | 81 KB | `v2/lab-workshop.webp` |
| `learning/hotplate.webp` | 6장 가열판 (윗부분만 잘라 사용, 켜짐 빛은 코드로 표시) | `hotplate.png` | 20 KB | `v2/equipment-atlas.webp` |
| `learning/drawing-board.webp` | 5장 물그림 판 (A·B 같은 그림 두 장) | `drawing-board.png` | 45 KB | `stages/sun-courtyard.webp` |
| `learning/water-core.webp` | 10장 물방울 코어 (꺼짐 상태, 물 도착 빛은 코드로 표시) | `water-core.png` | 104 KB | `v2/equipment-atlas.webp + v2/lab-workshop.webp` |

- 9·10장 배경은 새로 생성하지 않고 사용자 샘플 페이지에서 만든 기존 `v2/lab-workshop.webp`, `v2/lab-core.webp`를 적용했다.

## 2026-10-25 3D 모형·3D 엔진·앱 아이콘

- 3D 엔진: Three.js 0.170.0 (`public/assets/vendor/three/`, MIT, `THREE-LICENSE.txt` 동봉). npm 패키지에서 `three.module.min.js`, `GLTFLoader.js`, `BufferGeometryUtils.js`만 가져왔고, 로더 두 파일은 `import` 경로만 같은 폴더로 바꿨다. 외부 CDN 요청은 없다.
- 3D 모형 9개(`public/assets/models/`): 이 프로젝트의 기준 그림(`image/3d-refs/meshy/`, 힉스필드 GPT Image 2.5 생성 또는 기존 공방 그림)을 사용자가 Meshy Image to 3D로 바꿨다. 원본 GLB는 저장소 밖 `D:\iscreammedia_sc34\_scratch\waterchange-3d\raw\`에 있다.
- 다듬기: Blender 5.2 배치 스크립트(`_scratch/waterchange-3d/optimize.py`). 겹친 점 합치기 → 복셀로 겉면 재구성 → 삼각형 줄이기 → 새 펼침 좌표에 원본 바탕색 굽기 → WebP 텍스처 GLB. 원본과 결과를 같은 각도로 렌더해 찢어짐을 확인했다.
- Meshy 출력의 상업 이용 조건은 사용 계정의 요금제 약관을 따른다. 이 기록은 그 권리를 새로 보장하지 않는다(맨 위 도구 검토 표 참조).
- 앱 아이콘 `public/assets/icons/`: 기존 `v2/rescue-reward.webp`, `v2/buddy-poses-clean.webp`를 로컬 PIL로 자르고 크림색 배경에 얹었다. 새 생성 없음.

## 실험 효과음 · 2026-11-02

| 장면 | 배포 파일 | 제작자와 배포처 |
|---|---|---|
| 물 붓기 / 끓는 기포 관찰 기록 | `audio/splash_09.ogg` / `audio/bubble_02.ogg` | rubberduck · [Water, Splash & Slime SFX](https://opengameart.org/content/40-cc0-water-splash-slime-sfx) |
| 노트 펼치기 / 겉면 닦기 / 장치 연결 | `audio/bookFlip1.ogg` / `audio/cloth1.ogg` / `audio/metalLatch.ogg` | Kenney · [RPG Audio](https://kenney.nl/assets/rpg-audio) · 원본 고지 `audio/Kenney-RPG-LICENSE.txt` |

두 묶음의 배포 라이선스는 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)이다.

## 지도 위 방울이 걷기 · 2026-11-03

기존 타이틀 방울이를 참고해 내장 OpenAI 이미지 생성 도구로 그렸다. 게임 에셋은 `v2/bangul-walk.webp`이며, 128px 정사각형 12칸을 정면·왼쪽·오른쪽·뒷면 순으로 배치했다. 각 행 가운데 칸이 정지 자세다.

2026-11-06 색 보정: 타이틀 방울이와 맞도록 로컬에서 몸을 맑은 파랑(평균 HSV 187/.34/.66 → 200/.60/.91)으로, 가운을 흰색으로 바꾸고 볼터치를 다시 칠했다. 새 이미지 생성 없음. 눈·입·포즈·칸 배치는 원본 그대로다.

<details><summary>이미지 생성 프롬프트</summary>

Create ONE production-ready transparent 3-column by 4-row walk-cycle sprite sheet for a small top-down school science island adventure videogame. Use the reference image as identity: Bangul, cute round aqua-blue teardrop scientist, one pointed tip, navy eyes, short white lab coat, tiny blue feet, blue ID badge on front. Same visual materials, but soften the bright cyan so it fits a hand painted muted teal/sand island. NO magnifier in hands. Strict atlas layout: exactly TWELVE separate full-body sprites, flat evenly spaced 3 columns × 4 rows on transparent background, no visible rules or writing. Row 1 DOWN toward viewer (front); row 2 LEFT true side profile facing image-left; row 3 RIGHT true side profile facing image-right; row 4 UP away from viewer (back of blue drop head and coat, NO face). Columns left-foot forward / centered idle feet level / right-foot forward in EVERY row. Side poses must look like walking, clear foot separation and opposing arms, no waving. Same 3/4 overhead camera, same sizes, same scale and proportions and feet baseline within grid cell. Keep each figure entirely inside its own cell surrounded by empty transparent gutter. Aim game icon legibility at 46 px high. No background, shadows under feet, labels, arrows, typography, ground, borders or accessories. Professional coherent soft painted stylized game-character turnaround.

</details>

## 연구섬 주민 · 2026-11-02

물모양 샘터부터 물길 공방까지 각 장이 끝나면 돌아오는 주민 10명의 캐릭터 일러스트는 내장 OpenAI 이미지 생성 도구로 제작했다. 주민마다 투명 PNG 원본을 `image/research-island-residents/resident-1.png`~`resident-10.png`에 보관했다. 게임은 지도와 대화창에서 `v2/resident-1.webp`~`resident-10.webp`를 공유한다.

## 물 붓기 유리 그릇 · 2026-11-03

내장 OpenAI 이미지 생성 도구로 투명 유리 그릇과 주전자를 제작했다. 런타임 에셋은 `v2/pouring-glass.webp`와 `v2/pouring-jug.webp`다. 유리 앞면, 물의 몸체, 수면을 분리해 기록된 양에 맞춰 합성한다. 두 그릇은 깊이가 같은 타원형 단면으로 해석한다.

<details><summary>유리 그릇 생성 프롬프트</summary>

Scientific educational game asset, polished realistic glass product rendering for a sunlit Mediterranean garden science laboratory. Create ONE transparent 2x2 sprite sheet, four separate full objects evenly aligned in equal square cells, lots of transparent gutter. TOP LEFT empty tall narrow glass vessel; TOP RIGHT empty broad wide glass vessel; BOTTOM LEFT exactly the same tall vessel 80 percent filled with crystal clear very pale aqua water; BOTTOM RIGHT exactly the same wide vessel roughly 42 percent filled with the same clear water. Vessels have same height and same front-to-back depth, but wide one is 1.92 times wider viewed from front, an elongated oval cross-section, with shallow rim ellipse SAME vertical thickness for both. Straight vertical walls, very gently rounded heel at base. No spouts and NO handles. Thin clear colorless glass with subtly blue-gray rim, realistic highlights, refraction at edges and subtle warm garden reflections, soft ivory highlights. TOP EMPTY VESSELS have genuinely transparent clean interiors with only faint reflective glints on glass. Filled vessels have visibly TRANSLUCENT colorless water lightly tinted aqua, an elegant elliptical meniscus, gentle reflections and mild caustics at their bottom, not a saturated solid blue block. SAME perspective for all, near-frontal with elevated view just enough to see oval opening, NO perspective lean, no pinched walls. Full object and full base fit inside each cell. Same absolute height and base baseline across all four. NO text, graduations, ticks, numbers, labels, backgrounds, tabletop, shadows outside the glass, framed cells, arrows, characters or decoration. All empty space is genuinely transparent. Production-ready raster asset sheet, realistic yet soft enough for a 4th grade adventure.

</details>

<details><summary>주전자 생성 프롬프트</summary>

Create a production game sprite atlas of TWO matching glass pitchers side by side, both upright, on fully transparent background. LEFT contains a measured serving of clear water to 55% of its straight-sided interior; RIGHT exactly the same pitcher empty. Near-front elevated product photograph camera 10 degrees above eye level. Clear colorless borosilicate glass pitcher, rounded barrel lower body and straight upper neck, a small pouring spout pointing RIGHT, generous round handle on LEFT, realistic soft ivory and pale blue-green garden reflections and fine glass highlights. Very subtle pale aqua transparent water with an elliptical meniscus. Water looks clear and naturally translucent. Realistically substantial clear glass base. Full pitcher, rim, spout and handle entirely within its half, same dimensions and baseline in both halves, each centered with ample empty gutter. Reference a Mediterranean garden educational science game, warm daylight, soft photorealism, understated blue-gray edges, clean readable silhouette at 100px display. NO tilt, no pouring stream, no splashes, no labels, no numbers, no measuring marks, no text, no shadows outside object, no surface, no background, no frame. The entire space around and inside the empty glass is transparent.

</details>

## 관찰 재질과 의뢰 도구 · 2026-11-03

내장 OpenAI 이미지 생성 도구로 천의 건조·젖은 모습, 얼음과 두 그릇, 물그림용 돌판과 붓, 밀봉한 유리컵과 부착 냉각팩, 따뜻한 받침·젤 냉각팩·모래시계를 제작했다. 배포 에셋은 `learning/real-cloth.webp`, `real-ice.webp`, `real-painting.webp`, `real-dew.webp`, `real-tools.webp`다. 물자국과 이슬 변화는 관찰 기록의 시간·닦은 위치에 맞춰 합성한다. 물그림은 색소 없이 맑은 물만 사용하며 수증기는 보이는 구름으로 표현하지 않는다.

<details><summary>cloth 이미지 생성 프롬프트</summary>

Production sprite atlas for a realistic elementary water science game in a warm sunlit Mediterranean garden. Two matching unfolded rectangular ivory cotton washcloths side by side, full cloth in each half, both viewed overhead at the same shallow elevated 20 degree camera, same exact wrinkles, hem and weave. LEFT completely dry soft pale warm ivory cotton, RIGHT the IDENTICAL cloth with a large naturally irregular water-soaked patch across its center. Wet patch is realistically DARKER muted warm gray-beige fibers, blurred capillary bleeding edges and a few tiny moisture glints, absolutely no blue paint, no blue oval, no colored stain, no visible steam. Cloth lies almost flat with slight soft rumpled edges. Clear readable weave and stitching. Transparent background around cloths, no table, no labels, no text, no props, no extra objects, no heavy shadows. Consistent equal-cell horizontal atlas, full isolated objects with generous transparent gutter. Photorealistic natural material, calm refined educational design.

</details>

<details><summary>ice 이미지 생성 프롬프트</summary>

Production transparent 2 by 2 game sprite sheet, warm daylight photorealistic objects for a school water experiment. Equal square cells. TOP LEFT one elegant shallow warm white ceramic plate with a faint blue rim, EMPTY, seen 30 degrees above front. TOP RIGHT one broad shallow pale blue glazed ceramic serving bowl, EMPTY, same overhead perspective, larger flat inner floor visible, no tall sides. BOTTOM LEFT a tight cluster of three beautiful crystal clear water ice cubes touching on flat base, sharp natural edges, internal crack lines, realistic refraction, icy specular gleam, no puddle. BOTTOM RIGHT a single identical clear ice cube. Exactly four isolated assets, all fully visible with transparent gutters, genuinely transparent background and outside objects, no environmental background, labels, numbers, letters, decorative steam, fog, characters or UI. The ice must look like water frozen into clear solid cubes, not blue crystals or gems.

</details>

<details><summary>painting 이미지 생성 프롬프트</summary>

One production-ready transparent 2 by 2 sprite atlas for elementary pure-water drawing experiments. Realistic sunlit Mediterranean garden science game art. TOP LEFT one empty rectangular pale limestone drawing slab viewed nearly straight on with a slight overhead perspective, lightly textured unpolished absorbent surface, neutral pale cream, thin natural edge, no frame, no writing. TOP RIGHT an identical blank slab, same exact dimensions and perspective. BOTTOM LEFT a slender natural wooden watercolor brush angled 25 degrees diagonal, silver ferrule, pointed dark bristles only slightly damp with CLEAR COLORLESS WATER. BOTTOM RIGHT exactly matching brush heavily loaded with CLEAR WATER, bristles visibly wet and glossy, one rounded colorless water droplet hanging from tip. Full objects inside equal cells, transparent background, generous gutters. No colored paint, colored pigment, paint palette, text, signs, numbers, colored puddles, steam or clouds. Realistic refined soft product photography suitable for a children's science learning adventure.

</details>

<details><summary>dew 이미지 생성 프롬프트</summary>

Production-ready realistic transparent 2x2 sprite sheet for a school condensation comparison experiment. Same identical clear colorless cylindrical glass cup containing water to 55 percent in each cell, front view slightly from above, neutral warm daylight with subtle blue-green reflections, full glass fits within cell with clear gutters. TOP LEFT clean DRY cup with OPEN rim. TOP RIGHT same DRY cup with its mouth tightly SEALED by a visibly stretched transparent food wrap membrane across the entire opening, slight crinkles and folds wrapping around rim, secured by a thin pale elastic band below rim. BOTTOM LEFT identical SEALED cup with a rectangular blue gel cold pack visibly strapped FLUSH against the OUTSIDE RIGHT WALL using a white fabric band, dry outer glass. BOTTOM RIGHT same SEALED cup with the SAME blue gel cold pack on the RIGHT side and many photorealistic fine condensation droplets on the OUTSIDE glass only, random varied sizes with bright upper highlights and darker refracted lower rims, water inside stays at same 55 percent level. Colorless water, truly transparent glass, no saturated blue block. The plastic wrap must clearly look tightly attached to the rim, and the external pack looks flexible reusable gel pouch, NOT a bottle. No labels, no text, no letters, no numbers, no vapor clouds, no visible breath, no arrows, no background or tabletop.

</details>

<details><summary>tools 이미지 생성 프롬프트</summary>

Production transparent sprite atlas with exactly THREE isolated realistic school science props in an evenly spaced horizontal row, each same sized equal cell. LEFT a square ceramic warming pad on a rounded low cork base, pale terracotta center with subtle warm orange rim, a safe simple tabletop WARMING REST for melting ice, no knobs, no electric coil, no thermometer. CENTER a flexible rectangular sealed BLUE GEL COLD PACK pouch with softly rounded corners, frosty translucent blue gel visible within, white fabric hook-and-loop attachment strap sitting next to it, must look like a flexible medical ice gel pouch and NOT a water bottle. RIGHT a small simple brass-and-ivory hourglass with sand partly fallen to convey waiting, precise realistic glass and warm wood/brass edges. All objects entirely in frame, pure transparent background and gutters, consistent soft daylight, realistic photographic educational game style, no labels, numbers, writing, steam, cold fog, icons or UI.

</details>

## 2026-11-05 · 실험 그림과 주민 음성

- `learning/heat-plate-guide.webp`, `learning/cold-plate-guide.webp`, `learning/cold-plate-dry.webp`, `learning/water-material.webp`: 프로젝트용으로 Codex 내장 ImageGen에서 생성 후 WebP로 변환했다. 물의 양과 기포 등 관찰 결과는 코드로 표시한다.
- `audio/briefings/resident-01.m4a`~`resident-10.m4a`: 프로젝트 대사를 모모 자비스의 기본 음성 프리셋으로 합성 후 인코딩했다.

## 2026-11-06 · 물 모으는 장치의 컬러 피겨스

- 9장과 10장의 벡터 모형 및 상호작용은 이 프로젝트용으로 만들었다. 투영과 잉크 렌더링은 [Colorfigures](https://april-zhu.com/colorfigures) (April Zhu, MIT)의 로컬 엔진을 사용한다. 저작권과 라이선스 전문은 `vendor/colorfigures/LICENSE.md`에 동봉했다.
- 물방울의 표시와 도착 여부는 앱의 실험 모형을 읽는다. 과학 참고: [미국 지질조사국 — 응결과 물의 순환](https://www.usgs.gov/water-science-school/science/condensation-and-water-cycle?page=1).

## 얼기·녹기 소품과 개념 영상 · 2026-11-06

생성형 이미지가 아니라 코드로 직접 그렸다. `scripts/learning-art/freeze-props.mjs`가 SVG를 WebP로 만들고, 글자는 그림에 넣지 않는다.

| 파일 | 용도 |
|---|---|
| `learning/weight-100g.webp` | 뒤섞인 실험 사진의 양팔저울에 올리는 100 g 추. 양팔저울과 도장은 코드로 그린다 |
| `learning/ice-pop-soft.webp`, `learning/ice-pop-frozen.webp` | 얼리기 전과 얼린 뒤의 쭈쭈바 |
| `learning/pipe-water.webp`, `learning/pipe-burst.webp` | 물이 찬 배관과 얼어서 금이 간 배관 |
| `concepts/stage-3.mp4`, `concepts/stage-3.webp` | 얼면 왜 커질까 개념 영상. `scripts/concept-clips/freeze-why.mjs`와 `render-freeze.mjs`, macOS AVFoundation 인코더 `encode-mac.swift`로 렌더 |

이전 `concepts/stage-3.webm`은 ffmpeg 없이 다시 만들 수 없어 `_unused/public-assets/concepts/`로 옮겼고, 3번 영상은 MP4만 쓴다.

## 복구 장소 지도 클립 · 2026-11-06

- 실행 파일: `village/stage-1~10-on.webp`(켜지는 장면 4초), `village/stage-1~10-idle.webp`(반복 장면 2초).
- 제작: `scripts/map-clips`의 Remotion 코드로 직접 그린 투명 벡터 애니메이션. 외부 이미지·음원을 쓰지 않았다.
- 도구: Remotion 4.0.541(개인·소규모 조직 무료 라이선스, 직원 4명 이상 회사는 회사 라이선스 필요). 게임 실행에는 Remotion이 들어가지 않는다.


## 2026-11-07 실험 소품과 NPC 음성

- `learning/experiment-props-20261107/`: OpenAI imagegen으로 제작한 시험관·마개, 냉동고, 나무 물통, 유리병, 목이 좁은 병, 수도꼭지, 물방울, 시계, 밸브 손잡이. 학습 상태에 따라 물높이·얼음·시계 바늘·물줄기를 코드로 합성한다. 생성 이미지는 실제 실험 사진을 기록한 자료가 아니다.
- 컵·금속판·물 받이·냉각팩은 기존 `real-dew.webp`, `real-tools.webp`, `workshop-atlas.webp`에서 단일 소품으로 분리했다. 원본의 기존 출처 고지를 유지한다.
- `audio/npc-20261107/`: 모모 도구로 생성한 한국어 합성 음성 33개(시작 편지 10, 첫인사 10, 추가 대화 10, 현장 의뢰 3). 실존 인물 음성 복제를 사용하지 않았다. 읽은 글·목소리 ID·길이는 `src/npc-audio.js`에 기록한다.
- `audio/npc-cute-20261107/`: 위 녹음 중 성인·노년 프리셋 23개를 모모의 어린이 프리셋 `preset-01`·`preset-02`로 다시 생성했다. 밝은 감정·높은 톤·귀여운 동물 친구 연기 지시를 적용했다. 기존 어린이 음성 10개와 합쳐 NPC 음성 33개 모두 어린이 프리셋을 사용한다. 원본과 생성 설정·원래 URL은 외장 SSD `assets/source-media/npc-voice-cute-20261107/manifest.json`에 보존한다.
- 생성 원본과 작업 파일은 이 프로젝트의 외장 SSD `assets/source-media/`에 보존한다.

## 얼음틀로 얼리기 · 2026-11-08

- `learning/ending-collector-20261108/collector-plate-dry.webp`: 프로젝트 파이널 영상의 원형 은색 응결판을 참고해 OpenAI 기본 imagegen으로 생성한 교육용 일러스트. 투명 원본은 외장 SSD `assets/source-media/ending-collector-20261108/`에 보관한다. 물방울·뒷면 냉각팩·물 받이·물줄기는 학습 단계에 따라 코드로 합성한다.

- `learning/ice-tray-20261108/ice-tray-empty.webp`, `freezer-open.webp`: OpenAI 기본 imagegen으로 각각 생성한 빈 얼음틀과 문 열린 냉동고. 투명 PNG 원본을 alpha 유지 WebP로 최적화했다. 실험 사진이 아닌 교육용 일러스트다.
- `learning/freeze-props-20261108/freezer-closed.webp`, `ice-pop-soft.webp`, `ice-pop-frozen.webp`: 2026-11-08 OpenAI 기본 imagegen으로 생성한 문 닫힌 냉동고와 쭈쭈바의 얼리기 전·얼어 부푼 뒤 모습. 투명 배경과 같은 구도·크기를 유지해 WebP로 최적화했다. 실제 실험 사진이나 상표 제품이 아닌 교육용 일러스트이며, 부푼 정도는 정량 측정값이 아니다. 원본과 프롬프트는 외장 SSD의 `assets/source-media/freeze-props-20261108/`에 보관한다.
- `learning/freeze-props-20261108/bench-freezer-closed.webp`: 같은 날 기본 imagegen으로 기존 4장 실험용 냉동고의 닫힌 모습을 생성했다. 열린 그림과 동일한 600×545 좌표계로 맞추어 선반·시험관 애니메이션에 사용한다.
- 물 붓기, 여섯 칸의 물·얼음, 냉동고 문 닫힘, 시간과 조작 안내는 DOM·SVG·CSS로 합성한다. 같은 얼음틀을 얼기 전·후와 다음 녹이기에 함께 사용한다.
- 생성 원본·해시는 외장 SSD `assets/source-media/ice-tray-20261108/`에 보존한다. 적용 흐름과 프롬프트는 `docs/design/ICE-TRAY-20261108.md`에 기록했다.

## 건물 대표 주민 직접 음성 · 2026-11-08

- `audio/npc-sohee-20261108/`: 사용자가 선택한 한국어 Sohee 음색을 Qwen3-TTS 공식 Python API로 직접 생성한 음성 23개. 시작 편지 10개, 건물 대표 주민 5명의 인사·추가 대화 10개, 현장 의뢰 3개다. 모모 도구·API를 거치지 않았다. [Qwen3-TTS 공식 모델](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)은 Apache-2.0으로 공개되었으며, 다운로드 커밋은 `0c0e3051f131929182e2c023b9537f8b1c68adfe`다.
- 캐릭터별 연기 지시로 한국어 어조를 먼저 조절하고, Apple AVAudioUnitTimePitch를 오프라인으로 적용했다. 파랑은 +100 cents/1.04배, 뚝딱은 −100 cents/0.99배, 보리는 −40 cents/0.97배, 송이는 +40 cents/1.00배, 느티는 −140 cents/0.94배다. 100 cents는 반음 하나다. 실존 인물 목소리를 복제하지 않았다.
- 생성 원본 WAV·보정 WAV·대사·설정·모델 출처·해시는 외장 SSD `assets/source-media/npc-qwen-sohee-20261108/`에 보존한다. 게임에는 검증한 24 kHz 모노 MP3를 사용한다. 이전 음성 원본은 보존한다.


## 2026-11-08 응결 캔
- `learning/overnight-20261108/condensation-can.webp`: OpenAI image_gen에서 생성한 단일 투명 캔 일러스트. Imagen 아님. 구체적 모델 버전 미제공. 실제 사진이나 학생 관찰 결과가 아닌 설명용 모형. 물방울은 앱의 관찰 상태가 별도로 표시한다.
- 원본: `assets/source-media/overnight-20261108/condensation-can.png`. WebP 변환은 sharp 사용.

## 지도 악당 밸브 두더지·방울이 전투 · 2026-11-09

- `v2/map-villain-mole.webp`: 4×2칸(256px) 밸브 두더지. 대기·걷기·도발·웅크림 / 돌진·맞음·밀려남·쓰러짐 순서. 원본 `v2/valve-mole-sheet.png`에서 만든 `valve-mole-sheet.webp`의 초록·빨강 배경 번짐(반투명 가장자리 4,076픽셀)을 로컬에서 지우고, 투명 픽셀의 색값을 0으로 정리했다. 새 이미지 생성 없음.
- `v2/bangul-combat-sheet.webp`: 4×1칸(256px) 방울이 준비·물대포·놀람·안도 자세. 원본 `v2/bangul-combat-sheet.png`.
- 두 원본 시트는 2026-11-09 오후 다른 작업 세션에서 만들어졌고, 사용한 생성 도구와 프롬프트 기록이 남아 있지 않다. 배포 전 생성 도구와 이용 조건을 확인해 이 항목에 적어야 한다.
