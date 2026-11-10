// Observation time runs twice as fast at every existing menu setting.
export const OBSERVATION_SPEEDS=[.5,1,1.5,2];
export const PACE=.5;
export const observationSpeed=settings=>OBSERVATION_SPEEDS.includes(settings?.observationPace)?settings.observationPace:1;
/** Engine rate for the chosen menu speed. */
export const observationRate=settings=>observationSpeed(settings)*PACE;
export const observationDelay=(milliseconds,settings)=>milliseconds/observationRate(settings);

// Accumulated virtual time lets a live speed change continue without a jump.
export function createObservationClock(settings,start=performance.now()){
 let previous=start,elapsed=0;
 return now=>{elapsed+=Math.max(0,now-previous)*observationRate(settings);previous=now;return elapsed;};
}
