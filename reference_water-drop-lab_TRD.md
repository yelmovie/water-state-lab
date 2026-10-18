# 물방울 연구실 (Water Drop Lab) — TRD

- **Repository:** `science-world-water-drop-lab`
- **Runtime:** Web / PWA-ready
- **Target:** Tablet landscape first
- **Backend:** None
- **Primary stack:** Vite + TypeScript + Phaser 3 + Three.js + HTML/CSS/SVG
- **State persistence:** localStorage (optional IndexedDB for snapshots)
- **Architecture:** Phaser canvas + Three.js scene + DOM overlay, EventBus communication

---

## 1. 기술 목표

1. 2D와 3D를 같은 화면에 억지로 섞지 않고 **Screen 단위로 엔진 역할을 분리**한다.
2. 학습 UI는 DOM/SVG로 구현하여 텍스트 판독성과 접근성을 유지한다.
3. Phaser는 2D 상호작용·애니메이션·드래그·그리기·타임라인 장면을 담당한다.
4. Three.js는 공간 이해가 필요한 Screen 04·09와 경량 허브/엔딩만 담당한다.
5. EventBus로 엔진과 UI를 분리해 1년 유지보수 가능한 구조로 만든다.
6. 모든 Stage 데이터는 serializable state로 저장한다.
7. 실제 유체 해석을 흉내 내는 무거운 물리 엔진보다 **교육 목적에 맞는 결정론적 시뮬레이션**을 사용한다.

---

## 2. 권장 디렉터리 구조

```text
science-world-water-drop-lab/
├─ public/
│  ├─ assets/
│  │  ├─ bg/
│  │  ├─ ui/
│  │  ├─ props/
│  │  ├─ fx/
│  │  ├─ audio/
│  │  └─ models/
│  │     ├─ lab_hub.glb
│  │     ├─ pipe_chamber.glb
│  │     ├─ water_collector_parts.glb
│  │     └─ final_core.glb
│  └─ manifest.webmanifest
├─ src/
│  ├─ app/
│  │  ├─ App.ts
│  │  ├─ router.ts
│  │  └─ bootstrap.ts
│  ├─ core/
│  │  ├─ EventBus.ts
│  │  ├─ SceneManager.ts
│  │  ├─ AssetManager.ts
│  │  ├─ AudioManager.ts
│  │  └─ DeviceCapabilities.ts
│  ├─ state/
│  │  ├─ WaterLabState.ts
│  │  ├─ WaterLabStore.ts
│  │  ├─ migrations.ts
│  │  └─ persistence.ts
│  ├─ screens/
│  │  ├─ Screen01LabHub/
│  │  ├─ Screen02StateLab/
│  │  ├─ Screen03FreezeMeasure/
│  │  ├─ Screen04Pipe3D/
│  │  ├─ Screen05WaterDrawing/
│  │  ├─ Screen06EvapBoilCompare/
│  │  ├─ Screen07CondensationExperiment/
│  │  ├─ Screen08EvidenceBoard/
│  │  ├─ Screen09Collector3D/
│  │  └─ Screen10FinalReport/
│  ├─ phaser/
│  │  ├─ scenes/
│  │  ├─ systems/
│  │  └─ objects/
│  ├─ three/
│  │  ├─ scenes/
│  │  ├─ controls/
│  │  ├─ loaders/
│  │  └─ simulations/
│  ├─ components/
│  │  ├─ ProgressBar/
│  │  ├─ ResearchNotebook/
│  │  ├─ ExperimentToolbar/
│  │  ├─ TimelineScrubber/
│  │  ├─ MeasurementPanel/
│  │  ├─ EvidenceBoard/
│  │  ├─ RewardModal/
│  │  ├─ Toast/
│  │  └─ BottomBar/
│  ├─ domain/
│  │  ├─ waterState.ts
│  │  ├─ freezeExperiment.ts
│  │  ├─ evaporationExperiment.ts
│  │  ├─ condensationExperiment.ts
│  │  └─ collectorDesign.ts
│  ├─ data/
│  │  ├─ standards.ts
│  │  ├─ scenarios.ts
│  │  ├─ hints.ts
│  │  └─ copy.ko.ts
│  └─ styles/
│     ├─ tokens.css
│     ├─ layout.css
│     └─ accessibility.css
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ package.json
└─ README.md
```

