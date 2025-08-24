import { toast, Toaster } from 'react-hot-toast';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import React from 'react';

// Custom toast styles
const toastStyle = {
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.95)',
  color: '#374151',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const darkToastStyle = {
  borderRadius: '12px',
  background: 'rgba(31, 41, 55, 0.95)',
  color: '#F9FAFB',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
};

// Custom toast component
const CustomToast = ({ 
  type, 
  title, 
  message, 
  isDark = false 
}: { 
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  isDark?: boolean;
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="flex items-start space-x-3 max-w-sm">
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </p>
        {message && (
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Toast notification functions
export const showToast = {
  success: (title: string, message?: string, isDark = false) => {
    toast.custom(
      <CustomToast type="success" title={title} message={message} isDark={isDark} />,
      {
        duration: 4000,
        style: isDark ? darkToastStyle : toastStyle,
      }
    );
  },

  error: (title: string, message?: string, isDark = false) => {
    toast.custom(
      <CustomToast type="error" title={title} message={message} isDark={isDark} />,
      {
        duration: 6000,
        style: isDark ? darkToastStyle : toastStyle,
      }
    );
  },

  warning: (title: string, message?: string, isDark = false) => {
    toast.custom(
      <CustomToast type="warning" title={title} message={message} isDark={isDark} />,
      {
        duration: 5000,
        style: isDark ? darkToastStyle : toastStyle,
      }
    );
  },

  info: (title: string, message?: string, isDark = false) => {
    toast.custom(
      <CustomToast type="info" title={title} message={message} isDark={isDark} />,
      {
        duration: 4000,
        style: isDark ? darkToastStyle : toastStyle,
      }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
      isDark = false,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
      isDark?: boolean;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading,
        success,
        error,
      },
      {
        style: isDark ? darkToastStyle : toastStyle,
        success: {
          duration: 4000,
        },
        error: {
          duration: 6000,
        },
      }
    );
  },
};

// Toaster component with custom configuration
export const AppToaster: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerClassName="!top-16 !right-4"
      toastOptions={{
        duration: 4000,
        style: isDark ? darkToastStyle : toastStyle,
        className: '',
        success: {
          style: {
            ...(isDark ? darkToastStyle : toastStyle),
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
          },
        },
        error: {
          style: {
            ...(isDark ? darkToastStyle : toastStyle),
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
          },
        },
      }}
    />
  );
};

// Hook to use toast notifications
export const useToast = () => {
  return {
    toast: showToast,
    dismiss: toast.dismiss,
    remove: toast.remove,
  };
};
