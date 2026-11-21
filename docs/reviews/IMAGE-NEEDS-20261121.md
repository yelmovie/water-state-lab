# 06 방울이의 물길탐험 · 필요한 그림 목록 (2026-11-21)

- 기준: 운영 앱 코드 `9ef8497`. 권리 장부 `docs/RIGHTS-LEDGER-20261121.md`의 「출처 미확인」 줄(G23~G27)과 화면에서 실제로 쓰는지(`src/`·`index.html` 검색)를 맞춰 봤다.
- 그림은 만들지 않았다. 사용자 결정 「출처 모르는 옛 그림: 자료가 있으면 장부에 연결, 없으면 새로 만들어 교체(3-3단계)」에 따라, 아래 (가)는 **생성 기록이 나오면 새로 만들 필요가 없다.**

> **사용자 확인 반영(2026-11-21 09:25):** 「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제」 → 「전부 맞아」. 마지막 출처 미확인 그림 `v2/experiment-table-v3.webp`와 `icons/bangul-loader.webp`도 「Codex(GPT 이미지)·유료」로 장부에 채웠다(G23·G24). **새로 그려야 할 그림: 0장**((가) 0, (나) 0, (다) 0).
>
> **3-2a 갱신(2026-11-21):** Codex 생성 기록(`_shared/CODEX-IMAGE-RECORDS-20261121.md` 방법)과 대조해 아래 (가) 9장 가운데 8장(시간 마법 2장, 배관, 응결 5장)의 생성 기록·변환 명령을 찾았다. 권리 장부 G25~G27이 「근거 약함」(Codex 생성, 계정 요금제 기록만 남음)이 되어 **새로 그릴 필요가 없다.** 남은 출처 미확인은 `v2/experiment-table-v3.webp` 1장(2026-10-18, 이 맥의 기록 시작일 11-05 이전)이다. 화면에서 안 쓰는 5장 가운데 4장도 기록을 찾았고 `icons/bangul-loader.webp`만 출처 미확인이다.
>
> **지금 새로 그려야 할 수 있는 그림: 1장**(가) `experiment-table-v3.webp`, (나) 0장, (다) 0장. 아래 표는 3-1단계 기록으로 남긴다.

## (가) 출처 미확인 + 화면에서 쓰는 그림: 9장(3-1단계 기준 · 3-2a 뒤 1장)

| 쓰이는 화면 | 지금 파일 | 크기·비율 | 화풍을 맞출 참고 그림 | 왜 필요한가 |
|---|---|---|---|---|
| 실험 화면 바탕 작업대(`src/experience.css`, `src/tablet.css`) | `public/assets/v2/experiment-table-v3.webp` | 1672×940(약 16:9), 투명 아님 | `public/assets/v2/lab-workshop.webp`, `public/assets/stages/field-lab.webp` | 생성 도구·날짜 기록 없음(CREDITS에도 「생성 도구부터 확인 필요」) |
| 시간 마법 시계판(`src/time-dial.js`) | `public/assets/learning/time-clock-face.webp` | 384×384(1:1), 투명 배경 | `public/assets/learning/experiment-props-20261107/clock.webp` | 원본 `clock.png`만 있고 기록 없음 |
| 시간 마법 지팡이 누르기(`src/time-dial.js`, `src/guided-experience.css`) | `public/assets/learning/time-wand-tap.webp` | 384×384(1:1), 투명 배경 | 같은 묶음 `time-clock-face.webp`(교체 시 한 벌로) | 원본 `wand.png`만 있고 기록 없음 |
| 3장 배관 터짐(`src/freeze-measure.js`) | `public/assets/learning/pipe-burst-photo.webp` | 1500×383(약 4:1), 투명 배경, 실사풍 | `public/assets/learning/pipe-burst.webp`, `public/assets/learning/real-ice.webp` | 기록 없음. 이름이 photo라 실제 사진인지부터 확인해야 함(실사풍 생성 그림으로 보이지만 판정 못 함) |
| 7·8장 젖은 음료병(`src/inquiry.js`, `src/phaser-scenes.js`) | `public/assets/learning/condensation-20261108/bottle-wet.webp` | 768×1152(2:3), 투명 배경 | `public/assets/stages/drink-bottle.webp`(마른 병, 같은 구도로 맞춰야 겹쳐 보임) | 원본 이름 `*-generated.png` 말고 기록 없음 |
| 현장 응결 판 젖음(`src/transform-process.js`) | `.../condensation-20261108/cold-plate-wet.webp` | 1080×720(3:2) | `public/assets/learning/cold-plate-dry.webp`(같은 구도) | 같음 |
| 현장 실온 작업대(`src/transform-process.js`) | `.../condensation-20261108/room-bench.webp` | 1200×800(3:2) | `public/assets/learning/cold-plate-dry.webp` | 같음 |
| 온실 순환 모으개 마름(`src/greenhouse-cycle.js`) | `.../condensation-20261108/collector-cold-dry.webp` | 1536×1024(3:2) | `public/assets/learning/ending-collector-20261108/` | 같음 |
| 온실 순환 모으개 젖음(`src/greenhouse-cycle.js`) | `.../condensation-20261108/collector-cold-wet.webp` | 1536×1024(3:2), 마름 그림과 같은 구도 | 위 `collector-cold-dry.webp` | 같음(마름·젖음 두 장은 한 벌로 만들어야 겹침이 맞음) |

## 출처 미확인이지만 화면에서 쓰지 않는 그림: 5장 (새로 만들 필요 없음)

`public/assets/icons/bangul-loader.webp`, `public/assets/learning/time-clock.webp`, `public/assets/learning/time-wand.webp`, `public/assets/learning/ice-texture.webp`, `public/assets/learning/water-texture.webp`. 앱 코드가 부르지 않는다(이름 조합 경로도 검색함). 새로 만들지 말고 배포본에서 빼는 것이 맞다. 빼는 일은 이 단계 범위 밖이라 할 일로만 남긴다.

## (나) 화풍·해상도가 튀거나 임시로 넣은 그림: 없음

이번에 근거를 갖고 튄다고 판정한 그림은 없다. `pipe-burst-photo.webp`는 실사풍이지만 같은 장면의 `real-*` 소품(`real-ice.webp`, `real-dew.webp`)도 실사풍이라 튀는 것으로 보지 않았다. 전 화면을 그림 단위로 비교하지는 않았다.

## (다) 게임성·화면 보강용 소품·배경: 없음

할 일 목록(`SCORE-100-TODO-20261120.md`)에 A17·C14 같은 게임성·화면 보강 줄이 없다.

## 합계

새로 그려야 할 수 있는 그림 9장(가) → 3-2a 뒤 1장 → 사용자 확인 뒤 0장, 0장(나), 0장(다). 영상 4개(`public/assets/story/intro·final` mp4·webp)도 출처 미확인이지만 그림이 아니라 이 목록에서 뺐다(권리 장부 M1).
