import { useSyncExternalStore } from 'react';
import { store } from '../store';

export function useStore() {
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  return { ...state, ...store };
}
