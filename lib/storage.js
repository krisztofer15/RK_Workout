import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ellenőrizzük, hogy a kód böngészőben fut-e
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const storage = isBrowser
  ? {
      getItem: async (key) => Promise.resolve(window.localStorage.getItem(key) || null),
      setItem: async (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: async (key) => Promise.resolve(window.localStorage.removeItem(key)),
    }
  : AsyncStorage;

export default storage;
