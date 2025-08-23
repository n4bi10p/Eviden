import React from 'react';

interface MoonIconProps {
  className?: string;
  size?: number;
}

const MoonIcon: React.FC<MoonIconProps> = ({ className = '', size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" className="fill-gray-800 dark:fill-gray-800"/>
      <path 
        d="M12 8.5C12 12.6421 15.3579 16 19.5 16C18.3284 19.6569 14.8431 22.5 10.5 22.5C6.08172 22.5 2.5 18.9183 2.5 14.5C2.5 10.1569 5.34315 6.67157 9 5.5C10.1569 6.67157 12 7.5 12 8.5Z" 
        className="fill-yellow-400 dark:fill-yellow-400 stroke-yellow-500 dark:stroke-yellow-500"
        strokeWidth="0.5"
      />
    </svg>
  );
};

export default MoonIcon;
