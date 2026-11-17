# 06 방울이의 물길 탐험 · 3D 달리기 스테이지 계획 · 2026-11-17

**현재 단계: 구현·운영 배포 완료(2026-11-17).** 아래 본문은 구현 전 계획이고, 실제로 정한 것과 결과는 문서 끝의 「계획 확정」과 「구현 결과」에 있다. 공통 규격은 [공통 계획](../../_shared/RUN-STAGE-3D-PLAN-20261117.md)에 있다.

## 한 줄 요약

홈의 「방울이 변신 모험」을, 방울이가 물길을 달리며 열판과 냉각판에서 얼음·물·수증기로 모습을 바꿔 관문을 지나는 3D 달리기로 바꾼다.

## 바꿀 자리

- 4학년 「물의 상태 변화」. 홈 화면 '방울이 변신 모험' 버튼으로 들어가는 독립 선택 모드다. 모험 5개, 관문 11개.
- 학습 완료 기록(10장, 현장 의뢰 3개)에 반영되지 않는 모드라서 필수 흐름에 영향이 없다.
- 파일: `src/drop-adventure-model.js`(판정), `src/drop-adventure.js`(화면). 진입은 `src/app.js`의 `drop-start` 버튼, 렌더는 `dropAdventureView` → `mountDropAdventure`, 클릭 처리는 `handleDropAdventure`다.
- 지도 악당 작업 때 06번은 완성된 기준판이라 손대지 않기로 했었다. 이번에는 사용자가 대상에 넣었으므로 진행하되, **변신 모험 모드만 바꾼다.** 지도(`src/journey.js`, `src/map-villains.js`)와 10장의 실험은 건드리지 않는다.

## 지금 방식과 바뀐 방식

| | 지금 | 바꾼 뒤 |
|---|---|---|
| 모습 바꾸기 | '열 주기'·'열 빼앗기'를 두 번 누른다 | 열판이나 냉각판 위에 서서 버튼을 두 번 누른다 |
| 얼 자리 남기기 | '여유 공간 남기기'를 누른다 | 냉각 관찰대 앞의 밸브를 눌러 물을 조금 덜어 낸다 |
| 관문 지나기 | 지금 관문을 누른다 | 그 관문까지 달려가 지나간다 |
| 화면 | 장치가 옆으로 늘어선 2D 줄 | 장치가 이어진 3D 물길 |

## 과학 개념과 조작

| 개념 | 달리기에서 하는 일 |
|---|---|
| 얼음이 열을 얻으면 물이 된다 | 열판에서 열을 주면 얼음 방울이가 물이 되어 좁은 수로를 지난다 |
| 물은 얼 때 부피가 늘어난다 | 꽉 찬 배관에서 그대로 얼리면 막힌다. 얼 자리를 남긴 뒤 냉각한다 |
| 물은 증발해 눈에 보이지 않는 수증기가 된다 | 열을 주면 공기 통로로 올라간다. 방울이는 점선 위치표시로만 보인다 |
| 수증기는 차가운 곳에서 물방울로 맺힌다 | 차가운 수집판에 닿으면 다시 물방울이 된다 |

### 지켜야 할 제한

- 코드 주석: "A learning model, not a simulation of real time or scale."
- 화면 문구: "얼굴·장치 사이 이동·버튼 횟수는 게임의 표현이며 실제 변화 시간이나 크기를 나타내지 않아. 실제 뜨거운 물은 어른과 함께 다뤄." 달리기 화면에도 그대로 둔다.
- 문서: "수증기는 보이지 않으므로 캐릭터는 위치표시임을 명시한다."
- 모습이 바뀌는지, 관문을 지날 수 있는지는 `adventureMove()`가 정한다. 3D에서 일어난 일을 `warm`, `cool`, `space`, `move` 동작으로 바꿔 넘기기만 한다.
- 얼음·물·수증기의 달리기 속도와 점프 높이는 같게 둔다. 모습에 따른 차이는 "어느 관문을 지날 수 있는가"뿐이다. 모형에 없는 차이(얼음은 미끄러진다 등)를 규칙으로 만들지 않는다.

## 코스 구성

기존 탐험 5개를 그대로 코스 5개로 옮긴다. 관문 순서와 필요한 모습은 `expeditions` 자료를 그대로 읽는다.

| 탐험 | 제목 | 시작 모습 |
|---|---|---|
| 1 | 좁은 물길을 건너라 | 얼음 |
| 2 | 꽉 찬 배관의 비밀 | 물 |
| 3 | 햇빛 온실로 올라가자 | 물 |
| 4 | 물방울 배달 작전 | 수증기 |
| 5 | 마지막 물길 연결 | 얼음 |

