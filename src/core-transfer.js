// Shared display/model coordinates for gravity flow from the collected water to the core inlet.
export function coreTransfer(progress,working){
 const collected=progress.diagnosis?.tests.at(-1)?.collected??100;
 const sourceY=working.parts.bucket.y*.64+10+21-Math.min(100,collected)*.27;
 const height=Math.max(25,Math.min(95,Number(progress.coreHeight??90))),inletY=320-height*.8;
 const head=inletY-sourceY,downhill=head>0;
 return {sourceY,inletY,height,head,downhill,canFlow:!!progress.connected&&Number(progress.valve)>0&&downhill};
}
