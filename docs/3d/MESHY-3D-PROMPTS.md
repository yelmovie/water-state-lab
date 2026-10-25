# 3D 모델 기준 그림·메시 프롬프트 (2026-10-25)

GLB는 메시(Meshy)에서 만든다. 이 문서는 **기준 그림 목록 + 붙여 넣을 프롬프트 + 받은 뒤 정리 규칙**이다.
기준 그림 폴더: `image/3d-refs/meshy/` (원래 그림 자른 것은 `image/3d-refs/existing/`)

## 어디에 쓰나

| 순위 | 화면 | 3D로 하는 이유 | 필요한 모델 |
|---|---|---|---|
| 1 | 10장 코어 복구 | 9장에서 학생이 만든 장치를 3D로 돌려 보며 높이·기울기·연결을 확인한다. 물이 코어로 들어가며 빛난다 | 01~06 |
| 2 | 엔딩 | 되살린 섬 위로 물길이 흐르고 물레가 실제로 돈다 | 07a·07b·08 |

3·4장 얼음 단면은 투명한 유리가 필요해서 메시보다 코드로 만든 원기둥이 낫다. 그래서 목록에서 뺐다.

## 기준 그림 목록

| # | 파일 | 무엇 | 출처 | 메시 방식 |
|---|---|---|---|---|
| 01 | `01-cooling-plate.png` | 냉각판 | 힉스필드 새로 생성 (공방 그림 참고) | Image to 3D |
| 02 | `02-ramp-tray.png` | 경사판 | 힉스필드 새로 생성 (공방 그림 참고) | Image to 3D |
| 03 | `03-funnel.png` | 깔때기 | 기존 `workshop-atlas.webp` 잘라 흰 배경 | Image to 3D |
| 04 | `04-connector-tube.png` | 연결관 | 기존 `workshop-atlas.webp` | Image to 3D |
| 05 | `05-collection-bucket.png` | 물통 | 기존 `workshop-atlas.webp` | Image to 3D |
| 06 | `06-water-core.png` | 물방울 코어 | 오늘 만든 10장 코어 그림 | Image to 3D |
| 07a | `07a-water-wheel-wheel.png` | 물레 바퀴만 (돌릴 부분) | 힉스필드 새로 생성 | Image to 3D |
| 07b | `07b-water-wheel-stand.png` | 물레 받침대만 | 힉스필드 새로 생성 | Image to 3D |
| — | `07-water-wheel-full-reference.png` | 물레 전체 모습 (조립 참고용, 변환하지 않음) | 힉스필드 새로 생성 | — |
| 08 | `08-island-diorama.png` | 연구섬 디오라마 | 힉스필드 새로 생성 (연구섬 지도 참고) | Image to 3D |
| 09 | `09-bangul-optional.png` | 방울이 (선택) | 기존 `buddy-poses-clean.webp` 첫 칸 | Image to 3D |

물레는 **바퀴와 받침을 따로** 만든다. 메시는 모델을 한 덩어리로 주기 때문에, 한 번에 만들면 바퀴만 돌릴 수 없다.

## 메시 공통 설정

- 기능: **Image to 3D**. 그림 한 장씩 올린다. 배경 제거는 켠다.
- Topology: **Triangle**
- Target polycount: 아래 표의 삼각형 수
- Symmetry: 01~07b는 켜기(Auto), 08·09는 Auto
- Texture: 켜기. 색만 쓰고 PBR은 끈다(파일이 가벼워진다)
- 텍스처 해상도: 1024. 섬(08)만 2048로 받고 블렌더에서 1024로 줄인다
- 마음에 안 들면 같은 그림으로 한 번 더 뽑고, 그래도 안 되면 아래 **Text to 3D 대체 프롬프트**를 쓴다

## 폴리곤·크기 예산

태블릿 한 화면 합계는 10장 약 3만 삼각형, 엔딩 약 5.5만 삼각형으로 잡는다.

메시 다운로드 창: **크기 조정 켜기 · 단위 mm · 높이 · 기원**을 아래대로 넣는다. 게임 화면 1px = 1mm로 맞춘 값이다. 단위가 cm뿐이면 숫자를 10으로 나눠 넣는다. 부품끼리 같은 단위로만 받으면 게임에서 크기를 다시 맞춘다.