관문 사이 길에는 턱과 틈을 두어 점프를 쓰게 한다. 모습이 맞지 않은 채 관문에 닿으면 튕겨 나오고, 기존 힌트 문구(`gate.hint`)가 나온다.

## 연결과 저장

- 저장 키는 localStorage `water-drop-lab:v1`이다. `dropAdventure{chapter, gate, phase, space, heat, steps, done, log, message, mistakes}`와 `dropReturn`을 그대로 쓴다. 저장 형식은 바꾸지 않는다.
- 통과 기록 문구(`gate.proof`)는 기존처럼 `log`에 쌓는다.
- 대체 화면은 기존 `drop-adventure.js`의 2D 화면이다.

## 이미지 생성·적용 목록

기존 그림 `public/assets/learning/adventure-20261111/`(얼음·물 모습, 수로·냉각 장치·증발 수반·수집판)을 먼저 다시 쓴다. 참고 그림은 `public/assets/v2/bangul-walk.webp`와 `bangul-title.webp`다.

| 번호 | 그림 | 종류 | 적용 위치 |
|---|---|---|---|
| 1 | 물 방울이 달리기 | 캐릭터 동작 줄 | 물 모습 이동 |
| 2 | 물 방울이 점프 | 캐릭터 동작 줄 | 물 모습 점프 |
| 3 | 얼음 방울이 달리기 | 캐릭터 동작 줄 | 얼음 모습 이동 |
| 4 | 얼음 방울이 점프 | 캐릭터 동작 줄 | 얼음 모습 점프 |
| 5 | 모습이 바뀌는 순간(얼음↔물) | 캐릭터 동작 줄 | 변신 연출 |
| 6 | 방울이 기뻐하기 | 캐릭터 동작 줄 | 관문 통과 |
| 7 | 열판(따뜻한 색 판) | 소품 | 열 주는 자리 |
| 8 | 냉각판(차가운 색 판) | 소품 | 열 빼앗는 자리 |
| 9 | 밸브 | 소품 | 얼 자리 남기기 |
| 10 | 연구섬 물길 바닥 무늬 | 바닥 무늬 | 길 |
| 11 | 배관 겉면 무늬 | 바닥 무늬 | 탐험 2의 배관 |
| 12 | 연구섬 원경(바다와 하늘, 온실과 건물) | 원경 2장 | 배경 |
| 13 | 햇빛 온실 | 소품 | 탐험 3 도착 |
| 14 | 시작 카드 그림 | 시작 카드 | 모드 들어갈 때 |

수증기 모습은 그림을 만들지 않는다. 기존처럼 "방울이는 지금 수증기 상태야" 표시와 점선 원으로 보여 준다. 예상 15장.

## 기술, 검증, 배포

- Three.js는 로컬 파일 `public/assets/vendor/three/three.module.min.js`(r170)가 이미 있다. `src/three-view.js`처럼 `import(BASE+…)`로 필요할 때 불러오고, `canShow3D()`로 WebGL을 확인한다.
- 설치 없는 구조다. 새 파일은 번들 도구 없이 ES 모듈로 쓴다.
- `scripts/build.mjs` 22행 부근이 정해진 `public/assets` 폴더만 복사한다. `public/assets/run-stage/`를 만들면 이 복사 목록과 지연 캐시 정규식에 추가해야 한다.
- 검증 명령: `npm test`(`node --test tests/*.test.mjs`), `npm run check`, `npm run build`.
- 운영 주소는 https://water-state-lab.pages.dev/ 이고 `wrangler pages deploy dist --project-name water-state-lab --branch main`으로 직접 올린다.

## 작업 순서

1. 규칙 연결: 3D에서 일어난 일을 `adventureMove()` 동작으로 바꾸는 함수와 테스트(기존 모형 테스트는 그대로 통과해야 한다)
2. 기본 도형으로 탐험 1을 만들어 끝까지 해 보기, 이어서 탐험 2~5
3. 이미지 생성·적용
4. `build.mjs` 복사 목록 추가, 오프라인 캐시 확인
5. 대체 화면, 새로고침 후 이어 하기 확인
6. 검증 명령 → 커밋·푸시 → 운영 배포 → 운영 주소 확인

## 시작 전에 확인할 것

- 동료 캐릭터의 이름과 그림을 확인하지 못했다. `src/island-residents.js`와 `public/assets/v2/buddy-poses-clean.webp`를 보고 힌트를 줄 캐릭터를 정한다.
- 탐험 4는 수증기로 시작한다. 보이지 않는 상태에서 길을 따라가는 조작이 아이에게 어렵지 않은지 기본 도형 단계에서 먼저 해 본다.
- 운영 시트 G·H열의 주소와 저장소를 대조한다.

