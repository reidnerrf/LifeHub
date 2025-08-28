import React from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-[var(--app-light-gray)] rounded-2xl bg-[var(--app-card)]">
      {icon && (
        <div className="mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-[var(--app-text)] font-medium">{title}</h3>
      {description && (
        <p className="text-[var(--app-text-light)] text-sm mt-1">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

