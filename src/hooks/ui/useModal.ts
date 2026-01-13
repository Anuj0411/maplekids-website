import { useState, useCallback } from 'react';

interface UseModalReturn {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

/**
 * Modal State Management Hook
 * 
 * Manages modal open/close state with a clean API.
 * Provides open, close, and toggle functions.
 * 
 * @param initialState - Initial modal state (default: false)
 * @returns Modal state and control functions
 * 
 * @example
 * const { isOpen, open, close, toggle } = useModal();
 * 
 * return (
 *   <>
 *     <button onClick={open}>Open Modal</button>
 *     <Modal isOpen={isOpen} onClose={close}>
 *       <h2>Modal Content</h2>
 *       <button onClick={close}>Close</button>
 *     </Modal>
 *   </>
 * );
 * 
 * @example
 * // With initial state
 * const { isOpen, close } = useModal(true); // Modal starts open
 */
export const useModal = (initialState = false): UseModalReturn => {
	const [isOpen, setIsOpen] = useState(initialState);

	const open = useCallback(() => {
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
	}, []);

	const toggle = useCallback(() => {
		setIsOpen(prev => !prev);
	}, []);

	return {
		isOpen,
		open,
		close,
		toggle,
	};
};
