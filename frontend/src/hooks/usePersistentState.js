import { useState, useEffect } from 'react';

/**
 * A custom hook that behaves like useState but syncs data to sessionStorage.
 * This ensures data survives a page refresh.
 * 
 * @param {string} key The unique string key for sessionStorage
 * @param {any} initialValue The default value if nothing is found in storage
 */
export function usePersistentState(key, initialValue) {
    // Lazy initialize to read from sessionStorage only on the first render
    const [state, setState] = useState(() => {
        try {
            const item = window.sessionStorage.getItem(key);
            if (item !== null) {
                return JSON.parse(item);
            }
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error);
        }
        return initialValue;
    });

    // Sync to sessionStorage whenever the state changes
    useEffect(() => {
        try {
            if (state === undefined) {
                window.sessionStorage.removeItem(key);
            } else {
                window.sessionStorage.setItem(key, JSON.stringify(state));
            }
        } catch (error) {
            console.warn(`Error setting sessionStorage key "${key}". Storage might be full:`, error);
        }
    }, [key, state]);

    return [state, setState];
}
