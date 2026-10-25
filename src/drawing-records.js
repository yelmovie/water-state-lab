const choices=new Set(['thin','thick','same']);

// A first prediction is an observation record, not an answer to be corrected.
export function lockDrawingPrediction(inquiry){
 if(inquiry.drawPredictionLocked)return true;
 if(!choices.has(inquiry.drawPrediction))return false;
 inquiry.drawInitialPrediction=inquiry.drawPrediction;
 inquiry.drawPredictionLocked=true;
 return true;
}

export function restoreDrawingMetadata(inquiry,draw){
 if(draw.time>0||draw.records.length){
  // Older saves did not record when the prediction was entered or changed.
  inquiry.drawInitialPrediction='unrecorded';
  inquiry.drawPredictionLocked=true;
  inquiry.drawReflection=draw.faster||'';
 }
}

export function archiveDrawing(inquiry,draw){
 if(!draw.strokes.length&&!draw.records.length)return false;
 inquiry.drawArchive.push({
  strokes:structuredClone(draw.strokes),records:structuredClone(draw.records),
  prediction:inquiry.drawInitialPrediction||inquiry.drawPrediction||'unrecorded',
  predictionLocked:!!inquiry.drawPredictionLocked,reflection:inquiry.drawReflection||'',
  savedPrediction:inquiry.drawPrediction||'',
  result:{faster:draw.faster,destination:draw.destination},time:draw.time
 });
 return true;
}

export function resetDrawingExperiment(inquiry,draw,strokes=[]){
 archiveDrawing(inquiry,draw);
 Object.assign(draw,{strokes:structuredClone(strokes),time:0,records:[],faster:'',destination:''});
 Object.assign(inquiry,{drawPrediction:'',drawInitialPrediction:'',drawPredictionLocked:false,drawReflection:'',drawCompared:false,drawMode:'live',drawCursor:0});
}

export const drawingPredictionLabel=value=>({thin:'A가 먼저',thick:'B가 먼저',same:'비슷하게',unrecorded:'확인할 수 없음 · 이전 버전 기록'})[value]||'아직 예상하지 않음';
