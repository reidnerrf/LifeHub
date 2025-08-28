import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  activeTab: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, activeTab }) => {
  const getColor = () => {
    switch (activeTab) {
      case 'tasks':
        return 'bg-[var(--app-blue)]';
      case 'habits':
        return 'bg-[var(--app-green)]';
      case 'calendar':
        return 'bg-[var(--app-yellow)]';
      default:
        return 'bg-[var(--app-blue)]';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 right-6 w-14 h-14 ${getColor()} rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 z-50`}
    >
      <Plus size={24} />
    </button>
  );
};

export default FloatingActionButton;