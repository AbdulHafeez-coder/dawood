import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  variant?: 'horizontal' | 'compact';
}

export function Logo({ className, variant = 'horizontal', ...props }: LogoProps) {
  if (variant === 'compact') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={className}
        fill="currentColor"
        {...props}
      >
        <path d="M15 30 L85 30 L75 80 L25 80 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
        <path d="M35 30 C35 10, 65 10, 65 30" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <text
          x="50%"
          y="65%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fontFamily="'DM Sans', sans-serif"
          fill="currentColor"
        >
          DM
        </text>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 80"
      className={className}
      fill="currentColor"
      {...props}
    >
      <g transform="translate(10, 15)">
        {/* Shopping bag icon */}
        <path d="M5 20 L45 20 L38 55 L12 55 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
        <path d="M18 20 C18 5, 32 5, 32 20" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <text
          x="25"
          y="45"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fontFamily="'DM Sans', sans-serif"
          fill="currentColor"
        >
          DM
        </text>
      </g>
      <text
        x="70"
        y="45"
        dominantBaseline="middle"
        fontSize="36"
        fontWeight="bold"
        fontFamily="'DM Sans', sans-serif"
        letterSpacing="-0.03em"
        fill="currentColor"
      >
        DAWOOD MART
      </text>
    </svg>
  );
}