| # | 모델 | 삼각형 | 높이 (mm) | 기원 | 확인할 것 | GLB 상한 |
|---|---|---:|---:|---|---|---:|
| 01 | 냉각판 | 4,000 | 70 | 바닥 | 가로가 약 100mm | 300 KB |
| 02 | 경사판 | 2,000 | 30 | 센터 (기울기 회전축) | 길이가 약 140mm, 판이 수평인지 | 200 KB |
| 03 | 깔때기 | 3,000 | 75 | 바닥 | | 250 KB |
| 04 | 연결관 | 2,000 | 70 | 바닥 | | 200 KB |
| 05 | 물통 | 3,000 | 67 | 바닥 | | 250 KB |
| 06 | 물방울 코어 | 12,000 | 170 | 바닥 | | 700 KB |
| 07a | 물레 바퀴 | 6,000 | 100 | **센터** (바퀴 축, 좌우 X축으로 회전) | 바퀴가 똑바로 서 있는지 | 400 KB |
| 07b | 물레 받침 | 8,000 | 130 | 바닥 | | 500 KB |
| 08 | 연구섬 디오라마 | 40,000 | 160 | 바닥 | 지름이 약 400mm | 2.5 MB |
| ~~09~~ | ~~방울이~~ | | | | 만들지 않음 (2026-10-25 결정) | |

메시가 quad로 셀 때는 위 숫자의 **절반**을 넣는다.

---

## 01 냉각판

텍스처 프롬프트
```text
Stylized game prop, brushed silver steel cooling plate on top, bright blue cooling fins underneath, cream white and gold pedestal bracket with gold screws, glossy clean hand-painted look, soft bright colors.
```
Text to 3D 대체 프롬프트
```text
A stylized game prop cooling plate device: a flat rectangular brushed steel plate with four gold screws, a row of bright blue cooling fins underneath, standing on a small cream white pedestal bracket with a gold axle. Low poly, game-ready for web and tablet (three.js, glTF), target 4000 triangles, single 1024 texture, clean topology, no interior faces.
```

## 02 경사판

텍스처 프롬프트
```text
Stylized game prop, long shallow open gutter tray, brushed silver steel channel with polished gold rim and gold end caps, glossy clean hand-painted look.
```
Text to 3D 대체 프롬프트
```text
A stylized game prop water ramp: a long shallow open gutter tray made of brushed steel with a thin polished gold rim and small gold end caps, open on top so water can slide along it. Low poly, game-ready for web and tablet (three.js, glTF), target 2000 triangles, single 1024 texture, clean topology, no interior faces.
```

## 03 깔때기

텍스처 프롬프트
```text
Stylized game prop, polished stainless steel funnel with a gold ring around the rim and a short steel spout with a gold band, glossy clean hand-painted look.
```
Text to 3D 대체 프롬프트
```text
A stylized game prop funnel: a wide polished stainless steel cone with a gold ring around the top rim and a short narrow steel spout with a gold band at the bottom. Low poly, game-ready for web and tablet (three.js, glTF), target 3000 triangles, single 1024 texture, clean topology, no interior faces.
```

## 04 연결관

텍스처 프롬프트
```text
Stylized game prop, short clear light-blue glass pipe with two polished gold clamp rings and gold end rims, glossy clean hand-painted look.
```
Text to 3D 대체 프롬프트
```text
A stylized game prop connector pipe: a short vertical light-blue glass tube with two polished gold clamp rings and gold rims at both ends. Low poly, game-ready for web and tablet (three.js, glTF), target 2000 triangles, single 1024 texture, clean topology, no interior faces.
```

## 05 물통

텍스처 프롬프트
```text
Stylized game prop, round light-blue glass collection bucket with a cream white top rim and a gold base band with small gold rivets, glossy clean hand-painted look.
```
Text to 3D 대체 프롬프트
```text
A stylized game prop water collection bucket: a round slightly tapered light-blue glass bucket with a thick cream white top rim and a polished gold base band with small gold rivets. Low poly, game-ready for web and tablet (three.js, glTF), target 3000 triangles, single 1024 texture, clean topology, no interior faces.
```

## 06 물방울 코어

