import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  className = '',
  size = 'md',
  ...props
}) {
  const sizes = {
    sm: 'text-xs py-1.5 pl-3 pr-8',
    md: 'text-sm py-2 pl-3.5 pr-9',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition cursor-pointer ${sizes[size]}`}
        {...props}
      >
        {placeholder && !options.some((opt) => opt.value === '') && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export default Select;