## 계획 확정 · 2026-11-17

「시작 전에 확인할 것」을 코드를 읽어 해결했고, 계획과 달라진 곳을 적는다.

| 항목 | 정한 것 | 이유 |
|---|---|---|
| 카메라 | 옆에서 따라가는 고정 시점. 코스는 화면 오른쪽으로 진행하고 ▲▼는 안쪽·앞쪽 줄 이동 | 기존 장치 그림 4종이 모두 옆모습이고, 방향판이 한 번에 한 방향만 받으며, 점프 거리를 옆에서 보는 쪽이 판단하기 쉽다 |
| 충돌 | `Octree`·`Capsule`을 들이지 않고 상자 겹침 계산을 직접 썼다(`src/run-stage-model.js`) | 길이 전부 축에 맞춘 상자다. 파일을 더 들이지 않아도 되고 Node 테스트로 완주까지 돌릴 수 있다. 한 프레임 5등분, 0.05초 상한은 예제대로다 |
| 힌트 동료 | 소식꾼 물총새 파랑(`/assets/v2/parang-think.webp`) | `buddy-poses-clean.webp`는 방울이 자신의 표정 모음이라 동료로 쓸 수 없다. 주민 가운데 소식꾼이 길 안내에 맞다 |
| 관문 | 길이 끊긴 자리에 선 장치. 닿으면 `adventureMove(…,'move')`를 부르고, 통과하면 장치를 타고 건너는 연출, 아니면 뒤로 살짝 튕기며 `gate.hint`가 나온다 | 관문을 걸어서 넘을 방법이 없어야 판정이 모형에만 남는다(장치 폭 5.6 > 점프 거리) |
| 얼 자리 남기기 | 밸브 옆에 물이 든 관을 두고 물 높이를 코드로 그린다(`space`에 따라 100% → 72%) | 물 높이는 그림이 아니라 코드로 그린다는 공통 규칙 |
| 수증기 구간 | 탐험 3 둘째, 탐험 4 첫째, 탐험 5 셋째 길에는 턱 하나만 둔다 | 점선 원·글자·발밑 그림자만 보고 조작하는 구간이다. 기본 도형 단계에서 자동 주행과 캡처로 따라갈 수 있음을 봤다(아이 대상 확인은 아님) |
| 방해꾼 | 밸브 두더지 그림(`/assets/v2/map-villain-mole.webp`)만 다시 쓴다. `map-villains.js`는 건드리지 않았다. 닿으면 움찔하고 뒤로 밀릴 뿐이다 | 공통 규격 |
| 교사 시연 | 기존 2D가 먼저 열리고 「3D 달리기로 하기」로 바꾼다 | 공통 규격의 대체 화면 조건 |
| 화면 선택 | 방문하는 동안만 기억하고 저장하지 않는다 | 저장 형식을 바꾸지 않는다 |
| WebGL 확인 | `three-view.js`의 `canShow3D()`를 부르지 않고 한 번만 확인해 기억한다 | `canShow3D()`는 부를 때마다 컨텍스트를 만든다. 화면을 그릴 때마다 묻기에는 무겁다 |

문서와 코드가 달랐던 곳: `mountDropAdventure`는 인자 없이 불렸다. 3D 무대가 저장과 다시 그리기를 직접 부를 수 있게 `state`와 `{go,render,save}`를 넘기도록 `src/app.js` 한 줄을 고쳤다.

### 코스 설계표

한 구간은 「체크포인트 → 턱·틈 → 변신 자리(열판·냉각판, 필요한 곳만 밸브) → 관문 장치」다. 관문 순서와 필요한 모습은 `expeditions`를 그대로 읽는다.

| 탐험 | 구간 1 | 구간 2 | 구간 3 | 길이 |
|---|---|---|---|---|
| 1 좁은 물길을 건너라 | 턱 → 좁은 수로 | 틈 → 얼음 운반대 | | 60.8 |
| 2 꽉 찬 배관의 비밀 | 턱, 틈 → 밸브 → 냉각 관찰대 | 앞쪽 좁은 다리 → 출구 수로 | | 71.8 |
| 3 햇빛 온실로 올라가자 | 틈, 계단, 두더지 → 공기 통로(위로 3) | 턱 → 차가운 지붕(아래로 3) | | 75.3 |
| 4 물방울 배달 작전 | 턱 → 차가운 수집판(아래로 3) | 징검돌, 두더지 → 냉각 보관함 | | 69.8 |
| 5 마지막 물길 연결 | 턱, 틈 → 첫 수로 | 안쪽 좁은 다리, 두더지 → 온실 공기길(위로 3) | 턱 → 수집 지붕(아래로 3) | 102.4 |

