import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={`rounded-xl border bg-white text-gray-800 shadow-md ${className}`}
      {...props}
    >
      <div className="p-6">{children}</div>
    </div>
  );
};