import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultProfiles, cleanProfiles, currentProfile, setCurrent, updateProfile, stickerKey,
} from '../js/logic/profiles.js';

describe('profiles', () => {
  test('always the school child and the toddler; the first keeps the old name', () => {
    const state = cleanProfiles(null, 'Liv');
    assert.deepEqual(state, defaultProfiles('Liv'));
    assert.deepEqual(state.profiles.map((p) => [p.id, p.kind, p.palette, p.name]), [
      ['p1', 'school', 'roze', 'Liv'],
      ['p2', 'kleuter', 'paars', ''],
    ]);
    assert.equal(currentProfile(state).id, 'p1');
  });

  test('data from the single-child version gets the toddler added', () => {
    const state = cleanProfiles({ profiles: [{ id: 'p1', name: 'Liv', kind: 'school' }], current: 'p1' });
    assert.deepEqual(state.profiles.map((p) => p.id), ['p1', 'p2']);
    assert.equal(state.profiles[0].name, 'Liv');
    assert.equal(state.profiles[1].kind, 'kleuter');
  });

  test('switching child', () => {
    const state = defaultProfiles();
    assert.equal(setCurrent(state, 'p2').current, 'p2');
    assert.equal(setCurrent(state, 'nope').current, 'p1');
  });

  test('name, colour and game settings change; id and kind stay fixed', () => {
    const state = updateProfile(defaultProfiles(), 'p2', { name: 'Zus', palette: 'roze', tellenMax: 10, kind: 'school', id: 'x' });
    assert.deepEqual(state.profiles[1], { id: 'p2', name: 'Zus', kind: 'kleuter', palette: 'roze', tellenMax: 10, memoryCards: 6 });
  });

  test('cleanProfiles repairs junk and drops unknown children', () => {
    const stored = {
      profiles: [
        { id: 'p2', name: 5, kind: 'school', palette: 'neon', tellenMax: 7, memoryCards: 99 },
        { id: 'p1', name: 'Liv', kind: 'kleuter' },
        { id: 'p3', name: 'extra' },
      ],
      current: 'p9',
    };
    const state = cleanProfiles(stored);
    assert.deepEqual(state.profiles.map((p) => p.id), ['p1', 'p2']);
    assert.equal(state.profiles[0].kind, 'school');
    assert.deepEqual(state.profiles[1], { id: 'p2', name: '', kind: 'kleuter', palette: 'paars', tellenMax: 5, memoryCards: 6 });
    assert.equal(state.current, 'p1');
  });

  test('the old mint colour becomes purple', () => {
    const state = cleanProfiles({ profiles: [{ id: 'p2', palette: 'mint' }], current: 'p2' });
    assert.equal(state.profiles[1].palette, 'paars');
    assert.equal(state.current, 'p2');
  });

  test('the first child keeps the original sticker book', () => {
    assert.equal(stickerKey('p1'), 'huiswerk.stickers.v1');
    assert.equal(stickerKey('p2'), 'huiswerk.stickers.p2.v1');
  });
});