---

## 3. 화면 모드 매트릭스

| Screen | 이름 | 엔진 | 렌더링 | 3D 필수도 |
|---|---|---|---|---|
| 01 | 물방울 연구실 | Three.js + DOM | 고정 카메라 3D 디오라마 | 권장 |
| 02 | 세 가지 상태 판별실 | Phaser + DOM | 2D/2.5D | 불필요 |
| 03 | 얼기 전후 측정 | Phaser + SVG/DOM | 2D 계측 UI | 불필요 |
| 04 | 얼음 압력 사고 해결 | Three.js + DOM | 실시간 3D | **핵심** |
| 05 | 물그림 시간 실험 | Phaser + Canvas/DOM | 2D 드로잉 | 불필요 |
| 06 | 증발 VS 끓음 분석기 | Phaser + DOM/SVG | 2D 비교 실험 | 불필요 |
| 07 | 컵 바깥의 물 사건 | Phaser + DOM | 2D 실험 | 불필요 |
| 08 | 증거 보드 | DOM/SVG | 논리 연결 UI | 불필요 |
| 09 | 물방울 수집 장치 공방 | Three.js + DOM | 실시간 3D 빌더 | **핵심** |
| 10 | 물방울 코어 복구 | Three.js + DOM | 경량 3D + 결과 UI | 권장 |

---

## 4. 전역 상태 모델

```ts
type ScreenId =
  | "screen-01-main"
  | "screen-02-state"
  | "screen-03-freeze-measure"
  | "screen-04-pipe"
  | "screen-05-water-drawing"
  | "screen-06-evap-boil"
  | "screen-07-condensation"
  | "screen-08-evidence"
  | "screen-09-collector"
  | "screen-10-final";

type StageId = 1 | 2 | 3 | 4 | 5;

interface WaterLabState {
  schemaVersion: "1.0.0";
  lessonId: "topic-10-water-state";
  title: "물방울 연구실";
  currentScreen: ScreenId;
  unlockedStage: StageId;
  completedScreens: ScreenId[];
  completedStages: StageId[];

  stage1: StateObservationState;
  stage2: FreezeLabState;
  stage3: EvaporationBoilingState;
  stage4: CondensationState;
  stage5: CollectorDesignState;

  researchCrystals: {
    state: boolean;
    freeze: boolean;
    evaporationBoiling: boolean;
    condensation: boolean;
    design: boolean;
  };

  hintCount: number;
  retryCount: number;
  reducedMotion: boolean;
  audioEnabled: boolean;
  updatedAt: string;
}
```

---

## 5. Stage 데이터 계약

### Stage 1

```ts
type WaterStateType = "solid" | "liquid" | "gas";

interface ObservationEvidence {
  evidenceId: string;
  objectId: string;
  action: "pour" | "move" | "scan" | "wipe" | "wait";
  observation: string;
  stateClaim?: WaterStateType;
  selectedReasonIds: string[];
}

interface StateObservationState {
  completedObjectIds: string[];
  evidence: ObservationEvidence[];
}
```

### Stage 2

```ts
interface FreezeMeasurement {
  initialLevel: number;
  predictedFrozenLevel: number;
  observedFrozenLevel: number;
  initialMassDisplay: number;
  observedMassDisplay: number;
  zeroed: boolean;
}

interface PipeTrial {
  fillRatio: number;
  frozen: boolean;
  deformationLevel: number; // game-relative 0..1
  risk: "low" | "medium" | "high";
}

interface FreezeLabState {
  measurement?: FreezeMeasurement;
  pipeTrials: PipeTrial[];
  selectedSafeCondition?: number;
}
```

`deformationLevel`은 교육 게임 내부 비교값이며 실제 배관 공학 계산값이 아니다.

### Stage 3

```ts
interface WaterDrawingTrial {
  id: string;
  brushWidth: number;
  waterAmount: number;
  airflow: boolean;
  marks: Array<{x:number; y:number; t:number;}>;
  observationPins: Array<{x:number; y:number; time:number;}>;
}

interface EvapBoilObservation {
  vesselId: "evaporation" | "boiling";
  waterLevelMarks: number[];
  observedZones: Array<"surface" | "inside">;
  bubbleObserved: boolean;
}

interface EvaporationBoilingState {
  drawingTrials: WaterDrawingTrial[];
  compareObservations: EvapBoilObservation[];
}
```

