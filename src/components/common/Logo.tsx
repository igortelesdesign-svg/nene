import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSlogan = false,
}) => {
  const heights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  };

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <img
        src="/logomarca-e.png"
        alt="NENÊ"
        className={`${heights[size]} w-auto object-contain`}
      />

      {showSlogan && (
        <span className="text-xs font-medium tracking-tight mt-0.5 text-[#89A589]">
          Cuidar fica mais leve.
        </span>
      )}
    </div>
  );
};
