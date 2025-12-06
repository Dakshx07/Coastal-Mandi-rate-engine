import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineAlert: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-center space-x-3 animate-slide-up">
            <WifiOff className="w-5 h-5 text-red-400" />
            <span className="text-sm font-bold">You are offline. App is running in offline mode.</span>
        </div>
    );
};