### Stage 4

```ts
interface CondensationSnapshot {
  timeStep: number;
  dropletCoverage: number;
  dropletStage: "none" | "tiny" | "growing" | "merged" | "flowing";
}

interface CondensationState {
  wiped: boolean;
  sealed: boolean;
  zeroed: boolean;
  initialMass?: number;
  finalMass?: number;
  snapshots: CondensationSnapshot[];
  evidenceLinks: Array<{ fromId: string; toId: string; }>;
}
```

### Stage 5

```ts
type CollectorPartType =
  | "coolingPlate"
  | "slopePlate"
  | "funnel"
  | "tube"
  | "cover"
  | "container"
  | "stand";

interface PlacedPart {
  instanceId: string;
  type: CollectorPartType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  connectedTo?: string[];
}

interface CollectorTrialResult {
  trialIndex: number;
  generatedUnits: number;
  collectedUnits: number;
  lostUnits: number;
  efficiency: number;
  leakPoints: Array<[number, number, number]>;
}

interface CollectorDesignState {
  version: number;
  parts: PlacedPart[];
  trials: CollectorTrialResult[];
  passed: boolean;
}
```

---

## 6. EventBus 계약

```ts
type WaterLabEvent =
  | { type: "NAVIGATE"; screen: ScreenId }
  | { type: "SCREEN_COMPLETED"; screen: ScreenId }
  | { type: "STAGE_COMPLETED"; stage: StageId }
  | { type: "NOTEBOOK_ADD"; payload: unknown }
  | { type: "HINT_USED"; screen: ScreenId }
  | { type: "EXPERIMENT_RESET"; screen: ScreenId }
  | { type: "MEASUREMENT_RECORDED"; payload: unknown }
  | { type: "EVIDENCE_CONNECTED"; payload: unknown }
  | { type: "DESIGN_UPDATED"; payload: unknown }
  | { type: "TRIAL_FINISHED"; payload: unknown }
  | { type: "OPEN_REWARD"; stage: StageId };
```

### 규칙
- Phaser/Three.js 내부에서 DOM을 직접 수정하지 않는다.
- DOM UI는 EventBus event와 store만 구독한다.
- 각 Screen은 `mount()`, `unmount()`, `serialize()` 계약을 따른다.
- Screen 종료 시 listener cleanup 필수.

---

## 7. Screen별 기술 설계

### Screen 01 — Lab Hub
**Three.js**
- orthographic 또는 낮은 FOV perspective camera
- 고정 카메라
- 5개 zone hitbox raycast
- 완료 stage별 emissive/animation state 변경

**DOM**
- 제목
- 진행도
- 이어하기
- 연구노트

**성능**
- material reuse
- GLB 경량화
- idle animation 최소화

---

### Screen 02 — State Lab
**Phaser**
- 물 pour animation은 실제 유체 해석 대신 sprite/mask
- 얼음 object drag + rotate
- wipe gesture는 pointer trail을 texture mask에 적용
- scanner는 cone/spot overlay

**Domain**
- object metadata 기반 상태/근거 검증
- 하얀 김을 곧바로 “기체 수증기”로 라벨링하지 않도록 data/copy 분리

**Completion**
- object별 required action 완료 후 claim UI 활성화
- 근거 없는 상태 선택만으로 완료 불가

---

### Screen 03 — Freeze Measure
**Phaser/SVG**
- 눈금관 vector/SVG
- 표시선 y normalized coordinate 저장
- 전자저울 DOM numeric display

**Freeze animation**
- water level → frozen level morph
- 실제 물리 엔진 불필요

**Validation**
- 초기선/예상선/결과선 모두 있어야 compare 활성화

---

### Screen 04 — Pipe 3D
**Three.js**
- OrbitControls 제한: rotate only, pan 금지, zoom 제한
- translucent pipe
- 내부 water/frozen mesh는 fillRatio에 따라 scale/clip 변경
- 냉각 후 얼음이 차지하는 공간을 비교 강조

**Simulation**
- `fillRatio -> frozen occupancy -> risk tier`는 교육용 preset
- 실제 관 강도/압력 수치 계산 금지
- risk는 low/medium/high 질적 피드백

