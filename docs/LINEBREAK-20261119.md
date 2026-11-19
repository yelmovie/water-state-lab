# 문장 줄바꿈 균형 · 2026-11-19

기준: `../_shared/LINEBREAK-BALANCE-20261119.md` 2절(짧은 끝줄, 가운데 짧은 줄, 단어 끊김, 잘림, 강제 줄바꿈 불균형). 문구·대사 내용은 바꾸지 않았고 줄바꿈 위치만 다뤘다.

## 측정 방법

- 공통 도구 `_scratch/linebreak-audit-20261119/run.mjs 06`(타이틀부터 버튼을 눌러 가는 자동 탐색)과 `measure.js`.
- 06 전용 스윕 `.tmp/linebreak-20261119/sweep.mjs`: 상태를 직접 세팅해 타이틀, 지도(절반·전체 진행), 실험 1~10, 실험별 주민 편지 10개, 현장 2·4·10(안내 대화·도움말·본 화면), 결과, 인증서, 탐구 노트, 개념 영상 1~10(자막 장면 바꾸기 포함), 주민 대화 5명(첫인사·답, 장 끝 대화), 마을 수첩, 설정, 3D 런 시작 화면을 열고 화면마다 잰다.
- 변경 후 측정은 다른 세션의 미커밋 변경이 섞이지 않게 `HEAD + 이번 두 파일`만 모은 사본(`.tmp/linebreak-20261119/clean-build.sh`)을 빌드해 쟀다.

## 전/후 문제 수

| 크기 | 변경 전(운영) | 변경 후(로컬 빌드) | 변경 후(운영) |
|---|---|---|---|
| 1280×800 | 6 (실제 3 + `<br>` 오탐 3) | 3 (`<br>` 오탐 3만) | 3 (`<br>` 오탐 3만, 자동 탐색 포함) |
| 1920×1080 | 9 (실제 6 + `<br>` 오탐 3) | 3 (`<br>` 오탐 3만) | 3 (`<br>` 오탐 3만) |
| 1024×768 | (전 측정 없음) | 6 (`<br>` 오탐 2, 균형 잡힌 2줄 제목 1, 좁은 버튼 2) | — |

1280×800 실제 문제 3개 중 1개(지도 도움말 「…첫 샘터부터 / 살펴보자!」)는 자동 탐색에서 나왔다.

## 고친 곳

| 화면 | 전 | 처리 |
|---|---|---|
| 장 끝 주민 대화 발견 카드 `.water-context .lesson-card strong` | 「…이 비교에서는 B를 가열해서 물이 / 더 빨리 줄었어.」 끝줄 14% | `text-wrap-style: balance` |
| 같은 카드의 도구 문구 `.water-context .lesson-card span` | 148px 칸에 끼어 「물방울 렌즈를 / 얻었어!」 | `flex: 0 0 auto; max-width: 45%` + balance |
| 실험 8 시작 안내 `.stage-guard p`(1920) | 「…어떻게 맺히는지 / 살펴보자.」 | balance |
| 탐구 노트 도장 기록 `.stamp-page p`(1920) | 「…것을 / 알았다.」「…것을 / 발견했다.」 | balance |
| 개념 영상 자막 `.concept-caption p`(1920) | 「…빨간 선보다 / 높아졌어.」 | balance(상자의 줄바꿈 방식은 그대로 따름) |
| 실험 4 빈 선반 안내 `.bench-empty p` | `<br>`로 뜻 단위 2줄 | balance(가운데 정렬 짧은 안내 보강) |
| 지도 도움말 `#map-coach-help p` | 「…첫 샘터부터 / 살펴보자!」 | 공통 규칙(`text-wrap: pretty`)으로 해결 |

공통 규칙: `src/korean-linebreak.css`(공통 파일 그대로 + 아래쪽 06 보정 절)를 `index.html`에서 다른 스타일보다 먼저 연결했다. `scripts/build.mjs`는 `src/`를 통째로 복사하므로 새 파일이 `dist`와 오프라인 캐시 목록에 자동으로 들어간다.

