# 방울이의 물길 탐험 인트로 파이널 영상과 수노 음악

인트로는 **멈춘 물길의 수수께끼 → 조사할 이유 → 함께 실험하고 장치를 만들자는 초대**, 파이널은 **알아낸 물의 변화 → 비교와 재시험 → 내 설계가 살린 연구섬과 보상**으로 이어져. 방울이는 학생의 탐구를 돕는 동료야. 파이널 자막의 ‘내’는 게임을 끝낸 학습자를 뜻해.

**제작 기준은 인트로 24초와 파이널 30초.** 장면 이미지가 각각 3장이고, 이미지마다 대응하는 영상 프롬프트를 하나씩 복사하면 돼. 음악은 아래 수노 프롬프트로 새로 만들면 돼.

# 수노 음악 프롬프트

두 곡 모두 **가사란은 비우고 보컬 없는 연주곡**으로 만들어줘. 조성·악기·상승하는 4음 모티프를 함께 지정해서 같은 모험의 시작과 끝처럼 들리도록 설계했어. 아래 코드 블록을 각각 음악 스타일 프롬프트로 복사하면 돼.

## 메인 테마 호기심 가득한 물길 탐험

인트로와 탐험 지도의 분위기. 피아노와 마림바가 작은 물방울처럼 질문을 던지고, 플루트가 길을 열어 주는 느낌이야. 눈 덮인 배관의 반짝임부터 햇빛 뜰의 따뜻함까지 담되, 실험 중에도 생각을 방해하지 않을 정도로 가볍게.

**요청값:** 88 BPM · D장조 · 4/4박자 · 약 2분 · 반복하기 편한 끝맺음.

```text
Instrumental theme for a polished, playful science adventure for ages 9-10 on a sunlit island with a friendly water-drop researcher. Curious, warm, inventive and quietly adventurous. 88 BPM, D major, 4/4. Felt piano, wooden marimba, celesta, pizzicato strings, soft flute, subtle water-like musical plucks, very light brushed percussion. A short rising four-note motif inspired by D-E-F#-A, with breathing space between phrases. First 8 seconds: a small musical question; next 8: gentle investigation pulse; next 8: flute opens the invitation to explore. Then a steady unobtrusive exploration groove, about 2 minutes, with a soft loop-friendly ending. Leave room for reading Korean subtitles and thinking. Clear melody, moderate dynamics, no sudden drops, no heavy bass or big drums. Not a nursery song or lullaby. No vocals, lyrics, choir, humming, speech, cinematic booms or realistic water sound effects.
```

## 파이널 테마 내가 되살린 물길

알아낸 사실이 실제 결과로 이어졌다는 자부심. 처음에는 물방울 하나를 발견한 기쁨, 중간에는 장치가 작동하는 기대, 마지막에는 연구섬 전체가 살아나는 축하로 커져. 같은 악기에 현악과 부드러운 호른을 더해.

**요청값:** 96 BPM · D장조 · 4/4박자 · 약 60~75초. 첫 30초 안에 ‘발견 → 작동 → 축하’가 한 번 완결되고, 뒤에는 인증서 화면에 어울리는 여운을 요청했어.

```text
Instrumental ending theme for the same warm water-drop science adventure. The learner used observations, comparisons and a repaired water collector to restore the island. 96 BPM, D major, 4/4. Keep piano, celesta, marimba and soft flute, with a rising four-note motif inspired by D-E-F#-A. Add warm legato strings, gentle French horn and light orchestral percussion. First 10 seconds: intimate wonder as droplets collect; next 10: hopeful steady build as the repaired device works; next 10: joyful earned celebration as the waterwheel turns. Aim for a satisfying musical cadence near 30 seconds, then a gentle reprise and a sparkling resolved ending. About 60-75 seconds total. Proud, bright, touching and playful, never bombastic or childish. Leave space for Korean subtitles. No vocals, lyrics, choir, humming, speech, trailer drums, EDM drops, huge bass or abrupt tempo changes.
```

수노의 실제 결과는 길이·박자·전개·선율이 요청과 다를 수 있어. 두 곡을 들어 보고 같은 분위기로 이어지는 결과를 골라 줘. 영상의 초 단위 구간은 편집 기준값이고, 음악이 나오면 강박과 멜로디 마무리에 맞춰 조금 조절하면 돼. 96 BPM에서는 4마디가 10초여서 파이널의 세 장면과 맞추기 좋아.

