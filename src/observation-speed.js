// The menu shows 0.5×–2× around a classroom pace. 1× runs the engine at a quarter of its raw rate,
// half the old default (2026-11-09: the old 0.5× still felt rushed); 2× equals that old default.
export const OBSERVATION_SPEEDS=[.5,1,1.5,2];
export const PACE=.25;
export const observationSpeed=settings=>OBSERVATION_SPEEDS.includes(settings?.observationPace)?settings.observationPace:1;
/** Engine rate for the chosen menu speed. */
export const observationRate=settings=>observationSpeed(settings)*PACE;
export const observationDelay=(milliseconds,settings)=>milliseconds/observationRate(settings);

// Accumulated virtual time lets a live speed change continue without a jump.
export function createObservationClock(settings,start=performance.now()){
 let previous=start,elapsed=0;
 return now=>{elapsed+=Math.max(0,now-previous)*observationRate(settings);previous=now;return elapsed;};
}
