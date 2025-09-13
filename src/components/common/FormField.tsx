import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [x: string]: any;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  as = 'input',
  options = [],
  placeholder,
  required = false,
  disabled = false,
  size = 'md',
  className = '',
  ...rest
}) => {
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-5 py-4'
  }[size];

  const inputClasses = [
    'form-input',
    sizeClasses,
    error ? 'error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-field mb-4">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      {as === 'input' && (
        <input 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange} 
          type={type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...rest} 
        />
      )}
      
      {as === 'textarea' && (
        <textarea 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          rows={4}
          {...rest} 
        />
      )}
      
      {as === 'select' && (
        <select 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormField;
