# 성취 카드(지도 두더지 퇴치 보상) · 2026-11-18

운영 배포: 커밋 `924df16` → Cloudflare Pages `748761fa`(https://water-state-lab.pages.dev/). 직전 커밋 `a07d960`(방울이·두더지 음성, 썸네일)까지 함께 올라갔다. 운영 주소의 카드 그림 10장·효과음 5개·`src/app.js` 등 25개 파일 SHA-256이 커밋본 빌드와 일치. 빌드는 `_scratch/deploy-20261118/wt/06`(git archive 커밋본), 명령은 `deploy.sh 06 "6 waterchange" pages water-state-lab`.

공통 모듈 보강본 배포: 커밋 `ceeb8dd` → Cloudflare Pages `a7ec3f72`(같은 주소, 같은 명령). `src/reward-cards.js`·`reward-cards.css`만 공통 원본 최신본으로 바꿨다(연출 중 오류가 나도 화면이 멈추지 않음, `inert` 속성 병행). `npm run check`, `npm test` 325개, `qa.mjs` 개발 서버 13단계·오류 0. 운영 주소의 `src/reward-cards.js`·`src/reward-cards.css`·`src/app.js`·`sw.js` 등 7개 파일 SHA-256이 빌드와 일치하고, 운영 주소에서도 `qa.mjs` 13단계 통과·콘솔 오류 0(음성 mp3 2개는 화면 전환 중 요청이 중단된 것이고 파일은 200으로 내려온다). 글꼴 테스트의 `system-ui` 예외와 `experience.css` 덮어쓰기는 그대로 뒀다.

- 지도 밸브 두더지를 3타로 물리치면 퇴장 뒤 카드가 돌며 나타나고, 「카드 보관함에 넣기」를 누르면 소리 버튼 앞 5칸(`header()`의 `.topbar-right`, 지도 화면만)으로 들어간다. 5장이면 「컬렉션 완성!」, 칸을 누르면 보관함.
- 연결 파일은 `src/map-rewards.js`(카드 설정·보유 계산·등장). 공통 모듈 `src/reward-cards.js`·`reward-cards.css`는 `../_shared/reward-cards`의 복사본이라 고치지 않는다. 빈 칸 글꼴만 `experience.css`의 `.topbar .rc-slot`에서 덮어쓴다.
- 보유는 새로 저장하지 않는다. `map-villains.js`의 `clearedMapVillains(state)`(= 기존 `water-state-lab:map-villains:v1` 기록 + 이번 탭 기록)를 그대로 읽는다. 그래서 탐구를 다시 해서 증거가 바뀌어 두더지가 다시 나타나면 그 카드 칸도 비고, 다시 물리치면 카드가 또 나온다. 교사 시연은 기록을 남기지 않으므로 카드도 없다.
- `map-villains.js` 변경은 세 가지뿐: `clearedMapVillains` 추가(`remainingMapVillains`는 이것을 센다), `onCleared(index)`로 섬 번호 전달, 일시정지 조건 `paused()`에 `.rc-layer` 추가. `journey.js`의 `blocked()`에도 `.rc-layer`를 더해 카드가 열린 동안 이동·공격·두더지 배회·접촉 피격이 멈춘다.
- 모두 퇴치 안내·`victory` 징글·엔딩 영상(`app.js`의 `mountMapCamera` 콜백)은 카드를 닫은 뒤 실행된다. 자동 관찰로 엔딩 영상이 바로 열릴 때는 `stopCue()`로 카드 징글을 먼저 끊는다.
- 효과음은 `sound.js`의 `playCue`(`cardWhoosh`·`cardReveal`·`cardEpic`·`cardSlot`·`cardComplete`)로 낸다. 파일·그림 출처는 `public/assets/CREDITS.md` 끝 절.
- 카드 그림은 `public/assets/reward-cards/`(빌드 복사 목록과 오프라인 지연 캐시에 추가). 원본 PNG는 `../_scratch/reward-cards-20261118/gen/06/`. 다시 변환: `node ../_shared/reward-cards/convert.cjs "<sharp 있는 프로젝트>" "<gen/06>" public/assets/reward-cards`.
- 확인: `npm run check` 통과, `npm test` 325개 통과, 빌드 통과. 헤드리스 Chrome(`.tmp/reward-cards/qa.mjs`, 개발 서버와 배포본 빌드 둘 다 13단계·콘솔 오류 0): 1·2타와 반격, 3타 뒤 카드, 카드 중 지도 멈춤, 칸 채움, 새로고침 뒤 유지·재등장 없음, 보관함, 소리 버튼, 5/5 축하 뒤 안내·징글 순서, 자동 관찰의 엔딩 영상 순서, 1024×768 헤더 한 줄, 움직임 줄이기, 교사 시연. 스크린샷은 `.tmp/reward-cards/`.
- 확인 못 한 것: 실제 태블릿 터치와 실제 스피커 소리(재생 호출 순서만 확인), iPad Safari.
- 그림 메모: 4번 카드(이슬 정원)에서 파랑의 날개 손이 셋으로 보인다(판 위, 수건, 오른쪽 날개). 글자·다른 캐릭터·잘림은 없다.

# 3초 규칙 디자인 고도화 · 2026-11-18

운영 배포: 커밋 `35f1ff1`(디자인 `525a2b4`·`957b56d`·`e7adefa` + 두더지 반격음 수정 포함) → Cloudflare Pages `492a2e48`. 공개 파일 468개 SHA-256 일치. 직전 운영본 `8ad7aa4c`(8fb2275). 빌드는 `.tmp/deploy-35f1ff1`(git archive 커밋본).

- 지시 한 곳: 문제는 위 막대에만. 아래 답 카드의 같은 문제 문장(h2)은 화면에서 숨기고(스크린리더용으로 남김), `pinQuestion`은 답 묶음 위에 문제를 다시 넣지 않는다(답 묶음 전체 표시는 유지).
- 주 버튼 하나: 타이틀의 「방울이 변신 모험」을 보조 버튼으로 낮춰 「실험부터 시작」/「이어서 탐험하기」 하나만 주 버튼.
- 3D 시작 카드: 제목 h2 삭제(위 HUD와 중복), 1180px 넘으면 방향판과 점프 사이 아래쪽, 좁으면 안내 문장 아래 하늘 자리. 「다시 도전」「기존 방식으로 하기」「게임과 실제 과학」은 오른쪽 위 「더 보기」 접힘 하나로. `tmp/run3d-qa/qa.mjs`는 접힘을 먼저 열도록 고쳤다(52/52).
- 온실 판 `.field-transform` 배경 0.96→0.6 + blur 4px, 두 카드 사이 빈 칸 제거.
- 팝업 배경: `--scrim`(#153c3a47, 0.28) 토큰 하나(tablet.css, `:root,::backdrop`). 개념 영상만 예외.
- 글자: `--font-size-*`는 tablet.css에서만 정의, caption 16→18px. 학생이 읽는 12~17px 글자(속도·힌트 라벨, 단계 칩, 문제 단서, 기록 카드, 3D HUD·이름표 등)를 18px로.
- (이어서 `12e2974` → Pages `b91bc216`, 공개 파일 468개 일치) 실험 7은 예상 문제를 고르기 전 캔버스의 다음 단계 안내를 숨긴다. 엔딩·지도 이름표·두더지 말풍선·주민 대화 이름줄과 주제·저장 경고를 18px로 올렸다.
- (이어서 `e41413c` → Pages `412f55e6`, 공개 파일 468개 일치) 주민·부탁 대화를 모달 대신 장면 카드로 연다(`modal(...,{scene:true})` → `dialog.show()`, 배경 어둡게 없음, 아래쪽 카드만 클릭을 받음, 닫기 버튼은 카드 안, Esc로 닫힘). 모달 ↔ 카드 전환은 `modal()`이 닫았다 다시 연다. 지도 방향판 「방울이 이동」 줄바꿈 수정. `check:experience`는 `stage-N.mp4`(지금은 `zone-N.mp4`)를, `chapter-process-qa.mjs flow`는 없어진 `ix-pour-auto`를 찾아 이전 커밋에서도 실패한다 — 스크립트 갱신 필요.
- 남은 18px 미만: 교사 전용 「시연할 장」(14px), 힌트 버튼 장식 「…」, 실험 캔버스 뒤에 숨은 접근성용 이름표, 높이 680px 이하 화면의 축소 글자.
- 확인 못 한 것: 실제 태블릿 터치, 학생 반응, `npm run check:experience`(이 맥에 파이썬 playwright 없음).
- 스크린샷: `.tmp/design-3sec-20261117/before`(운영 8ad7aa4c 이전 코드) · `after`(로컬), 측정값 `audit.json`.

# 작업 기록 — 2026-11-17 (변신 모험 3D 달리기 · 새 창에서 이어가기)

새 창에서는 이 절과 `docs/RUN-STAGE-3D-PLAN-20261117.md` 끝의 「계획 확정」「구현 결과」「화면 고도화」「물 그림 맞추기」만 읽으면 이어서 할 수 있다. 공통 규칙은 `../_shared/RUN-STAGE-3D-IMPLEMENT-GUIDE-20261117.md`.

## 완료한 작업

- 홈의 「방울이 변신 모험」(선택 모드, 탐험 5개·관문 11개)이 3D 달리기 스테이지로 먼저 열린다. 기존 2D 화면은 대체 화면으로 남았다(WebGL 없음, 3D 내려받기 실패, 움직임 줄이기, 「기존 방식으로 하기」, 교사 시연 기본).
- 판정은 `adventureMove()` 그대로, 저장은 `water-drop-lab:v1`의 `dropAdventure` 그대로(키 10개 변동 없음).
- 생성 그림 7장을 입혔다: 원경, 길·벽 무늬, 열판·냉각판, 물·얼음 달리기 6프레임, 소품 9종.
- 장치 받침 위치, 관문 난간, 장치별 통과 연출, 턱에서 잘림, 물에 빠질 때 표현, 이름표 겹침을 고쳤다.
- (오후 이어받기) 물 달리기 그림을 2D 물 그림(`water.webp`)을 참고 그림으로 붙여 다시 만들었다. 끝이 둥근 꼭지, 넓게 퍼진 웅덩이 바닥, 가운데 얼굴이 2D와 같아졌다. 참고 그림을 384px PNG로 줄여 붙이니 첫 시도에 생성됐다.
- 운영 배포: 커밋 `70893f4` → Cloudflare Pages `d214ad1a`. 직전 운영본 `8ecbddbd`(8272213), 그 전 `d14a562d`(9603468), `06da9ac7`(00f99cc). `70893f4`는 `water-run.webp` 한 장만 바꿨고, 그 뒤 커밋은 문서만 바꾼다.
- (2026-11-18 효과음) 커밋 `fe230e1` → Cloudflare Pages `d36519fb`(직전 `d214ad1a`). 지도 두더지 등장 `bubble-03.mp3`, 3타 퇴장 `bubble-01.mp3`, 모두 퇴치 `victory-jingle-04.mp3`(자동 관찰로 엔딩 영상이 바로 열릴 땐 안 냄)를 더했다. 기존 공격·타격·반격 소리는 그대로. 배포는 깨끗한 worktree 빌드로 했다(같은 폴더의 다른 세션 미커밋 CSS 변경은 운영에 안 들어감).
- (2026-11-18 반격음 중복 수정) 커밋 `8fb2275` → Cloudflare Pages `8ad7aa4c`(직전 `d36519fb`). 두더지 반격 때 `src/map-villains.js`가 돌진 순간(760ms)과 `hitFighter`의 피격 자세(860ms)에서 `thud`를 두 번 냈다. 돌진 쪽 소리를 빼서 피격 자세와 함께 한 번만 난다(접촉 쿨다운·명중음 타이밍은 그대로). 브라우저 재생 호출 기록으로 수정 전 2회 → 수정 후 1회 확인. 깨끗한 worktree 빌드로 배포.

## 수정한 파일 (`git diff --stat 00f99cc HEAD` 기준, 문서 제외)

| 파일 | 변경 내용 | 이유 |
|---|---|---|
| `src/run-stage-model.js` (새 파일, 161줄) | `runMove`·`runHint`·`adventureMode`, 코스 생성, 달리기·점프·상자 충돌, 장치 통과 궤적 | 판정 연결과 물리를 DOM 없이 테스트하려고 |
| `src/run-stage.js` (새 파일, 377줄) | Three.js 무대, 세운 그림, 입력, 이름표, 소품 배치 | 3D 화면 |
| `src/run-stage.css` (새 파일, 83줄) | 방향판·버튼·안내 배치 | 3D 화면 |
| `tests/run-stage.test.mjs` (새 파일, 179줄) | 테스트 12개 | 판정 대응, 코스, 완주, 저장 필드 |
| `src/drop-adventure.js` (+30) | 화면 선택, 무대 연결, 전환 버튼, 실패 시 2D | 대체 화면 |
| `src/app.js` (1줄) | `mountDropAdventure(state,{go,render,save})` | 무대가 저장을 부르려고 |
| `index.html` (1줄), `scripts/build.mjs` (2줄) | CSS 링크, `run-stage` 복사·지연 캐시 | 빌드 포함 |
| `public/assets/run-stage/` 16개 | 실행용 WebP 약 560KB | 그림 |

## 테스트·빌드 결과

| 명령 | 결과 |
|---|---|
| `npm run check` | 통과 |
| `npm test` | 318개 통과 |
| `npm run build` | 통과 |
| `QA_URL=<주소> node tmp/run3d-qa/qa.mjs` | 개발 서버 52/52, 운영 주소 52/52 (마지막 코드 `70893f4` 기준). 빌드본(4337) 52/52는 첫 배포 `9603468` 때만 돌렸다 |
| 운영 파일 해시 | 118개 일치(`70893f4` 커밋본 빌드와 대조, `index.html`은 `/`로) |
| 실제 태블릿·iPad Safari·아이 대상 | 미실행 — 기기와 사람이 필요 |

`tmp/run3d-qa/`는 git 제외다: `qa.mjs`(전체 검사), `bot.js`(자동 주행), `gates.mjs`(관문 통과 장면 캡처), `shot.mjs`(한 장 캡처), `process.mjs`(그림 가공), `gen.sh`(생성 대기열), `clean.sh`(내장 원본 정리). Playwright·sharp는 `../5magnet/node_modules`의 것을 읽어 쓴다. `TMPDIR`은 프로젝트 `.tmp/` 아래로 준다.

## 확정된 결정

- 카메라는 옆에서 따라가는 고정 시점이다. 기존 장치 그림이 모두 옆모습이고 방향판이 한 번에 한 방향만 받는다.
- 충돌은 직접 쓴 상자 겹침 계산이다. 물리 엔진, `Octree`, 외부 3D 모형은 쓰지 않는다.
- 얼음·물·수증기의 속도와 점프는 같다. 수증기는 그림 없이 점선 원과 글자다.
- 힌트 동료는 파랑(`/assets/v2/parang-think.webp`). 세 번 막히거나 세 번 떨어지면 나온다.
- 화면 선택(2D/3D)은 저장하지 않는다.
- 배포는 `git archive`로 꺼낸 커밋본을 빌드해 올린다(작업 폴더는 줄바꿈이 달라 캐시 이름이 달라진다).

## 남은 문제

| 등급 | 문제 | 재현·확인 방법 | 막힌 지점 |
|---|---|---|---|
| 확인 필요 | 실제 태블릿에서 두 손가락 동시 누름(방향판+점프), 프레임 수 | 운영 주소를 태블릿에서 열어 탐험 1~5 | 기기 없음(오후 이어받기에서도 이 맥에서는 못 했다) |
| 확인 필요 | 좁은 다리(탐험 2·5)와 수증기 구간이 4학년에게 어렵지 않은지 | 아이가 직접 | 사람 필요. 아이가 해 보기 전에는 추측으로 바꾸지 않고 그대로 둔다(2026-11-17 오후 확인). 어렵다는 결과가 오면 `src/run-stage-model.js`의 `PLAN`에서 `bridge`를 `gap`으로 바꾼다 |
| 작음 | 앱 안 브라우저 창이 숨겨져 있으면 3D가 거의 그려지지 않는다 | 창이 가려진 채 미리보기 | 헤드리스 검사로 대신했다 |
| 의도한 동작 | 두더지에 닿는 순간 두더지 그림이 방울이 앞에 겹쳐 보이고, 물길 장치에 들어가는 순간 물이 길 뒤쪽 가장자리에 납작하게 눕는다 | 탐험 3·5 캡처(`tmp/run3d-qa/shots-dev/*-exp3-run.png`, `*-exp5-run.png`) | 부딪힘·흘러 들어감 연출이라 고치지 않았다. 아이가 어색하다고 하면 다시 본다 |

해결: 물 달리기 그림이 2D 물 그림과 다르던 문제는 `70893f4`에서 고쳤다(2026-11-17 오후).

## 다음에 할 일

1. (끝남) 생성 그림 8장(오후에 다시 만든 `water-run-ref1.png` 포함)의 내장 임시 원본은 모두 지웠다. `gpt-image.sh -l`에 이 프로젝트 경로가 없는 것을 확인했다.
2. 사용자가 화면을 보고 주는 수정 요청 반영. 고친 뒤 순서: `npm run check` → `npm test` → 4336 미리보기(`.claude/launch.json`의 `water-run3d`)에 `qa.mjs` → 커밋·푸시 → `git archive` 빌드 → `pages deploy dist --project-name water-state-lab --branch main --commit-hash <해시>` → 운영 주소에 `qa.mjs`.
3. 계획 목록 중 안 만든 그림: 변신 순간, 기뻐하기, 밸브 소품, 시작 카드. 지금은 코드 연출과 기본 도형이다. 필요하다는 요청이 있을 때만.
4. 실기기 확인 결과가 오면 계획 문서의 「확인하지 못한 것」을 갱신.

## 건드리면 안 되는 것

- `src/drop-adventure-model.js`, `src/state.js`의 저장 형식: 판정과 기록은 그대로 둔다는 것이 이번 작업의 전제다.
- `src/journey.js`, `src/map-villains.js`, 1~10장 실험: 이번 범위 밖이다. 두더지는 그림만 다시 썼다.
- `localhost:4316`의 저장 기록: 기존 진행 기록이 있다. 검사는 4336(개발)·4337(빌드본)을 쓴다.
- `assets/source-media/run-stage-20261117/`의 PNG 원본: 다시 가공할 때 쓴다(git 제외, SSD에만 있음).

## 새 창에 붙여 넣을 시작 문장

```
06번 「방울이의 물길 탐험」(/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange) 변신 모험 3D 달리기 스테이지를 이어서 작업해 줘.
먼저 HANDOFF.md 맨 위 「작업 기록 — 2026-11-17」과 docs/RUN-STAGE-3D-PLAN-20261117.md 끝의 「계획 확정」「구현 결과」「화면 고도화」「물 그림 맞추기」를 읽어.
현재 운영은 커밋 70893f4, Cloudflare Pages d214ad1a야. 판정(adventureMove)과 저장(dropAdventure)은 건드리지 마.
그다음 할 일: (여기에 요청을 적는다)
```

# 최신 확인 · 2026-11-12

현재 실행 배포는 `bda2f5d`, Cloudflare Pages `a36d78d5`다. 공개 파일 399개 전수 일치와 후속 사용자 요청의 기능을 재확인했다. 아래 과거 기록의 해금 조건·자동 보기 위치·여권 명칭은 이후 요청으로 변경됐다. 현재 동작과 항목별 검증 근거는 `docs/reviews/CHANGE-RECONCILIATION-20261112.md`에 정리했다.

# 물길탐험 인계 · 2026-11-09 늦은 밤 (직접 해보기 먼저·악당 배회·같은 봉지)

운영 배포: 2026-11-09 커밋 85746bc → Cloudflare Pages `16d2457e`, 344개 파일 SHA-256 일치 확인. 직전 운영본 `5b653c5b`(되돌릴 때 사용). 빌드는 `tmp/deploy-85746bc`(git archive 커밋본), 배포는 터미널 패널에서 `tmp/deploy-85746bc.sh`.

- 모든 스테이지가 직접 조작 화면으로 시작한다. 자동 관찰은 '자동으로 보기'를 눌러야 시작하고, 두 단계마다 멈춰 '이어서 보기'로 넘긴다(`src/observation-play.js` `CHECKPOINT_STEPS`).
- 관찰 속도 메뉴 0.5·1·1.5·2배. 1배 = 예전 기본 0.5배의 절반 속도(`src/observation-speed.js` `PACE=.25`). 설정 키가 `observationPace`로 바뀌어 예전 저장의 속도는 1배로 시작한다.
- 질문 칸: '❓ 문제' 표시·문제 문장·금색 강조·큰 답 버튼, 제목줄 '문제' 배지. 질문 대기 중 화면이 가려져도 질문 상태 유지.
- 밸브 두더지: 배회·밸브 비틀기(끼익/쾅)·오염 웅덩이·악당 말풍선(방울이 접근 시), 퇴치 후 맑은 웅덩이. 효과음은 Kenney Impact Sounds(CC0) 3개 + 기존 물 튀는 소리.
- 3장 쭈쭈바: GPT Image 2.6으로 한 장에 같은 봉지 두 개를 생성해 반으로 나눔(`public/assets/learning/freeze-props-20261109/`, 원본·프롬프트 `assets/source-media/freeze-props-20261109/`).
- 미확인: 실기기에서 효과음 음량, 두 단계 멈춤의 전 스테이지 수동 확인(테스트로만 확인).

# 물길탐험 인계 · 2026-11-09 밤 (지도 악당 전투·16px 하한)

운영 배포: 2026-11-09 커밋 09df655 → Cloudflare Pages `5b653c5b`, 338개 파일 SHA-256 일치 확인. 직전 운영본 `bbdd5dc8`(되돌릴 때 사용). 빌드는 `git -c core.autocrlf=false archive`로 꺼낸 커밋본(`tmp/deploy-09df655`)에서 했다. GitHub 푸시는 하지 않았다(로컬 main이 origin/main보다 앞섬).

- 로컬 main은 origin/main보다 커밋 2개(bbbe4f7 지도 조작·관찰 재생, 39c2f06 섬 전체보기 맞춤) 뒤처져 있었다. 합쳐서 배포했고, 합치면서 `tests/map-camera.test.mjs`의 가짜 DOM에 악당 모듈이 쓰는 최소 기능을 채웠다.
- 지도 악당: 밸브 두더지 스프라이트(`v2/map-villain-mole.webp`), 방울이 전투 시트(`v2/bangul-combat-sheet.webp`), 물대포·반격·퇴치 애니메이션, 스페이스로 가까운 악당 공격(`src/map-villains.js`, `src/journey.js`). 회귀 스크립트 `scripts/map-villains-*.cjs`는 `PLAYWRIGHT_MODULE`과 `TEST_URL`을 주고 돌린다.
- 16px 하한·지도 겹침·2장 카드 캡션 정리. 자세한 내용은 `docs/reviews/SCORE-20261109.md`의 "이후 조치".
- wrangler 로그인 토큰은 11/09 07:54에 만료돼 있었다. 비대화형 셸에서는 갱신되지 않아서, 터미널 패널에서 `tmp/deploy-09df655.sh`(HOME만 SSD로 지정, XDG_CONFIG_HOME은 주지 않음)로 배포했다.
- 미확인: 두 전투 시트의 생성 도구·이용 조건(`public/assets/CREDITS.md` 마지막 항목), 실기기 터치로 악당 전투.

# 물길탐험 인계 · 2026-11-09 (구역 통합·학습 결론·여권·인증서·3D 물)

운영 배포: 2026-11-09 커밋 7130fdd → Cloudflare Pages `bbdd5dc8`, 205개 파일 SHA-256 일치 확인. 직전 운영본 `90f1813d`(되돌릴 때 사용). GitHub main 푸시 완료. 빌드는 `git -c core.autocrlf=false archive`로 꺼낸 커밋본에서 했다. Wrangler 로그인 정보는 `/Volumes/T7 Shield/DevCaches/tools/wrangler-home`에 있어서 `HOME`과 `XDG_CONFIG_HOME`을 그쪽으로 주고 실행한다.

- 현장 의뢰·개념 영상을 구역당 하나(5개)로 줄였다. 스테이지가 끝나면 "알게 된 것"과 주민 대화가 바로 이어진다. 자세한 내용은 `docs/reviews/STAGE-LEARNING-REVIEW-20261107.md`.
- 9장은 고장 두 곳(경사판·깔때기)만 고치는 구조와 ▶ 자동재생으로 바꿨다.
- 엔딩 영상 전체 화면, 탐구 여권·인증서 재디자인(`src/achievement.js`), 연구섬 3D 물 효과(`src/island-water.js`).
- 미검증: 학교 태블릿에서 3D 물 셰이더 성능, 아이 대상 수업, iPad Safari.

# 물길탐험 인계 · 2026-11-04 (BGM·이야기 영상)

운영 배포: 2026-11-04 커밋 ca12f5b → Cloudflare Pages `90f1813d`, 169개 파일 SHA-256 일치 확인. 직전 운영본 `6274b70c`(되돌릴 때 사용). 작업은 main에 병합했고 GitHub 푸시는 하지 않았다. 빌드는 `git -c core.autocrlf=false archive`로 꺼낸 커밋본에서 했다. 이 PC는 `npx wrangler`가 `ECOMPROMISED`로 실패해서 임시 폴더에 `npm install wrangler@4`로 설치해 썼다.

완료
- 파일 정리: 원본은 `assets/source-media/video|audio/`, 앱용은 `public/assets/story/`(MP4·VTT·WebP)와 `public/assets/audio/music/`. 루트의 mp3·mp4는 옮겼다.
- BGM(`src/sound.js`): 합성음을 없애고 메인 테마 「섬의 탐험」(탐험 중 반복)과 엔딩 테마 「물바퀴의 노래」(`ending` 화면에서 한 번, 다시 보기 후 처음부터)를 재생한다. 영상 중 멈추고 닫으면 이어진다. 음량은 iPad Safari 때문에 gain 노드로 조절한다. 기본값을 켜짐으로 바꾸고, 예전 저장본은 `settings.themeMusic`로 한 번만 켠다.
- 영상(`scripts/render-film.mjs`, 8번 프로젝트 방식): HEVC 원본을 1080p H.264로 다시 만들었다(19·23MB → 6.7·7.4MB). 색 보정, Jua 자막, 얼음 구간 스포트라이트·눈, 임무 카드(인트로), 코어 복구 %·도장 10개·색종이(엔딩), 테마 음악과 CC0 효과음을 입혔다. 자막은 화면에 새겨지고 VTT는 보조 기술용이다.
- 재생바는 자막을 가려서 평소 숨겼다. 자동재생 실패와 움직임 줄이기 때만 보인다.
- 서비스워커: mp3도 영상처럼 한 번 받아 206으로 답한다. 음악·영상은 설치 뒤 백그라운드 캐시.

다시 렌더할 때
- `PW_PATH`에 playwright-core 폴더를 준다(이 프로젝트엔 의존성이 없다). 예: `F:\iscreammedia_sc34\8 creatures\node_modules\playwright-core`. Chrome 필요.
- 엔딩 원본은 16.87초부터 번짐이 튄다. 16.8초까지만 쓰고 12.4초 프레임을 정지 화면으로 쓴다.
- 정지 화면에 확대를 넣으면 용량이 38MB 넘게 커진다(Cloudflare 파일 한도 25MiB). 고정 이미지로 둘 것.
- 인코더에 `-frames:v`가 없으면 엔딩 렌더가 끝나지 않고 파일이 계속 커졌다. 원인은 못 찾았고 상한으로 막았다.

남은 것
- 귀로 듣는 확인: 음악·효과음·영상 음량 균형은 수치로만 봤다(영상 약 -21 LUFS, BGM 기본 35%).
- iPad Safari 실기기의 BGM·영상 재생은 미검증.

# 물길탐험 인계 · 2026-10-30 새벽 (타이틀·지도 고도화)

시리즈 1~4번(우당탕 힘 실험실·동물기록 복구작전·초록정원 연구기지·생명시계 연구실) 화면을 기준으로 맞췄다.

운영 배포: 2026-11-04 커밋 2725b2b → Cloudflare Pages `6274b70c`, 163개 파일 해시 일치 확인. 직전 운영본 `4ced57db`(71c2376). 배포본은 작업 폴더가 아니라 `git archive`로 꺼낸 커밋본을 빌드했다(작업 폴더 CRLF라 캐시 해시가 다르다).

영상 Range
- Cloudflare Pages는 Range를 무시하고 200 전체 파일로 답한다. 그래서 캐시에 없는 영상도 서비스워커가 한 번만 받아 저장하며 206으로 답한다(`public/sw.js` `networkRange`). 네트워크 응답과 서비스워커 응답을 한 영상에 섞으면 Chrome이 `video error 4`로 실패하므로, 영상 Range 요청은 네트워크로 넘기지 말 것.
- Chromium 계열로 Cloudflare에서 재생·탐색, 구 서비스워커 → 새 서비스워커 교체 확인. iPad Safari 실기기는 미검증.
- 서비스워커가 켜지기 전 첫 재생은 여전히 200이라 Safari에서 실패할 수 있다(건너뛰기는 가능).

완료
- 타이틀(`home`): 새 배경·로고·방울이(`v2/title-island`, `title-logo`, `bangul-title`, Higgsfield GPT Image 2.5). 저장 없으면 [방울이와 탐험 시작] → 도입 이야기 → 지도. 저장 있으면 [이어서 탐험하기][탐험 지도 보기]. 왼쪽 하늘에 물방울 9개(움직임 줄이기 때 끔).
- 지도(`map`): 화면 전체 덮기 + 1.3배 확대(위아래 띠 없음), 방울이 중심. 방향키나 화면 화살표로 돌길과 다리를 따라 걷는다. 주민·열린 구역 근처에서는 행동 버튼이 뜬다. Enter는 가장 가까운 행동을 선택한다. 끌기·[손으로 밀기]·[한눈에 보기]로 지도를 둘러본다. 끌기와 손 모드에서는 구역에 들어가지 않는다. 처음 들어오면 이동·엔터 안내 4초. 구역을 고르면 방울이가 연결된 길을 따라 입구까지 걷는다. 지도 캔버스는 2배 해상도(카메라 줌 2). 코드: `src/journey.js` `mountMapCamera`.
- 이름 통일: 탭 제목·설치 이름·설정 앱 이름을 '방울이의 물길 탐험'으로. 카톡·SNS 미리보기 `og:image`(`assets/icons/og-image-v1.jpg`, 1200×630, 2.2:1 크롭 안쪽 배치).
- 엔딩: 낮은 가로 화면(915×412 등)에서 왼쪽 열이 잘려 '3D로 둘러보기'에 못 닿던 문제 → 왼쪽 열도 스크롤.

확인
- `npm run check`, `npm test` 94/94, `npm run build` 통과.
- 전 화면 스윕(타이틀 2·지도 2·엔딩·실험 10·현장 10 = 25화면 × 1920×1080, 1366×768, 1280×800, 1024×600, 915×412): 콘솔 오류·깨진 그림·가로 스크롤 0. 남은 10건은 오른쪽 패널의 '스크롤 목록 + 고정 버튼' 구조로, 끝까지 스크롤하면 모두 드러남(오탐). 스윕 스크립트 `.tmp/qa/sweep.cjs`(저장소 제외, 다른 프로젝트의 Playwright를 `PW_PATH`로 사용).

남은 것
- 세로(폰 세우기) 첫 방문 때 방울이 시작점(해변)이 지도 맨 아래라 하단 패드 뒤에 가려진다. 지도를 위로 밀면 보인다. 가로 화면은 문제없음.
- 지도 그림이 1672px라 1920 전자칠판에서 1.3배 확대 시 약간 부드러움. 더 큰 원본이 생기면 교체.
- Python QA(`scripts/*-qa.py`)는 이 맥에 Python Playwright가 없어 돌리지 못함. 지도 구조(`.map-viewport` > `.journey-world`)가 바뀌었으니 지도 클릭 좌표를 쓰는 스크립트는 확인 필요.
- 운영 배포 후 카카오 공유 디버거에서 캐시 초기화하고 `og:image`가 `og-image-v1.jpg`인지 확인.

# 물길탐험 인계 · 2026-10-25 밤

목표: 최종점검(23항목) 진단 → 1~5단계 고도화 → 3D 모형 적용.
운영 배포: 2026-10-25 커밋 46038cf → Cloudflare Pages `bc820acd`, 125개 파일 일치 확인. 직전 운영본 `3462b4f4`. GitHub main 푸시 완료(2026-10-25).

완료
- 그림: 현장 의뢰 작업대 배경 5장, 6장 가열판, 5장 그림판, 10장 물방울 코어(`public/assets/stages`, `learning`). 9·10장 배경은 샘플 페이지 연구실(`v2/lab-workshop`, `lab-core`).
- 화면: 16px 미만 글씨 0(4해상도), 힌트 버튼 겹침 0, 873×580 현장 캔버스 확대, 8장 안내 카드, 지도 위아래 띠.
- 코드: 빌드본 전용 서비스워커(오프라인 끝까지 진행), 진행률 로딩 화면, 안 쓰는 코드·그림 `_unused/`.
- 재도전: 2장 숨은 물 2곳, 3장 다른 양 예측 도전. 연구노트 '도전 기록'.
- 3D: Three.js 0.170.0 로컬(`vendor/three`), `src/three-view.js`·`three-layout.js`. 9장·10장 `3D로 보기`, 엔딩 `연구섬 3D로 둘러보기`. 모형 9개 `public/assets/models/`.
- 문서: 제작기·기능향상기, CREDITS 도구 검토표, `docs/3d/MESHY-3D-PROMPTS.md`, `docs/reviews/FINAL-CHECK-20261025.md`.
- 루트 정리: 중복 문서 `_unused/root-duplicates/`, PRD·TRD `docs/`, 사본 폴더 `_unused/files`·`_unused/samplepages`(git 제외).

3D 모형 다시 만들 때
- 메시 원본 `D:\iscreammedia_sc34\_scratch\waterchange-3d\raw\`, 스크립트 `optimize.py`(용접 → 복셀 재구성 → 줄이기 → 새 펼침 좌표에 바탕색 굽기). 바로 줄이면 얇은 유리벽이 찢어진다. 결과는 `renders/`의 원본·결과 렌더로 꼭 비교한다.

남은 것
- 실물 태블릿 터치, iPad Safari 오프라인 영상, 학교 AP 30대 동시 접속, 실제 학생 반응.
- 방울이 원본·이미지 생성 계정 권리 확인(회사).
- 2장 Phaser 무대 위아래 여백(720×330 비율 고정 때문).