# 캐릭터와 편집 기준

![방울이 캐릭터 고정용 3패널 시트](D:/iscreammedia_sc34/6 waterchange/image/video-plan-20261101/bangul-character-sheet.png)

위 시트는 **의상 정면의 머리 없는 마네킹 · 전신 후면 · 얼굴 확대** 3패널이야. 방울이의 파란 물방울 머리, 짙은 파란 눈, 분홍 볼, 흰 연구복, 물방울 문양과 파란 명찰을 유지해. 화면에는 방울이가 한 명만 등장해.

1. 아래 장면 이미지를 **해당 클립의 시작 이미지**로 넣고 그 아래 영상 프롬프트를 복사해. 추가 캐릭터 참조를 지원하면 이 시트를 함께 써.
2. 인트로는 8초 클립 3개, 파이널은 10초 클립 3개를 각각 생성해 순서대로 이어 붙여. 생성 길이를 고를 수 없으면 가까운 긴 길이로 생성한 뒤 편집해.
3. 최종 화면은 16:9, 편집 기준 1920×1080과 24fps. **영상 자체는 무음**으로 생성하고 수노 음악을 편집에서 얹어. 자막은 아래 원문을 별도 자막으로 넣어.
4. 하단 약 22%를 자막 영역으로 쓰고, 한 번에 최대 두 줄만 보여 줘. 1080p 기준 약 48~56px의 흰색 굵은 글씨와 짙은 그림자를 사용하고, 화면 가장자리에서 충분히 띄워. 얼굴·손·관찰 대상을 가리지 않게 위치를 조절해.
5. 장소 이동은 컷 전환으로 연결해. 실내에서 다른 스테이지로 배경이 변형되는 연출 대신, 다리·배관·물 흐름의 방향으로 이동감을 이어 가면 돼. 각 클립 마지막 1초는 안정된 구도로 멈춰.

# 인트로 영상

첫 장면에서 아름다운 연구섬의 문제를 발견하고, 둘째 장면에서 직접 조사하고 싶은 질문을 만들고, 셋째 장면에서 ‘왜 실험하고 장치를 만들어야 하는지’를 연결해. 원리의 정답은 게임에서 발견하도록 남겨 둬.

| 컷 | 장소 | 화면 크기 | 앵글 | 카메라 한 가지 | 길이 | 목적 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 멈춘 샘터 | 롱샷 | 눈높이 | 느린 달리 인 | 8초 | 물길이 멈춰 온실과 물레가 도움을 기다린다는 문제 제시 |
| 2 | 눈 덮인 얼음 배관 | 미디엄 풀샷 | 로우앵글 | 오른쪽으로 사이드 트래킹 | 8초 | 얼어 막힌 배관을 조사하며 상태 변화에 관한 질문 유발 |
| 3 | 햇빛 뜰 | 미디엄 풀샷 | 눈높이 | 느린 리버스 트래킹 | 8초 | 사라지는 물의 수수께끼와 실험 및 장치 제작이라는 플레이 목적 연결 |

## 인트로 1 멈춘 샘터와 물레

![인트로 1 멈춘 샘터와 물레](D:/iscreammedia_sc34/6 waterchange/image/video-plan-20261101/intro-01-stopped-waterway.png)

**시작 이미지:** `intro-01-stopped-waterway.png` · **편집 구간:** 00:00–00:08 · **생성 길이:** 8초

물길이 멈춰 온실과 물레가 도움을 기다린다는 문제 제시.

**영상 생성 프롬프트**