### 공통 규칙에서 발견한 부작용

공통 `:where([role="status"]) { text-wrap: balance }`는 줄임형이라 `text-wrap-mode: wrap`까지 정한다. 개념 영상 재생 중에는 자막 상자가 `white-space: nowrap` + 1px clip으로 숨겨지는데, 자막 `<p role="status">`에 wrap이 걸려 숨김 자막이 한 낱말씩 세로로 쌓였다(눈에는 안 보이지만 높이 358px). 06 보정에서 `.concept-caption p { text-wrap-mode: inherit; text-wrap-style: balance }`로 막았고, 보정 규칙은 모두 `text-wrap-style`만 쓴다. 공통 파일을 `text-wrap-style`로 바꾸자는 제안은 세션 공유 노트에 남겼다.

## 남은 것

- `<br>` 오탐 3개: 타이틀 「…물의 비밀로<br>멈춘 물길을…」, 실험 4 「…덜 담은 물을<br>나란히 비교해 보자」, 인증서 「…되살렸기에<br>이 인증서를 드립니다.」. 모두 뜻 단위로 끊긴 두 줄이라 그대로 둔다(도구가 `<br>` 자리를 낱말 안으로 잘못 본다).
- 1024×768 실험 4 「덜 / 담기」「더 / 담기」: 48px 폭 세로 버튼(−·덜·담기 3단). 한 줄로 만들려면 버튼 폭·배치를 바꿔야 해서 이번 범위 밖.
- 1024×768 실험 4 「물의 양 / 정하기」: 두 줄 길이 93%로 이미 균형. 도구의 4글자 기준 오탐.
- 캔버스: Phaser 장면 글(그릇 이름표, 「그릇 위에 놓아 봐」 등)은 한 줄 짧은 이름표이고 글자 단위 자르기 코드가 없다. 개념 영상·스토리 영상에 박힌 자막은 범위 밖.
- 줄바꿈과 무관한 기존 문제(보고만): 390×844 세로 폰 지도에서 교사 시연 모드 위 띠 버튼이 화면 오른쪽으로 105px 넘친다. 운영 배포본에도 같다.

## 검증

- `node scripts/check.mjs` 통과, `node --test tests/*.test.mjs` 329개 통과, `node scripts/build.mjs` 통과(HEAD + 이번 파일 사본).
- `scripts/responsive-workspace-qa.mjs`(6개 화면 크기 × 20개 화면): 위 390×844 기존 넘침 1건 외 넘침·스크롤·화면 밖 조작 없음, 콘솔 오류 0.
- 전/후 스크린샷·측정: `.tmp/linebreak-20261119/before/`, `after2/`, `live/`.

## 배포

- 커밋 `97e5a35` → Cloudflare Pages `water-state-lab` 배포 `5fa6aaea`.
- `cmp.sh`: `src/korean-linebreak.css` 빌드=운영 `bebacd5e7abe7d39` MATCH, `index.html` MATCH.
- 운영 재측정(`sweep.mjs live`, `run.mjs 06`): 1280×800·1920×1080 모두 `<br>` 오탐 3개만 남음. 장 끝 대화 발견 카드 운영 스크린샷 `.tmp/linebreak-20261119/live/1280x800/endtalk6.png`(전: `before/1280x800/endtalk6.png`).
- 추가(2026-11-20, 사용자 승인): 성취 카드 보관함 잠긴 문구 `src/reward-cards.css` `.rc-locked` 컨테이너 보정 네 줄(공통 지침 8절). 06은 전에도 한 줄(카드 175~180px)이었고, 후 1280×800·1920×1080 한 줄, 1024×768 「악당을 / 물리치면 / 열려요」 세 줄, 카드 넘침 없음. 커밋 `8b6575b` → Pages `7ae206f8`, `cmp.sh` reward-cards.css·index.html MATCH.
