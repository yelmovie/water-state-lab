# 고도화 결과 · 방울이의 물길 탐험 (2026-11-09 밤, 무인 진행)

브랜치 `claude/upgrade-20261109`(시작 42be476). 배포·push는 하지 않았다. 점수: `SCORE-20261109-2.md`, 계획: `UPGRADE-PLAN-20261109.md`.
최종점검 79 → 84/100 · 디자인 점검 126 → 127/130.

## 바꾼 것

1. **글자 하한(C20 FAIL 해소)** — 1장 '주전자에 남은 물'(14px), 3장 '용기값을 뺀 물의 무게'(낮은 화면 12px), 3장 냉동고·실온 준비대 제목(15px), 낮은 화면 조작 버튼(15px), 타이틀 위 작은 줄(15px)을 16px로, 1600px 이상 화면에서 실험 안내 글자는 18px로. `src/guided-experience.css`, `src/process-upgrades.css`, `src/experience.css`.
2. **개념 영상 5편 교체(HyperFrames, A안 「방울이의 실험 노트」)** — `films/concept-zone-1~5/`(원본 HTML·게임에서 자른 그림·CC0 효과음), 공통 부품 `films/kit/`, 자르기 `films/prepare-assets.cjs`, 검토 `films/REVIEW.md`. 같은 경로·같은 이름 `public/assets/concepts/zone-N.mp4`(1280×720 H.264 faststart)와 `zone-N.webp`(마지막 장면 — 포스터, 움직임 줄이기·재생 실패 대체)를 바꿨다.
3. **자막 시간표** — `src/concept-data.js`를 영상 장면 시각(`at`초) 기준으로 바꿔 장면이 바뀌면 아래 자막과 장면 버튼이 같이 바뀐다. 문장은 그대로. 설정의 교사 시연 표시 '9초' → 실제 길이.
4. **4편 자리** — 응결 구역은 조작형 설명을 그대로 먼저 열고, 바닥에 '영상으로 보기' 버튼을 더해 같은 영상 창(같은 '계속' 버튼)으로 넘어간다. `src/concept-collector.js`, `src/concepts.js`, 테스트 1개 추가.
5. **렌더 스크립트** — `npm run concepts:render`(`scripts/concept-clips/render.mjs`)가 HyperFrames 렌더 → 1280×720 인코딩 → WebP를 한 번에 한다. 예전 도형 렌더러(`scenes.mjs`, `freeze-why.mjs`, `encode-mac.swift`)는 `_unused/concept-clips-20261022/`로.
6. 문서: README에 영상 다시 만드는 법, `.gitignore`에 영상 검사·렌더 산출물 제외.

## 개념 영상

| 편 | 앱 파일 | 길이 | mp4 | 마지막 장면 webp | 이전 |
|---|---|---:|---:|---:|---|
| 1 물의 세 가지 모습 | `public/assets/concepts/zone-1.mp4` · `.webp` | 24.0 s | 0.67 MB | 28 KB | 9~15 s 960×540 도형 |
| 2 물이 얼면 | `public/assets/concepts/zone-2.mp4` · `.webp` | 25.0 s | 0.73 MB | 32 KB | 9~15 s 960×540 도형 |
| 3 사라진 물 | `public/assets/concepts/zone-3.mp4` · `.webp` | 24.0 s | 0.57 MB | 30 KB | 9~15 s 960×540 도형 |
| 4 물방울(응결) | `public/assets/concepts/zone-4.mp4` · `.webp` | 22.0 s | 0.61 MB | 35 KB | 영상 미사용(조작형 설명만) |
| 5 물의 순환 | `public/assets/concepts/zone-5.mp4` · `.webp` | 24.0 s | 0.58 MB | 43 KB | 9~15 s 960×540 도형 |

모두 1280×720 H.264 High + AAC 모노 64k, faststart, 30fps. 5편 합 3.16 MB(편당 2.5MB 한도 안). 원본 렌더(1920×1080)는 외장 SSD 임시 폴더에만 두고 커밋하지 않았다.

## 검증 (명령과 실제 결과)

| 명령 | 결과 |
|---|---|
| `npm run check` | 통과 |
| `npm test` | 255/255 통과(기존 254 + 4편 영상 버튼 1, 자막 시간표 테스트는 새 형식으로 고침) |
| `npm run build` | 통과 · 첫 화면 185 + 백그라운드 151 파일(BEFORE와 같음) |
| `hyperframes check --json`(편마다) | 1~5편 오류 0 |
| `scripts/chapter-process-qa.mjs layout`(dev, 52화면) | 문제 0, 오류 0 |
| 자체 스윕(dist, 타이틀·지도·1장·3장 × 1920×1080·1280×800·1024×768·1024×600·915×412) | 가로 스크롤 0, 44px 미만 버튼 0, 16px 미만 글자 0, 콘솔·네트워크 오류 0 |
| 첫 화면(로컬) | DOMContentLoaded 224ms, 시작 버튼 257ms, 2.95MB/83요청 |
| 첫 화면(1.6Mbps·150ms) | 첫 그림 3.78s, 시작 버튼 13.8s(BEFORE와 같음) |
| 앱 안 영상 재생(헤드리스 Chrome, dist) | 1~5편 모두 readyState 4, 길이 24/25.0/24/22.0/24 s, 1280×720, 재생 중(paused=false), 포스터 1280×720 로드. 4편은 조작형 설명 → '영상으로 보기' → 같은 '계속' 버튼(915×412·1024×600·1920×1080에서 버튼 화면 안·가림 0) |
| 앱 영상 프레임 디코딩 확인 | 8프레임 직접 봄(이름표·결론 줄 잘림 없음) |

## 미검증 · 남은 위험

- 영상 효과음은 길이와 시각만 맞췄다. 귀로 듣지 않았다(음량 균형 포함).
- iPad Safari·학교 태블릿 실기기에서 새 영상 재생·소리 미확인. 서비스워커 Range 처리 경로는 바꾸지 않았다(파일 이름·형식 동일).
- 스크린리더(VoiceOver) 순회 안 함. 4편 '영상으로 보기' 버튼은 일반 `<button>`.
- 느린 망(1.6Mbps)에서 시작 버튼까지 13.8초 — Phaser 지연 로딩은 미룸(계획 1-5).
- 5편에서 앞 네 편 도구를 다시 불러오는 연출, 3편 물그림을 게임 붓 그림으로 바꾸기는 다음으로.
- `hyperframes check` 경고 중 남긴 것: 같은 그림 두 번 사용, 눈금통 테두리 위치(의도).

## 남은 일 (다음 세션)

UPGRADE-PLAN의 '미룸' 항목: 1-5 첫 화면 가볍게, 1-6 실기기·수업, 1-7 색 토큰·CSS 합치기, 1-8 2장 카드 캡션, 2-4 오개념 문장 점검, 2-5 VoiceOver, 3-5 교실 효과 파일럿.