```text
Use the supplied scene image as the exact starting frame. If the character sheet is also supplied, use it ONLY for face and clothing, never its background or panel layout. Exactly ONE Bangul. Preserve the cyan teardrop head, deep-blue eyes, rosy cheeks, white lab coat, cyan droplet emblem and blue clip ID. No character redesign or duplicates.
[DURATION] 8 seconds, one continuous shot.
[CAMERA]
Movement: one gentle dolly-in, straight forward only. Speed: slow and even, easing to a stop at second 7. Angle: child eye-level. Framing: long shot, Bangul on the left and the stopped brass wheel on the right; keep the dry channel between them readable. END: hold the final balanced view completely still for the last second, with the dry channel and Bangul's questioning face both visible.
[SCENE]
At the spring observation terrace, the constructed stone waterway has stopped. The sea beyond the island remains healthy. Bangul studies the still wheel, lowers the magnifier slightly, and opens the free hand in a small puzzled gesture. A leaf moves gently in the breeze; a tiny residual puddle catches sunlight. Keep the wheel stationary and the channel nearly dry throughout. The distant greenhouse needs the learner's help. Curious and hopeful, not frightening. Do not reveal the solution or restore the water yet.
[OUTPUT]
16:9 landscape, polished 3D animated game-cinematic style. Silent video: no generated music, speech or narration. No generated text, subtitles, logos or UI. Keep faces, hands and key evidence clear of the bottom 22% reserved for captions. Gentle blinking and breathing only; no talking mouth. No morphing architecture, extra limbs, floating objects or sudden scene changes.
```

**이 장면에 얹을 자막**

```text
어? 연구섬의 물길이 멈췄어!
온실도, 물레도 도움이 필요해.
```

## 인트로 2 얼음 배관의 단서

![인트로 2 얼음 배관 조사](D:/iscreammedia_sc34/6 waterchange/image/video-plan-20261101/intro-02-ice-pipe.png)

**시작 이미지:** `intro-02-ice-pipe.png` · **편집 구간:** 00:08–00:16 · **생성 길이:** 8초

얼어 막힌 배관을 조사하며 상태 변화에 관한 질문 유발.

**영상 생성 프롬프트**

```text
Use the supplied scene image as the exact starting frame. If the character sheet is also supplied, use it ONLY for face and clothing, never its background or panel layout. Exactly ONE Bangul. Preserve the cyan teardrop head, deep-blue eyes, rosy cheeks, white lab coat, cyan droplet emblem and blue clip ID. No character redesign or duplicates.
[DURATION] 8 seconds, one continuous shot.
[CAMERA]
Movement: side-track gently from left to right along the brass pipe; no zoom, orbit or tilt. Speed: measured and curious, easing to a stop at second 7. Angle: low angle just below Bangul's chest. Framing: medium-full shot, keep the solid ice plug in the pipe window on the left and Bangul's face and magnifier on the right. END: stop with the ice window and the questioning face side by side, then hold for one second.
[SCENE]
In the snowy elevated ice-waterworks district, Bangul leans a little closer to inspect the ice plug through the same blue magnifier, then tilts the head thoughtfully. A few small snowflakes drift, brass catches cold sunlight, the solid ice remains stable and blocks the liquid. No melting or repair yet. Keep the same snowy bridge, distant observatory and pipe geometry. It is a science mystery inviting a comparison experiment, not a disaster.
[OUTPUT]
16:9 landscape, polished 3D animated game-cinematic style. Silent video: no generated music, speech or narration. No generated text, subtitles, logos or UI. Keep faces, hands and key evidence clear of the bottom 22% reserved for captions. Gentle blinking and breathing only; no talking mouth. No morphing architecture, extra limbs, floating objects or sudden scene changes.
```

**이 장면에 얹을 자막**

```text
얼음 배관은 꽉 막히고…
물은 얼면 어떻게 달라질까?
```

## 인트로 3 햇빛 뜰에서 탐험 초대

![인트로 3 햇빛 뜰에서 탐험 초대](D:/iscreammedia_sc34/6 waterchange/image/video-plan-20261101/intro-03-sun-courtyard.png)

**시작 이미지:** `intro-03-sun-courtyard.png` · **편집 구간:** 00:16–00:24 · **생성 길이:** 8초

사라지는 물의 수수께끼와 실험 및 장치 제작이라는 플레이 목적 연결.

**영상 생성 프롬프트**

