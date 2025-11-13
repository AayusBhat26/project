'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { syncManager } from '@/lib/db/syncManager';
import { FaSync, FaCheckCircle, FaExclamationTriangle, FaWifi } from 'react-icons/fa';

export default function SyncStatus() {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      if (session?.user?.id) {
        handleManualSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [session]);

  const handleManualSync = async () => {
    if (!session?.user?.id || !isOnline) return;

    setIsSyncing(true);
    setSyncError(false);

    try {
      await syncManager.syncPendingChanges(session.user.id);
      await syncManager.fetchAndStoreData(session.user.id);
      setLastSync(new Date());
      setSyncError(false);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(true);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!session) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3 border border-gray-200">
        {/* Online/Offline Indicator */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <FaWifi className="text-green-500" />
              <span className="text-xs text-gray-600">Online</span>
            </>
          ) : (
            <>
              <FaWifi className="text-red-500" />
              <span className="text-xs text-gray-600">Offline</span>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-gray-300"></div>

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <>
              <FaSync className="text-blue-500 animate-spin" />
              <span className="text-xs text-gray-600">Syncing...</span>
            </>
          ) : syncError ? (
            <>
              <FaExclamationTriangle className="text-yellow-500" />
              <span className="text-xs text-gray-600">Sync failed</span>
            </>
          ) : lastSync ? (
            <>
              <FaCheckCircle className="text-green-500" />
              <span className="text-xs text-gray-600">Synced</span>
            </>
          ) : (
            <>
              <FaSync className="text-gray-400" />
              <span className="text-xs text-gray-600">Ready</span>
            </>
          )}
        </div>

        {/* Manual Sync Button */}
        {isOnline && (
          <>
            <div className="h-4 w-px bg-gray-300"></div>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="text-xs px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <FaSync className={isSyncing ? 'animate-spin' : ''} />
              Sync Now
            </button>
          </>
        )}

        {syncError && (
          <span className="text-xs text-yellow-600">
            Check MongoDB connection
          </span>
        )}
      </div>
    </div>
  );
}
