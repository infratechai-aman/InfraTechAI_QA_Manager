import { SEED_PROJECTS, SEED_FILES, SEED_TESTS, SEED_BUGS } from '../constants/seedData';
import { firestore, isFirebaseConfigured } from '../config/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const STORAGE_KEYS = {
  PROJECTS: 'qa_projects_v2',
  FILES: 'qa_files_v2',
  TESTS: 'qa_tests_v2',
  BUGS: 'qa_bugs_v2',
};

// Safe JSON parser
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

// Safe JSON serializer
const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
};

/**
 * Cloud sync helper to persist updates to Firestore when configured.
 */
const syncToFirestore = async (collectionName, docId, data) => {
  if (!isFirebaseConfigured || !firestore) return;
  try {
    const docRef = doc(firestore, collectionName, docId);
    await setDoc(docRef, { payload: JSON.stringify(data), updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn(`[Firebase] Failed to sync ${collectionName} to cloud:`, error.message);
  }
};

export const db = {
  // --- Projects ---
  getProjects: () => load(STORAGE_KEYS.PROJECTS, SEED_PROJECTS),
  saveProjects: (projects) => {
    save(STORAGE_KEYS.PROJECTS, projects);
    syncToFirestore('infratech_qa', 'projects', projects);
  },

  // --- Test Files ---
  getFiles: () => load(STORAGE_KEYS.FILES, SEED_FILES),
  saveFiles: (files) => {
    save(STORAGE_KEYS.FILES, files);
    syncToFirestore('infratech_qa', 'files', files);
  },

  // --- Test Cases ---
  getTestCases: () => load(STORAGE_KEYS.TESTS, SEED_TESTS),
  saveTestCases: (tests) => {
    save(STORAGE_KEYS.TESTS, tests);
    syncToFirestore('infratech_qa', 'tests', tests);
  },

  // --- Bugs & Issues ---
  getBugs: () => load(STORAGE_KEYS.BUGS, SEED_BUGS),
  saveBugs: (bugs) => {
    save(STORAGE_KEYS.BUGS, bugs);
    syncToFirestore('infratech_qa', 'bugs', bugs);
  },

  // --- Clear / Reset ---
  wipeAllData: async () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.FILES);
    localStorage.removeItem(STORAGE_KEYS.TESTS);
    localStorage.removeItem(STORAGE_KEYS.BUGS);
    
    if (isFirebaseConfigured && firestore) {
      try {
        await setDoc(doc(firestore, 'infratech_qa', 'projects'), { payload: '[]' });
        await setDoc(doc(firestore, 'infratech_qa', 'files'), { payload: '[]' });
        await setDoc(doc(firestore, 'infratech_qa', 'tests'), { payload: '[]' });
        await setDoc(doc(firestore, 'infratech_qa', 'bugs'), { payload: '[]' });
      } catch (err) {
        console.warn('[Firebase] Clear cloud error:', err);
      }
    }
  },

  // --- Cloud Pull (Initial Firebase load if cloud data exists) ---
  pullFromFirestore: async () => {
    if (!isFirebaseConfigured || !firestore) return null;
    try {
      const [projSnap, filesSnap, testsSnap, bugsSnap] = await Promise.all([
        getDoc(doc(firestore, 'infratech_qa', 'projects')),
        getDoc(doc(firestore, 'infratech_qa', 'files')),
        getDoc(doc(firestore, 'infratech_qa', 'tests')),
        getDoc(doc(firestore, 'infratech_qa', 'bugs')),
      ]);

      const result = {};
      if (projSnap.exists() && projSnap.data().payload) {
        result.projects = JSON.parse(projSnap.data().payload);
        save(STORAGE_KEYS.PROJECTS, result.projects);
      }
      if (filesSnap.exists() && filesSnap.data().payload) {
        result.files = JSON.parse(filesSnap.data().payload);
        save(STORAGE_KEYS.FILES, result.files);
      }
      if (testsSnap.exists() && testsSnap.data().payload) {
        result.tests = JSON.parse(testsSnap.data().payload);
        save(STORAGE_KEYS.TESTS, result.tests);
      }
      if (bugsSnap.exists() && bugsSnap.data().payload) {
        result.bugs = JSON.parse(bugsSnap.data().payload);
        save(STORAGE_KEYS.BUGS, result.bugs);
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (err) {
      console.warn('[Firebase] Could not pull from Firestore:', err);
      return null;
    }
  },

  // --- Export / Backup ---
  exportToJson: () => {
    const data = {
      projects: db.getProjects(),
      files: db.getFiles(),
      tests: db.getTestCases(),
      bugs: db.getBugs(),
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfratechAI_QA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // --- Import from Backup ---
  importFromJson: (jsonData) => {
    if (!jsonData || typeof jsonData !== 'object') throw new Error('Invalid backup file');
    if (Array.isArray(jsonData.projects)) db.saveProjects(jsonData.projects);
    if (Array.isArray(jsonData.files)) db.saveFiles(jsonData.files);
    if (Array.isArray(jsonData.tests)) db.saveTestCases(jsonData.tests);
    if (Array.isArray(jsonData.bugs)) db.saveBugs(jsonData.bugs);
  }
};
