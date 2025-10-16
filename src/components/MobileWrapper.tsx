import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileWrapperProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Mobile-first wrapper component that provides consistent spacing
 * and ensures content doesn't overlap with bottom navigation
 */
export const MobileWrapper = ({ 
  children, 
  className,
  noPadding = false 
}: MobileWrapperProps) => {
  return (
    <div 
      className={cn(
        "page-container w-full",
        !noPadding && "px-4 sm:px-6 md:px-8",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MobileWrapper;