달리기 5.6, 줄 이동 4.2, 점프 세기 9.6, 중력 26(단위/초). 점프 높이 1.77, 턱 0.9, 틈 2.3~2.4. 얼음·물·수증기 모두 같은 값이다.

### 구현 작업 목록

1. 규칙 연결 `runMove`와 테스트 → 2. 코스 생성·달리기·충돌 모형과 완주 테스트 → 3. Three.js 무대·입력·겹침 화면 → 4. 기존 화면과 연결(선택 규칙, 대체 화면) → 5. 원경 그림 → 6. `build.mjs` 복사 목록·지연 캐시 → 7. 검증·배포.

## 구현 결과 · 2026-11-17

### 바뀐 파일

| 파일 | 내용 |
|---|---|
| `src/run-stage-model.js` (새 파일) | `runMove`, `runHint`, `adventureMode`, `buildCourse`, `stepRunner` 등. DOM 없이 돈다 |
| `src/run-stage.js`, `src/run-stage.css` (새 파일) | 무대, 세운 그림 캐릭터, 입력, 안내·버튼·이름표 |
| `tests/run-stage.test.mjs` (새 파일) | 테스트 12개 |
| `public/assets/run-stage/backdrop.webp` (새 파일) | 원경 1536×512, 76KB |
| `src/drop-adventure.js` | 화면 선택, 3D 무대 연결, 「3D 달리기로 하기」 버튼, 실패 시 기존 화면 |
| `src/app.js` | `mountDropAdventure(state,{go,render,save})` 1줄 |
| `index.html` | `run-stage.css` 링크 1줄 |
| `scripts/build.mjs` | 복사 목록과 지연 캐시 정규식에 `run-stage` |
| `README.md`, `.gitignore` | 달리기 절 추가, 생성 원본 폴더 제외 |

지도(`journey.js`, `map-villains.js`)와 10장 실험, 판정 모형(`drop-adventure-model.js`), 저장(`state.js`)은 고치지 않았다. `dropAdventure`의 키는 그대로 10개다.

### 이미지

| 그림 | 프롬프트 | 원본 | 실행 파일 |
|---|---|---|---|
| 원경 | Wide painterly background for a children's science game, soft storybook illustration: a calm turquoise sea under a bright pastel sky with gentle clouds, a distant green research island with a glass greenhouse, a wooden water wheel and small stone buildings on the horizon line, a few tiny islets far away. The lower third is only open calm sea so it can sit behind foreground platforms. Horizontal 3:2 image, low detail, hazy distance, no characters, no text, no letters, no logo. | `assets/source-media/run-stage-20261117/backdrop.png` (1536×1024, git 제외) | 수평선 둘레 1536×512를 잘라 `public/assets/run-stage/backdrop.webp` |

- 이 첫 배포(9603468) 때 만든 그림은 원경 한 장이었고, 캐릭터는 기존 그림 한 장씩에 코드로 움직임을 넣었다. 같은 날 뒤이은 고도화에서 그림 6장을 더 만들어 입혔다. 아래 「화면 고도화」에 적었다.

### 검증

| 검사 | 결과 |
|---|---|
| `npm run check` | 통과 |
| `npm test` | 318개 통과(새 테스트 12개 포함). 물리 그대로 탐험 5개를 끝까지 도는 자동 주행, 저장 왕복, 기존 변신 모험 테스트 포함 |
| `npm run build` | 통과. `dist/assets/run-stage/`와 지연 캐시 목록에 들어감(`tests/offline.test.mjs`가 참조 파일을 확인) |
| 헤드리스 Chrome, 개발 서버와 빌드본 각각 | 52개 항목 통과 |

헤드리스 검사(Playwright, 1280×800과 1024×768)가 본 것:

- 홈에서 3D로 열림, 화면 버튼 6개가 66px 이상이고 이름표가 있으며 겹치지 않음, 글자 16px 이상
- 실제 키 입력과 마우스 누름으로 방향키·WASD·방향판·점프 버튼·스페이스가 듣고, 손을 떼거나 창을 벗어나면 멈춤
- 탐험 1~5를 두 크기에서 키보드와 화면 버튼을 번갈아 끝까지 진행. 완료 기록이 `water-drop-lab:v1`의 `dropAdventure`에 남고 키가 그대로임
- 새로고침하면 그 관문의 체크포인트에서 이어짐
- 세 번 떨어지면 파랑의 귀띔, 틀린 모습으로 세 번 막히면 어느 판인지 귀띔. 기록은 줄지 않음
- 「기존 방식으로 하기」 ↔ 「3D 달리기로 하기」 양방향, 2D에서 같은 기록으로 이어 감
- 움직임 줄이기, WebGL 없음, Three.js 내려받기 실패에서 기존 화면으로 진행
- 교사 시연은 기존 화면이 먼저 열리고 3D를 고를 수 있음
- 팝업이 열리면 멈춤, 나가면 캔버스가 사라지고 여러 번 드나들어도 다시 열림, 콘솔 오류 없음

