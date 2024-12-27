import { openDB } from 'idb';

const DB_NAME = 'myDB';
const STORE_NAME = 'entities';

// Open the database and create it if it doesn't exist
export const initDB = async () => {
  const db = await openDB(DB_NAME, 2, { // Increment version to 2
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('entities', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('misc', { keyPath: 'id' });
      }
    },
  });
  return db;
};

// Save data to IndexedDB
export const saveEntities = async (data) => {
    if(!data) return;
    
    const entitiesWithId = {...data, id: 1};
    const db = await initDB();
    await db.put('entities', entitiesWithId);
};

export const saveMisc = async(data) => {
    if(!data) return;

    const miscWithId = {...data, id: 1};
    const db = await initDB();
    await db.put('misc', miscWithId);
}

// Get data from IndexedDB
export const getEntities = async () => {
  const db = await initDB();
  return await db.get('entities', 1);
};

export const getMisc = async() => {
  const db = await initDB();
  return await db.get('misc', 1);
}

/**
 * Saves the necessary state to the local db
 * @param {*} data Should contain the entities, and the 'misc' slice
 */
export const saveState = async (data) => {
    const entities = data.entities;
    const misc = data.misc;
    if(!entities || !misc) return;
    await saveMisc(misc);
    await saveEntities(entities);
}

export const getState = async () => {
  const entities = await getEntities();
  const misc = await getMisc();
  return {entities: entities, misc: misc};
}