**Touch**
- 1 finger rotate
- fill slider DOM
- CTA는 냉각 시작 중심

---

### Screen 05 — Water Drawing
**Phaser RenderTexture**
- pointer path를 RenderTexture에 draw
- waterAmount/brushWidth에 따라 fade 파라미터 변경
- timeline scrub 시 deterministic replay
- stroke points downsample 저장

**주의**
- 상대적 가상 시간으로 처리
- 실제 증발 속도 정량 예측으로 표현하지 않음

---

### Screen 06 — Evaporation vs Boiling
**Phaser**
- split-screen 2 vessels
- water-level marker
- magnifier window
- 끓음 용기 내부 bubble animation
- 증발 용기 내부에 끓음과 같은 bubble 표시 금지

**ObservationPins**
- 학생 pin 좌표를 surface/inside zone으로 quantize
- 학생 관찰을 기반으로 비교 모델 생성

**Accessibility**
- animation speed 0.5x/1x
- replay
- text description

---

### Screen 07 — Condensation Experiment
**Phaser**
- cup surface wipe mask
- droplet particle은 deterministic seed
- time step별 droplet density 증가
- tiny→growing→merged→flowing state

**Scale UI**
- DOM digital scale
- zeroing state
- initial/final reading

**Seal**
- seal 미완료 시 run 차단
- “실험 조건을 먼저 확인해 보자” 피드백

---

### Screen 08 — Evidence Board
**DOM/SVG**
- 카드 drag
- 연결선 SVG path
- mobile pointer events
- connection graph validation

**Graph rule**
- exact order 하나가 아니라 필수 relation set 검증
- 예: `airVapor -> coldSurface`, `coldSurface -> waterDroplets`
- evidence 2개 이상 요구

---

### Screen 09 — Collector 3D Builder
**Three.js**
- 핵심 장면
- part palette DOM
- GLB parts reuse
- raycast select
- 초등학생용 단순 transform:
  - 1축 회전 우선
  - 높이 slider
  - 경사 preset + fine adjust
  - snap connector
- 삭제/되돌리기 제공

**Simulation**
실제 CFD 대신 규칙 기반 경로 시뮬레이션.

1. `coolingPlate`가 유효하면 droplet source 생성
2. plate orientation으로 downhill vector 결정
3. funnel/tube/container connector graph를 따라 이동
4. 연결 끊김 또는 역경사 시 leak point
5. collected/lost unit 계산
6. 3D droplet animation으로 시각화

**교육적 투명성**
- 결과 패널에 `가상 시험` 표시
- 실제 장치 성능 예측값이 아님을 도움말에 명시

**Completion**
- design v1 → test → feedback → modify → design v2 → pass
- 재설계를 학습 행동으로 저장

---

### Screen 10 — Final
**Three.js**
- fixed cinematic camera
- completed stage state 기반 복구 sequence
- 분자/입자 시각화 금지

**DOM**
- 관찰/측정/비교/증거/설계 결과
- 인증서
- 다시 연구
- Science World 복귀

---

## 8. 3D 자산 규격

### 공통
- `.glb`
- PBR materials
- 모델 1개 가능한 한 50k triangles 이하
- scene total 200k triangles 이하 목표
- texture 1K 기본, 핵심만 2K
- KTX2 압축 권장
- Draco compression 권장
- pivot 기준 통일

### Screen 04
- `pipe_chamber.glb`
- transparent pipe shell
- interior water/frozen mesh는 코드 생성 가능
- crack/deformation은 morph target 또는 별도 mesh

### Screen 09
- `collector_cooling_plate.glb`
- `collector_slope_plate.glb`
- `collector_funnel.glb`
- `collector_tube.glb`
- `collector_cover.glb`
- `collector_container.glb`
- `collector_stand.glb`

connector anchor node:
```text
connector_in
connector_out
snap_top
snap_bottom
```

---

## 9. 렌더링 및 성능 예산

### Tablet
- 1280×720 logical baseline
- DPR clamp: `Math.min(devicePixelRatio, 1.5)`
- 목표 60fps, 3D 핵심 Screen 최소 30fps
- WebGL context 1개만 active
- Phaser와 Three scene 동시 상시 렌더 금지
- Screen 전환 시 미사용 renderer pause/dispose

