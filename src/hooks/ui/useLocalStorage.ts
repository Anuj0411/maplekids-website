import { useState, useEffect, useCallback } from 'react';

/**
 * Local Storage Hook
 * 
 * Syncs state with localStorage for persistent data.
 * Automatically parses JSON and handles errors.
 * 
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns Tuple of [storedValue, setValue, removeValue]
 * 
 * @example
 * const [user, setUser, removeUser] = useLocalStorage('user', null);
 * 
 * // Set value (automatically stringified)
 * setUser({ name: 'John', email: 'john@example.com' });
 * 
 * // Remove value
 * removeUser();
 * 
 * @example
 * // With complex objects
 * const [preferences, setPreferences] = useLocalStorage('preferences', {
 *   theme: 'light',
 *   language: 'en',
 *   notifications: true,
 * });
 * 
 * // Update preference
 * setPreferences(prev => ({ ...prev, theme: 'dark' }));
 * 
 * @example
 * // Common use cases
 * const [token, setToken] = useLocalStorage('authToken', '');
 * const [cart, setCart] = useLocalStorage('cart', []);
 * const [settings, setSettings] = useLocalStorage('settings', {});
 */
export const useLocalStorage = <T>(
	key: string,
	initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
	// State to store our value
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}

		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	// Return a wrapped version of useState's setter function that
	// persists the new value to localStorage.
	const setValue = useCallback(
		(value: T | ((prev: T) => T)) => {
			try {
				// Allow value to be a function so we have same API as useState
				const valueToStore = value instanceof Function ? value(storedValue) : value;
				
				// Save state
				setStoredValue(valueToStore);
				
				// Save to local storage
				if (typeof window !== 'undefined') {
					window.localStorage.setItem(key, JSON.stringify(valueToStore));
				}
			} catch (error) {
				console.error(`Error setting localStorage key "${key}":`, error);
			}
		},
		[key, storedValue]
	);

	// Remove value from localStorage
	const removeValue = useCallback(() => {
		try {
			setStoredValue(initialValue);
			if (typeof window !== 'undefined') {
				window.localStorage.removeItem(key);
			}
		} catch (error) {
			console.error(`Error removing localStorage key "${key}":`, error);
		}
	}, [key, initialValue]);

	// Listen for changes in other tabs/windows
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue !== null) {
				try {
					setStoredValue(JSON.parse(e.newValue));
				} catch (error) {
					console.error(`Error parsing localStorage value for key "${key}":`, error);
				}
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, [key]);

	return [storedValue, setValue, removeValue];
};