```text
Use the supplied scene image as the exact starting frame. If the character sheet is also supplied, use it ONLY for face and clothing, never its background or panel layout. Exactly ONE Bangul. Preserve the cyan teardrop head, deep-blue eyes, rosy cheeks, white lab coat, cyan droplet emblem and blue clip ID. No character redesign or duplicates.
[DURATION] 8 seconds, one continuous shot.
[CAMERA]
Movement: reverse-track slowly straight backward as Bangul takes one small inviting step forward. No orbit or zoom. Speed: light and unhurried, stop moving at second 7. Angle: eye-level. Framing: medium-full shot; keep the open inviting hand, drying observation slab and right-hand path toward the greenhouse visible. END: hold Bangul's welcoming smile and open hand, with the onward bridge clear on the right, for the final second.
[SCENE]
In the warm sun-observation courtyard, the small wet drawing on the stone slab becomes only slightly lighter around its edges. Water vapor is invisible: do not show white steam or magic particles rising from the slab. Bangul looks from the observation to the viewer, keeps the magnifier lowered and invites the learner with an open palm, then makes one small step. Lemon leaves move softly. The greenhouse and final core stay geographically fixed beyond the bridge. End with the feeling “Come investigate and help build a working waterway,” while leaving the scientific answer to gameplay.
[OUTPUT]
16:9 landscape, polished 3D animated game-cinematic style. Silent video: no generated music, speech or narration. No generated text, subtitles, logos or UI. Keep faces, hands and key evidence clear of the bottom 22% reserved for captions. Gentle blinking and breathing only; no talking mouth. No morphing architecture, extra limbs, floating objects or sudden scene changes.
```

**이 장면에 얹을 자막**

```text
햇빛 뜰의 물그림도 사라져!
실험으로 비밀을 찾아,
우리 장치로 물길을 살리자!
```

## 인트로 자막 전체 SRT

```srt
1
00:00:00,300 --> 00:00:03,900
어? 연구섬의 물길이 멈췄어!

2
00:00:04,000 --> 00:00:07,800
온실도, 물레도 도움이 필요해.

3
00:00:08,200 --> 00:00:11,800
얼음 배관은 꽉 막히고…

4
00:00:11,900 --> 00:00:15,800
물은 얼면 어떻게 달라질까?

5
00:00:16,100 --> 00:00:19,200
햇빛 뜰의 물그림도 사라져!

6
00:00:19,300 --> 00:00:24,000
실험으로 비밀을 찾아,
우리 장치로 물길을 살리자!
```

**총 러닝타임:** 24초. 피아노의 물음표에서 시작해 배관 조사 때 리듬을 조금 올리고, 마지막 초대에서 플루트와 밝아지는 선율을 연결해. 끝난 다음 게임의 첫 실험이나 지도 화면으로 이어져.

# 파이널 영상

학습을 마친 학생에게 보여 주는 영상이야. ‘증발과 응결을 이해했다 → 비교하고 고쳐 다시 시험했다 → 내 설계가 연구섬을 되살렸다’가 보이게 구성했어. 온실의 가까운 물방울에서 시작해 공방의 장치, 섬 전체로 공간이 넓어져.

| 컷 | 장소 | 화면 크기 | 앵글 | 카메라 한 가지 | 길이 | 목적 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 이슬 온실 | 미디엄샷 → 미디엄 클로즈업 | 눈높이 | 느린 달리 인 | 10초 | 증발한 물과 응결해 모이는 물을 연결하며 학습 내용 회상 |
| 2 | 물길 설계 공방 | 미디엄 풀샷 | 약한 로우앵글 | 오른쪽으로 사이드 트래킹 | 10초 | 부피 비교와 실패 후 수정 및 재시험을 자기 성취로 연결 |
| 3 | 복구된 연구섬 테라스 | 롱샷 | 정면·수평 | 천천히 크레인 업 | 10초 | 내 탐구가 만든 변화와 실제 보상인 도장 10개 및 연구 인증서 연결 |

## 파이널 1 이슬 온실에서 되찾은 물

![파이널 1 이슬 온실의 발견](D:/iscreammedia_sc34/6 waterchange/image/video-plan-20261101/final-01-dew-greenhouse.png)

**시작 이미지:** `final-01-dew-greenhouse.png` · **편집 구간:** 00:00–00:10 · **생성 길이:** 10초

증발한 물과 응결해 모이는 물을 연결하며 학습 내용 회상.

**영상 생성 프롬프트**

