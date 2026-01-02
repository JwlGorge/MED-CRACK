import React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
}

export const Progress: React.FC<ProgressProps> = ({ value, className = "", ...props }) => (
  <div className={"w-full bg-gray-200 rounded-full h-2 " + className} {...props}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

export default Progress;
