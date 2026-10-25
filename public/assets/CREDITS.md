# 에셋 출처

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
| logo.png | ChatGPT Image 2026년 9월 23일 오후 11_30_01.png |
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
| v2/buddy-poses.webp | 사용자 제공 image/chatgpt_generated_035.png의 형식 변환, 4×4 포즈 |
| v2/buddy-poses-clean.webp | 같은 원본의 16개 포즈를 실제 윤곽별로 분리하고 투명 여백을 두어 재배치. scripts/prepare-buddy-sprites.py로 생성. 원본 그림 유지 |
| v2/lab-observe.webp | 사용자 제공 2026-09-23 오후 11_30_40 (1).png |
| v2/lab-cold.webp | 사용자 제공 2026-09-23 오후 11_30_41 (3).png |
| v2/lab-compare.webp | 사용자 제공 2026-09-23 오후 11_30_42 (5).png |
| v2/lab-detective.webp | 사용자 제공 2026-09-23 오후 11_30_43 (7).png |
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