완주 검사는 화면의 무대 상태를 읽어 키·포인터 이벤트를 보내는 자동 주행이다. 사람이 손으로 끝까지 한 것이 아니고, 걸린 시간(탐험당 12~23초)은 아이의 시간이 아니다. 검사 스크립트와 캡처는 `tmp/run3d-qa/`(git 제외)에 있다.

### 확인하지 못한 것

- 실제 태블릿 터치(두 손가락 동시 누름 포함), 학교 태블릿의 프레임 수, iPad Safari
- 아이가 직접 했을 때의 난이도와 수증기 구간 조작감
- 성능 목표의 실측. 구성으로 보면 메시 약 60개(삼각형 수천), 픽셀 비율 1.5 상한, 그림자는 발밑 원 하나, 후처리 없음. 추가 내려받기는 `run-stage` 그림(첫 배포 76KB, 고도화 뒤 약 560KB)과 코드 약 50KB이고, Three.js 본체는 9·10장 3D 보기와 같은 파일을 쓴다

### 커밋과 배포

- 커밋 `9603468`(`96034688b5070177b8b5c130424bcf5a757a5db2`)을 `main`에 푸시했다. 이 절을 덧붙인 문서 커밋이 그 뒤에 하나 더 있으며 실행 파일은 바뀌지 않는다.
- 배포본은 `git archive`로 꺼낸 커밋본(`tmp/deploy-9603468`)을 빌드한 것이다. 작업 폴더 빌드와는 줄바꿈이 다른 글 파일 3개와 `build-info.json`, `sw.js`의 캐시 이름만 다르고 코드와 그림은 같다.
- Cloudflare Pages `water-state-lab` 운영 배포 `d14a562d`(main, 9603468), 450개 파일 중 9개 새로 올림. 직전 운영본은 `06da9ac7`(00f99cc)이다.
- 운영 주소 https://water-state-lab.pages.dev/ 에서 `src/` 전체, `index.html`, `sw.js`, `build-info.json`, `assets/run-stage/`, `assets/vendor/three/`, `assets/learning/adventure-20261111/` 103개 파일의 SHA-256이 커밋본 빌드와 같았다. 오프라인 캐시 이름은 `water-0efd64608a77`.
- 같은 헤드리스 검사를 운영 주소에 돌려 52개 항목이 통과했다(3D로 열림, 탐험 5개 완주와 기록 저장, 대체 화면 전환 포함).
- 이미 설치된 기기는 HTML과 코드를 온라인에서 먼저 확인하므로 연결된 상태로 다시 열면 새 화면이 뜬다. 원경 그림과 Three.js는 한가할 때 받는 목록에 있어, 다 받기 전에 인터넷이 끊기면 기존 화면으로 이어진다.

## 화면 고도화 · 2026-11-17 (사용자 요청: 생성 이미지로 화면을 아기자기하게, 겹침·잘림·어색한 물리 표현 점검)

### 새로 만든 그림 6장

모두 `gpt-imagegen`으로 참고 그림 없이 만들었다. 원본은 `assets/source-media/run-stage-20261117/`(git 제외), 실행 파일은 `public/assets/run-stage/`다. 공통 화풍 문장은 "Soft painterly storybook illustration for a cute children's science game set on a sunny research island, pastel colours, rounded friendly shapes, gentle shading, clean edges."이고 아래 표에서는 [화풍]으로 줄였다. 전체 프롬프트는 `tmp/run3d-qa/gen.sh`에도 있다(git 제외).

