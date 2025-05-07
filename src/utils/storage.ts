import { UserPreferences } from '../types';

const STORAGE_KEYS = {
  USER_PREFERENCES: 'quiz-app-preferences',
  SAVED_QUIZZES: 'quiz-app-saved-quizzes',
  QUIZ_HISTORY: 'quiz-app-history',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  timePerQuestion: 30,
  restartOnError: false,
  showExplanations: 'depois',
  theme: 'light',
  shuffleQuestions: false,
};

export const getUserPreferences = (): UserPreferences => {
  try {
    const storedPrefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!storedPrefs) return DEFAULT_PREFERENCES;
    
    const parsedPrefs = JSON.parse(storedPrefs) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsedPrefs };
  } catch (error) {
    console.error('Error reading preferences from localStorage:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const saveUserPreferences = (prefs: Partial<UserPreferences>): void => {
  try {
    const currentPrefs = getUserPreferences();
    const updatedPrefs = { ...currentPrefs, ...prefs };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to localStorage key ${key}:`, error);
  }
};

export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) return defaultValue;
    return JSON.parse(storedData) as T;
  } catch (error) {
    console.error(`Error reading data from localStorage key ${key}:`, error);
    return defaultValue;
  }
};