텍스처 프롬프트
```text
Stylized game prop, tall glass capsule with pale aqua tint, faceted pale aqua water-drop crystal inside held by a gold and white ring frame, white and gold round pedestal base, short brass inlet pipe on the left, glossy clean hand-painted look.
```
Text to 3D 대체 프롬프트
```text
A stylized game hero prop "water droplet core": a tall vertical glass capsule with gold caps, a large faceted pale aqua crystal shaped like a water drop floating in the middle inside a gold and white ring frame, a round white and gold pedestal base, one short brass inlet pipe on the lower left side. Low poly, game-ready for web and tablet (three.js, glTF), target 12000 triangles, single 1024 texture, clean topology, no interior faces.
```
게임에서 빛나는 효과는 코드로 넣는다. 그러니까 모델은 **꺼진 상태(연한 색)** 그대로 받으면 돼.

## 07a 물레 바퀴

텍스처 프롬프트
```text
Stylized game prop, polished gold water wheel with six spokes, aqua glass hub with a water-drop emblem, small open aqua glass buckets around the rim, glossy clean hand-painted look.
```
Text to 3D 대체 프롬프트
```text
A stylized game prop water wheel, wheel only: a vertical polished gold wheel with six spokes, a round aqua hub with a water-drop emblem, eight small open aqua glass buckets evenly spaced around the rim, a short gold axle through the hub. No stand, no water. Low poly, game-ready for web and tablet (three.js, glTF), target 6000 triangles, single 1024 texture, clean topology, no interior faces.
```

## 07b 물레 받침

텍스처 프롬프트
```text
Stylized game prop, cream marble pedestal with polished gold trim, two marble supports with a gold axle bearing on top, short sloped gold water chute, empty clear glass cup on a round front platform, glossy clean hand-painted look.
```
Text to 3D 대체 프롬프트
```text
A stylized game prop water wheel stand without the wheel: a cream marble and polished gold pedestal base, two upright marble supports holding an empty round gold axle bearing at the top, a short sloped gold water chute at the front, and a round platform at the front right with an empty clear glass cup. No wheel, no water. Low poly, game-ready for web and tablet (three.js, glTF), target 8000 triangles, single 1024 texture, clean topology, no interior faces.
```
그림에 떨어지는 물줄기가 있으면 모델에서는 지운다. 물은 게임에서 입자로 흘린다.

## 08 연구섬 디오라마

텍스처 프롬프트
```text
Stylized miniature island diorama, thick round grey stone and earth base with green moss, sandy paths, turquoise water channels and waterfalls painted on the sides, snowy hill with ice bridge, glass dome fountain plaza, sunny courtyard with laundry line, glass greenhouse, wooden water-wheel workshop, bright cheerful hand-painted game look.
```
Text to 3D 대체 프롬프트
```text
A stylized round floating island diorama for a children's science game: a thick circular stone and earth base, on top a small spring fountain plaza with a glass dome, a snowy hill with an ice bridge, a sunny courtyard with a laundry line, a glass greenhouse and a wooden water-wheel workshop connected by sandy paths, turquoise streams and small waterfalls running down the sides. Chunky simplified shapes. Low poly, game-ready for web and tablet (three.js, glTF), target 40000 triangles, single 2048 texture, clean topology, no interior faces.
```
폭포는 모델 표면에 색으로만 남긴다. 움직이는 물은 게임에서 입자로 얹는다.

## 09 방울이 — 만들지 않음 (2026-10-25 결정, 아래는 기록용)

텍스처 프롬프트
```text
Cute glossy blue water-drop mascot character with big dark blue eyes, pink cheeks, open smile, wearing a small white lab coat with a blue water-drop badge and a blue pocket badge, bright clean hand-painted game look.
```
Text to 3D 대체 프롬프트
```text
A cute stylized mascot character shaped like a glossy blue water drop, big dark blue eyes, pink cheeks, open happy smile, wearing a small white lab coat with a blue water-drop badge, short arms, one hand waving, standing. Low poly, game-ready for web and tablet (three.js, glTF), target 12000 triangles, single 1024 texture, clean topology, no interior faces.
```
캐릭터는 얼굴이 조금만 달라져도 다른 아이처럼 보인다. 2D 방울이와 나란히 놓고 비교해서 고른다.

---

## 받은 뒤 정리 (블렌더)

