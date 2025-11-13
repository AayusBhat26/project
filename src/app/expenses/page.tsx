'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/indexedDB';
import { syncManager } from '@/lib/db/syncManager';
import { FaMoneyBillWave, FaPlus, FaTimes, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const expenses = useLiveQuery(() =>
    session?.user?.id ? db.expenses.where('userId').equals(session.user.id).toArray() : []
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

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingExpense) {
      await syncManager.updateItem('expenses', editingExpense.id, expenseData);
    } else {
      await syncManager.addItem('expenses', expenseData);
    }

    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      title: '',
      amount: '',
      category: 'other',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      type: expense.type,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    if (confirm('Are you sure you want to delete this transaction?')) {
      await syncManager.deleteItem('expenses', id, session.user.id);
    }
  };

  const filteredExpenses = expenses?.filter(e =>
    filterType === 'all' ? true : e.type === filterType
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  const totalIncome = expenses?.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalExpenses = expenses?.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0) || 0;
  const balance = totalIncome - totalExpenses;

  const categories = [
    { value: 'food', label: 'Food & Dining', icon: '🍔' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'bills', label: 'Bills & Utilities', icon: '📄' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'health', label: 'Health & Fitness', icon: '🏥' },
    { value: 'other', label: 'Other', icon: '📦' },
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
            <FaMoneyBillWave className="text-green-500" />
            Expenses
          </h1>
          <p className="text-gray-600">Track your income and expenses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Income</span>
              <FaArrowUp className="text-green-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Expenses</span>
              <FaArrowDown className="text-red-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Balance</span>
              <FaChartLine className="text-blue-500 text-xl" />
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Filter and Add Button */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterType === 'income' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterType === 'expense' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Expenses
            </button>
          </div>

          <button
            onClick={() => {
              setEditingExpense(null);
              setFormData({
                title: '',
                amount: '',
                category: 'other',
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                description: '',
              });
              setShowModal(true);
            }}
            className="ml-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Add Transaction
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16">
              <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-6">Start tracking your finances</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => {
                const category = categories.find(c => c.value === expense.category);
                return (
                  <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-3xl">{category?.icon || '📦'}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{expense.title}</h3>
                          <p className="text-sm text-gray-500">
                            {category?.label} • {formatDate(expense.date)}
                          </p>
                          {expense.description && (
                            <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`text-xl font-bold ${
                          expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id!)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  {editingExpense ? 'Edit Transaction' : 'New Transaction'}
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
                      Type *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                          formData.type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                          formData.type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Income
                      </button>
                    </div>
                  </div>

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
                      placeholder="e.g., Grocery shopping"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
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
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    {editingExpense ? 'Update' : 'Add Transaction'}
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
