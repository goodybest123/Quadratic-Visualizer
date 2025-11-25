import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

export const SliderInput: React.FC<SliderInputProps> = ({ label, value, onChange, min, max, step }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={`${label}-range`} className="w-8 font-mono text-sm text-gray-400">{label}</label>
      <input
        id={`${label}-range`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-20 px-2 py-1 text-sm bg-[#2c313a] border-0 rounded-md text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
      />
    </div>
  );
};