import { CustomMonthImage } from '../types/calendar';

const DB_NAME = 'orbis_calendar_media_v1';
const STORE_NAME = 'custom_month_images';
const RECORD_KEY = 'by_month';

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadCustomImagesFromDb(): Promise<
  Record<number, CustomMonthImage>
> {
  try {
    const db = await openMediaDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);
      req.onsuccess = () => {
        const val = req.result;
        resolve(val && typeof val === 'object' ? val : {});
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

export async function saveCustomImagesToDb(
  images: Record<number, CustomMonthImage>
): Promise<void> {
  try {
    const db = await openMediaDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(images, RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore storage errors
  }
}