| 원본 | 프롬프트 | 실행 파일과 가공 |
|---|---|---|
| `path-tile.png` 1254² | [화풍] Seamless tileable top-down texture of warm cream sandstone paving slabs for a garden path, irregular rounded rectangular stones with thin grout lines, a few tiny moss tufts and one or two small pastel pebbles, even flat lighting with no cast shadows, no perspective, edges continue seamlessly on all four sides. Square image filled edge to edge. No text, no letters, no logo. | `path-tile.webp` 512². 채도 0.62로 낮춰 크림색으로 맞춤 |
| `pier-tile.png` 1254² | [화풍] Seamless tileable texture of a stone quay wall seen straight on, rows of soft grey-beige stone blocks with rounded corners and thin grout lines, small patches of green moss and tiny hanging vines, even flat lighting with no cast shadows, no perspective, edges continue seamlessly on all four sides. Square image filled edge to edge. No text, no letters, no logo. | `pier-tile.webp` 512² |
| `plates.png` 2172×724 | [화풍] Two separate square floor plates side by side seen exactly from straight above (top-down, flat, no perspective), with wide empty space between them: on the left a warm copper and orange heating plate with a glowing spiral coil and a rounded brass rim; on the right a pale blue frosty cooling plate with a white snowflake pattern and a rounded silver rim. Both plates the same size, perfectly square with rounded corners. Fully transparent background. No shadows, no text, no letters, no logo. | 좌우로 나눠 `heat-plate.webp`, `cool-plate.webp` 256² |
| `decor-sheet.png` 1254² | [화풍] A sheet of 9 separate small game props arranged in a tidy 3 by 3 grid, each prop centred in its own cell with wide empty space around it, nothing touching or crossing into another cell, every prop seen from the side at eye level and complete from top to bottom: (1) a round green bush with pink flowers, (2) a cluster of tall reeds and cattails, (3) a small glass lantern on a short wooden post, (4) a little stone fountain with a splash of water, (5) a wooden barrel planter with a green seedling, (6) a tiny grassy rock islet with one small tree, (7) a small wooden sailboat with a white sail, (8) a red and white striped buoy with a seagull sitting on it, (9) a patch of lily pads with one pink water lily. Fully transparent background. No ground, no cast shadows, no text, no letters, no numbers, no logo, no grid lines. | 9칸으로 나눠 `decor-bush·reeds·lantern·fountain·planter·islet·boat·buoy·lilies.webp`(긴 변 320) |
| `water-run.png` 2172×724 | Sprite sheet for a 2D children's game, glossy painterly illustration style. A cute translucent cyan water droplet slime character: soft mound-shaped body with a small curled tip on top leaning right, a shallow puddle base, two big round dark-blue eyes with white highlights, small open smiling mouth, pale blue cheek blush, a few tiny bubbles inside, white glossy highlights. One horizontal row of exactly 6 evenly spaced frames of a bouncy hop-run cycle moving to the right: squash low, stretch up, lift off, airborne, land squash, recover. The same character and same body volume in every frame, face visible and looking right-forward, bottoms resting on one shared baseline, wide equal gaps between frames, nothing overlapping or cut off. Wide 3:1 image. Fully transparent background. No ground, no shadow, no water trail, no text, no letters, no numbers, no logo, no frame borders. | `water-run.webp` 1536×256. 6칸을 찾아 같은 배율로 줄이고 발을 한 줄에 맞춤 |
| `ice-run.png` 2172×724 | Sprite sheet for a 2D children's game, glossy painterly illustration style. A cute translucent pale-cyan ice cube character: a solid cube with slightly bevelled edges seen at a three-quarter angle, faceted icy texture, two big round dark-blue eyes with white highlights and a small open smiling mouth on the front face, a few tiny bubbles inside, white glossy highlights. One horizontal row of exactly 6 evenly spaced frames of a hopping slide cycle moving to the right: crouch tilt, push off, small hop up, airborne tilted forward, land, settle. The same rigid cube with the same size and shape in every frame (it never melts or bends), face visible, bottoms resting on one shared baseline, wide equal gaps between frames, nothing overlapping or cut off. Wide 3:1 image. Fully transparent background. No ground, no shadow, no text, no letters, no numbers, no logo, no frame borders. | `ice-run.webp` 1536×256. 위와 같음 |

- 검수: 여섯 장을 직접 열어 글자·로고가 없고 소품이 칸을 넘지 않으며 프레임이 여섯 개인 것을 봤다. 투명 배경에 남은 색 부스러기는 가공에서 지웠다(흐린 픽셀, 작은 조각, 가장자리 한 줄). 바다색 바탕에 올려 테두리를 확인했다.
- 과학 표현: 얼음은 여섯 프레임 모두 같은 크기의 단단한 육면체다. 수증기는 여전히 그림 없이 점선 원과 글자다. 열판·냉각판의 무늬는 장식이고 판정은 모형이 한다.
- 가공 스크립트는 `tmp/run3d-qa/process.mjs`(git 제외, 5번 프로젝트의 sharp 사용). `run-stage` 폴더는 16개 파일 약 560KB다.

### 화면에 입힌 것

