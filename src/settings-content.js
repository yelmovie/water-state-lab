import {stageLessons,screenNames} from './domain.js';
// Keep all settings copy here; activity screens use their own concise prompts.
export const STANDARDS=[
 {code:'4과10-01',text:'물이 세 가지 상태로 변할 수 있음을 알고, 우리 주변에서 예를 찾을 수 있다.'},
 {code:'4과10-02',text:'물이 얼 때, 얼음이 녹을 때, 물이 증발할 때와 끓을 때, 수증기가 응결할 때의 변화를 관찰할 수 있다.'},
 {code:'4과10-03',text:'물의 상태 변화를 이용하여 물을 얻을 수 있는 장치를 설계하고 만들 수 있다.'}
];
// Existing curriculum wording and the learner-facing lesson share one source.
export const STAGE_LEARNING=stageLessons.slice(1).map((objective,index)=>({
 stage:index+1,
 title:screenNames[index+1],
 standard:STANDARDS[index<2?0:index<8?1:2].code,
 objective
}));
export const SETTINGS_CONTENT={
 title:'연구실 설정',close:'닫기',
 sound:{bgm:'배경 음악',sfx:'효과음',volume:'배경 음악 크기',on:'켜짐 · 끄기',off:'꺼짐 · 켜기',reduced:'움직임 줄이기'},
 replay:{intro:'인트로 영상 다시 보기',ending:'엔딩 영상 다시 보기',certificate:'연구 인증서 받기',locked:'연구 인증서는 다섯 연구를 마치고 물길을 복구하면 열려요.',concepts:'개념 영상 다시 보기 (선택)',conceptsIntro:'현장 의뢰를 해결한 발견만 다시 볼 수 있어요. 영상을 닫으면 이 목록으로 돌아와요.',conceptReady:'내가 확인한 발견 · 9초',conceptLocked:'현장 의뢰 {n}을 해결하면 열려요.',conceptReturn:'목록으로 돌아가기'},
 app:{title:'앱 정보 · 배움과 보상',name:'방울이의 물길 탐험',maker:'기획·제작: 옐샘 & 아이스크림미디어',rows:[
  ['물길 복구 탐험','방울이와 물·얼음·수증기를 관찰하고, 조건을 바꾸어 물의 상태 변화를 확인해요.'],
  ['미션 보상','직접 찾은 증거로 연구 도구를 얻고 멈춘 물길을 하나씩 되살려요. 다섯 연구를 마치면 마지막 복구 장치와 연구 인증서가 열려요.'],
  ['남는 배움','처음 예상·관찰한 근거·다시 고친 생각·생활 속 적용이 연구 노트에 남아요.']
 ],notebook:'나의 연구 노트와 탐구 노트',discoveries:'모은 도구와 발견 보기'},
 student:{title:'학생용 가이드',lines:[
  '방울이와 연구섬에 들어가요. 길을 따라 열린 연구 장소로 이동해요.',
  '물건을 끌어 옮기고, 물을 붓고, 온도와 시간을 바꿔 보아요. 바뀐 모습을 직접 살펴보아요.',
  '예상과 달라도 괜찮아요. 한 가지 조건을 바꾸고 다시 비교하면 새로운 증거를 얻을 수 있어요.',
  '물체와 놓을 곳을 차례로 눌러도 돼요. 구역을 마칠 때 현장 의뢰와 짧은 개념 영상으로 정리하고, 방울이에게 두 단계 힌트를 받을 수 있어요.',
  '도구를 얻으면 물길이 이어져요. 진행은 이 기기의 같은 브라우저·주소에 저장돼요.',
  '뜨거운 물이나 전기 기구를 실제로 사용할 때는 선생님이나 보호자와 함께해요.'
 ]},
 teacher:{title:'교사용 가이드',offlineSaving:'이 기기에 수업 자료 저장: 준비 중 {n}% · 와이파이가 연결된 동안 조금씩 저장해요.',offlineDone:'이 기기에 수업 자료 저장: 완료 · 그림 무대는 연결된 상태에서 한 번 열면 저장돼요.',standardsTitle:'성취기준',
 toolsTitle:'전체 해금',toolsOff:'켜면 모든 실험과 의뢰를 시연할 수 있어요. 학생 기록은 그대로 남아요.',toolsOn:'화면 위 ‘시연할 장’에서 이동해요. 끄거나 새로고침하면 학생 기록으로 돌아가요.'},
 credits:{title:'이미지·소리·저작권 고지',lines:[
  '캐릭터·배경·장식은 제작자가 제공한 원화와 프로젝트 자체 AI 생성 이미지예요. 3D 장치·연구섬 모형도 프로젝트 자체 AI 이미지로 만든 뒤 다듬은 모형이에요.',
  '실험 장면은 실제 현장 사진이 아닌 학습용 재현 이미지예요. 그림 속 눈금이나 배치는 실제 측정값의 근거로 쓰지 않아요.',
  '배경 음악 「섬의 탐험」과 「물바퀴의 노래」는 제작자가 Suno로 만든 곡이에요. 물 따르기·물방울·기포는 qubodup, AngeloYazar, BMacZero의 CC0 효과음이에요. 다른 물소리는 rubberduck, 책장·도구·버튼 소리는 Kenney의 CC0 효과음이에요. 음원 재생이 안 되면 자체 합성음으로 대신해요.',
  '편지와 주민 대사는 모모와 Qwen3-TTS로 만든 가상 인물의 AI 음성이에요. 실제 인물의 목소리를 복제하지 않았어요.',
  '개념 영상 5편은 직접 작성한 SVG 모션 그래픽으로 제작했어요. 영상은 무음이며, 큰 글씨 설명을 화면에서 함께 보여 줘요.',
  '도입·엔딩 영상은 제작자가 제공한 영상에 자막과 연출, 프로젝트 음악을 FFmpeg로 더했어요.',
  '화면과 실험 글꼴은 네이버 나눔스퀘어네오이며 SIL Open Font License 1.1에 따라 앱에 담았어요. Phaser 게임 엔진과 Three.js 3D 엔진은 MIT 라이선스에 따라 사용해요.',
  '출처와 라이선스 상세 내용은 프로젝트의 assets/CREDITS.md에서 확인할 수 있어요.'
 ],sourcesTitle:'자료 출처 모아 보기',sourcesIntro:'활동 화면에서 쓰는 자료의 출처를 이곳에 모았어요.',sources:[
  ['연구섬·실험실·방울이','사용자 제공 ChatGPT 생성 이미지와 프로젝트 자체 AI 생성 이미지예요.'],
  ['실험 도구·물 수집 장치','프로젝트 자체 AI 생성 이미지와 직접 작성한 Canvas·SVG 실험 표현이에요.'],
  ['배경 음악·효과음','배경 음악: 제작자가 Suno로 만든 곡. 효과음: Kenney Interface Sounds와 RPG Audio, rubberduck의 Water / Splash / Slime SFX, qubodup·AngeloYazar·BMacZero의 물소리 · CC0 1.0 (Kenney, OpenGameArt).'],
  ['개념 영상','프로젝트 자체 SVG 모션 그래픽 · FFmpeg 렌더링이에요.'],
  ['3D 모형','프로젝트 자체 AI 생성 이미지를 Meshy로 3D로 바꾸고 Blender로 다듬었어요.'],
  ['게임 엔진','Phaser · Richard Davey, Phaser Studio Inc. · MIT License예요.'],
  ['3D 엔진','Three.js · three.js authors · MIT License예요.'],
  ['화면 글꼴','나눔스퀘어네오 · 네이버 · SIL Open Font License 1.1이에요.'],
  ['교육 내용','교육부 2022 개정 과학과 교육과정 및 경기도교육청·충청북도교육청 공개 교육 자료를 참고했어요.']
 ],copyright:'ⓒ 2026 옐샘 & 아이스크림미디어. All rights reserved.',own:'앱 화면 캡처·자체 제작 일러스트·자체 제작 음원은 무단 복제·재배포·전용·상업적 이용을 금지해요.',external:'외부 공개 자료·라이브러리·폰트의 저작권은 각 원저작자와 소장 기관에 있으며, 각 자료의 공개 라이선스와 이용 조건을 따라요.',references:'교육 내용 구성 참고: 교육부(moe.go.kr), 경기도교육청(goe.go.kr), 충청북도교육청(pain.cbe.go.kr).'},
 reset:{button:'연구 기록 초기화',title:'연구 기록을 초기화할까요?',body:'이 브라우저·주소의 진행 상황, 모은 도구와 현장 도장, 관찰·그림·비교·설계 기록이 모두 지워져요. 소리와 움직임 줄이기 설정은 그대로 남아요.',cancel:'취소',confirm:'기록 지우기',failed:'기록을 지우지 못했어요. 기존 기록은 그대로 남아 있어요. 창을 닫고 다시 확인해 주세요.'}
};
