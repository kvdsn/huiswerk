import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultProfiles, cleanProfiles, currentProfile, setCurrent, updateProfile, stickerKey, takenAvatar,
} from '../js/logic/profiles.js';

describe('profiles', () => {
  test('always the school child and the toddler; the first keeps the old name', () => {
    const state = cleanProfiles(null, 'Liv');
    assert.deepEqual(state, defaultProfiles('Liv'));
    assert.deepEqual(state.profiles.map((p) => [p.id, p.kind, p.avatar, p.name]), [
      ['p1', 'school', 'eenhoorn', 'Liv'],
      ['p2', 'kleuter', 'kat', ''],
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

  test('name, avatar and game settings change; id and kind stay fixed', () => {
    const state = updateProfile(defaultProfiles(), 'p2', { name: 'Zus', avatar: 'panda', tellenMax: 10, kind: 'school', id: 'x' });
    assert.deepEqual(state.profiles[1], { id: 'p2', name: 'Zus', kind: 'kleuter', avatar: 'panda', tellenMax: 10, memoryCards: 6 });
  });

  test('a child cannot take the other child\'s avatar, or an unknown one', () => {
    const state = defaultProfiles();
    assert.equal(takenAvatar(state, 'p2'), 'eenhoorn');
    assert.equal(updateProfile(state, 'p2', { avatar: 'eenhoorn' }).profiles[1].avatar, 'kat');
    assert.equal(updateProfile(state, 'p2', { avatar: 'giraf' }).profiles[1].avatar, 'kat');
    assert.equal(updateProfile(state, 'p1', { avatar: 'uil' }).profiles[0].avatar, 'uil');
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
    assert.deepEqual(state.profiles[1], { id: 'p2', name: '', kind: 'kleuter', avatar: 'kat', tellenMax: 5, memoryCards: 6 });
    assert.equal(state.current, 'p1');
  });

  test('old colour settings become the default avatars, and duplicates are fixed', () => {
    const old = cleanProfiles({ profiles: [{ id: 'p1', palette: 'roze' }, { id: 'p2', palette: 'mint' }], current: 'p2' });
    assert.deepEqual(old.profiles.map((p) => p.avatar), ['eenhoorn', 'kat']);
    assert.equal(old.current, 'p2');
    const same = cleanProfiles({ profiles: [{ id: 'p1', avatar: 'vos' }, { id: 'p2', avatar: 'vos' }] });
    assert.deepEqual(same.profiles.map((p) => p.avatar), ['vos', 'eenhoorn']);
  });

  test('the first child keeps the original sticker book', () => {
    assert.equal(stickerKey('p1'), 'huiswerk.stickers.v1');
    assert.equal(stickerKey('p2'), 'huiswerk.stickers.p2.v1');
  });
});