- 길 윗면과 벽면에 돌 무늬(3단위마다 반복), 열판·냉각판 그림, 물·얼음 달리기 여섯 프레임(땅에서는 달리기, 공중에서는 한 프레임, 서 있을 때 마지막 프레임).
- 체크포인트마다 등불, 길 안쪽 가장자리에 꽃덤불과 새싹 화분, 도착 자리에 돌 분수, 받침 옆 물가에 부들, 바다에 수련·부표·돛단배·작은 섬. 소품은 걷는 줄 뒤(z −2.7)나 바다에만 두어 길을 막지 않고, 열판·밸브·턱·두더지·관문 근처와 장치 뒤 물 위는 비웠다.

### 겹침·잘림·어색한 표현을 고친 것

| 문제 | 고친 내용 |
|---|---|
| 냉각 장치와 응결판이 받침에서 떠 있고 증발 수반은 받침에 묻힘 | 그림에서 발 위치를 재서(수로 86.5%, 냉각 77.3%, 수반 94.4%, 응결판 91.3%) 받침 윗면에 정확히 올림 |
| 관문이 반투명 벽이라 무엇인지 알기 어려움 | 길 끝의 놋쇠 난간으로 바꿈. 통과하면 사라짐 |
| 장치를 지날 때 모두 같은 포물선으로 넘어감 | 수로는 물이 낮게 누워 흐르고 앞벽이 캐릭터를 가림, 얼음은 수조 턱을 넘어 안에 앉았다 나옴, 수증기는 올라가고, 물방울은 찬 판을 타고 컵 높이까지 내려온 뒤 건너감 |
| 턱에 붙으면 캐릭터 옆이 턱에 잘림 | 몸 폭을 그림 폭에 맞춤(반폭 0.42 → 0.68) |
| 바다에 빠지면 물속으로 한참 가라앉음 | 수면 바로 아래에서 되돌리고(떨어짐 깊이 7 → 3.4) 수면에 물결 고리를 남김 |
| 판 위에 서면 판 이름표가 캐릭터와 겹침 | 그 판 위에 서 있는 동안 이름표를 숨김 |
| 관문 이름표가 위쪽 표시줄·버튼 밑에 깔리거나 수증기 표시와 겹침 | 가야 할 관문 이름표는 표시줄 아래·화면 안에 머물고, 지난 관문 이름표는 위쪽 띠에 닿으면 숨김. 수증기 표시와 겹치면 관문 이름표를 숨김 |
| 큰 화면(1920×1080)에서 「다시 도전」이 홈 버튼과 겹침, 세로 화면에서 위쪽 표시가 서로 겹침 | 표시줄 크기 변수를 따라 배치하고 좁은 화면은 한 줄씩 쌓음(첫 배포 전에 고친 것) |
| 좁은 화면에서 바다 평면 끝이 보임 | 바다 평면을 넓힘 |

### 검증

- `npm run check` 통과, `npm test` 318개 통과(몸 폭과 궤적이 바뀐 뒤에도 탐험 5개 자동 완주 포함).
- 헤드리스 Chrome 52개 항목을 개발 서버에서 다시 돌려 모두 통과.
- 관문 네 종류의 통과 장면을 다섯 시점씩 찍어(`tmp/run3d-qa/gates/`) 장치와 받침, 캐릭터의 위치를 눈으로 확인했다. 1280×800 기준이며 사람이 손으로 플레이한 것은 아니다.

### 커밋과 배포(고도화)

- 커밋 `8272213`을 `main`에 푸시했다. 이 절을 덧붙인 문서 커밋이 그 뒤에 하나 더 있다.
- Cloudflare Pages `water-state-lab` 운영 배포 `8ecbddbd`(main, 8272213), 465개 파일 중 20개 새로 올림. 직전 운영본은 `d14a562d`(9603468).
- 운영 주소에서 `src/` 전체, `index.html`, `sw.js`, `build-info.json`, `assets/run-stage/`, `assets/vendor/three/`, `assets/learning/adventure-20261111/` 118개 파일의 SHA-256이 커밋본 빌드와 같았다. 오프라인 캐시 이름 `water-63059196fb6f`.
- 같은 헤드리스 검사 52개 항목이 운영 주소에서 통과했다.
- 내장 임시 원본: 7장 모두 정리했다. `gpt-image.sh -l`에 이 프로젝트 경로가 남지 않은 것을 확인했다.

## 물 그림 맞추기 · 2026-11-17 오후 (이어받기 세션)

### 바꾼 것

