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
