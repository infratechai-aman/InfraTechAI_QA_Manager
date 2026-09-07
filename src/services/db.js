import { firestore, isFirebaseConfigured } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Generate user-scoped storage keys
const getStorageKey = (key, userId) => {
  const scope = userId ? `_${userId}` : '_guest';
  return `qa_${key}_v2${scope}`;
};

// Safe JSON loader
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
};

// Safe JSON saver
const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
};

/**
 * Cloud sync helper scoped to the authenticated user's private collection:
 * /users/{userId}/qa_manager/{docId}
 */
const syncToFirestore = async (userId, docId, data) => {
  if (!isFirebaseConfigured || !firestore || !userId) return;
  try {
    const docRef = doc(firestore, 'users', userId, 'qa_manager', docId);
    await setDoc(docRef, { 
      payload: JSON.stringify(data), 
      updatedAt: new Date().toISOString(),
      ownerId: userId
    });
  } catch (error) {
    console.warn(`[Firebase] Failed to sync ${docId} to user ${userId}:`, error.message);
  }
};

export const db = {
  // --- Projects ---
  getProjects: (userId) => {
    const key = getStorageKey('projects', userId);
    return load(key, []);
  },
  saveProjects: (projects, userId) => {
    const key = getStorageKey('projects', userId);
    save(key, projects);
    syncToFirestore(userId, 'projects', projects);
  },

  // --- Test Files ---
  getFiles: (userId) => {
    const key = getStorageKey('files', userId);
    return load(key, []);
  },
  saveFiles: (files, userId) => {
    const key = getStorageKey('files', userId);
    save(key, files);
    syncToFirestore(userId, 'files', files);
  },

  // --- Test Cases ---
  getTestCases: (userId) => {
    const key = getStorageKey('tests', userId);
    return load(key, []);
  },
  saveTestCases: (tests, userId) => {
    const key = getStorageKey('tests', userId);
    save(key, tests);
    syncToFirestore(userId, 'tests', tests);
  },

  // --- Bugs & Issues ---
  getBugs: (userId) => {
    const key = getStorageKey('bugs', userId);
    return load(key, []);
  },
  saveBugs: (bugs, userId) => {
    const key = getStorageKey('bugs', userId);
    save(key, bugs);
    syncToFirestore(userId, 'bugs', bugs);
  },

  // --- Wipe User Data ---
  wipeAllData: async (userId) => {
    localStorage.removeItem(getStorageKey('projects', userId));
    localStorage.removeItem(getStorageKey('files', userId));
    localStorage.removeItem(getStorageKey('tests', userId));
    localStorage.removeItem(getStorageKey('bugs', userId));
    
    if (isFirebaseConfigured && firestore && userId) {
      try {
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'projects'), { payload: '[]' });
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'files'), { payload: '[]' });
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'tests'), { payload: '[]' });
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'bugs'), { payload: '[]' });
      } catch (err) {
        console.warn('[Firebase] Clear cloud error for user:', err);
      }
    }
  },

  // --- Cloud Pull (Loads this user's private data from Firestore) ---
  pullFromFirestore: async (userId) => {
    if (!isFirebaseConfigured || !firestore || !userId) return null;
    try {
      const [projSnap, filesSnap, testsSnap, bugsSnap] = await Promise.all([
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'projects')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'files')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'tests')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'bugs')),
      ]);

      const result = {};
      if (projSnap.exists() && projSnap.data().payload) {
        result.projects = JSON.parse(projSnap.data().payload);
        save(getStorageKey('projects', userId), result.projects);
      }
      if (filesSnap.exists() && filesSnap.data().payload) {
        result.files = JSON.parse(filesSnap.data().payload);
        save(getStorageKey('files', userId), result.files);
      }
      if (testsSnap.exists() && testsSnap.data().payload) {
        result.tests = JSON.parse(testsSnap.data().payload);
        save(getStorageKey('tests', userId), result.tests);
      }
      if (bugsSnap.exists() && bugsSnap.data().payload) {
        result.bugs = JSON.parse(bugsSnap.data().payload);
        save(getStorageKey('bugs', userId), result.bugs);
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (err) {
      console.warn('[Firebase] Could not pull from Firestore for user:', err);
      return null;
    }
  },

  // --- Export User Backup ---
  exportToJson: (userId) => {
    const data = {
      userId,
      projects: db.getProjects(userId),
      files: db.getFiles(userId),
      tests: db.getTestCases(userId),
      bugs: db.getBugs(userId),
      exportedAt: new Date().toISOString(),
      version: '2.1'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfratechAI_QA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // --- Import Backup ---
  importFromJson: (jsonData, userId) => {
    if (!jsonData || typeof jsonData !== 'object') throw new Error('Invalid backup file');
    if (Array.isArray(jsonData.projects)) db.saveProjects(jsonData.projects, userId);
    if (Array.isArray(jsonData.files)) db.saveFiles(jsonData.files, userId);
    if (Array.isArray(jsonData.tests)) db.saveTestCases(jsonData.tests, userId);
    if (Array.isArray(jsonData.bugs)) db.saveBugs(jsonData.bugs, userId);
  }
};
