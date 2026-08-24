import React from 'react';

interface AppIconProps {
  className?: string;
  size?: number;
  rounded?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({
  className = '',
  size = 48,
  rounded = true,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${
        rounded ? 'rounded-2xl' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="512" height="512" rx="128" fill="#133A34" />
        {/* Circumflex accent in coral #F08A6B */}
        <path
          d="M 205 160 L 256 105 L 307 160"
          stroke="#F08A6B"
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Rounded lowercase 'e' in warm white #FFF6EE */}
        <path
          d="M 345 285 C 345 230 310 190 256 190 C 200 190 160 235 160 295 C 160 358 202 400 262 400 C 298 400 328 385 344 365"
          stroke="#FFF6EE"
          strokeWidth="46"
          strokeLinecap="round"
        />
        <path
          d="M 164 285 L 340 285"
          stroke="#FFF6EE"
          strokeWidth="46"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
