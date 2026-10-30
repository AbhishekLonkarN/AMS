import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Off by default: data stores reset to seed on every reload. Turn on to keep
 * demo edits in localStorage between reloads (clear site data to reset).
 */
export const IS_PERSISTENCE_ENABLED = false;

const STORAGE_PREFIX = 'clintech';

/** Creates a data store, persisted to localStorage only when the flag is on. */
export function createAppStore<T>(name: string, creator: StateCreator<T>) {
  if (!IS_PERSISTENCE_ENABLED) return create<T>()(creator);
  return create<T>()(persist(creator as any, { name: `${STORAGE_PREFIX}:${name}` }) as any);
}

/** The session always survives reloads (sessionStorage) so HMR/refresh keeps you logged in. */
export function createSessionStore<T>(name: string, creator: StateCreator<T>) {
  return create<T>()(
    persist(creator as any, {
      name: `${STORAGE_PREFIX}:${name}`,
      storage: createJSONStorage(() => sessionStorage),
    }) as any,
  );
}