- 물 달리기 그림(`public/assets/run-stage/water-run.webp`)을 다시 만들었다. 기존 그림은 글로만 묘사해 꼭지가 말려 있고 얼굴이 오른쪽으로 치우쳐 2D 물 그림(`assets/learning/adventure-20261111/water.webp`)과 생김새가 달랐다.
- 2D 그림을 384×384 PNG로 줄여(`.tmp/refimg/water-ref-384.png`, git 제외) `-i`로 붙이니 첫 시도에 생성됐다. 지난번 `Bad Request`는 원인을 확정하지 못했지만, 작은 PNG로 바꾼 뒤에는 나지 않았다.
- 새 그림은 끝이 둥근 꼭지, 넓게 퍼진 웅덩이 바닥, 몸 가운데 얼굴과 벌린 입이 2D 그림과 같다. 6프레임, 투명 배경, 글자 없음을 직접 열어 확인했다. 지금 그림보다 2D와 더 닮아서 바꿨다.
- 원본 `assets/source-media/run-stage-20261117/water-run-ref1.png`(2172×724, git 제외). 가공은 `tmp/run3d-qa/process-water.mjs`(기존 `process.mjs`의 달리기 띠 가공을 물 그림 한 장에만 적용, 1536×256, 75KB). 이전 실행 파일은 `.tmp/refimg/water-run-old.webp`에 남겨 두었다.
- 프롬프트: Sprite sheet for a 2D children's game. Draw exactly the same character as the attached reference image, matching its glossy painterly style, colours and shape: a translucent cyan water slime with a tall leaning cone-shaped body whose peak tilts to the upper right and ends in a small round bulb tip, a wide flat puddle base that spreads out at the bottom, two big round dark-blue eyes with white highlights set in the middle of the body, a wide open smiling mouth, soft blue cheek blush, a few tiny bubbles inside, white glossy highlights. One horizontal row of exactly 6 evenly spaced frames of a bouncy hop-run cycle moving to the right: squash low, stretch up, lift off, airborne, land squash, recover. The same character and same body volume in every frame, face visible and looking right-forward, bottoms resting on one shared baseline, wide equal gaps between frames, nothing overlapping or cut off. Wide 3:1 image. Fully transparent background. No ground, no shadow, no water trail, no text, no letters, no numbers, no logo, no frame borders.
- 코드, 몸 크기(`RUN.halfW`), 판정, 저장은 바꾸지 않았다. 얼음·물·수증기의 속도와 점프도 그대로다.

### 다시 훑어본 것

- 헤드리스 검사 52개 항목(탐험 1~5 두 크기 완주 포함)을 개발 서버에서 다시 돌려 모두 통과했다. 탐험별 달리는 장면, 시작 카드, 관문 통과 장면(`gates.mjs`, 7개 관문 × 다섯 시점)을 눈으로 봤다.
- 새 그림은 턱 앞에서 잘리지 않고, 물길에서 납작하게 누워 흐르고, 찬 판을 타고 내려오는 장면에서도 자연스럽다.
- 남겨 둔 것: 두더지에 닿는 순간 두더지 그림이 방울이 앞에 겹쳐 보이는 것과, 물길 장치에 들어가는 순간 물이 길 뒤쪽 가장자리에 납작하게 눕는 것은 부딪힘·흘러 들어감 연출이라 고치지 않았다.
- 좁은 다리(탐험 2·5)와 수증기 구간 난이도는 아이가 직접 해 봐야 안다. 추측으로 `bridge`를 `gap`으로 바꾸지 않았다.
- 실제 태블릿·iPad Safari 확인은 이 맥에서 하지 못했다.

### 검증과 배포

- `npm run check` 통과, `npm test` 318개 통과, 개발 서버(4336) `qa.mjs` 52/52.
- 커밋 `70893f4`를 `main`에 푸시했다. `git archive`로 꺼낸 커밋본(`tmp/deploy-70893f4`)을 빌드해 Cloudflare Pages `water-state-lab` 운영 배포 `d214ad1a`(main, 70893f4)로 올렸다(465개 중 3개 새로 올림). 직전 운영본은 `8ecbddbd`(8272213).
- 운영 주소 https://water-state-lab.pages.dev/ 에서 `src/` 전체, `index.html`(`/`로 대조), `sw.js`, `build-info.json`, `assets/run-stage/`, `assets/vendor/three/`, `assets/learning/adventure-20261111/` 118개 파일의 SHA-256이 커밋본 빌드와 같았다. 오프라인 캐시 이름 `water-1eb814058dd4`.
- 운영 주소에 `qa.mjs` 52/52 통과, 운영 화면 캡처에서 새 물 그림이 보이는 것을 확인했다.
- 내장 임시 원본은 `-c`로 지웠고 `gpt-image.sh -l`에 이 프로젝트 경로가 남지 않았다.
