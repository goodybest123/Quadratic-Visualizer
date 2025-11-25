import React from 'react';

interface InfoCardProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, fullWidth = false }) => {
  return (
    <div className={`bg-[#2c313a] p-2 rounded-md ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-sm text-gray-200 truncate">{value}</div>
    </div>
  );
};