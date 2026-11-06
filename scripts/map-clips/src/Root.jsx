import React from 'react';
import {Composition} from 'remotion';
import {FPS,LOOP,REVEAL,SCALE,places} from './places.mjs';
import {Place} from './Place.jsx';

export const Root=()=>places.flatMap(place=>['on','idle'].map(mode=>(
 <Composition key={place.id+mode} id={`stage-${place.id}-${mode}`} component={Place} defaultProps={{id:place.id,mode}}
  fps={FPS} durationInFrames={mode==='on'?REVEAL:LOOP} width={Math.round(place.box[2]*SCALE)} height={Math.round(place.box[3]*SCALE)}/>
)));
