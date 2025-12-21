
import { UserProfile, Medication, HistoryRecord, Message } from '../types';

export class DatabaseService {
  private prefix = 'medos_';

  async init(): Promise<void> {
    // LocalStorage doesn't need async init, but keeping signature for compatibility
    return Promise.resolve();
  }

  private getStorageKey(storeName: string): string {
    return `${this.prefix}${storeName}`;
  }

  private rehydrateDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.rehydrateDates(item));
    }
    
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Simple heuristic for date strings
      if (typeof value === 'string' && key === 'timestamp' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        newObj[key] = new Date(value);
      } else if (typeof value === 'object') {
        newObj[key] = this.rehydrateDates(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const data = localStorage.getItem(this.getStorageKey(storeName));
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => this.rehydrateDates(item));
    } catch {
      return [];
    }
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const items = await this.getAll<any>(storeName);
    const key = storeName === 'users' || storeName === 'session' ? 'id' : (storeName === 'users' ? 'email' : 'id');
    // For the users store, we sometimes search by email, but the generic key logic here needs care.
    // In current app, 'users' uses email as key, 'session' uses 'id', others use 'id'.
    const searchKey = storeName === 'users' ? 'email' : 'id';
    return items.find(item => item[searchKey] === id) || null;
  }

  async save(storeName: string, data: any): Promise<void> {
    const items = await this.getAll<any>(storeName);
    const searchKey = storeName === 'users' ? 'email' : 'id';
    
    const index = items.findIndex(item => item[searchKey] === data[searchKey]);
    if (index !== -1) {
      items[index] = data;
    } else {
      items.push(data);
    }
    
    localStorage.setItem(this.getStorageKey(storeName), JSON.stringify(items));
  }

  async delete(storeName: string, id: string): Promise<void> {
    const items = await this.getAll<any>(storeName);
    const searchKey = storeName === 'users' ? 'email' : 'id';
    const filtered = items.filter(item => item[searchKey] !== id);
    localStorage.setItem(this.getStorageKey(storeName), JSON.stringify(filtered));
  }

  async clearStore(storeName: string): Promise<void> {
    localStorage.removeItem(this.getStorageKey(storeName));
  }
}

export const db = new DatabaseService();
