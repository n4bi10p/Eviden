import React from 'react';

interface MacOSSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const MacOSSwitch: React.FC<MacOSSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-3">
      {label && (
        <span className="text-sm font-medium text-macos-gray-700">{label}</span>
      )}
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out
          ${checked ? 'bg-macos-green' : 'bg-macos-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-macos-green focus:ring-offset-2
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out shadow-lg
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

export default MacOSSwitch;
