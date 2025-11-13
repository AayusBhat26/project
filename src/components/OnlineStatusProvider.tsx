'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { syncManager } from '@/lib/db/syncManager';

interface OnlineStatusContextType {
  isOnline: boolean;
  isSyncing: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({
  isOnline: true,
  isSyncing: false,
});

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      console.log('🟢 Back online!');
      setIsOnline(true);

      if (session?.user?.id) {
        setIsSyncing(true);
        try {
          await syncManager.syncPendingChanges(session.user.id);
          await syncManager.fetchAndStoreData(session.user.id);
        } catch (error) {
          console.error('Sync error:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const handleOffline = () => {
      console.log('🔴 Offline mode');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [session]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, isSyncing }}>
      {children}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span>Offline Mode - Changes will sync when online</span>
        </div>
      )}
      {isSyncing && (
        <div className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span>Syncing data...</span>
        </div>
      )}
    </OnlineStatusContext.Provider>
  );
}

export const useOnlineStatus = () => useContext(OnlineStatusContext);
