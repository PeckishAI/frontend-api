import { useLayoutEffect } from 'react';

/**
 * Locks the body scroll (often used in modal etc).
 * @param lock - (Optional) If true, it will lock the body scroll. If false, it will unlock the body scroll.
 */
export const useLockBodyScroll = (lock: boolean = true) => {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (lock) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (lock) {
        document.body.style.overflow = originalStyle;
      }
    };
  }, [lock]);
};