```text
Use the supplied scene image as the exact starting frame. If the character sheet is also supplied, use it ONLY for face and clothing, never its background or panel layout. Exactly ONE Bangul. Preserve the cyan teardrop head, deep-blue eyes, rosy cheeks, white lab coat, cyan droplet emblem and blue clip ID. No character redesign or duplicates.
[DURATION] 10 seconds, one deliberate continuous shot.
[CAMERA]
Movement: a very slow straight dolly-in only. Speed: quiet and steady over 9 seconds, then stop. Angle: level with the cooling plate and Bangul's face. Framing: begin medium, end medium-close; preserve Bangul's smiling face at left, the real droplets on the cold metal and the downhill gutter into the jar at right. END: hold a clear view of collected liquid water and Bangul's proud reaction for the final second.
[SCENE]
Inside the green glass greenhouse, droplets already clinging to the chilled metal plate slowly merge. Two or three droplets detach under gravity, land in the gutter below and travel downhill into the collection jar, making tiny ripples. Bangul follows one droplet with a small pointing gesture and gives one satisfied nod. The jar level rises only slightly. This shows condensation and collection after the learner's investigation. Water vapor itself remains invisible: no white steam, no mist ribbons, no floating water, no droplets materializing away from a surface. Keep the cold plate, gutter and jar rigidly connected and unchanged.
[OUTPUT]
16:9 landscape, polished 3D animated game-cinematic style. Silent video: no generated music, speech or narration. No generated text, subtitles, logos or UI. Keep faces, hands and key evidence clear of the bottom 22% reserved for captions. Gentle blinking and breathing only; no talking mouth. No morphing architecture, extra limbs, floating objects or sudden scene changes.
```

**이 장면에 얹을 자막**

```text
물은 증발해서 공기 중으로!
수증기를 식히니, 다시 물방울로!
```

## 파이널 2 내가 고친 장치의 성공

![파이널 2 내가 고친 물 수집 장치](D:/iscreammedia_sc34/6 waterchange/image/video-plan-20261101/final-02-collector-workshop.png)

**시작 이미지:** `final-02-collector-workshop.png` · **편집 구간:** 00:10–00:20 · **생성 길이:** 10초

부피 비교와 실패 후 수정 및 재시험을 자기 성취로 연결.

**영상 생성 프롬프트**

```text
Use the supplied scene image as the exact starting frame. If the character sheet is also supplied, use it ONLY for face and clothing, never its background or panel layout. Exactly ONE Bangul. Preserve the cyan teardrop head, deep-blue eyes, rosy cheeks, white lab coat, cyan droplet emblem and blue clip ID. No character redesign or duplicates.
[DURATION] 10 seconds, one deliberate continuous shot.
[CAMERA]
Movement: slow side-track from left to right only. Speed: confident and even, easing to a stop at second 9. Angle: slight low angle. Framing: medium-full; keep the simple collector, blue connector, clear receiving bucket and Bangul visible together. END: stop with the successful downhill water path centered, Bangul at the right and the core behind; hold the final frame for one second.
[SCENE]
In the bright white-and-brass design workshop, Bangul gives the aligned blue coupling one small final securing turn, then releases the hand and smiles at the viewer as if congratulating the learner. The old small puddle remains as evidence of an earlier imperfect trial; no new leak appears. A modest flow follows the existing cooling plate, gutter, funnel and continuously downhill clear tube into the receiving bucket. The existing core glow becomes gently brighter as the collected water starts the system. Keep the background comparison samples fixed; do not animate them as a scientific measurement. Make the student's repaired design, careful testing and perseverance the source of success. No magic blast, explosion or new machinery.
[OUTPUT]
16:9 landscape, polished 3D animated game-cinematic style. Silent video: no generated music, speech or narration. No generated text, subtitles, logos or UI. Keep faces, hands and key evidence clear of the bottom 22% reserved for captions. Gentle blinking and breathing only; no talking mouth. No morphing architecture, extra limbs, floating objects or sudden scene changes.
```

**이 장면에 얹을 자막**

```text
얼음의 부피도 꼼꼼히 비교하고,
새는 곳은 고쳐서, 다시 시험했지!
```

## 파이널 3 되살아난 연구섬과 나의 인증서

![파이널 3 되살아난 연구섬과 도장 10개](D:/iscreammedia_sc34/6 waterchange/image/video-plan-20261101/final-03-restored-island.png)

**시작 이미지:** `final-03-restored-island.png` · **편집 구간:** 00:20–00:30 · **생성 길이:** 10초

