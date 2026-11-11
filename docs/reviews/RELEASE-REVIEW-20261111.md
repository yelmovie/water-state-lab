# 2026년 11월 11일 납품 전 최종 검토

## 배포 보류 · 60/100 · 6.0/10

검토한 코드는 `main`, `c18c475b1b6897c160c038a9610fd5cc9cf41909`다. 내일 11월 12일 납품을 기준으로 검토했다. **온실 실험 중 설정을 닫거나 새로고침하면 실험 그림과 시계가 화면 밖으로 밀려 진행하기 어려워지는 오류**를 실제 버튼 조작으로 재현했다. 핵심 복원 항목 B14 FAIL이므로 점수와 별개로 배포 보류다.

현재 공개 주소의 앱·연구노트 코드는 이 커밋의 빌드와 다르다. 최신 수정 내용의 배포와 공개본 재검증도 필요하다. 배포 대상은 README에 명시된 Cloudflare Pages의 도메인 루트로 잡았다. [공개 서비스](https://water-state-lab.pages.dev/)

이번 작업은 `edu-final-check`의 읽기 전용 검토다. 점수는 수정 전 현재 코드와 검증 범위에 적용했다. 검토 보고서와 검사 증거를 외장 T7에 저장했다. 학생 기록은 별도의 격리 브라우저에서 검사했다.

## 적용한 사용자 기준

| 자료 | 적용 내용 |
|---|---|
| `/Volumes/T7 Shield/DESIGN.md` | 전자칠판 가독성, 44px 터치 최소선, 한글 줄바꿈, 색상 외 상태 표시 |
| `/Volumes/T7 Shield/PRODUCT.md` | 전자칠판·태블릿 우선, 40분 수업, 개인정보·저장 원칙 |
| `/Volumes/T7 Shield/skill/skill-backup/skills-backup-20260803-171622/CLAUDE_FINAL_REVIEW_MASTER (1).md` | 실제 학생 경로, 저장·이어하기, 안내와 조작 일치, 생성 이미지 고지 |
| `/Volumes/T7 Shield/skill/skill-backup/skills-backup-20260803-171622/CLAUDE_RESPONSIVE_STAGE_MASTER.md` | 가로·짧은 화면·세로 화면 구분, 실측 배율과 최소 크기 |
| `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/docs/design/TABLET-EXPERIENCE-DESIGN-2026-10-16.md` | 같은 조건 비교, 예상 보존, 실험과 조작의 연결, 주요 터치 48px |
| `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/docs/design/EXPEDITION-DESIGN-2026-10-21.md` | 10장 흐름과 성취기준, 과학 모형의 한계, 실물 제작 연결 |
| `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/docs/TRANSFORMATION-ADVENTURE-20261111.md` | 최근 변경과 자유 변신 모험, 엔딩·노트·인증서 변경 확인 |
| `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/docs/reviews/RELEASE-REVIEW-20261110.md`, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/docs/reviews/SCORE-20261110.md` | 바뀌지 않은 교육과정 원문 대조·출처·기존 저장 검사 근거 재사용 |

이전 설계의 부분 닦기·필수 재관찰·능력 문장 선택·여권 표현은 이후 사용자가 삭제·간소화를 요청했다. 해당 최신 요청을 현재 검토 기준에 우선 적용했다. 예전 반응형 문서의 전체 축소 전략도 현재 앱에 일괄 적용하도록 요구하지 않았다. 실제 터치 크기와 가독성으로 판정했다.

## 실제 실행 범위

- `npm test` 300개 통과, `npm run check` 통과, `npm run build` 통과. lint·typecheck 스크립트는 해당 없음이다. 기존 환경을 사용했다.
- production build를 `http://127.0.0.1:4327`에서 검사했다. 서비스워커 버전은 `water-d17f558ebb8a`다.
- 1280×800, 1920×1080, 1024×768, 1024×600, 915×412, 830×515, 390×844의 7개 크기를 검사했다.
- 기본 실험 10개와 현장 3개를 7개 크기로 검사한 91샘플, 얼기·녹기와 온실 내부 19상태를 7개 크기로 검사한 133샘플, 터치 2샘플, 전체 진행 21샘플, 홈·지도·엔딩·자유 모험·실험·노트·인증서·설정 119샘플을 수집했다. 합계 366개 화면·상태 샘플이며 서로 다른 페이지 366개라는 의미는 아니다.
- 대표 캡처를 직접 열어 배치·그림·안내·글자 겹침을 확인했다. 온실은 추가로 실제 단계 진행 → 설정 닫기 → 새로고침을 검사했다.
- 기본 자동 스윕은 문제 0건을 출력했지만 온실 빈 화면을 놓쳤다. 검사 코드가 40px 하한을 사용하고, 화면 밖으로 밀려난 요소 일부를 검사 대상에서 제외하기 때문이다. **자동 검사 0건을 전체 UI PASS의 근거로 사용하지 않았다.**
- 새로고침을 끼우지 않은 전체 10장 진행, 현장 2·4·10, 고장 수리 → 3D → 온실 → 악당 퇴치 → 엔딩 경로는 통과했다. 별도로 발견한 중간 복원 실패를 이 결과와 함께 기록한다.
- 기존 최신 증거인 `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/../latest-ui.log`, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/../final-contact-clock.log`, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/../finale-independent.log`로 컵 1회 관찰, 물통 DOM 유지, 교사용 자동 관찰, 자유 모험 독립, 악당 엔딩 조건, 지도 접근 후 Enter 입장, 타격 효과, 시계 속도와 투명 배경을 보완 확인했다. 이 부분은 같은 코드의 앞선 실행 증거를 재사용했다.

## 페이지별 검토

| 페이지·장면 | 결과 | 관찰 |
|---|---|---|
| 시작 | PASS | 주요 시작 동작과 설정 접근, 로딩 안내, 7개 크기 배치 확인 |
| 연구섬 지도 | PASS, 실기 조건 | 클릭으로 접근 후 Enter 입장하는 기존 검사 통과. 터치 입장 버튼 제공. 실제 태블릿 제스처 검수는 남음 |
| 1 물·얼음 모양 | PASS | 붓기·이동·젖은 자국 관찰과 저장 진행. 좁은 화면에서도 주요 조작 접근 가능 |
| 2 세 상태 분류 | PASS, 접근성 검증 일부 남음 | 포인터 분류 완료. 키보드 기본 Tab 순회는 상단 도구 중심이며 보조 조작을 여는 추가 동작이 필요. 전 과정 키보드 검수는 미완료 |
| 현장 2 네 가지 변화 | PASS | 네 과정을 실제 조작으로 완료. 작은 가로 화면에서도 도구와 다음 행동 확인 |
| 3 얼기·녹기 측정 | PASS | 예상·세 시점 측정·비교, 1024×600 터치 완료 |
| 4 얼음 배관 | WARNING | 기능 완료. 1920 화면에서도 더/덜 담기 14px, 주요 관찰 질문 16px |
| 현장 4 추운 밤 | PASS | 세 밤 완료. 수도꼭지 채우기 중 DOM 유지 관련 최신 검사 통과 |
| 5 물그림 | PASS | 한 번의 관찰 후 답·행방 선택. 그림 저장 복원 통과 |
| 6 증발·끓음 | PASS | 같은 양에서 B 가열 후 비교. 예전 무가열 대기를 필수로 반복하지 않는 경로 확인 |
| 7 컵 비교 | PASS | 한 번에 컵 닦기, 밀봉, 한 번 관찰. 선택 재닦기는 부가 기능 |
| 8 관찰결과 | PASS | 컵 관찰결과 확인 후 완료 가능. 음료병 적용은 선택 경로 |
| 9 물 수집 장치 | PASS | 냉각·경사·깔때기 수정 후 시험. 버튼 대체 조작 가능 |
| 10 고장 진단·코어 | PASS | 고장 가설·수리·시험·코어·3D 진행 통과 |
| 현장 10 온실 | **FAIL** | 시계가 중앙 과학 설명을 덮음. 응결 대기 중 설정 닫기·새로고침 후 실험 영역 높이가 0이 됨 |
| 자유 변신 모험 | WARNING | 단계 독립, 변신과 이동 확인. 보조 펼침 메뉴 높이 40px, 전자칠판 설명 일부 16px |
| 엔딩 | PASS, 글자 크기 WARNING | 1024×600 가로에서 좌우 상하 높이 균형 확인. 제거 요청한 능력 카드 없음. 보조 버튼 15~17px |
| 연구노트 | PASS, 글자 크기 WARNING | 도장 3+2 정렬, 한글 연구 기록, 과학 개념 강조. 긴 내용은 내부 스크롤. 도장 설명 일부 16px |
| 인증서 | PASS, 실기 조건 | 굵은 제목과 가로 상장 배치. A4 가로 PDF 1장. 짧은 화면은 내부 스크롤로 하단 확인. iOS 실제 인쇄 미검증 |
| 설정·가이드 | PASS, 실기 조건 | 교사용 자동 관찰 선택, 닫기·Esc, 초기화 확인·취소 동작 확인. 실제 스크린리더 미검증 |
| 되살린 연구섬 3D | PASS, 실기 조건 | 현재 코드의 휠 줌·최대 5배·초기화 검증 증거 재사용. 이번 데스크톱 프레임 실측. 실제 태블릿 핀치는 미검증 |

노트·인증서의 일부 캡처에는 부분 완료 상태를 넣었다. 도장 수 자체는 완료 저장 데이터에 따라 달라진다. 완료하지 않은 의뢰 도장을 임의로 부여한 결과로 판단하지 않았다. 세로 자유 모험의 좌우 넘겨보기와 노트·인증서의 내부 스크롤은 의도된 접근 경로라서 가로 페이지 넘침 결함에서 제외했다.

## 발견 사항

### R1 · P0 · 온실 중간 복원 후 실험이 화면 밖으로 사라짐

- **화면** 10장 현장 의뢰, 판 뒷면 냉각 시작 이후의 응결 대기.
- **재현** 교사 설정에서 자동 관찰을 끈다. 물 준비 → 시간 보내기 → 줄어든 물 관찰 → 받이 놓기 → 판 뒷면 냉각을 진행한다. 설정을 열었다 닫거나 새로고침한다.
- **예상** 같은 판과 물, 시계가 보이고 이어서 시간 관찰을 시작한다.
- **실제** 1280×800에서 `.cycle-scene` 높이가 600.8px에서 0px로 줄고 y가 1003.7px로 내려간다. 시계는 y823px부터 시작해 화면 바깥에 놓인다. 설정 닫기와 새로고침 모두 재현됐다.
- **영향·증거** 학생이 수업 도중 소리를 조절하거나 새로고침한 뒤 진행할 조작을 찾을 수 없다. `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/resume-greenhouse.json`, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/greenhouse-after-settings.png`, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/greenhouse-after-reload.png`.
- **파일·줄** `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/app.js` 153~184, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/stage-guide.js` 147~168, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/guided-experience.css` 214·271.
- **원인 판단** 하단 `.stage-question-pop`의 bottom 값을 상단 헤더 높이 계산에 포함한다. 그 값으로 상단 padding을 다시 키워 레이아웃 측정이 자기 자신에게 영향을 준다.
- **최소 수정안** 헤더 높이는 상단 헤더와 상단에 실제로 배치한 안내로만 계산한다. 하단 질문을 상단 여백 계산에서 제외한다.
- **수정 위험** 중간. 질문·관찰 도구 통합 공통 함수가 여러 실험에 쓰인다.
- **재검증** 7개 크기, 자동 관찰 on/off, 온실 모든 대기 상태의 설정 닫기·새로고침. 실험 높이 양수, 시계 중심 hit test와 실제 클릭, 완료까지 검사한다.
- **증거등급** 확인됨. 원인 설명은 코드와 DOM 실측을 함께 대조했다.
- **판정** B14·C6 FAIL. B14는 예외를 적용할 수 없는 배포 차단 항목이다.

### R2 · P1 · 투명 시계와 과학 설명의 겹침

- **화면** 온실 응결 대기, 1024×600.
- **재현** R1의 냉각 단계까지 진행하고 설정을 열기 전 화면을 본다.
- **예상** 증발·공기 중 수증기·응결 설명과 시계가 각자 읽힌다.
- **실제** ‘여기 톡!’이 ‘증발’과 겹치고 시계 그림이 공기 중 수증기 설명을 가린다.
- **영향·증거** 핵심 상태 변화 연결을 읽기 어렵다. `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/greenhouse-wait-stable.png`.
- **파일·줄** `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/guided-experience.css` 590~602·627~641, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/time-dial.js` 27~28.
- **최소 수정안** 가운데 설명과 시계의 세로 위치 또는 전용 영역을 분리한다. 현재 요청한 투명 배경은 유지하는 방향으로 위치를 조정한다.
- **수정 위험** 낮음~중간. 짧은 화면에서 좌우 도구 영역 침범을 함께 점검해야 한다.
- **재검증** 1280×800, 1024×768, 1024×600, 915×412에서 정지·진행 중·완료 시점의 캡처와 글자 영역 교차를 확인한다.
- **증거등급** 확인됨.
- **판정** C4 FAIL. 기본 자동 검사에는 일반 설명 글자와 그림의 교차 검사가 없다.
- **우선순위 근거** 진행은 가능하지만 과학 설명을 덮는다.

### R3 · P1 · 전자칠판 글자 하한 미달

- **화면** 배관 실험, 자유 모험, 연구노트, 엔딩.
- **재현** 1920×1080에서 웹폰트 로딩 후 렌더 크기를 측정한다.
- **예상** 학생이 읽는 본문·선택지는 최소 18px다.
- **실제** 배관 더/덜 담기 14px, 관찰 질문 16px, 노트 도장 설명 16px, 자유 모험 장치 설명 16px, 엔딩 보조 버튼 15~17px.
- **영향·증거** 교실 뒷자리에서 보조 설명과 일부 조작 문구를 읽기 어렵다. `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/metrics.json`의 1920 샘플.
- **파일·줄** `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/freeze-bench.css` 22~26, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/drop-adventure.css` 5~69, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/experience.css`의 stamp-page·ending 관련 규칙, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/guided-experience.css`의 activity-status 규칙.
- **최소 수정안** 전자칠판 구간의 실제 최솟값을 18px로 정리하고 주 질문·선택지는 더 크게 유지한다. 장면 전체 확대에 의존하지 않는다.
- **수정 위험** 중간. 제목·도장 카드 줄바꿈과 하단 높이를 다시 확인해야 한다.
- **재검증** 1920에서 DOM·Canvas 실효 크기와 1024 최소 14px를 각각 측정한다.
- **증거등급** 확인됨. 인쇄물 미리보기 축소는 별도로 보고, 이 FAIL은 실제 학습 본문·선택지를 근거로 했다.
- **판정** C20 FAIL.
- **우선순위 근거** 사용자 공통 디자인의 전자칠판 가독성 기준 위반이다.

### R4 · P2 · 자유 모험 보조 메뉴 터치 높이 40px

- **화면** 자유 변신 모험의 ‘게임과 실제 과학’ 펼침 메뉴.
- **재현** 7개 뷰포트에서 summary의 실제 bounding rect를 측정한다.
- **예상** 최소 44px, 권장 48px.
- **실제** 모두 높이 40px다. 일반 보조 버튼에는 44~47px인 대상도 있다.
- **영향·증거** 작은 보조 목표를 정확히 누르기 어렵다. `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/metrics.json`.
- **파일·줄** `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/drop-adventure.css` 66.
- **최소 수정안** summary의 min-height를 48px로 정리하고 인접 간격을 확보한다.
- **수정 위험** 낮음.
- **재검증** 태블릿 실제 터치와 390px 세로 화면에서 펼침·접힘·하단 접근 확인.
- **증거등급** 확인됨.
- **판정** C3 FAIL. 여러 화면의 동일 원인은 한 번 감점했다.
- **우선순위 근거** 핵심 이동 버튼은 동작하며 보조 메뉴의 크기 문제다.

### R5 · P1 · 공개본과 최신 수정본 불일치

- **화면** 공개 서비스 전체, 특히 엔딩·노트·인증서.
- **재현** 공개 주소의 `/src/app.js`, `/src/achievement.js` 응답을 현재 dist와 SHA-256으로 비교한다.
- **예상** 납품 URL이 검증한 최신 빌드와 일치한다.
- **실제** 두 파일 모두 다르다. index.html과 일반 버전 모듈은 같아서 화면 제목·3.0.0 표시만으로는 최신 여부를 구분할 수 없다.
- **영향·증거** 납품받는 쪽이 이전 화면을 확인할 수 있다. `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/deployed.json`.
- **파일·줄** `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/README.md` 5~20, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/dist/sw.js`의 캐시 해시, 앱·achievement 응답.
- **최소 수정안** 차단 오류 수정 후 새 빌드를 배포하고 주요 파일 해시와 실제 첫 실험·이어하기·엔딩 UI를 확인한다.
- **수정 위험** 중간. 서비스워커 업데이트와 기존 저장 데이터 복원을 함께 검사해야 한다.
- **재검증** 실제 URL에서 새 사용자·기존 사용자, 저장·새로고침·오프라인 및 주요 수정 UI.
- **증거등급** 확인됨.
- **판정** G10 FAIL, G11 NOT TESTED. 현재 로컬 빌드는 통과했지만 최신 코드의 공개 smoke test는 아직 성립하지 않는다.
- **롤백 참고** 직전 보고서에 기록된 `fd7a200a42d9c95f80394c25900280c560b2f772`, `https://cb4fd406.water-state-lab.pages.dev`. 이번 공개본이 정확히 그 커밋이라는 추가 단정은 하지 않는다.

### R6 · P2 · 반복 진입 후 DOM·리스너 수 증가

- **화면** 1장 ↔ 연구섬 지도 반복 진입.
- **재현** 자동 관찰 off, 애니메이션 on으로 15회 왕복하고 5회마다 강제 GC 후 CDP 지표를 읽는다.
- **예상** 초기 리소스 준비 이후 노드·리스너 수가 안정된다.
- **실제** 5·10·15회에 노드 1,878 → 3,558 → 5,236, 리스너 163 → 208 → 253. heap은 6.33 → 6.91 → 7.19MB.
- **영향·증거** 오래 재진입하는 수업에서 자원 누적 가능성이 있다. 실제 기기 성능 저하까지 확인한 것은 아니다. `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/performance.json`.
- **파일·줄** `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/app.js` 193~215, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/phaser-scenes.js` 25, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/journey.js` 62·272는 생명주기 조사 시작점이다.
- **최소 수정안** detached node와 이벤트 등록자를 추적해 실제 소유자가 해제되는지 확인한다.
- **수정 위험** 중간. 원인 모듈을 확정한 뒤 수정해야 한다.
- **재검증** 30~50회 왕복, 충분한 idle 후 GC, DOM counters·heap snapshot·실기 프레임 측정.
- **증거등급** 수치 증가 확인됨, 장기 누수 원인은 추정.
- **판정** D8 WARNING.
- **우선순위 근거** 이번 5초 데스크톱 프레임 샘플에서는 지연이 나타나지 않았다.

### 유지보수·용량 경고

| ID | 증거·영향 | 관련 위치 | 최소 조치와 재검증 |
|---|---|---|---|
| E1·E2 | 기존 CSS 위에 덧붙인 크기·배치 규칙, 큰 파일로 수정 영향 파악이 어려움 | `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/experience.css` 1,482줄, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/guided-experience.css` 834줄 | 기능별 회귀 캡처를 유지하며 중복 규칙 정리. 납품 직전 전면 재작성은 필요 없음 |
| E3 | 사용처가 없는 named import 후보 27개. 예를 들어 app의 stageGuide·travelRoute·currentTrialValid는 import 외 참조가 없음 | `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/app.js` 7·20·29 등 | 실제 참조와 부작용을 확인하고 named binding만 정리. 구문·테스트·빌드 재검사 |
| D3 | intro.mp4 6.73MB, final.mp4 7.42MB로 5MB 경고선 초과 | `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/public/assets/story/` | 영상 가독성을 유지하는 인코딩과 다운로드 시간을 비교. 첫 화면 준비 수치와 구분 |
| D6 | 제거된 2D 관찰 UI의 collector-figure 모듈과 57,890바이트 colorfigures 라이브러리가 dist에 포함 | `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/collector-figure-view.js`, `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/scripts/build.mjs` 20~26 | 활성 진입점·동적 참조를 재확인하고 빌드 포함 목록을 정리. 모든 에셋을 정적 검색만으로 미사용 판정한 것은 아님 |
| D13·C24 | 일부 Phaser 무한 cue/ring tween이 앱 설정만 검사하고 OS reduced-motion은 직접 검사하지 않음 | `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/src/phaser-scenes.js` 107·318, 공통 reduced 함수는 22 | 같은 reduced 판정을 사용. OS 설정만 켠 환경에서 실제 tween 생성 여부 검사 |

위 경고는 소스 정적 분석 또는 계측된 조건의 범위로 판정했다. R1과 R5의 선행 해결을 대체하지 않는다.

## 로딩·성능·저장 실측

| 측정 | 결과 | 해석 |
|---|---|---|
| 캐시 없는 로컬 production 준비 | 234ms | Mac Chrome, 로컬망, 1280×800 |
| 모의 네트워크·CPU 제한 | 3,383ms | 10Mbps, RTT 설정 100ms, CPU 4배 감속. 학교 실기 수치로 일반화하지 않음 |
| 준비 시점 전송량 | 3,560,985바이트, 요청 86건 | 이후 서비스워커 배경 저장량은 별도 |
| 런타임 호스트 | 앱 origin 및 data URI | 외부 CDN 요청 관찰 없음 |
| 빌드 산출물 | 403파일, 68.02MB | 이미지 최대 약 0.78MB, 가장 큰 GLB 약 2.88MB |
| 지도 5초 rAF 샘플 | 평균 16.666ms, p95 16.7ms, 50ms 초과 0회 | Mac headless Chrome의 프레임 간격 |
| 연구섬 3D 5초 rAF 샘플 | 평균 16.666ms, p95 16.8ms, 50ms 초과 0회 | 학교 저사양 GPU 성능을 보장하는 수치는 아님 |
| 오프라인 | production 재방문·자유 모험 변신·이동·저장 통과 | 설치 자료 캐시가 준비된 상태 |
| 손상 저장 | 깨진 JSON 원문 보존, 저장 보호 안내, 홈 접근 가능 | 새 활동을 손상 원문 위에 덮어쓰지 않음 |
| 초기화 | 확인창·취소 후 원문 보존 | 실제 삭제·구버전 호환 등은 단위 테스트와 기존 검증도 사용 |
| 인증서 | A4 가로 841.92×594.96pt, 1페이지 | `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/certificate-current.pdf` |
| 배포 내용 정적 검사 | 중복 바이너리 0, 배포물 내 로그·원본 bank·node_modules·환경 파일 경로 0, 검사한 고위험 키 패턴 0 | 완전한 보안 감사 범위로 확대 해석하지 않음 |

## A~G 판정표

동일 판정과 근거를 공유하는 항목을 묶었다. ‘확인됨’은 실행·측정·파일 내용 대조, ‘추정’은 실행하지 않은 코드 경로의 정적 판단이다.

| 항목 | 판정 | 증거와 범위 |
|---|---|---|
| A1~A5 | PASS | 3개 성취기준과 10장 대응, 이전 원문 대조, 관찰·예상·조건 비교·수리 경로와 오답 테스트 |
| A6 | NOT TESTED | 실제 4학년 학생 난이도 검증 없음 |
| A7·A8 | PASS | 관찰 완료와 근거·시험에 따른 보상, 단위 테스트와 전체 진행 |
| A9·A10 | PASS | 요청형 힌트와 같은 장면 재시도, 핵심 오답 처리 테스트 |
| A11 | WARNING | 성취기준은 별도 설정·문서에 있지만 활동별 구조화된 목표 필드 부족 |
| A12 | NOT TESTED | 콘텐츠별 최종 교사 승인 기록 미확인 |
| A13 | NOT APPLICABLE | 사회·문화 집단 일반화 소재 없음 |
| A14·A15 | PASS | 초등 대상 지시문·오개념 풀이·노트 문장 대조. 복잡한 설명은 선택형 모형 안내 |
| A16·A17 | PASS | 붓기·이동·분류·그리기·닦기·측정·수리·설계로 확장 |
| B1~B12 | PASS | 현재 flow, UI 검사, 300개 테스트 및 변경 없는 기존 검증 |
| B13 | NOT TESTED | 브라우저 히스토리의 모든 복귀 경로는 이번에 전수 조작하지 않음 |
| B14 | FAIL | R1, 온실 응결 대기 중 설정 닫기·새로고침 후 재개 조작이 화면 밖으로 나감 |
| B15 | PASS | 비활성 코어 연결 앞 선행 안내, 완료 조건 표시 |
| B16 | NOT TESTED | 실제 학생 한 차시 수행 시간 미측정 |
| B17·B18 | PASS | 중복 보상·유효 시험 조건 테스트, 전체 흐름·저장 동기화 |
| B19 | WARNING | 일부 준비·닦기·전환 연출 동안 재입력 대기. 잠금 미해제는 별도 발견 없음 |
| C1·C2 | FAIL | 기본 배치는 통과하지만 R1이 주력 1280×800과 상태 복원 화면에서 나타남 |
| C3 | FAIL | R4, 40px 보조 메뉴 |
| C4 | FAIL | R2, 시계·설명 교차 |
| C5 | PASS | 검사한 정상 상태의 주요 제목·선택지 실제 잘림 없음. 작은 글자는 C20으로 구분 |
| C6 | FAIL | R1, 시계와 작업 영역이 화면 아래에 놓임 |
| C7 | PASS | 7개 크기 연속 변경과 세로 레이아웃, 작은 화면의 스크롤 접근 |
| C8 | PASS | 실측한 기본 장면의 과도한 점멸 없음. OS 전용 감소 설정의 일부 경로는 C24에 기록 |
| C9 | NOT TESTED | 반투명 배경 전체의 최저 대비 비율은 전수 실측하지 않음 |
| C10 | PASS | 공통 음소거와 설정 저장, 기존 오디오 정지 검사 |
| C11 | NOT TESTED | 키보드 일부 조작·Enter 입장은 검사. 전체 학습 완료와 VoiceOver는 미완료 |
| C12~C19 | PASS | 공통 팔레트·아이콘·닫기 위치·상태 문구, 작은 가로 제목, 모달 내부 스크롤·Esc, safe-area 구현. C17은 문서 가로 넘침 기준 |
| C20 | FAIL | R3, 1920 본문·선택지 14~17px |
| C21~C23 | PASS | 한글 줄바꿈, 포인터 좌표와 DOM 결과 일치, 단계별 행동 안내. R1은 위 FAIL에 반영 |
| C24 | WARNING | 일부 Phaser tween의 OS 감소 설정 누락 정적 확인 |
| C25 | NOT TESTED | DOM 글자 2배 모의 검사에서 속도 라벨 밀집 확인. 실제 브라우저 글자 설정·125% 줌과 동등한 검사로 처리하지 않음 |
| D1 | WARNING | 모의 저속 조건 3.383초. 3~8초 경고 구간 |
| D2 | PASS | 빌드 이미지 1MB 이하, 주력 장면 실물 크기와 캡처 대조 |
| D3 | WARNING | 도입·엔딩 MP4 5MB 초과 |
| D4·D5 | PASS | GLB 최대 2.88MB, 실행 확인. 바이너리 내용 중복 0 |
| D6 | WARNING | 제거된 2D UI 모듈·라이브러리 배포 포함 |
| D7 | PASS | 불필요한 npm 런타임 의존성 없음 |
| D8 | WARNING | R6, 반복 진입 계측상 노드·리스너 증가 |
| D9 | PASS | 현재 Mac의 지도·3D 5초 프레임 샘플 기준 |
| D10 | NOT TESTED | 학교 저사양 태블릿 실기 없음 |
| D11·D12 | PASS | 현재 오프라인 검사, 기존 미방문 3D 오프라인 검사, origin 내 요청 |
| D13 | WARNING | 상시 cue/ring tween 등 정적 모션 위험. 실제 FPS 장애를 주장하지 않음 |
| D14 | PASS | 로컬 woff2·라이선스와 네트워크 로딩 확인 |
| E1·E2·E3 | WARNING | CSS 누적·큰 파일·미사용 named import 후보 |
| E4 | NOT APPLICABLE | TypeScript 프로젝트 아님 |
| E5~E9 | PASS | 검사 중 JS 오류·리소스 404 없음. 현재 빌드 경로와 키 패턴 대조. E6은 모형 상수와 문자열 존재 자체를 결함으로 분류하지 않음 |
| E10 | NOT APPLICABLE | 설치형 npm 의존성과 lock 혼용 없음 |
| E11·E12 | PASS | 빌드·구문·300개 테스트 |
| E13 | PASS | 검사한 진행에서 중복 발행·보상 없음. 리스너 누적 원인은 D8에서 추적 대상으로 남김 |
| E14 | PASS | 배포 파일명과 빌드 목록의 kebab-case·경로 확인 |
| F1~F10 | PASS | 학생 입력·외부 전송 없음, 저장 구조·버전·키·구버전·초기화 검사와 명시된 출처 확인 |
| F11 | NOT TESTED | 제공 원화·원본 도입/엔딩 영상의 소유자 권리 확인 기록이 CREDITS에 미완료로 남음. Suno 음악은 11월 4일 제작자 확인 기록이 있음 |
| F12~F15 | PASS | 제작 출처·고위험 키 패턴 검사, 손상 원문 보호, 해금·완료 파생 조건 회귀 테스트 |
| G1 | PASS | 기존 Cloudflare 루트 서비스와 README 일치 |
| G2 | NOT APPLICABLE | 하위 경로 납품은 현재 배포 대상에 없음. README에 별도 경로 변경 필요 명시 |
| G3·G4 | PASS | production 로컬 새로고침·에셋 경로. R1은 HTTP 404가 아닌 렌더 실패 |
| G5 | NOT APPLICABLE | 런타임 비밀 환경변수 요구 없음 |
| G6~G9 | PASS | 정적 서버 처리, 기존 OG 자료와 현재 HTML 메타·favicon, 공개 응답 확인 |
| G10 | FAIL | 현재 공개 앱·achievement 해시가 검증 빌드와 다름 |
| G11 | NOT TESTED | 최신 빌드의 공개 URL smoke test 미완료 |
| G12~G17 | PASS | 로그인 없는 공개 응답, 시작 시 clean main, README 실제 명령, 배포 산출물·ignore·origin 분리 문서 |
| G18 | NOT TESTED | 실제 카카오톡 미리보기 없음 |
| G19 | NOT TESTED | PC PDF 1장 확인. iOS 실기 인쇄·공유 없음 |
| G20 | PASS | 현재 기준 커밋과 직전 배포·롤백 참고 기록 있음 |

C1·C2·C6과 B14는 같은 R1을 서로 다른 검사 관점에서 표시했다. 점수는 정해진 매핑으로 계산하며 임의의 추가 벌점은 넣지 않았다. 코드 정적 분석만으로 학생 학습 효과나 실기 성능을 통과 처리하지 않았다.

## 납품 전 처리 순서

1. **R1 온실 복원 오류 수정과 회귀 검사**. 기능 완성도의 3점 상한을 만든 배포 차단 오류다.
2. **R2 시계·설명 영역 분리**. 자동 관찰 on/off 모두에서 기다리기 전·중·후 캡처를 확인한다.
3. **R3·R4 글자·터치 최소선 정리**. 주력 1920·1280·1024부터 검사하고 작은 가로 화면으로 확장한다.
4. **최신 production 배포와 해시·실사용 검사**. 공개 URL에서 시작·첫 입력·저장·새로고침·온실 복원·엔딩·노트·인증서를 확인한다.
5. **최종 실기 확인**. 수업 담당자가 학교 태블릿에서 터치·소리·3D 핀치·인쇄를 확인하고 콘텐츠 승인 및 제공 원본 권리 확인 기록을 마무리한다.

## 미검증 항목의 담당과 시점

| 항목 | 담당·시점 |
|---|---|
| A6·B16 실제 학생 난이도·시간 | 수업 담당자, 납품 전 파일럿 또는 수업 적용 전 |
| A12 최종 과학 내용 승인 | 콘텐츠 검수 교사, 정식 납품 전 |
| B13 브라우저 히스토리 | 개발 검수자, R1 수정 회귀 때 |
| C9·C11·C25 대비·전체 키보드·실제 확대 | 접근성 검수자, 납품 검수 기기에서 |
| D10·3D 핀치·물소리 청취 | 납품 담당자, 실제 학교 태블릿에서 |
| F11 제공 원화·원본 영상 기록 | 제작자·납품 담당자, 배포 승인 전 |
| G11 최신 공개본 | 개발 검수자, 수정본 배포 직후 |
| G18·G19 카카오·iOS 인쇄 | 납품 담당자, 실제 앱·기기에서 |

검사 로그와 재현 스크립트는 `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/.tmp/delivery-audit-20261111/`에 있다. 장기 보관할 소스 변경 없이 검토 산출물만 추가했다. 전체 점수 산식과 항목별 감점은 `/Volumes/T7 Shield/iscreammedia_sc34/6 waterchange/docs/reviews/SCORE-20261111.md`에 기록했다.
