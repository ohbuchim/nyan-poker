// hooks/index.ts

export { useSound } from './useSound';
export type { SoundName } from './useSound';

export {
  useLocalStorage,
  getItem,
  setItem,
  removeItem,
  STORAGE_VERSION,
  STORAGE_KEYS,
} from './useLocalStorage';

export { useSoundPlayedFlag } from './useSoundPlayedFlag';