1. 메시에서 받은 원본 GLB: `D:\iscreammedia_sc34\_scratch\waterchange-3d\raw\`
2. 블렌더 정리
   - 삼각형 수를 위 예산 이하로 줄이고, 텍스처를 1024(부품은 512도 가능)로 줄인다
   - 원점을 위 표대로 옮기고, 크기를 표의 단위에 맞춘다. glTF는 Y가 위쪽이다
   - 물레 바퀴는 축이 X축 방향이 되게 돌려 놓는다
   - 떨어지는 물줄기처럼 떠 있는 작은 조각은 지운다
3. 최종 파일: 프로젝트 `public/assets/models/`
   - `device-cooling-plate.glb`, `device-ramp.glb`, `device-funnel.glb`, `device-tube.glb`, `device-bucket.glb`
   - `water-core.glb`, `waterwheel-wheel.glb`, `waterwheel-stand.glb`, `island-diorama.glb`, `bangul.glb`
4. 출처: `public/assets/CREDITS.md`에 메시 사용 사실과 기준 그림 파일명을 적는다

GLB를 넣어 주면 연결은 내가 한다. 계획은 이래:
- Three.js를 10장·엔딩에서만 불러온다
- 3D가 안 뜨는 기기에서는 지금의 2D 화면을 그대로 보여 준다
- '움직임 줄이기'를 켜면 회전을 멈춘다

## 기준 그림 생성 프롬프트 (다시 만들 때)

- 도구: 힉스필드 GPT Image 2.5, high, 1K, 1:1. 한 장에 1.5크레딧
- 참고 이미지: 01·02는 공방 그림에서 자른 해당 부품, 07·07a·07b는 `rescue-reward.webp`, 08은 `research-island-v4.webp`

공통 끝부분 (모든 프롬프트 뒤에 붙임)
```text
Single object, centered, fully visible with a generous margin, plain pure white background, soft even studio lighting, no cast shadow, simple clean readable shapes suitable for low-poly modeling. No text, no labels, no people.
```

01 냉각판
```text
3D modeling reference image of a single game prop, exactly matching the design, colors and glossy painterly style of the reference image: a cooling plate device with a flat rectangular brushed-steel plate on top, a row of blue cooling fins underneath, standing on a small cream-white and gold pedestal bracket. Three-quarter front view from slightly above so the top, front and one side are visible.
```

02 경사판
```text
3D modeling reference image of a single game prop, exactly matching the design, colors and glossy painterly style of the reference image: a long shallow open gutter tray (water slide ramp) made of brushed steel with a thin gold rim and small gold end caps, open on top so water can run along it, gently tilted. Three-quarter front view from slightly above so the inside of the channel, the front and one end are visible.
```

07a 물레 바퀴
```text
3D modeling reference image of ONLY the wheel part of the golden water wheel in the reference image, same colors and glossy painterly style: a single vertical gold wheel with six spokes, a round aqua hub with a water-drop emblem, and eight small open aqua glass buckets evenly spaced around the rim, plus a short gold axle sticking out of the hub on both sides. No stand, no base, no water. Three-quarter front view.
```

07b 물레 받침
```text
3D modeling reference image of ONLY the stand of the golden water wheel machine in the reference image, same colors and glossy painterly style, with the wheel removed: a cream marble and gold pedestal base with two upright marble supports holding an empty round axle bearing at the top (where a wheel would mount), a short sloped gold water chute on the front, and a round platform at the front right where an empty clear glass cup stands. No wheel, no water. Three-quarter front view from slightly above.
```

07 물레 전체 (조립 참고용)
```text
3D modeling reference image of a single game prop, matching the machine design, colors and glossy painterly style of the reference image but WITHOUT any character: the golden water wheel machine only — a vertical gold wheel with aqua glass buckets around its rim, mounted on a cream marble and gold pedestal base with an axle housing, and a small gold spout at the bottom pouring a thin stream of water into a clear glass cup standing on the base. Three-quarter front view from slightly above. No character, no mascot.
```

08 연구섬 디오라마
```text
3D modeling reference image of a single round floating island diorama game asset, a miniature version of the island in the reference image, same colors and glossy painterly style: a thick circular stone-and-earth base seen from 30 degrees above (isometric three-quarter view). On top: a small spring fountain plaza with a glass dome on the left, a snowy hill with an ice bridge at the back left, a sunny courtyard with a laundry line in the middle, a glass greenhouse at the back right, and a wooden water-wheel workshop on the right, connected by sandy paths and little waterfalls flowing down the sides of the base. Chunky, simplified shapes and few small details so it suits a low-poly 3D model. No sea around it, no characters.
```
