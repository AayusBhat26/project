'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/indexedDB';
import { syncManager } from '@/lib/db/syncManager';
import {
  FaTasks,
  FaStickyNote,
  FaMoneyBillWave,
  FaCheckCircle,
  FaChartLine,
  FaPlus
} from 'react-icons/fa';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const tasks = useLiveQuery(() =>
    session?.user?.id ? db.tasks.where('userId').equals(session.user.id).toArray() : []
  );

  const notes = useLiveQuery(() =>
    session?.user?.id ? db.notes.where('userId').equals(session.user.id).toArray() : []
  );

  const expenses = useLiveQuery(() =>
    session?.user?.id ? db.expenses.where('userId').equals(session.user.id).toArray() : []
  );

  const habits = useLiveQuery(() =>
    session?.user?.id ? db.habits.where('userId').equals(session.user.id).toArray() : []
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.id) {
      // Sync in background
      syncManager.fetchAndStoreData(session.user.id);
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const activeTasks = tasks?.filter(t => !t.completed).length || 0;
  const totalNotes = notes?.length || 0;
  const thisMonthExpenses = expenses?.filter(e => {
    const date = new Date(e.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0) || 0;
  const activeHabits = habits?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your productivity overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/tasks" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaTasks className="text-blue-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{activeTasks}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Active Tasks</h3>
            <p className="text-sm text-gray-500 mt-1">Things to do today</p>
          </Link>

          <Link href="/notes" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaStickyNote className="text-yellow-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalNotes}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Notes</h3>
            <p className="text-sm text-gray-500 mt-1">Saved ideas & thoughts</p>
          </Link>

          <Link href="/expenses" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">${thisMonthExpenses.toFixed(0)}</span>
            </div>
            <h3 className="text-gray-600 font-medium">This Month</h3>
            <p className="text-sm text-gray-500 mt-1">Total expenses</p>
          </Link>

          <Link href="/habits" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-purple-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{activeHabits}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Active Habits</h3>
            <p className="text-sm text-gray-500 mt-1">Tracking daily</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
              <Link href="/tasks" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {tasks?.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={async () => {
                      if (session?.user?.id) {
                        await syncManager.updateItem('tasks', task.id!, {
                          completed: !task.completed,
                        });
                      }
                    }}
                    className="w-5 h-5 text-primary-600 rounded cursor-pointer"
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </span>
                  {task.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">High</span>
                  )}
                </div>
              ))}
              {(!tasks || tasks.length === 0) && (
                <p className="text-gray-500 text-center py-8">No tasks yet. Create your first task!</p>
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Notes</h2>
              <Link href="/notes" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {notes?.slice(0, 5).map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                </div>
              ))}
              {(!notes || notes.length === 0) && (
                <p className="text-gray-500 text-center py-8">No notes yet. Start writing!</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <Link
            href="/tasks"
            className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-all transform hover:scale-110"
            title="Add New Task"
          >
            <FaPlus className="text-2xl" />
          </Link>
        </div>
      </div>
    </div>
  );
}
