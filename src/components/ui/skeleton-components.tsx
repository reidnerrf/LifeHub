import React from 'react';
import { Skeleton } from './skeleton';

export const DashboardSkeleton: React.FC = () => (
  <div className="flex flex-col space-y-6 pb-6">
    {/* Header Skeleton */}
    <div className="p-6 bg-[var(--app-card)] rounded-3xl animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="w-6 h-6 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-4" />
      <div className="flex items-center space-x-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 bg-[var(--app-card)] rounded-2xl animate-pulse">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-3 w-20 mb-2" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Chart Skeleton */}
    <div className="p-6 bg-[var(--app-card)] rounded-2xl animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>

    {/* Timeline Skeleton */}
    <div className="p-6 bg-[var(--app-card)] rounded-2xl animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="w-3 h-3 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TasksViewSkeleton: React.FC = () => (
  <div className="flex flex-col space-y-6 pb-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>

    {/* Filters */}
    <div className="flex space-x-3 overflow-x-auto">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
      ))}
    </div>

    {/* Kanban Columns */}
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((col) => (
        <div key={col} className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((task) => (
              <div key={task} className="p-4 bg-[var(--app-card)] rounded-2xl animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-8 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CalendarViewSkeleton: React.FC = () => (
  <div className="flex flex-col space-y-6 pb-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-40" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
    </div>

    {/* Calendar Grid */}
    <div className="p-6 bg-[var(--app-card)] rounded-2xl animate-pulse">
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <Skeleton key={day} className="h-4 w-8 mx-auto" />
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-10 flex items-center justify-center">
            <Skeleton className="w-6 h-6" />
          </div>
        ))}
      </div>
    </div>

    {/* Today's Events */}
    <div className="p-6 bg-[var(--app-card)] rounded-2xl animate-pulse">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-3 bg-[var(--app-light-gray)] rounded-xl">
            <Skeleton className="w-3 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const HabitsViewSkeleton: React.FC = () => (
  <div className="flex flex-col space-y-6 pb-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>

    {/* Habits Grid */}
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-6 bg-[var(--app-card)] rounded-2xl animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="w-8 h-8 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-[var(--app-light-gray)] border-t-[var(--app-blue)] rounded-full animate-spin`} />
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[var(--app-light-gray)] flex items-center justify-center mb-6 text-[var(--app-gray)]">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-[var(--app-text)] mb-2">{title}</h3>
    <p className="text-[var(--app-text-light)] mb-6 max-w-sm leading-relaxed">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-3 bg-[var(--app-blue)] text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
      >
        {action.label}
      </button>
    )}
  </div>
);