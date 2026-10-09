import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from './safeStorage';

/**
 * A tiny observable store persisted to Web Storage.
 *
 * It can be read outside React (for example by the API client, to add a header) and inside
 * React through `useStore`, which re-renders when the value changes.
 */
export interface PersistedStore<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  useStore: () => T;
}

export function createPersistedStore<T>(
  kind: 'local' | 'session',
  key: string,
  initial: T,
): PersistedStore<T> {
  let value = readJson<T>(kind, key, initial);
  const listeners = new Set<() => void>();

  const get = () => value;

  const set: PersistedStore<T>['set'] = (next) => {
    value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
    writeJson(kind, key, value);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = () => useSyncExternalStore(subscribe, get, get);

  return { get, set, subscribe, useStore };
}
