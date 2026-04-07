import React from 'react';
import { cn } from './Button';

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    new: "bg-blue-100 text-blue-800",
    dispatched: "bg-red-100 text-red-800",
    received: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
