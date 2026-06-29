import { MemoryItem, FamilyMember } from '../types';

export interface LocalMemoryRecord {
  id: string;
  title: string;
  type: 'photo' | 'video';
  file: Blob; // The raw binary File or Blob stored in IndexedDB
  chapter: string;
  date: string;
  description: string;
  tags: string[];
  constellationPos: { x: number; y: number };
}

export interface KeeperProfile {
  id: string; // usually 'active-keeper'
  name: string;
  email: string;
  councilTitle: string;
  realmDominion: string;
  avatarFile?: Blob; // optional raw uploaded avatar blob
  avatarUrl?: string; // fallback or initial URL
}

export interface LocalGroupMember {
  id: string;
  name: string;
  role: string;
  avatarFile?: Blob; // optional raw uploaded avatar blob
  avatarUrl?: string; // fallback or initial URL
  privateVault: boolean;
  permissionLevel: 'Sovereign' | 'Ranger' | 'Archivist' | 'Spellweaver' | 'Knight';
}

export interface AppConfig {
  id: string; // 'landing-config'
  landingHeading: string;
  landingSub: string;
}

const DB_NAME = 'fillory_vault_local_db';
const STORE_NAME = 'local_memories';
const CONFIG_STORE = 'app_config';
const PROFILE_STORE = 'keeper_profile';
const MEMBERS_STORE = 'group_members';
const DB_VERSION = 3; // Upgraded version to include other object stores

/**
 * Initializes the IndexedDB database and returns the IDBDatabase instance.
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event);
      reject(new Error('Failed to open magical IndexedDB storage.'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CONFIG_STORE)) {
        db.createObjectStore(CONFIG_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MEMBERS_STORE)) {
        db.createObjectStore(MEMBERS_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Retrieves all saved local memories from IndexedDB.
 */
export async function getLocalMemories(): Promise<LocalMemoryRecord[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error('Failed to scan local parchment archives.'));
    };

    request.onsuccess = () => {
      resolve(request.result as LocalMemoryRecord[]);
    };
  });
}

/**
 * Saves a new memory record into IndexedDB.
 */
export async function saveLocalMemory(record: LocalMemoryRecord): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onerror = () => {
      reject(new Error('Failed to seal the memory scroll in the database.'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Deletes a memory record from IndexedDB by ID.
 */
export async function deleteLocalMemory(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      reject(new Error('Failed to purge memory scroll from IndexedDB.'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * CONFIG_STORE functions
 */
export async function getAppConfig(): Promise<AppConfig | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONFIG_STORE], 'readonly');
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.get('landing-config');

    request.onerror = () => {
      reject(new Error('Failed to load landing page config.'));
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONFIG_STORE], 'readwrite');
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.put(config);

    request.onerror = () => {
      reject(new Error('Failed to save landing page config.'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * PROFILE_STORE functions
 */
export async function getKeeperProfile(): Promise<KeeperProfile | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROFILE_STORE], 'readonly');
    const store = transaction.objectStore(PROFILE_STORE);
    const request = store.get('active-keeper');

    request.onerror = () => {
      reject(new Error('Failed to load Keeper profile.'));
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

export async function saveKeeperProfile(profile: KeeperProfile): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROFILE_STORE], 'readwrite');
    const store = transaction.objectStore(PROFILE_STORE);
    const request = store.put(profile);

    request.onerror = () => {
      reject(new Error('Failed to save Keeper profile.'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * MEMBERS_STORE functions (Group members)
 */
export async function getGroupMembers(): Promise<LocalGroupMember[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEMBERS_STORE], 'readonly');
    const store = transaction.objectStore(MEMBERS_STORE);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error('Failed to load group members.'));
    };

    request.onsuccess = () => {
      resolve(request.result || []);
    };
  });
}

export async function saveGroupMember(member: LocalGroupMember): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEMBERS_STORE], 'readwrite');
    const store = transaction.objectStore(MEMBERS_STORE);
    const request = store.put(member);

    request.onerror = () => {
      reject(new Error('Failed to save group member.'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

export async function deleteGroupMember(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEMBERS_STORE], 'readwrite');
    const store = transaction.objectStore(MEMBERS_STORE);
    const request = store.delete(id);

    request.onerror = () => {
      reject(new Error('Failed to delete group member.'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}
