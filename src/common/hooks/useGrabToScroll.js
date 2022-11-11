import { useState } from 'react';

const useGrabToScroll = ({ ref, vertical, horizontal }) => {
  const [isScrollable, setIsScrollable] = useState(true);
  let position = { top: 0, left: 0, x: 0, y: 0 };
  const container = ref.current;
  const rect = container?.getBoundingClientRect();

  if (typeof document !== 'undefined') {
    const mouseMoveHandler = (e) => {
      // How far the mouse has been moved
      const dx = e.clientX - position.x;
      const dy = e.clientY - position.y;

      // Scroll the element
      if (vertical) {
        container.scrollTop = position.top - dy;
        if (container.scrollTop <= (rect.width - 27)) {
          setIsScrollable(true);
        } else {
          setIsScrollable(false);
        }
      }
      if (horizontal) {
        container.scrollLeft = position.left - dx;
        if (container.scrollLeft <= (rect.left - 27)) {
          setIsScrollable(true);
        } else {
          setIsScrollable(false);
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
    };
    return { grabToScroll, isScrollable };
  }
  return {
    grabToScroll: () => {},
    isScrollable,
  };
};

export default useGrabToScroll;
