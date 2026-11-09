// One film per area (films/concept-zone-N, HyperFrames → scripts/concept-clips/render.mjs). Each cue starts at `at`
// seconds of that film, so the caption under the video changes with the scene. Cues stay in HTML so classroom text
// can scale independently of the video; the film itself only carries labels and one short conclusion line.
const cue=(text,at)=>({text,at});
export const concepts = [null,
 {title:'물의 세 가지 모습',seconds:24,cues:[
  cue('같은 물을 다른 그릇에 옮기면, 물은 그릇에 따라 모양이 달라져.',0),
  cue('얼음은 옮겨도 모양이 그대로야. 물과 얼음의 차이야.',13),
  cue('얼음, 물, 수증기는 모두 물의 다른 모습이야.',17),
  cue('물은 수증기로, 수증기는 다시 물방울로 변할 수 있어.',20.5)]},
 {title:'물이 얼면 어떻게 될까?',seconds:25,cues:[
  cue('물을 더 넣지 않았는데, 원래 있던 물이 얼면서 빨간 선보다 높아졌어.',0),
  cue('높이는 달라져도 저울의 무게는 그대로야.',9.5),
  cue('물이 얼면 부피가 커져. 가득 찬 통은 자리가 부족해.',14),
  cue('그래서 얼음이 커질 빈 공간을 남겨야 통이 터지지 않아.',20.5)]},
 {title:'사라진 물은 어디로 갔을까?',seconds:24,cues:[
  cue('같은 양의 물을 넓게 펼치면 더 빨리 말라.',0),
  cue('물은 사라진 게 아니야. 보이지 않는 수증기가 되어 공기 중으로 갔어.',8.5),
  cue('끓지 않는 물도 표면에서 수증기로 변해. 이것이 증발이야.',13),
  cue('끓을 때는 물속에서도 기포가 생기며 수증기로 변해.',18.5)]},
 {title:'물방울은 어디서 왔을까?',seconds:22,cues:[
  cue('입구를 막았는데도 차가운 컵 바깥에 물방울이 생겼어.',0),
  cue('공기 중 수증기가 차가운 표면에서 물방울로 변한 거야. 이것이 응결이야.',8.5),
  cue('차가운 판 아래에 받이를 놓으면 떨어지는 물방울을 모을 수 있어.',15)]},
 {title:'물은 모습을 바꾸며 다시 돌아와',seconds:24,cues:[
  cue('온실의 물이 증발해 공기 중 수증기가 돼.',0),
  cue('차가운 판에서 응결해 다시 물방울이 돼.',8),
  cue('모은 물을 아래로 이어 보내면 온실의 물길이 다시 움직여.',14.5)]}
].map((c,i)=>c&&{...c,id:i});
