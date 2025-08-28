import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CheckCircle, Trash2, Edit3, Archive, Star } from 'lucide-react';

interface SwipeHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
    action: () => void;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
    action: () => void;
  };
  disabled?: boolean;
}

const SwipeHandler: React.FC<SwipeHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const SWIPE_THRESHOLD = 80;
  const MAX_TRANSLATE = 120;

  // Haptic feedback function
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleStart = useCallback((clientX: number) => {
    if (disabled || isAnimating) return;
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  }, [disabled, isAnimating]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || disabled) return;

    const deltaX = clientX - startX;
    const newTranslateX = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, deltaX));
    
    setCurrentX(clientX);
    setTranslateX(newTranslateX);

    // Haptic feedback at threshold
    if (Math.abs(newTranslateX) >= SWIPE_THRESHOLD && Math.abs(translateX) < SWIPE_THRESHOLD) {
      hapticFeedback('light');
    }
  }, [isDragging, startX, translateX, disabled, hapticFeedback]);

  const handleEnd = useCallback(() => {
    if (!isDragging || disabled) return;

    setIsDragging(false);
    setIsAnimating(true);

    const deltaX = currentX - startX;
    const shouldTriggerAction = Math.abs(deltaX) >= SWIPE_THRESHOLD;

    if (shouldTriggerAction) {
      hapticFeedback('medium');
      
      if (deltaX > 0 && rightAction) {
        rightAction.action();
      } else if (deltaX < 0 && leftAction) {
        leftAction.action();
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset position
    setTranslateX(0);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isDragging, currentX, startX, leftAction, rightAction, onSwipeLeft, onSwipeRight, disabled, hapticFeedback]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getActionOpacity = (side: 'left' | 'right') => {
    const absTranslate = Math.abs(translateX);
    if (side === 'left' && translateX < 0) {
      return Math.min(1, absTranslate / SWIPE_THRESHOLD);
    }
    if (side === 'right' && translateX > 0) {
      return Math.min(1, absTranslate / SWIPE_THRESHOLD);
    }
    return 0;
  };

  const getActionScale = (side: 'left' | 'right') => {
    const opacity = getActionOpacity(side);
    return 0.8 + (opacity * 0.2);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-[var(--app-card)] rounded-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{ userSelect: 'none' }}
    >
      {/* Left Action */}
      {leftAction && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center px-6"
          style={{
            background: leftAction.color,
            opacity: getActionOpacity('left'),
            transform: `scale(${getActionScale('left')})`,
            transition: isAnimating ? 'all 0.3s ease-out' : 'none'
          }}
        >
          <div className="flex flex-col items-center space-y-1 text-white">
            {leftAction.icon}
            <span className="text-xs font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action */}
      {rightAction && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center px-6"
          style={{
            background: rightAction.color,
            opacity: getActionOpacity('right'),
            transform: `scale(${getActionScale('right')})`,
            transition: isAnimating ? 'all 0.3s ease-out' : 'none'
          }}
        >
          <div className="flex flex-col items-center space-y-1 text-white">
            {rightAction.icon}
            <span className="text-xs font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isAnimating ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Predefined swipe actions for common use cases
export const SwipeActions = {
  complete: {
    icon: <CheckCircle size={20} />,
    label: 'Concluir',
    color: 'var(--app-green)',
    action: () => console.log('Complete action')
  },
  delete: {
    icon: <Trash2 size={20} />,
    label: 'Excluir',
    color: 'var(--app-red)',
    action: () => console.log('Delete action')
  },
  edit: {
    icon: <Edit3 size={20} />,
    label: 'Editar',
    color: 'var(--app-blue)',
    action: () => console.log('Edit action')
  },
  archive: {
    icon: <Archive size={20} />,
    label: 'Arquivar',
    color: 'var(--app-gray)',
    action: () => console.log('Archive action')
  },
  favorite: {
    icon: <Star size={20} />,
    label: 'Favoritar',
    color: 'var(--app-yellow)',
    action: () => console.log('Favorite action')
  }
};

export default SwipeHandler;