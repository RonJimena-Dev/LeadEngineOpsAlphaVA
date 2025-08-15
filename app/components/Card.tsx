'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  hover?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'lg',
  border = true,
  hover = false
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  const baseClasses = `bg-white dark:bg-gray-800 rounded-xl ${shadowClasses[shadow]} transition-all duration-300`;
  const borderClasses = border ? 'border border-gray-200 dark:border-gray-700' : '';
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-[1.02]' : '';

  return (
    <div className={`${baseClasses} ${borderClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
