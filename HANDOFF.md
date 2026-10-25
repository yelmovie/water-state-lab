# 물길탐험 인계 · 2026-10-25
목표: water-state-lab만 수정. 5구역·10개 발견·10개 의뢰, 방울이, 2.5D 지도/2D 실험, 여권·내 설계 재사용 유지.
확정: 검토 기준 224a381. 시작 HEAD/운영은 17484cb(지도 문구 두 커밋 차이). 수정 전 배포 파일 96개 일치. 운영 배포·푸시 금지, 별도 승인 필요.
완료: 지도 별 제거, 기본/의뢰 공간 목표 구분, 최초 예상 고정·생각 분리·새 실험 보관, 완료 조건 일치, 의뢰 행동/결과 상시 안내, 겹친 부품 선택·동일 좌표 이동, 같은 수집량 표시, 저장 상태·원본 보호, 가림·탭/버튼·라벨 교정. 구역 그림 6종 적용.
검증: 자동 83개, 새 학생 1~10장·의뢰·여권·엔딩, 오답/새 실험/새로고침, 분리된 읽기·쓰기 실패, 3해상도 71조합 확인. 실물 태블릿 터치 미검증.
파일: src/activities.js→inquiry.js, fieldwork.js, workshop.js, state.js, phaser-scenes.js. 상세는 docs/reviews/STAGE-REVISION-20261025.md. 원본 PNG=image/generated-stage-experience. 증거=screenshots/stage-revision-20261025.
다음: 실물 태블릿 점검, 사용자 BGM 확인. Suno 메인/엔딩 무가사 프롬프트=docs/audio/SUNO-PROMPTS.md. 미사용 experiments.js·map.js 수정 금지. 학생 저장소 삭제 금지. 변경 미커밋.
