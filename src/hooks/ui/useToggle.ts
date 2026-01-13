import { useState, useCallback } from 'react';

type UseToggleReturn = [boolean, () => void, (value?: boolean) => void];

/**
 * Toggle State Hook
 * 
 * Manages boolean toggle state with a clean API.
 * Perfect for visibility toggles, feature flags, etc.
 * 
 * @param initialState - Initial toggle state (default: false)
 * @returns Tuple of [state, toggle, setValue]
 * 
 * @example
 * const [isVisible, toggleVisible] = useToggle();
 * 
 * return (
 *   <>
 *     <button onClick={toggleVisible}>
 *       {isVisible ? 'Hide' : 'Show'}
 *     </button>
 *     {isVisible && <div>Content</div>}
 *   </>
 * );
 * 
 * @example
 * // With set function
 * const [isEnabled, toggle, setEnabled] = useToggle(false);
 * 
 * // Toggle
 * toggle();
 * 
 * // Set explicitly
 * setEnabled(true);
 * setEnabled(false);
 * 
 * @example
 * // Common use cases
 * const [isMenuOpen, toggleMenu] = useToggle();
 * const [isDarkMode, toggleDarkMode] = useToggle(false);
 * const [showPassword, togglePassword] = useToggle(false);
 * const [isExpanded, toggleExpanded] = useToggle(false);
 */
export const useToggle = (initialState = false): UseToggleReturn => {
	const [state, setState] = useState(initialState);

	const toggle = useCallback(() => {
		setState(prev => !prev);
	}, []);

	const setValue = useCallback((value?: boolean) => {
		if (value === undefined) {
			setState(prev => !prev);
		} else {
			setState(value);
		}
	}, []);

	return [state, toggle, setValue];
};
