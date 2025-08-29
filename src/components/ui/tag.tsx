import React from 'react';

type TagProps = {
  children: React.ReactNode;
  color?: string;
};

export const Tag: React.FC<TagProps> = ({ children, color }) => {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-lg text-xs"
      style={{ backgroundColor: color ? `${color}20` : 'var(--app-light-gray)', color: color || 'var(--app-text)' }}
    >
      {children}
    </span>
  );
};

export default Tag;

