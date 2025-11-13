'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/indexedDB';
import { syncManager } from '@/lib/db/syncManager';
import { FaCheckSquare, FaPlus, FaTimes, FaFlag, FaCalendarAlt, FaSquare } from 'react-icons/fa';

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: '',
    completed: false,
  });

  const tasks = useLiveQuery(() =>
    session?.user?.id ? db.tasks.where('userId').equals(session.user.id).toArray() : []
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.id) {
      // Sync in background
      syncManager.fetchAndStoreData(session.user.id);
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingTask) {
      await syncManager.updateItem('tasks', editingTask.id, taskData);
    } else {
      await syncManager.addItem('tasks', taskData);
    }

    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', category: '', completed: false });
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      category: task.category || '',
      completed: task.completed,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    if (confirm('Are you sure you want to delete this task?')) {
      await syncManager.deleteItem('tasks', id, session.user.id);
    }
  };

  const toggleComplete = async (task: any) => {
    if (!session?.user?.id) return;
    await syncManager.updateItem('tasks', task.id, {
      completed: !task.completed,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const isOverdue = (dueDate: any) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !tasks?.find(t => t.dueDate === dueDate)?.completed;
  };

  const filteredTasks = tasks?.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (filterStatus === 'active' && task.completed) return false;
    return true;
  }).sort((a, b) => {
    // Sort by completed status, then by priority, then by due date
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;

    if (aPriority !== bPriority) return aPriority - bPriority;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(t => t.completed).length || 0,
    active: tasks?.filter(t => !t.completed).length || 0,
    overdue: tasks?.filter(t => t.dueDate && isOverdue(t.dueDate) && !t.completed).length || 0,
  };

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
            <FaCheckSquare className="text-primary-500" />
            Tasks
          </h1>
          <p className="text-gray-600">Manage your tasks and stay organized</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-gray-600 text-sm">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-gray-600 text-sm">Active</div>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-gray-600 text-sm">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-gray-600 text-sm">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({ title: '', description: '', priority: 'medium', dueDate: '', category: '', completed: false });
              setShowModal(true);
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
          >
            <FaPlus /> New Task
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks?.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(task)}
                  className="mt-1 text-2xl text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {task.completed ? <FaCheckSquare /> : <FaSquare className="text-gray-400" />}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id!)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
                    </span>

                    {task.dueDate && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        isOverdue(task.dueDate) && !task.completed
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <FaCalendarAlt />
                        {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue(task.dueDate) && !task.completed && ' (Overdue)'}
                      </span>
                    )}

                    {task.category && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!filteredTasks || filteredTasks.length === 0) && (
            <div className="text-center py-16 bg-white rounded-xl">
              <FaCheckSquare className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6">Create your first task to get started</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Your First Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTask ? 'Edit Task' : 'New Task'}
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
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="Enter task title"
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
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Work, Personal, Shopping"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
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
