import React from 'react';
import { TastyLogo } from './TastyLogo';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = true, 
  className = '',
  theme = 'light'
}) => {
  const logoSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  };

  const titleSizes = {
    sm: 'text-base font-black tracking-tight',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-3xl font-black tracking-tight'
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#121214]';
  const taglineColor = theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Circular Badge Logo */}
      <TastyLogo size={logoSizes[size]} />

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-display ${titleSizes[size]} ${textColor}`}>
            TASTY <span className="text-[#FF7700]">FOOD COURT</span>
          </span>
        </div>
        {showTagline && (
          <span className={`text-[11px] font-semibold ${taglineColor} tracking-wider mt-1`}>
            Quality You Can Taste <span className="text-[#FF7700]">·</span> Since 2024
          </span>
        )}
      </div>
    </div>
  );
};
