import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

interface UseFormOptions<T> {
	initialValues: T;
	onSubmit: (values: T) => void | Promise<void>;
	validate?: (values: T) => Partial<Record<keyof T, string>>;
}

/**
 * Form State Management Hook
 * 
 * Handles form state, validation, and submission with a clean API.
 * Provides input handlers, validation, reset, and submit functionality.
 * 
 * @param options - Configuration options
 * @param options.initialValues - Initial form values
 * @param options.onSubmit - Submit handler function
 * @param options.validate - Optional validation function
 * 
 * @returns Form state and control functions
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit, isSubmitting, reset } = useForm({
 *   initialValues: { name: '', email: '' },
 *   onSubmit: async (values) => {
 *     await saveData(values);
 *   },
 *   validate: (values) => {
 *     const errors = {};
 *     if (!values.name) errors.name = 'Name is required';
 *     if (!values.email) errors.email = 'Email is required';
 *     return errors;
 *   }
 * });
 * 
 * @example
 * // In JSX
 * <form onSubmit={handleSubmit}>
 *   <input
 *     name="name"
 *     value={values.name}
 *     onChange={handleChange}
 *   />
 *   {errors.name && <span>{errors.name}</span>}
 *   <button type="submit" disabled={isSubmitting}>
 *     {isSubmitting ? 'Submitting...' : 'Submit'}
 *   </button>
 * </form>
 */
export const useForm = <T extends Record<string, any>>({
	initialValues,
	onSubmit,
	validate,
}: UseFormOptions<T>) => {
	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
	const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	/**
	 * Handle input change events
	 */
	const handleChange = useCallback((
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		
		// Handle checkbox separately
		const newValue = type === 'checkbox' 
			? (e.target as HTMLInputElement).checked 
			: value;

		setValues(prev => ({
			...prev,
			[name]: newValue,
		}));

		// Clear error for this field when user starts typing
		if (errors[name as keyof T]) {
			setErrors(prev => ({
				...prev,
				[name]: undefined,
			}));
		}
	}, [errors]);

	/**
	 * Handle field blur to mark as touched
	 */
	const handleBlur = useCallback((
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name } = e.target;
		setTouched(prev => ({
			...prev,
			[name]: true,
		}));
	}, []);

	/**
	 * Set a specific field value programmatically
	 */
	const setFieldValue = useCallback((name: keyof T, value: any) => {
		setValues(prev => ({
			...prev,
			[name]: value,
		}));
	}, []);

	/**
	 * Set a specific field error
	 */
	const setFieldError = useCallback((name: keyof T, error: string) => {
		setErrors(prev => ({
			...prev,
			[name]: error,
		}));
	}, []);

	/**
	 * Reset form to initial values
	 */
	const reset = useCallback(() => {
		setValues(initialValues);
		setErrors({});
		setTouched({});
		setIsSubmitting(false);
	}, [initialValues]);

	/**
	 * Validate all fields
	 */
	const validateForm = useCallback(() => {
		if (!validate) return {};
		
		const validationErrors = validate(values);
		setErrors(validationErrors);
		return validationErrors;
	}, [validate, values]);

	/**
	 * Handle form submission
	 */
	const handleSubmit = useCallback(async (e?: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();

		// Validate form
		const validationErrors = validateForm();
		
		// Check if there are any errors
		if (Object.keys(validationErrors).length > 0) {
			// Mark all fields as touched to show errors
			const allTouched = Object.keys(values).reduce((acc, key) => ({
				...acc,
				[key]: true,
			}), {} as Partial<Record<keyof T, boolean>>);
			setTouched(allTouched);
			return;
		}

		// Submit form
		try {
			setIsSubmitting(true);
			await onSubmit(values);
		} catch (error: any) {
			console.error('Form submission error:', error);
			// You can set a general error here if needed
		} finally {
			setIsSubmitting(false);
		}
	}, [values, validateForm, onSubmit]);

	return {
		values,
		errors,
		touched,
		isSubmitting,
		handleChange,
		handleBlur,
		handleSubmit,
		setFieldValue,
		setFieldError,
		reset,
		validateForm,
	};
};