내 탐구가 만든 변화와 실제 보상인 도장 10개 및 연구 인증서 연결.

**영상 생성 프롬프트**

```text
Use the supplied scene image as the exact starting frame. If the character sheet is also supplied, use it ONLY for face and clothing, never its background or panel layout. Exactly ONE Bangul. Preserve the cyan teardrop head, deep-blue eyes, rosy cheeks, white lab coat, cyan droplet emblem and blue clip ID. No character redesign or duplicates.
[DURATION] 10 seconds, one deliberate continuous celebration shot.
[CAMERA]
Movement: a subtle vertical crane-up only, about half a meter; no backward drift, zoom, orbit or tilt. Speed: slow, proud and graceful, easing to a complete stop at second 9. Angle: frontal with a fixed level camera pitch. Framing: long shot; keep Bangul on the left, the ten-seal passport readable near center and the working waterwheel on the right, with all five research districts in the background. END: hold the restored island, passport and smiling Bangul in a clean stable composition for the last second.
[SCENE]
The learner's collected water now flows from the upper channel onto the wheel cups, slowly turning the brass wheel and draining downhill. Connected research waterways flow gently; keep the five districts and bridges fixed. Bangul lifts the research passport only a few centimeters and gives one happy little nod toward the viewer, sharing the learner's achievement. Preserve exactly ten droplet seals in two rows of five and keep the blank header empty for editing. A few gold paper confetti pieces drift down; warm sunlight glints on the water. Joyful earned success, not random treasure. No new costume, trophy, fireworks or extra characters.
[OUTPUT]
16:9 landscape, polished 3D animated game-cinematic style. Silent video: no generated music, speech or narration. No generated text, subtitles, logos or UI. Keep faces, hands and key evidence clear of the bottom 22% reserved for captions. Gentle blinking and breathing only; no talking mouth. No morphing architecture, extra limbs, floating objects or sudden scene changes.
```

**이 장면에 얹을 자막**

```text
내 관찰과 설계가 물길을 살렸어!
현장 도장 10개 완성!
나의 연구 인증서를 받자!
```

## 파이널 자막 전체 SRT

```srt
1
00:00:00,300 --> 00:00:04,700
물은 증발해서 공기 중으로!

2
00:00:04,800 --> 00:00:09,700
수증기를 식히니, 다시 물방울로!

3
00:00:10,200 --> 00:00:14,700
얼음의 부피도 꼼꼼히 비교하고,

4
00:00:14,800 --> 00:00:19,700
새는 곳은 고쳐서, 다시 시험했지!

5
00:00:20,200 --> 00:00:24,400
내 관찰과 설계가 물길을 살렸어!

6
00:00:24,500 --> 00:00:27,000
현장 도장 10개 완성!

7
00:00:27,100 --> 00:00:30,000
나의 연구 인증서를 받자!
```

**총 러닝타임:** 30초. 0~10초는 피아노·첼레스타로 발견의 기쁨, 10~20초는 현악으로 장치 성공의 기대, 20~30초는 호른과 마림바로 성취를 축하해. 마지막에는 게임의 **연구 기록 5개·현장 도장 10개·나의 연구 인증서**와 이어져. 마지막 안정된 화면 위에 ‘연구 기록 5개 · 현장 도장 10개’를 편집 자막으로 추가해도 좋아.

# 과학 표현과 보상 연결

- 물이 보이지 않게 증발해 공기 중으로 이동하고, 공기 중 수증기가 차가운 표면에서 액체 물방울로 바뀌는 흐름을 보여 줘. 수증기 자체를 흰 연기처럼 그리지 않아.
- 냉각판에서 맺힌 물이 받이와 관을 따라 **아래쪽** 물통에 모여. 물이 저절로 위로 올라가거나 코어의 마법으로 생겨나는 장면을 넣지 않아.
- 얼음의 부피 비교는 실제 게임의 관찰 기록을 회상하는 자막이야. 공방 그림 속 샘플 용기를 같은 양·같은 무게를 증명하는 측정 자료로 사용하지 않아.
- 섬을 살린 원인은 학생의 관찰·비교·설계 수정이야. 방울이의 행동과 물레의 움직임은 그 성취를 보여 주는 연출이고, 도장과 인증서는 게임에서 실제로 얻는 보상과 연결돼.

