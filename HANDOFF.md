# 물길탐험 인계 · 2026-10-25 밤

목표: 최종점검(23항목) 진단 → 1~5단계 고도화 → 3D 모형 적용.
운영 배포: 2026-10-25 커밋 46038cf → Cloudflare Pages `bc820acd`, 125개 파일 일치 확인. 직전 운영본 `3462b4f4`. GitHub 푸시는 안 함(별도 승인 필요).

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
- 방울이 원본·이미지 생성 계정 권리 확인(회사), 새 배경음(Suno 프롬프트 `docs/audio/SUNO-PROMPTS.md`).
- 2장 Phaser 무대 위아래 여백(720×330 비율 고정 때문).
