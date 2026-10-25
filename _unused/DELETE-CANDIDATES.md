# 삭제 후보 기록 · 2026-10-24

실제 삭제·이동은 하지 않았다. 현재 요청의 원본과 이전 구현을 보존한다. 아래 용량은 점검 시 파일 크기다.

| 경로 | 크기 | 근거·처리 |
|---|---:|---|
| src/map.js | 4,191 B | 현재 src 모듈에서 import 참조 없음. 이전 지도 구현 보관 |
| src/experiments.js | 23,531 B | 현재 src 모듈에서 import 참조 없음. 이전 실험 구현 보관 |
| public/assets/v2/journey-map.webp | 458,462 B | `legacyJourneyView`에서만 참조. 현재 앱은 `journeyView`의 research-island-v3 사용. 단순 문자열 검색의 ‘미참조’ 판정은 아님 |
| public/assets/logo.png | 1,391,064 B | 초기 MVP 이미지. 현재 빌드는 assets/v2의 WebP만 복사하므로 배포본에 없음 |
| public/assets/lab-main.png | 1,922,547 B | 초기 MVP 이미지. 현재 빌드에서 제외 |
| public/assets/lab-room.png | 2,002,488 B | 초기 MVP 이미지. 현재 빌드에서 제외 |
| public/assets/v2/*.png | 합계 16,594,330 B | WebP의 재작업 원본. **현재 보존 필요**, dist에는 PNG 0개. 삭제 권고 아님 |

2026-10-24 `public/assets` 전체 69개 파일의 SHA-256을 비교했으며 내용이 완전히 같은 중복 파일은 0개다. PNG 원본과 WebP 실행본은 편집·실행 목적이 다른 파일로 보존한다. 참조가 적거나 없다는 정적 검색 결과만으로 삭제를 확정하지 않았다. 특히 `concepts/stage-${n}` 영상·끝 장면과 도구 아틀라스는 동적 경로·프레임 참조가 있으므로 미사용 후보에서 제외한다.

제공 원본·임시 프로필·이전 검증 결과는 `.gitignore`로 구분되어 있다. `legacyJourneyView`까지 제거하려면 레거시 참고 경로와 문서를 함께 정리해야 한다. 최종 고도화 QA의 전체 파일·크기·참조·해시 목록은 `docs/reviews/screenshots/upgrade-20261024/final/asset-results.json`에 기록한다. 실제 삭제·이동은 하지 않았다.


## 2026-10-24 지도 교체 후 보존 후보

- `public/assets/v2/research-island-v3.webp`: 현재 지도는 v4를 사용한다. 비교·롤백 원본으로 보존했고 삭제하지 않았다.
