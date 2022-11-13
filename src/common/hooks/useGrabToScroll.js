import { useEffect, useState } from 'react';

const useGrabToScroll = ({ ref, vertical, horizontal }) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [isContentScrollable, setIsContentScrollable] = useState(false);
  let position = { top: 0, left: 0, x: 0, y: 0 };
  const container = ref.current;
  const rect = container?.getBoundingClientRect();
  const isVerticalScrollable = container?.scrollHeight > rect?.height;
  const isHorizontalScrollable = container?.scrollWidth > rect?.width;

  // Detect if ref is scrollable
  useEffect(() => {
    if (isVerticalScrollable || isHorizontalScrollable) {
      setIsScrollable(true);
      setIsContentScrollable(true);
    } else {
      setIsScrollable(false);
      setIsContentScrollable(false);
    }
  }, [container?.scrollWidth]);

  if (typeof document !== 'undefined') {
    const mouseMoveHandler = (e) => {
      // How far the mouse has been moved
      const dx = e.clientX - position.x;
      const dy = e.clientY - position.y;

      // If vertical scroll has reached the end
      if (vertical && isVerticalScrollable) {
        container.scrollTop = position.top - dy;
        if (container.scrollTop <= (container?.scrollHeight - (rect.height + 1))) {
          setIsScrollable(true);
        } else {
          setIsScrollable(false);
        }
      }

      // If horizontal scroll has reached the end
      if (horizontal && isHorizontalScrollable) {
        container.scrollLeft = position.left - dx;
        if (container.scrollLeft >= (container.scrollWidth - (rect.width + 1))) {
          setIsScrollable(false);
        } else {
          setIsScrollable(true);
        }
      }
    };
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);

      container.style.cursor = 'grab';
      container.style.removeProperty('user-select');
    };
    const grabToScroll = (e) => {
      if (isContentScrollable) {
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
        position = {
          // The current scroll
          left: container.scrollLeft,
          top: container.scrollTop,
          // Get the current mouse position
          x: e.clientX,
          y: e.clientY,
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      } else {
        container.style.cursor = 'default';
        container.style.userSelect = 'none';
      }
    };
    return { grabToScroll, isScrollable };
  }
  return {
    grabToScroll: () => {},
    isScrollable,
  };
};

export default useGrabToScroll;
