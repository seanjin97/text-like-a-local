import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gemini-api-key';

export function useApiKey() {
    const [apiKey, setApiKeyState] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEY);
    });

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                setApiKeyState(e.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setApiKey = useCallback((key: string) => {
        localStorage.setItem(STORAGE_KEY, key);
        setApiKeyState(key);
    }, []);

    const clearApiKey = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setApiKeyState(null);
    }, []);

    return {
        apiKey,
        setApiKey,
        clearApiKey,
        hasApiKey: apiKey !== null && apiKey.length > 0,
    };
}
