import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultProfiles, cleanProfiles, currentProfile, setCurrent, addProfile, removeProfile, updateProfile, stickerKey,
} from '../js/logic/profiles.js';

describe('profiles', () => {
  test('starts with one school child carrying the old name', () => {
    const state = cleanProfiles(null, 'Liv');
    assert.deepEqual(state, defaultProfiles('Liv'));
    assert.equal(currentProfile(state).name, 'Liv');
    assert.equal(currentProfile(state).kind, 'school');
    assert.equal(currentProfile(state).palette, 'roze');
  });

  test('adding a toddler gives a new id, purple colours and game defaults', () => {
    const { state, profile } = addProfile(defaultProfiles('Liv'));
    assert.equal(profile.id, 'p2');
    assert.equal(profile.kind, 'kleuter');
    assert.equal(profile.palette, 'paars');
    assert.equal(profile.tellenMax, 5);
    assert.equal(profile.memoryCards, 6);
    assert.equal(state.profiles.length, 2);
    assert.equal(state.current, 'p1');
  });

  test('ids are not reused while in use, and switching works', () => {
    let { state } = addProfile(defaultProfiles());
    ({ state } = addProfile(state));
    assert.deepEqual(state.profiles.map((p) => p.id), ['p1', 'p2', 'p3']);
    assert.equal(setCurrent(state, 'p3').current, 'p3');
    assert.equal(setCurrent(state, 'nope').current, 'p1');
  });

  test('removing: never the last child, and the current one falls back', () => {
    const one = defaultProfiles();
    assert.equal(removeProfile(one, 'p1'), one);
    const { state } = addProfile(one);
    const removed = removeProfile(setCurrent(state, 'p2'), 'p2');
    assert.deepEqual(removed.profiles.map((p) => p.id), ['p1']);
    assert.equal(removed.current, 'p1');
  });

  test('changing kind switches to that kind\'s colours unless chosen', () => {
    const { state } = addProfile(defaultProfiles());
    assert.equal(updateProfile(state, 'p2', { kind: 'school' }).profiles[1].palette, 'roze');
    assert.equal(updateProfile(state, 'p2', { kind: 'school', palette: 'paars' }).profiles[1].palette, 'paars');
    assert.equal(updateProfile(state, 'p2', { name: 'Zus' }).profiles[1].name, 'Zus');
  });

  test('cleanProfiles repairs junk', () => {
    const stored = {
      profiles: [
        { id: 'p1', name: 'Liv', kind: 'school' },
        { id: 'p1', name: 'dup' },
        { id: 'p2', name: 5, kind: 'alien', palette: 'neon', tellenMax: 7, memoryCards: 99 },
        { name: 'no id' },
      ],
      current: 'p9',
    };
    const state = cleanProfiles(stored);
    assert.deepEqual(state.profiles.map((p) => p.id), ['p1', 'p2']);
    assert.equal(state.current, 'p1');
    assert.deepEqual(
      { ...state.profiles[1] },
      { id: 'p2', name: '', kind: 'school', palette: 'roze', tellenMax: 5, memoryCards: 6 },
    );
  });

  test('the old mint colour becomes purple', () => {
    const state = cleanProfiles({ profiles: [{ id: 'p1', kind: 'school' }, { id: 'p2', kind: 'kleuter', palette: 'mint' }], current: 'p2' });
    assert.equal(state.profiles[1].palette, 'paars');
  });

  test('the first child keeps the original sticker book', () => {
    assert.equal(stickerKey('p1'), 'huiswerk.stickers.v1');
    assert.equal(stickerKey('p2'), 'huiswerk.stickers.p2.v1');
  });
});
