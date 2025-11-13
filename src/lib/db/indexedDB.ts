import Dexie, { Table } from 'dexie';

export interface ITask {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  dueDate?: Date;
  category?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface INote {
  id?: string;
  title: string;
  content: string;
  category?: string;
  color: string;
  isPinned: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface IExpense {
  id?: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface IHabit {
  id?: string;
  name: string;
  description?: string;
  frequency: string;
  goal: number;
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface IHabitLog {
  id?: string;
  habitId: string;
  userId: string;
  date: Date;
  completed: boolean;
  note?: string;
  createdAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export class ProductivityDB extends Dexie {
  tasks!: Table<ITask>;
  notes!: Table<INote>;
  expenses!: Table<IExpense>;
  habits!: Table<IHabit>;
  habitLogs!: Table<IHabitLog>;

  constructor() {
    super('ProductivityHubDB');
    this.version(1).stores({
      tasks: '++id, userId, syncStatus, completed, dueDate',
      notes: '++id, userId, syncStatus, isPinned, updatedAt',
      expenses: '++id, userId, syncStatus, type, date',
      habits: '++id, userId, syncStatus',
      habitLogs: '++id, habitId, userId, syncStatus, date',
    });
  }
}

export const db = new ProductivityDB();
