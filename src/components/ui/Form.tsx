import React from 'react';
import { useForm, Controller, FieldValues, Path } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils';

// Form field types
interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

interface TextareaFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  rows?: number;
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

interface FormProps<T extends FieldValues> {
  onSubmit: (data: T) => void | Promise<void>;
  schema?: yup.ObjectSchema<T>;
  defaultValues?: Partial<T>;
  children: React.ReactNode;
  className?: string;
}

// Form context
const FormContext = React.createContext<any>(null);

// Main form component
export function Form<T extends FieldValues>({
  onSubmit,
  schema,
  defaultValues,
  children,
  className,
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: schema ? yupResolver(schema) as any : undefined,
    defaultValues: defaultValues as any,
  });

  const handleSubmit = methods.handleSubmit(onSubmit as any);

  return (
    <FormContext.Provider value={methods}>
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Form field component
export function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className,
  description,
}: FormFieldProps<T>) {
  const { theme } = useTheme();
  const methods = React.useContext(FormContext);
  
  if (!methods) {
    throw new Error('FormField must be used within a Form component');
  }

  const {
    control,
    formState: { errors },
  } = methods;

  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={name}
        className={cn(
          'block text-sm font-medium',
          theme === 'dark' ? 'text-white/90' : 'text-slate-700',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}
      >
        {label}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 rounded-xl border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              theme === 'dark'
                ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20',
              error && (theme === 'dark' ? 'border-red-400' : 'border-red-500'),
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        )}
      />
      
      {description && (
        <p className={cn(
          'text-xs',
          theme === 'dark' ? 'text-white/60' : 'text-slate-500'
        )}>
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

// Textarea field component
export function TextareaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  description,
  rows = 4,
}: TextareaFieldProps<T>) {
  const { theme } = useTheme();
  const methods = React.useContext(FormContext);
  
  if (!methods) {
    throw new Error('TextareaField must be used within a Form component');
  }

  const {
    control,
    formState: { errors },
  } = methods;

  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={name}
        className={cn(
          'block text-sm font-medium',
          theme === 'dark' ? 'text-white/90' : 'text-slate-700',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}
      >
        {label}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-vertical',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              theme === 'dark'
                ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20',
              error && (theme === 'dark' ? 'border-red-400' : 'border-red-500'),
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        )}
      />
      
      {description && (
        <p className={cn(
          'text-xs',
          theme === 'dark' ? 'text-white/60' : 'text-slate-500'
        )}>
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

// Select field component
export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  required = false,
  disabled = false,
  className,
  description,
}: SelectFieldProps<T>) {
  const { theme } = useTheme();
  const methods = React.useContext(FormContext);
  
  if (!methods) {
    throw new Error('SelectField must be used within a Form component');
  }

  const {
    control,
    formState: { errors },
  } = methods;

  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={name}
        className={cn(
          'block text-sm font-medium',
          theme === 'dark' ? 'text-white/90' : 'text-slate-700',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}
      >
        {label}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            id={name}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 rounded-xl border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              theme === 'dark'
                ? 'bg-white/10 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-blue-500/20',
              error && (theme === 'dark' ? 'border-red-400' : 'border-red-500'),
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      
      {description && (
        <p className={cn(
          'text-xs',
          theme === 'dark' ? 'text-white/60' : 'text-slate-500'
        )}>
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

// Submit button component
export function SubmitButton({
  children,
  loading = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const methods = React.useContext(FormContext);
  
  if (!methods) {
    throw new Error('SubmitButton must be used within a Form component');
  }

  const {
    formState: { isSubmitting },
  } = methods;

  const isLoading = loading || isSubmitting;

  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn(
        'w-full px-6 py-3 rounded-xl font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        theme === 'dark'
          ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Form validation schemas
export const createValidationSchemas = () => ({
  login: yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  }),

  signup: yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
    role: yup.string().oneOf(['attendee', 'organizer']).required('Role is required'),
  }),

  event: yup.object({
    title: yup.string().required('Event title is required'),
    description: yup.string().required('Description is required'),
    category: yup.string().required('Category is required'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup.string().required('End date is required'),
    maxAttendees: yup.number().positive('Must be a positive number').required('Max attendees is required'),
  }),

  profile: yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    bio: yup.string(),
    organizationName: yup.string(),
  }),
});

// Export Form as default
export default Form;
