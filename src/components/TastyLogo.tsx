import React from 'react';

interface TastyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TastyLogo: React.FC<TastyLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative inline-block select-none shrink-0 ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Outer Orange Ring with Black Border */}
        <circle cx="150" cy="150" r="142" fill="#FF7700" stroke="#111113" strokeWidth="6" />

        {/* Inner White Field with Black Border */}
        <circle cx="150" cy="150" r="114" fill="#FFFFFF" stroke="#111113" strokeWidth="6" />

        {/* Thin Inner Concentric Black Circle */}
        <circle cx="150" cy="150" r="82" fill="none" stroke="#111113" strokeWidth="4.5" />

        {/* Left Orange Banner (ESTD) */}
        <path
          d="M 6 126 L 80 126 L 80 174 L 6 174 Z"
          fill="#FF7700"
          stroke="#111113"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <text
          x="43"
          y="157"
          textAnchor="middle"
          fill="#111113"
          fontSize="22"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1"
        >
          ESTD
        </text>

        {/* Right Orange Banner (2024) */}
        <path
          d="M 220 126 L 294 126 L 294 174 L 220 174 Z"
          fill="#FF7700"
          stroke="#111113"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <text
          x="257"
          y="157"
          textAnchor="middle"
          fill="#111113"
          fontSize="22"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1"
        >
          2024
        </text>

        {/* Text Arc Path for "TASTY FOOD" */}
        <defs>
          <path
            id="tasty-food-arc"
            d="M 64 150 A 88 88 0 0 1 236 150"
            fill="none"
          />
        </defs>

        {/* Arched "TASTY FOOD" uppercase text */}
        <text>
          <textPath
            href="#tasty-food-arc"
            startOffset="50%"
            textAnchor="middle"
            fill="#111113"
            fontSize="28"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="5"
          >
            TASTY FOOD
          </textPath>
        </text>

        {/* Upper Accent Dots flanking TASTY FOOD */}
        <circle cx="68" cy="118" r="6" fill="#111113" />
        <circle cx="232" cy="118" r="6" fill="#111113" />

        {/* Lower Accent Dots */}
        <circle cx="78" cy="186" r="6" fill="#111113" />
        <circle cx="222" cy="186" r="6" fill="#111113" />

        {/* Center Calligraphic "Tasty" Script with Dynamic Underline Swoosh */}
        <g transform="translate(150, 146) rotate(-7)">
          {/* Custom vector calligraphy strokes matching the uploaded logo */}
          {/* Letter T */}
          <path
            d="M -54 -24 C -45 -26 -30 -27 -18 -25 C -15 -24 -17 -20 -23 -21 C -35 -21 -44 -19 -50 -18 C -52 -18 -55 -22 -54 -24 Z"
            fill="#111113"
          />
          <path
            d="M -34 -23 C -30 -22 -32 -14 -35 -2 C -38 12 -42 22 -44 26 C -45 28 -48 27 -47 24 C -44 14 -39 -2 -34 -23 Z"
            fill="#111113"
          />

          {/* Letter a */}
          <path
            d="M -22 6 C -27 5 -31 10 -31 16 C -31 22 -26 26 -20 26 C -14 26 -10 21 -10 16 C -10 11 -15 6 -20 6 C -23 6 -25 7 -26 9 C -26 8 -23 4 -19 4 C -16 4 -12 7 -11 9 L -9 8 C -11 5 -15 2 -20 2 C -27 2 -34 8 -34 16 C -34 24 -27 28 -18 28 C -11 28 -6 22 -6 14 C -6 9 -8 5 -10 2 L -7 2 C -8 7 -6 18 -6 27 L -3 27 C -3 18 -4 8 -3 4 C -6 4 -12 4 -22 6 Z"
            fill="#111113"
          />

          {/* Letter s */}
          <path
            d="M -4 21 C -2 21 0 19 0 17 C 0 14 -4 13 -7 11 C -11 9 -12 6 -12 3 C -12 -2 -7 -6 0 -6 C 3 -6 6 -5 8 -3 L 7 -1 C 5 -2 3 -3 0 -3 C -5 -3 -8 0 -8 3 C -8 5 -5 6 -2 8 C 3 10 5 13 5 17 C 5 22 0 25 -6 25 C -10 25 -13 23 -14 21 L -13 19 C -11 20 -8 21 -4 21 Z"
            fill="#111113"
            transform="translate(10, 2)"
          />

          {/* Letter t */}
          <path
            d="M 12 -12 L 15 -12 L 15 2 C 15 8 16 14 18 17 C 19 19 22 19 24 18 L 24 21 C 21 22 17 22 15 19 C 13 16 12 10 12 4 L 12 -12 Z"
            fill="#111113"
            transform="translate(8, 5)"
          />
          <path
            d="M 16 -3 L 26 -3 L 26 0 L 16 0 Z"
            fill="#111113"
            transform="translate(8, 5)"
          />

          {/* Letter y */}
          <path
            d="M 28 6 L 31 6 L 35 18 L 40 6 L 43 6 L 36 22 C 34 27 31 32 27 35 C 23 38 18 38 14 36 L 15 33 C 18 35 22 35 25 32 C 28 30 30 26 32 21 L 28 6 Z"
            fill="#111113"
            transform="translate(10, 2)"
          />

          {/* Dynamic Underline Swoosh from bottom of y */}
          <path
            d="M 44 26 C 24 33 -10 33 -40 28 C -46 27 -44 24 -38 25 C -10 30 20 30 42 24 C 44 24 45 25 44 26 Z"
            fill="#111113"
          />
        </g>
      </svg>
    </div>
  );
};
