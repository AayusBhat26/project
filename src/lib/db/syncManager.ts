import { db, ITask, INote, IExpense, IHabit, IHabitLog } from './indexedDB';

type SyncableItem = ITask | INote | IExpense | IHabit | IHabitLog;
type Collection = 'tasks' | 'notes' | 'expenses' | 'habits' | 'habitLogs';

class SyncManager {
  private isSyncing = false;
  private syncQueue: Set<string> = new Set();
  private idMappings: Map<string, string> = new Map(); // temp ID -> real ID

  async syncPendingChanges(userId: string): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress...');
      return;
    }

    if (!navigator.onLine) {
      console.log('Cannot sync: offline');
      return;
    }

    this.isSyncing = true;
    this.idMappings.clear();

    try {
      await this.syncCollection('tasks', userId, '/api/tasks');
      await this.syncCollection('notes', userId, '/api/notes');
      await this.syncCollection('expenses', userId, '/api/expenses');
      await this.syncCollection('habits', userId, '/api/habits');
      await this.syncCollection('habitLogs', userId, '/api/habit-logs');

      console.log('✅ All data synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncCollection(
    collection: Collection,
    userId: string,
    apiEndpoint: string
  ): Promise<void> {
    const table = db[collection] as any;
    const pendingItems = await table
      .where('syncStatus')
      .equals('pending')
      .and((item: SyncableItem) => item.userId === userId)
      .toArray();

    if (pendingItems.length === 0) {
      console.log(`No pending ${collection} to sync`);
      return;
    }

    console.log(`Syncing ${pendingItems.length} ${collection}...`);

    for (const item of pendingItems) {
      try {
        const method = item.id?.startsWith('temp-') ? 'POST' : 'PUT';
        const url = method === 'POST'
          ? apiEndpoint
          : `${apiEndpoint}/${item.id}`;

        // For habit logs, replace temp habitId with real ID if available
        let itemToSync = { ...item };
        if (collection === 'habitLogs' && (item as any).habitId?.startsWith('temp-')) {
          const realHabitId = this.idMappings.get((item as any).habitId);
          if (realHabitId) {
            itemToSync = { ...item, habitId: realHabitId };
          } else {
            console.error(`Cannot sync habit log - habit not synced yet:`, item.id);
            continue;
          }
        }

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemToSync),
        });

        if (response.ok) {
          const syncedItem = await response.json();
          const realId = syncedItem.id || syncedItem._id;

          // Store ID mapping for temp IDs
          if (item.id?.startsWith('temp-')) {
            this.idMappings.set(item.id, realId);
          }

          // Update local item with server ID and mark as synced
          await table.update(item.id, {
            id: realId,
            syncStatus: 'synced',
          });

          // For habit logs, also update the habitId to real ID
          if (collection === 'habitLogs' && itemToSync.habitId !== (item as any).habitId) {
            await table.update(item.id, {
              habitId: itemToSync.habitId,
            });
          }

          console.log(`✅ Synced ${collection} item:`, item.id, '→', realId);
        } else {
          const errorText = await response.text();
          console.error(`❌ Failed to sync ${collection} item:`, item.id);
          console.error(`Status: ${response.status}, Error:`, errorText);

          // Alert user about sync failure
          if (typeof window !== 'undefined') {
            console.warn(`⚠️ Data saved locally but not synced to server. Will retry when connection is restored.`);
          }
        }
      } catch (error) {
        console.error(`Failed to sync ${collection} item:`, item.id);
      }
    }
  }

  async fetchAndStoreData(userId: string): Promise<void> {
    if (!navigator.onLine) {
      console.log('📴 Offline: Using local data');
      return Promise.resolve();
    }

    try {
      // Add timeout to prevent hanging
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          fetch(url),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          ),
        ]);
      };

      // Fetch all data from server with timeout
      const [tasks, notes, expenses, habits, habitLogs] = await Promise.all([
        fetchWithTimeout('/api/tasks').then(r => r.json()).catch(() => []),
        fetchWithTimeout('/api/notes').then(r => r.json()).catch(() => []),
        fetchWithTimeout('/api/expenses').then(r => r.json()).catch(() => []),
        fetchWithTimeout('/api/habits').then(r => r.json()).catch(() => []),
        fetchWithTimeout('/api/habit-logs').then(r => r.json()).catch(() => []),
      ]);

      // Store in IndexedDB only if we got data
      if (tasks.length || notes.length || expenses.length || habits.length || habitLogs.length) {
        await Promise.all([
          tasks.length && db.tasks.bulkPut(tasks.map((t: any) => ({ ...t, syncStatus: 'synced' }))),
          notes.length && db.notes.bulkPut(notes.map((n: any) => ({ ...n, syncStatus: 'synced' }))),
          expenses.length && db.expenses.bulkPut(expenses.map((e: any) => ({ ...e, syncStatus: 'synced' }))),
          habits.length && db.habits.bulkPut(habits.map((h: any) => ({ ...h, syncStatus: 'synced' }))),
          habitLogs.length && db.habitLogs.bulkPut(habitLogs.map((l: any) => ({ ...l, syncStatus: 'synced' }))),
        ].filter(Boolean));

        console.log('✅ Data fetched and stored locally');
      } else {
        console.log('📴 No data from server, using cached data');
      }
    } catch (error) {
      console.log('📴 Failed to fetch from server, using cached data');
    }
  }

  async addItem<T extends SyncableItem>(
    collection: Collection,
    item: Omit<T, 'id' | 'syncStatus'>
  ): Promise<string> {
    const table = db[collection] as any;
    const newItem: any = {
      ...item,
      id: `temp-${Date.now()}-${Math.random()}`,
      syncStatus: navigator.onLine ? 'pending' : 'pending',
    };

    await table.add(newItem);

    if (navigator.onLine) {
      this.syncPendingChanges(item.userId);
    }

    return newItem.id;
  }

  async updateItem<T extends SyncableItem>(
    collection: Collection,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    const table = db[collection] as any;
    await table.update(id, {
      ...updates,
      syncStatus: 'pending',
      updatedAt: new Date(),
    });

    if (navigator.onLine) {
      const item = await table.get(id);
      this.syncPendingChanges(item.userId);
    }
  }

  async deleteItem(collection: Collection, id: string, userId: string): Promise<void> {
    const table = db[collection] as any;

    if (navigator.onLine) {
      try {
        const apiMap: Record<Collection, string> = {
          tasks: '/api/tasks',
          notes: '/api/notes',
          expenses: '/api/expenses',
          habits: '/api/habits',
          habitLogs: '/api/habit-logs',
        };

        await fetch(`${apiMap[collection]}/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting from server:', error);
      }
    }

    await table.delete(id);
  }

  async clearUserData(userId: string): Promise<void> {
    await Promise.all([
      db.tasks.where('userId').equals(userId).delete(),
      db.notes.where('userId').equals(userId).delete(),
      db.expenses.where('userId').equals(userId).delete(),
      db.habits.where('userId').equals(userId).delete(),
      db.habitLogs.where('userId').equals(userId).delete(),
    ]);
    console.log('✅ Local data cleared');
  }
}

export const syncManager = new SyncManager();