### Asset
- initial bundle < 2.5MB JS gzip 목표
- Screen별 lazy load
- 3D GLB stage bundle 개별 로드
- audio lazy load

---

## 10. 입력 처리

```ts
interface UnifiedPointer {
  id: number;
  x: number;
  y: number;
  type: "mouse" | "touch" | "pen";
}
```

### Gesture policy
- long press를 필수 기능에 사용하지 않음
- pinch는 보조 줌
- 핵심 기능은 한 손가락으로 수행 가능
- 회전은 1 finger drag 또는 큰 rotation UI
- Screen 09 정밀 배치는 snap 적극 사용

---

## 11. 접근성

- 대비 고려
- 색상+형태+텍스트 병행
- focus visible
- keyboard fallback
- reduced motion
- sound mute
- captions
- 48px 권장 touch target
- drag 대체 “선택 → 위치 탭”
- 결과 animation replay

---

## 12. 오디오

### BGM
- Main + Stage 1~5, 최대 6트랙

### SFX
- water pour
- ice click
- freeze
- wipe
- droplet
- scale confirm
- heater
- bubble
- connector snap
- trial start
- restore success

---

## 13. 저장 및 마이그레이션

```ts
const STORAGE_KEY = "science-world-water-drop-lab:v1";
```

### 저장 시점
- Screen 완료
- experiment trial 완료
- Stage 5 design update debounce
- 설정 변경
- visibility change

### migration
```ts
type Migration = (state: unknown) => WaterLabState;
```

---

## 14. 힌트 시스템

### 단계형 힌트
1. 관찰 위치 강조
2. 사용할 도구 강조
3. 질문형 힌트
4. 마지막에만 관계 설명

예:
- “비커 안이 아니라 바깥 표면을 다시 살펴봐.”
- “처음과 나중의 저울 값을 비교해 볼까?”
- “물이 생긴 곳과 공기가 닿는 곳을 연결해 보자.”

정답 텍스트를 즉시 노출하지 않는다.

---

## 15. 테스트

### Unit
- state machine
- persistence
- evidence graph validation
- Stage 5 connector graph
- trial calculation
- completion rules

### Integration
- EventBus cleanup
- Phaser → store
- Three → store
- restore
- stage unlock

### E2E
1. 신규 사용자 시작
2. Stage 1 완료
3. reload 후 복귀
4. Stage 2 예상/측정
5. Screen 04 rotate/fill/freeze
6. Stage 3 drawing/timeline
7. Stage 4 evidence
8. Stage 5 3D design v1→test→v2
9. final unlock
10. reset

### Tablet QA
- iPad Safari
- Galaxy Tab Chrome
- Windows touch Chrome/Edge
- mouse fallback

---

## 16. 검증 체크리스트

### 과학
- [ ] [4과10-01] 세 상태와 생활 사례 포함
- [ ] [4과10-02] 얼기/녹기/증발/끓음/응결 모두 관찰
- [ ] [4과10-03] 물 얻기 장치 설계/만들기 포함
- [ ] 수증기를 하얀 김과 동일시하지 않음
- [ ] 입자 수준 원인 설명을 핵심 학습으로 사용하지 않음
- [ ] 증발/끓음 비교가 첨부 자료의 학습 요소와 충돌하지 않음

### UX
- [ ] 객관식 반복 없음
- [ ] Screen마다 주 조작이 다름
- [ ] 정답보다 증거를 요구
- [ ] 실패 후 재실험 가능
- [ ] Stage 5에 수정 설계 과정 존재

### 기술
- [ ] 3D context leak 없음
- [ ] resize 대응
- [ ] touch/mouse 지원
- [ ] local save
- [ ] offline core flow
- [ ] 30fps 이상 3D
- [ ] npm verify / test 통과

---

## 17. 구현 우선순위

### P0
- navigation/state/persistence
- Screen 02/03/05/06/07/08
- Screen 09 3D builder + rule simulation
- completion flow

### P1
- Screen 04 3D pipe
- Screen 01/10 3D polish
- certificate
- audio

### P2
- scenario variants
- teacher debug panel
- accessibility polish
- PWA polish

---

## 18. 기술 원칙

> 3D는 장식이 아니라 공간 설계가 학습 행동일 때만 사용하고, 나머지 화면은 판독성과 반복 실험 속도를 위해 Phaser·DOM·SVG로 구현한다.
