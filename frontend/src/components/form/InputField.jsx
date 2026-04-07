import React from 'react';
import { cn } from '../common/Button';

export function InputField({ label, name, type = 'text', error, register, required, options = [], ...props }) {
  const isCheckbox = type === 'checkbox';
  
  const inputClasses = cn(
    "px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
    error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
    isCheckbox ? "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" : "w-full"
  );

  return (
    <div className={cn("flex mb-4", isCheckbox ? "flex-row items-center space-x-3" : "flex-col space-y-1")}>
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && !isCheckbox && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={name}
          {...register(name, { required })}
          className={inputClasses}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          {...register(name, { required })}
          className={inputClasses}
          {...props}
        />
      )}
      
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
