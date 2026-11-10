import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities} from '../src/activity-model.js';
import {prepareDrawingComparison} from '../src/drawing-records.js';

test('the comparison starts with a prepared drawing without requiring another drawing activity',()=>{
 const draw=initialActivities().draw;
 assert.equal(prepareDrawingComparison(draw),true);
 assert.ok(draw.strokes.some(stroke=>stroke.length>=3));
 const snapshot=structuredClone(draw);
 assert.equal(prepareDrawingComparison(draw),false);
 assert.deepEqual(draw,snapshot);
});

test('existing learner drawings and completed observations remain intact',()=>{
 const draw={...initialActivities().draw,strokes:[[[20,20],[30,50],[70,70]]],time:110,records:[{band:0,time:0,thin:1,thick:1}],faster:'thin',destination:'air'};
 const snapshot=structuredClone(draw);
 assert.equal(prepareDrawingComparison(draw),false);
 assert.deepEqual(draw,snapshot);
});
