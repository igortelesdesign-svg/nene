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
    <img
      src="/favicon-e.png"
      alt="NENÊ"
      width={size}
      height={size}
      className={`object-cover shrink-0 ${rounded ? 'rounded-2xl' : ''} ${className}`}
    />
  );
};
