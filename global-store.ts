import produce from 'immer';
import { atom, DefaultValue, selector } from 'recoil';

export const toBeDeletedHintMapState = atom<{ [id: string]: boolean }>({
  key: 'toBeDeletedHintMapState',
  default: {},
});

export const addToDeleteHintMapSelector = selector<string>({
  key: 'addToDeleteHintMapSelector',
  get: () => '',
  set: ({ get, set }, id) => {
    if (!(id instanceof DefaultValue)) {
      const map = get(toBeDeletedHintMapState);
      const newMap = produce(map, (nextMap) => {
        nextMap[id] = true;
      });
      set(toBeDeletedHintMapState, newMap);
    }
  },
});

export const removeFromDeleteHintMapSelector = selector<string>({
  key: 'removeFromDeleteHintMapSelector',
  get: () => '',
  set: ({ get, set }, id) => {
    if (!(id instanceof DefaultValue)) {
      const map = get(toBeDeletedHintMapState);
      const newMap = produce(map, (nextMap) => {
        nextMap[id] = false;
        //delete nextMap[id]로 해도 됨
      });
      set(toBeDeletedHintMapState, newMap);
    }
  },
});
