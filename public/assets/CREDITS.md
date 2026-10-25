# 에셋 출처

## 도구·라이선스 검토 (2026-10-25)

상업 배포물(옐샘 & 아이스크림미디어) 기준으로 검토했다. 법률 자문이 아니며, 라이선스·약관은 바뀔 수 있으므로 배포 전에 원문을 다시 본다. 웹 약관은 아래 날짜에 확인한 내용이다.

| 도구·자료 | 쓰는 곳 | 라이선스·조건 (확인 근거) | 판정 | 조치 |
|---|---|---|---|---|
| Phaser 3.90.0 | `vendor/phaser.min.js`. 지도·실험 Canvas. 배포 포함 | MIT. 전문 `vendor/PHASER-LICENSE.md`(Copyright (c) 2024 Richard Davey, Phaser Studio Inc.) 동봉, 빌드에 함께 복사. 버전은 파일 안 `VERSION:"3.90.0"`으로 확인 | PASS | 설정 > 자료 출처의 저작권자 표기(Photon Storm)를 라이선스 파일 표기와 맞추면 좋다 |
| Jua 글꼴 | `fonts/jua-korean-400.woff2`, `jua-latin-400.woff2`. 제목 글꼴. 배포 포함 | SIL OFL 1.1. `fonts/Jua-OFL.txt`에 저작권 줄(Woowahan Brothers, Reserved Font Name "Jua", Google Fonts 배포)과 OFL 1.1 전문이 끝까지 들어 있음. 배민 자체 약관판 '주아체'가 아니라 OFL판으로 기록됨 | PASS | 두 서브셋 파일을 처음 받은 배포처(Google Fonts 등)는 기록에 없다. 알면 이 칸에 보강 |
| Kenney Interface Sounds 7종 | `audio/*.ogg`. 효과음. 배포 포함 | CC0 1.0. `audio/Kenney-LICENSE.txt` 원문(개인·교육·상업 프로젝트 사용 가능, 크레딧 선택)과 `audio/sources.json`(출처·다운로드 주소·파일 대응) 동봉 | PASS | 없음 |
| 배경 음악·대체 효과음 | `src/sound.js` | 프로젝트 코드의 Web Audio 합성. 내려받은 음원 없음 | PASS | Suno 배경음은 아직 넣지 않았다(`docs/audio/SUNO-PROMPTS.md`). 넣을 때 생성 계정의 요금제를 이 표에 먼저 기록 |
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
| learning/tank-frame.webp | 같은 도구로 생성한 투명 관찰 탱크 테두리. 투명 중앙에 물높이·얼음 변화·눈금을 코드로 겹쳐 표시 |
| learning/condenser-plate.webp | 같은 도구로 생성한 응결 금속판. 물방울과 물 수집 결과는 코드로 표시 |
| v2/research-island-v4.webp | 같은 도구로 생성한 물 탐험 5개 구역 지도. 지도 글자·단계 선택·이동 경로·캐릭터는 별도 코드로 표시 |
| fonts/jua-korean-400.woff2, jua-latin-400.woff2 | Jua, Woowahan Brothers. SIL Open Font License 1.1. 기존 사용자 프로젝트의 로컬 파일을 원본 그대로 사용. 라이선스 전문은 fonts/Jua-OFL.txt에 동봉 |
| vendor/phaser.min.js | Phaser, MIT. 전문 vendor/PHASER-LICENSE.md 동봉 |
| BGM·대체 효과음 | 프로젝트의 src/sound.js가 Web Audio로 직접 합성. 내려받은 배경 음악·음성 없음 |
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

사용자 제공 배경의 정확한 원본 파일명은 `image/ChatGPT Image ` 접두사를 포함한다. 제공 원본은 삭제하지 않았다. 재사용한 배경·캐릭터와 새 지도·장비는 생성형 AI 이미지다. 눈금·물높이·기포·물방울·조작 UI는 상태를 정확히 표현하기 위해 프로젝트 코드로 그린다. 배경 음악과 대체 효과음은 Web Audio 합성이며, 기본 효과음은 아래 Kenney CC0 음원을 사용한다. 원격 폰트 요청은 없다.

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
- 실행 파일: `learning/scale.webp`, `learning/tank-frame.webp`, `learning/condenser-plate.webp`, `v2/research-island-v4.webp`.
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
