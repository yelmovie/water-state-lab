import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync} from 'node:fs';

const document = new EventTarget();
document.hidden = false;
globalThis.document = document;
globalThis.MutationObserver = class {
  observe() {}
  disconnect() {}
};

class AudioElement extends EventTarget {
  paused = true;
  ended = false;
  currentTime = 0;
  play() { this.paused = false; this.ended = false; return Promise.resolve(); }
  pause() { this.paused = true; }
  removeAttribute() { this.removed = true; }
  load() {}
}

function voiceBox() {
  const audio = new AudioElement();
  const label = {textContent: ''};
  const button = new EventTarget();
  button.querySelector = () => label;
  button.setAttribute = (name, value) => { button[name] = value; };
  const status = {textContent: ''};
  return {
    isConnected: true,
    audio,
    button,
    querySelector(selector) {
      return {audio, button, '.npc-voice-status': status}[selector];
    }
  };
}
document.createElement = voiceBox;

function dialogue() {
  const dialog = new EventTarget();
  dialog.open = true;
  const classes = new Set();
  dialog.classList = {
    toggle(name, active) { if (active) classes.add(name); else classes.delete(name); },
    remove(name) { classes.delete(name); },
    contains(name) { return classes.has(name); }
  };
  dialog.append = box => { dialog.box = box; };
  return dialog;
}

const {state} = await import('../src/state.js');
const {attachNpcVoice, stopNpcVoice} = await import('../src/npc-voice.js');
const {residentForStage, residentPortrait} = await import('../src/island-residents.js');

test('every resident has a stable portrait stage and semantic expression', () => {
  const parang = residentForStage(1);
  assert.match(residentPortrait(parang, 'happy'), /data-character="parang" data-emotion="happy"/);
  assert.match(residentPortrait(parang, 'think'), /data-emotion="think"/);
  assert.match(residentPortrait(parang), /width="640" height="640"/);
  for (const emotion of ['neutral', 'think', 'happy']) {
    assert.match(residentPortrait(parang, emotion), new RegExp(`data-portrait-expression="/assets/npc-expressions/resident-2-${emotion}.webp"`));
    assert.ok(statSync(new URL(`../public/assets/npc-expressions/resident-2-${emotion}.webp`, import.meta.url)).size > 1000);
  }
  assert.match(residentPortrait(residentForStage(3)), /npc-portrait/);
  for(const stage of [4,6,8,10])for(const emotion of ['neutral','think','happy'])assert.ok(statSync(new URL(`../public/assets/npc-expressions/resident-${stage}-${emotion}.webp`,import.meta.url)).size>1000);
  assert.match(residentPortrait(residentForStage(3)), /resident-4.webp/);
});

test('portrait motion follows actual playback and stops while buffering, muted, hidden or failed', () => {
  state.settings.sound = true;
  state.settings.sfx = true;
  const dialog = dialogue();
  attachNpcVoice(dialog, 'hello-02');
  const audio = dialog.box.audio;
  const speaking = () => dialog.classList.contains('npc-speaking');
  assert.equal(audio.paused, false);
  assert.equal(speaking(), false, 'a play request alone does not start portrait motion');
  audio.dispatchEvent(new Event('playing'));
  assert.equal(speaking(), true);
  audio.dispatchEvent(new Event('stalled'));
  assert.equal(speaking(), true, 'a stalled download can still play buffered audio');
  for (const event of ['waiting', 'emptied']) {
    audio.dispatchEvent(new Event(event));
    assert.equal(speaking(), false, event);
    audio.dispatchEvent(new Event('playing'));
    assert.equal(speaking(), true);
  }
  state.settings.sound = false;
  document.dispatchEvent(new Event('game-audio-settings'));
  assert.equal(audio.paused, true);
  assert.equal(speaking(), false);
  state.settings.sound = true;
  dialog.box.button.dispatchEvent(new Event('click'));
  audio.dispatchEvent(new Event('playing'));
  document.hidden = true;
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(audio.paused, true);
  assert.equal(speaking(), false);
  document.hidden = false;
  dialog.box.button.dispatchEvent(new Event('click'));
  audio.dispatchEvent(new Event('playing'));
  audio.ended = true;
  audio.paused = true;
  audio.dispatchEvent(new Event('ended'));
  assert.equal(speaking(), false);
  dialog.box.button.dispatchEvent(new Event('click'));
  audio.dispatchEvent(new Event('playing'));
  audio.dispatchEvent(new Event('error'));
  assert.equal(speaking(), false);
  assert.equal(audio.paused, true);
  stopNpcVoice();
});

test('replacing or closing a dialogue retires the old voice and ignores its late events', () => {
  const dialog = dialogue();
  attachNpcVoice(dialog, 'hello-02');
  const oldAudio = dialog.box.audio;
  oldAudio.dispatchEvent(new Event('playing'));
  attachNpcVoice(dialog, 'reply-02');
  assert.equal(oldAudio.paused, true);
  assert.equal(oldAudio.removed, true);
  oldAudio.dispatchEvent(new Event('playing'));
  assert.equal(dialog.classList.contains('npc-speaking'), false);
  const current = dialog.box.audio;
  current.dispatchEvent(new Event('playing'));
  dialog.dispatchEvent(new Event('close'));
  assert.equal(current.paused, false, 'a queued old close event cannot stop a reopened dialogue');
  dialog.open = false;
  dialog.dispatchEvent(new Event('close'));
  assert.equal(current.paused, true);
  assert.equal(dialog.classList.contains('npc-speaking'), false);
  current.dispatchEvent(new Event('playing'));
  assert.equal(dialog.classList.contains('npc-speaking'), false);
});
