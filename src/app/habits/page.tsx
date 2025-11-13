'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { FaCheckCircle, FaPlus, FaTimes, FaFire, FaCalendarAlt } from 'react-icons/fa';
import { getWeekDates, isToday } from '@/lib/utils';

export default function HabitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    goal: 1,
    color: 'blue',
    icon: '✓',
  });

  const fetchHabits = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const [habitsRes, logsRes] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/habit-logs'),
      ]);
      if (habitsRes.ok) setHabits(await habitsRes.json());
      if (logsRes.ok) setHabitLogs(await logsRes.json());
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchHabits();
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const habitData = {
      ...formData,
      goal: parseInt(formData.goal.toString()),
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      if (editingHabit) {
        await fetch(`/api/habits/${editingHabit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });
      } else {
        await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });
      }
      await fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
      alert('Failed to save habit. Please try again.');
    }

    setShowModal(false);
    setEditingHabit(null);
    setFormData({ name: '', description: '', frequency: 'daily', goal: 1, color: 'blue', icon: '✓' });
  };

  const handleEdit = (habit: any) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
      goal: habit.goal,
      color: habit.color,
      icon: habit.icon || '✓',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        await fetch(`/api/habits/${id}`, { method: 'DELETE' });
        await fetchHabits();
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const toggleHabitLog = async (habitId: string) => {
    if (!session?.user?.id) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = habitLogs?.find(log =>
      log.habitId === habitId &&
      new Date(log.date).toDateString() === today.toDateString()
    );

    try {
      if (existingLog) {
        await fetch(`/api/habit-logs/${existingLog.id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/habit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habitId,
            userId: session.user.id,
            date: today,
            completed: true,
            createdAt: new Date(),
          }),
        });
      }
      await fetchHabits();
    } catch (error) {
      console.error('Error toggling habit log:', error);
    }
  };

  const getStreak = (habitId: string) => {
    if (!habitLogs) return 0;

    const logs = habitLogs
      .filter(log => log.habitId === habitId && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (logs.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const isCompletedToday = (habitId: string) => {
    if (!habitLogs) return false;
    const today = new Date().toDateString();
    return habitLogs.some(log =>
      log.habitId === habitId &&
      new Date(log.date).toDateString() === today &&
      log.completed
    );
  };

  const weekDates = getWeekDates();
  const colors = [
    { value: 'blue', class: 'bg-blue-500' },
    { value: 'green', class: 'bg-green-500' },
    { value: 'purple', class: 'bg-purple-500' },
    { value: 'pink', class: 'bg-pink-500' },
    { value: 'orange', class: 'bg-orange-500' },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaCheckCircle className="text-purple-500" />
            Habits
          </h1>
          <p className="text-gray-600">Build better habits, one day at a time</p>
        </div>

        {/* Add Habit Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setEditingHabit(null);
              setFormData({ name: '', description: '', frequency: 'daily', goal: 1, color: 'blue', icon: '✓' });
              setShowModal(true);
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
          >
            <FaPlus /> New Habit
          </button>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          {habits?.map((habit) => {
            const colorClass = colors.find(c => c.value === habit.color)?.class || 'bg-blue-500';
            const streak = getStreak(habit.id!);
            const completedToday = isCompletedToday(habit.id!);
            const isTempHabit = habit.id?.startsWith('temp-');

            return (
              <div key={habit.id} className="bg-white rounded-xl p-6 shadow-md relative">
                {isTempHabit && (
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Syncing...
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center text-white text-2xl`}>
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-gray-600 text-sm">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 capitalize">
                          {habit.frequency} • Goal: {habit.goal}x
                        </span>
                        {streak > 0 && (
                          <span className="flex items-center gap-1 text-sm font-semibold text-orange-600">
                            <FaFire /> {streak} day streak!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(habit)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id!)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Week Calendar */}
                <div className="flex gap-2">
                  {weekDates.map((date, index) => {
                    const dateStr = date.toDateString();
                    const isCompleted = habitLogs?.some(log =>
                      log.habitId === habit.id &&
                      new Date(log.date).toDateString() === dateStr &&
                      log.completed
                    );
                    const isCurrentDay = isToday(date);
                    const isTempHabit = habit.id?.startsWith('temp-');

                    return (
                      <button
                        key={index}
                        onClick={() => isCurrentDay && !isTempHabit && toggleHabitLog(habit.id!)}
                        disabled={!isCurrentDay || isTempHabit}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          isCompleted
                            ? `${colorClass} border-transparent text-white`
                            : isCurrentDay && !isTempHabit
                            ? 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                        </div>
                        <div className="text-lg font-bold mt-1">
                          {date.getDate()}
                        </div>
                        {isCompleted && <div className="text-xl mt-1">✓</div>}
                      </button>
                    );
                  })}
                </div>

                {/* Today's Status */}
                <div className="mt-4 text-center">
                  {isTempHabit ? (
                    <span className="text-yellow-600 font-semibold">⏳ Syncing habit... Please wait</span>
                  ) : completedToday ? (
                    <span className="text-green-600 font-semibold">✓ Completed today!</span>
                  ) : (
                    <span className="text-gray-500">Click today to mark as complete</span>
                  )}
                </div>
              </div>
            );
          })}

          {(!habits || habits.length === 0) && (
            <div className="text-center py-16 bg-white rounded-xl">
              <FaCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-6">Start building better habits today</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Your First Habit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingHabit ? 'Edit Habit' : 'New Habit'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Habit Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Morning Exercise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="Optional description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Goal *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) || 1 })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-12 h-12 rounded-lg ${color.class} ${
                            formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      maxLength={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="✓"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
