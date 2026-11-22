# 납품 안내 · 방울이의 물길 탐험 (06 물의 상태 변화)

기존 인계 문서: [../HANDOFF.md](../HANDOFF.md)(최근 작업 기록), [../README.md](../README.md). 두 파일은 그대로 두었습니다.

## 1. 한눈에

| 항목 | 내용 |
|---|---|
| 이름 | 방울이의 물길 탐험(물의 상태 변화, 06번) |
| 운영 주소 | https://water-state-lab.pages.dev |
| 저장소 | https://github.com/yelmovie/water-state-lab (이 폴더 `6 waterchange`, 브랜치 `main`) |
| 현재 앱 커밋 | `2179f81`(2026-11-21). 운영 Pages 배포 `bc7b6751` |

## 2. 폴더 구조

- `src/`, `index.html`, `public/`: 앱 코드(바닐라 JS)와 배포되는 그림·영상·소리·3D 모델·서비스 워커
- `functions/assets/story/`, `functions/assets/concepts/`, `worker/media-range.js`: 영상 탐색 요청(Range) 처리
- `scripts/`: 빌드·검사·영상 렌더·품질 점검 스크립트
- `dist/`: 빌드 결과(배포 대상)
- `tests/`: 자동 검사
- `docs/`, `thumbnails/`, `image/`, `films/`, `assets`: 기획·검수·출처 기록, 납품 썸네일, 원본 자료(배포되지 않음)

## 3. 실행·빌드·검사 명령

`package.json`에서 확인한 것입니다. 별도 런타임 의존성이 없는 정적 사이트입니다.

- `npm run dev` 또는 `npm start`: 개발 서버(`scripts/serve.mjs`)
- `npm run build`: `scripts/build.mjs`가 `dist/`를 만듭니다
- `npm run preview`: 빌드 결과를 http://127.0.0.1:4317 에서 실행
- `npm test`: `node --test tests/*.test.mjs`
- `npm run check`: `scripts/check.mjs`
- `npm run check:experience`: `scripts/experience-qa.py`(파이썬)
- `npm run concepts:render`: 개념 영상 렌더

## 4. 배포

- 호스팅: Cloudflare Pages, 프로젝트 `water-state-lab`, 빌드 폴더 `dist`(`wrangler.jsonc`).
- 배포 명령(README): `npm run build` 후 `wrangler pages deploy dist --project-name water-state-lab --branch main`.
- GitHub 푸시와 운영 배포는 따로 실행합니다. 자동 배포 연동은 없습니다.
- 영상 Range 처리: `functions/assets/story/[[path]].js`, `functions/assets/concepts/[[path]].js`가 `worker/media-range.js`를 부릅니다.
- 서비스 워커는 `public/sw.js`이고, 빌드가 오프라인 자료 목록을 만들어 넣습니다.

## 5. 다른 호스팅으로 옮길 때 챙길 것

- 정적 파일 폴더: `npm run build`로 만든 `dist/` 전체를 도메인 루트에 서비스합니다.
- 영상: `assets/story/`, `assets/concepts/`의 mp4가 Range 요청에 206으로 답해야 탐색과 iPad 재생이 됩니다.
- 서비스 워커 `sw.js`는 루트 경로에서 서비스되어야 합니다. 오프라인 자료 준비가 이 파일에 의존합니다.
- 환경 값은 없습니다. 진행은 브라우저 localStorage(`water-drop-lab:v1`)에 저장되고, 외부 API·분석·로그인이 없습니다(README).

## 6. 버전과 변경 이력

앱 코드(`src`, `public`)를 바꾼 최근 커밋입니다.

- `2179f81` 2026-11-21 3D 달리기 밸브 옆 유리 배관을 Meshy 연결관(`device-tube.glb`)으로 교체
- `ae5b89b`·`550a313`·`1bfd2f9` 2026-11-21 큰 JS 파일의 화면 조각 함수를 별도 파일로 이동(픽셀 차이 0)
- `bcae757` 2026-11-21 `experience.css`를 두 파일로 분리(픽셀 차이 0)
- `c574125` 2026-11-21 `layout-balance.css` 덮어쓰기 층을 원래 파일로 합침
- `50a6b5e` 2026-11-21 브라우저 뒤로 가기가 앱 안에서 앞 화면으로(활동 → 지도 → 시작 화면)
- `9ef8497` 2026-11-21 성취 카드 잠긴 문구를 18px로
- `2032782` 2026-11-21 지도 악당 말풍선 폭을 글 길이에 맞춤
- `9994345` 2026-11-21 냉각판 이름표를 부품 위로, 단계 칩·결과 제목 글자색 진하게
- 2026-11-20 시작 화면 우측 하단 제작·저작권 표기 추가, 폰 가로 시작 화면 버튼 잘림 수정(`HANDOFF.md`)

## 7. 권리·출처

[RIGHTS-LEDGER-20261121.md](RIGHTS-LEDGER-20261121.md)에 그림·영상·3D·음악·효과음·목소리·글꼴을 49줄로 정리했습니다. 40줄은 확인됨(사용자 확인 포함), 9줄은 근거 약함, 출처 미확인은 0줄입니다. 근거 약함은 Higgsfield 그림(G2·G5), 방울이 파생 그림(G21), 코드 렌더 영상(M3 HyperFrames, M4 Remotion), Meshy 3D(D1), 앱이 재생하지 않는 옛 목소리 3줄(V5~V7)입니다.

## 8. 알려진 한계와 남은 일

성적표 [reviews/SCORE-20261121.md](reviews/SCORE-20261121.md) 기준 총점 92점, 실기기 제외 98점입니다.

- 자료 대기: 교사 검수(검수표 `TEACHER-REVIEW-20261121.md`), 권리 장부의 근거 약함 줄과 요금제·이용 조건 화면.
- 실기기·수업 대기: 학생 난이도, 40분 수업, 연출 중 실제 입력, 저사양 태블릿, 태블릿에서 지속 애니메이션, 학교 네트워크.
- 공개되는 `public/assets/CREDITS.md`에 내부 메모(요금제 판정, 외장 SSD 경로)가 들어 있습니다(권리 장부 기록).
