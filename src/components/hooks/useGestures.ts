import { useCallback, useRef, useState, useEffect } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPullToRefresh?: () => void;
}

interface UseGesturesOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  pullToRefreshThreshold?: number;
  enableHapticFeedback?: boolean;
}

export const useGestures = (
  handlers: GestureHandlers,
  options: UseGesturesOptions = {}
) => {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 0.1,
    pullToRefreshThreshold = 100,
    enableHapticFeedback = true
  } = options;

  const startPos = useRef({ x: 0, y: 0, time: 0 });
  const lastTap = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const isLongPressed = useRef(false);
  const initialDistance = useRef(0);
  const currentScale = useRef(1);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || !('vibrate' in navigator)) return;
    
    const patterns = {
      light: [10],
      medium: [30],
      heavy: [50]
    };
    navigator.vibrate(patterns[type]);
  }, [enableHapticFeedback]);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };

    isLongPressed.current = false;

    // Handle pinch gesture
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
      currentScale.current = 1;
    }

    // Handle double tap
    if (now - lastTap.current < doubleTapDelay) {
      if (handlers.onDoubleTap) {
        hapticFeedback('light');
        handlers.onDoubleTap();
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }

    // Start long press timer
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        isLongPressed.current = true;
        hapticFeedback('medium');
        handlers.onLongPress!();
      }, longPressDelay);
    }
  }, [handlers, doubleTapDelay, longPressDelay, getDistance, hapticFeedback]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel long press if moved too much
    if (distance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && handlers.onPinch) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;
      
      if (Math.abs(scale - currentScale.current) > pinchThreshold) {
        currentScale.current = scale;
        handlers.onPinch(scale);
      }
    }

    // Handle pull to refresh
    if (handlers.onPullToRefresh && window.scrollY === 0 && deltaY > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(deltaY, pullToRefreshThreshold + 50));
      
      if (deltaY >= pullToRefreshThreshold) {
        hapticFeedback('light');
      }
    }
  }, [handlers, getDistance, pinchThreshold, pullToRefreshThreshold, hapticFeedback]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    const deltaTime = Date.now() - startPos.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }

    // Handle pull to refresh
    if (isPulling) {
      setIsPulling(false);
      if (pullDistance >= pullToRefreshThreshold && handlers.onPullToRefresh) {
        hapticFeedback('medium');
        handlers.onPullToRefresh();
      }
      setPullDistance(0);
      return;
    }

    // Don't process swipe if it was a long press
    if (isLongPressed.current) {
      return;
    }

    // Handle swipe gestures
    if (distance > swipeThreshold && deltaTime < 500) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && handlers.onSwipeRight) {
          hapticFeedback('light');
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          hapticFeedback('light');
          handlers.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && handlers.onSwipeDown) {
          hapticFeedback('light');
          handlers.onSwipeDown();
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          hapticFeedback('light');
          handlers.onSwipeUp();
        }
      }
    }
  }, [handlers, swipeThreshold, isPulling, pullDistance, pullToRefreshThreshold, hapticFeedback]);

  const gestureProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: {
      touchAction: 'none',
      userSelect: 'none' as const
    }
  };

  return {
    gestureProps,
    isPulling,
    pullDistance,
    pullProgress: Math.min(pullDistance / pullToRefreshThreshold, 1)
  };
};

// Hook for navigation gestures
export const useNavigationGestures = (
  onNavigateBack?: () => void,
  onNavigateForward?: () => void,
  onOpenMenu?: () => void
) => {
  return useGestures({
    onSwipeRight: onNavigateBack,
    onSwipeLeft: onNavigateForward,
    onSwipeDown: onOpenMenu
  });
};

// Hook for list item gestures
export const useListItemGestures = (
  onComplete?: () => void,
  onDelete?: () => void,
  onEdit?: () => void
) => {
  return useGestures({
    onSwipeRight: onComplete,
    onSwipeLeft: onDelete,
    onDoubleTap: onEdit,
    onLongPress: () => {
      // Show context menu
      console.log('Show context menu');
    }
  });
};

export default useGestures;