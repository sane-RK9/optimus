import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={`appearance-none w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 pl-3 pr-8 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = 'Select';