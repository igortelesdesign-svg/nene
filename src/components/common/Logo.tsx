import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showSlogan = false,
}) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#133A34' : '#FFF6EE';
  const coralColor = '#F08A6B';

  const heights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  };

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className="flex items-center gap-1.5">
        <svg
          viewBox="0 0 480 160"
          className={`${heights[size]} w-auto`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="nenê"
        >
          {/* First 'n' */}
          <path
            d="M 40 140 L 40 75 C 40 52 56 42 74 42 C 92 42 108 52 108 75 L 108 140"
            stroke={textColor}
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* First 'e' */}
          <path
            d="M 195 95 C 195 65 174 42 145 42 C 114 42 92 68 92 102 C 92 136 116 155 148 155 C 172 155 188 144 196 130"
            stroke={textColor}
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 94 95 L 193 95"
            stroke={textColor}
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Second 'n' */}
          <path
            d="M 235 140 L 235 75 C 235 52 251 42 269 42 C 287 42 303 52 303 75 L 303 140"
            stroke={textColor}
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circumflex accent ^ over second 'e' in Coral */}
          <path
            d="M 368 28 L 392 6 L 416 28"
            stroke={coralColor}
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Second 'e' with circumflex */}
          <path
            d="M 440 95 C 440 65 419 42 390 42 C 359 42 337 68 337 102 C 337 136 361 155 393 155 C 417 155 433 144 441 130"
            stroke={textColor}
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 339 95 L 438 95"
            stroke={textColor}
            strokeWidth="24"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showSlogan && (
        <span
          className={`text-xs font-medium tracking-tight mt-0.5 ${
            isDark ? 'text-[#89A589]' : 'text-[#FFF6EE]/80'
          }`}
        >
          Cuidar fica mais leve.
        </span>
      )}
    </div>
  );
};
