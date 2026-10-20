# 삭제 후보 기록 · 2026-10-21

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

중복 해시는 별도로 원본 전체를 재정리하지 않았다. 제공 원본·임시 프로필·이전 검증 결과는 `.gitignore`로 구분되어 있다. `legacyJourneyView`까지 제거하려면 레거시 참고 경로와 문서를 함께 정리해야 한다.
