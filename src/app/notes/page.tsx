'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/indexedDB';
import { syncManager } from '@/lib/db/syncManager';
import { FaStickyNote, FaPlus, FaTimes, FaSearch, FaThumbtack } from 'react-icons/fa';

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    color: 'yellow',
    isPinned: false,
  });

  const notes = useLiveQuery(() =>
    session?.user?.id ? db.notes.where('userId').equals(session.user.id).toArray() : []
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

    const noteData = {
      ...formData,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingNote) {
      await syncManager.updateItem('notes', editingNote.id, noteData);
    } else {
      await syncManager.addItem('notes', noteData);
    }

    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', category: '', color: 'yellow', isPinned: false });
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || '',
      color: note.color,
      isPinned: note.isPinned,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    if (confirm('Are you sure you want to delete this note?')) {
      await syncManager.deleteItem('notes', id, session.user.id);
    }
  };

  const togglePin = async (note: any) => {
    await syncManager.updateItem('notes', note.id, { isPinned: !note.isPinned });
  };

  const filteredNotes = notes?.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes?.filter(n => n.isPinned) || [];
  const regularNotes = filteredNotes?.filter(n => !n.isPinned) || [];

  const colorOptions = [
    { value: 'yellow', class: 'bg-yellow-100 border-yellow-300' },
    { value: 'blue', class: 'bg-blue-100 border-blue-300' },
    { value: 'green', class: 'bg-green-100 border-green-300' },
    { value: 'pink', class: 'bg-pink-100 border-pink-300' },
    { value: 'purple', class: 'bg-purple-100 border-purple-300' },
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
            <FaStickyNote className="text-yellow-500" />
            Notes
          </h1>
          <p className="text-gray-600">Capture your ideas and thoughts</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            />
          </div>
          <button
            onClick={() => {
              setEditingNote(null);
              setFormData({ title: '', content: '', category: '', color: 'yellow', isPinned: false });
              setShowModal(true);
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
          >
            <FaPlus /> New Note
          </button>
        </div>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaThumbtack className="text-primary-600" />
              Pinned Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePin={togglePin}
                  colorOptions={colorOptions}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        <div>
          {pinnedNotes.length > 0 && (
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Notes</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={togglePin}
                colorOptions={colorOptions}
              />
            ))}
          </div>

          {filteredNotes?.length === 0 && (
            <div className="text-center py-16">
              <FaStickyNote className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create Note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNote ? 'Edit Note' : 'New Note'}
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
                      placeholder="Enter note title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="Write your note here..."
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
                      placeholder="e.g., Personal, Work, Ideas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: option.value })}
                          className={`w-12 h-12 rounded-lg border-2 ${option.class} ${
                            formData.color === option.value ? 'ring-2 ring-primary-500' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700">
                      Pin this note
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
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

function NoteCard({ note, onEdit, onDelete, onTogglePin, colorOptions }: any) {
  const colorClass = colorOptions.find((c: any) => c.value === note.color)?.class || 'bg-yellow-100 border-yellow-300';

  return (
    <div className={`${colorClass} border-2 rounded-lg p-4 hover:shadow-lg transition-all relative group`}>
      <button
        onClick={() => onTogglePin(note)}
        className="absolute top-2 right-2 text-gray-500 hover:text-primary-600"
      >
        <FaThumbtack className={note.isPinned ? 'text-primary-600' : ''} />
      </button>

      <h3 className="font-bold text-gray-900 mb-2 pr-6">{note.title}</h3>
      <p className="text-gray-700 text-sm mb-3 line-clamp-4">{note.content}</p>

      {note.category && (
        <span className="inline-block px-2 py-1 bg-white bg-opacity-50 text-xs rounded-full mb-2">
          {note.category}
        </span>
      )}

      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(note)}
          className="flex-1 px-3 py-1 bg-white bg-opacity-80 text-gray-700 rounded hover:bg-opacity-100 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="flex-1 px-3 py-1 bg-red-500 bg-opacity-80 text-white rounded hover:bg-opacity-100 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
