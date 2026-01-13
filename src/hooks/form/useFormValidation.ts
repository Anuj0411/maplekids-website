/**
 * Form Validation Hook
 * 
 * Provides reusable validation rules and a validation builder.
 * Common validation patterns used across the application.
 */

export type ValidationRule<T = any> = (value: T) => string | undefined;

/**
 * Validation Rules Library
 */
export const validationRules = {
	/**
	 * Required field validation
	 */
	required: (message = 'This field is required'): ValidationRule => {
		return (value: any) => {
			if (value === undefined || value === null || value === '') {
				return message;
			}
			if (typeof value === 'string' && value.trim() === '') {
				return message;
			}
			return undefined;
		};
	},

	/**
	 * Email format validation
	 */
	email: (message = 'Invalid email address'): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(value) ? undefined : message;
		};
	},

	/**
	 * Minimum length validation
	 */
	minLength: (min: number, message?: string): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			const defaultMessage = `Must be at least ${min} characters`;
			return value.length >= min ? undefined : (message || defaultMessage);
		};
	},

	/**
	 * Maximum length validation
	 */
	maxLength: (max: number, message?: string): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			const defaultMessage = `Must be at most ${max} characters`;
			return value.length <= max ? undefined : (message || defaultMessage);
		};
	},

	/**
	 * Minimum value validation (for numbers)
	 */
	min: (min: number, message?: string): ValidationRule<number> => {
		return (value: number) => {
			if (value === undefined || value === null) return undefined;
			const defaultMessage = `Must be at least ${min}`;
			return value >= min ? undefined : (message || defaultMessage);
		};
	},

	/**
	 * Maximum value validation (for numbers)
	 */
	max: (max: number, message?: string): ValidationRule<number> => {
		return (value: number) => {
			if (value === undefined || value === null) return undefined;
			const defaultMessage = `Must be at most ${max}`;
			return value <= max ? undefined : (message || defaultMessage);
		};
	},

	/**
	 * Phone number validation (Indian format)
	 */
	phone: (message = 'Invalid phone number'): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			// Indian phone number: 10 digits, optionally starting with +91
			const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
			return phoneRegex.test(value.replace(/\s/g, '')) ? undefined : message;
		};
	},

	/**
	 * URL validation
	 */
	url: (message = 'Invalid URL'): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			try {
				new URL(value);
				return undefined;
			} catch {
				return message;
			}
		};
	},

	/**
	 * Pattern matching validation
	 */
	pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			return regex.test(value) ? undefined : message;
		};
	},

	/**
	 * Date validation (not in the past)
	 */
	futureDate: (message = 'Date must be in the future'): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			const selectedDate = new Date(value);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return selectedDate >= today ? undefined : message;
		};
	},

	/**
	 * Date validation (not in the future)
	 */
	pastDate: (message = 'Date must be in the past'): ValidationRule<string> => {
		return (value: string) => {
			if (!value) return undefined;
			const selectedDate = new Date(value);
			const today = new Date();
			today.setHours(23, 59, 59, 999);
			return selectedDate <= today ? undefined : message;
		};
	},

	/**
	 * Custom validation rule
	 */
	custom: <T = any>(validator: (value: T) => boolean, message: string): ValidationRule<T> => {
		return (value: T) => {
			if (value === undefined || value === null || value === '') return undefined;
			return validator(value) ? undefined : message;
		};
	},
};

/**
 * Compose multiple validation rules
 */
export const composeValidators = <T = any>(
	...validators: ValidationRule<T>[]
): ValidationRule<T> => {
	return (value: T) => {
		for (const validator of validators) {
			const error = validator(value);
			if (error) return error;
		}
		return undefined;
	};
};

/**
 * Form Validation Hook
 * 
 * Provides validation functionality and pre-built validation rules.
 * 
 * @example
 * const validation = useFormValidation();
 * 
 * const { values, errors, handleChange, handleSubmit } = useForm({
 *   initialValues: { name: '', email: '', age: 0 },
 *   onSubmit: async (values) => { ... },
 *   validate: (values) => ({
 *     name: validation.rules.required()(values.name),
 *     email: validation.composeValidators(
 *       validation.rules.required(),
 *       validation.rules.email()
 *     )(values.email),
 *     age: validation.rules.min(18, 'Must be 18 or older')(values.age),
 *   })
 * });
 */
export const useFormValidation = () => {
	return {
		rules: validationRules,
		composeValidators,
	};
};

/**
 * Validate an entire form object
 * 
 * @param values - Form values object
 * @param validationSchema - Object mapping field names to validation rules
 * @returns Object with validation errors
 * 
 * @example
 * const errors = validateForm(
 *   { name: '', email: 'invalid' },
 *   {
 *     name: validationRules.required(),
 *     email: composeValidators(
 *       validationRules.required(),
 *       validationRules.email()
 *     ),
 *   }
 * );
 */
export const validateForm = <T extends Record<string, any>>(
	values: T,
	validationSchema: Partial<Record<keyof T, ValidationRule>>
): Partial<Record<keyof T, string>> => {
	const errors: Partial<Record<keyof T, string>> = {};

	for (const key in validationSchema) {
		const validator = validationSchema[key];
		if (validator) {
			const error = validator(values[key]);
			if (error) {
				errors[key] = error;
			}
		}
	}

	return errors;
};
