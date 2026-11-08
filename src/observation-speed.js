export const OBSERVATION_SPEEDS=[.25,.5,1,2];
export const observationSpeed=settings=>OBSERVATION_SPEEDS.includes(settings?.observationSpeed)?settings.observationSpeed:.5;
export const observationDelay=(milliseconds,settings)=>milliseconds/observationSpeed(settings);

// Accumulated virtual time lets a live speed change continue without a jump.
export function createObservationClock(settings,start=performance.now()){
 let previous=start,elapsed=0;
 return now=>{elapsed+=Math.max(0,now-previous)*observationSpeed(settings);previous=now;return elapsed;};
}
