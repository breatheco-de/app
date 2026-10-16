/* eslint-disable no-unsafe-optional-chaining */
import { useCallback, useRef, useState } from 'react';

const useGrabToScroll = ({ ref, vertical, horizontal }) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const position = useRef({ top: 0, left: 0, x: 0, y: 0 });
  const axis = useRef({ vertical, horizontal });
  axis.current = { vertical, horizontal };

  const measure = useCallback(() => {
    const container = ref.current;
    if (!container) return { vertical: false, horizontal: false, content: false };
    const rect = container.getBoundingClientRect();
    const isVerticalScrollable = container.scrollHeight > rect.height + 1;
    const isHorizontalScrollable = container.scrollWidth > rect.width + 1;
    return {
      vertical: Boolean(axis.current.vertical && isVerticalScrollable),
      horizontal: Boolean(axis.current.horizontal && isHorizontalScrollable),
      content: isVerticalScrollable || isHorizontalScrollable,
    };
  }, [ref]);

  const grabToScroll = useCallback((e) => {
    const container = ref.current;
    if (!container?.style || typeof document === 'undefined') return;
    const flags = measure();
    if (!flags.content) {
      container.style.cursor = 'default';
      container.style.userSelect = 'none';
      return;
    }

    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
    position.current = {
      left: container.scrollLeft,
      top: container.scrollTop,
      x: e.clientX,
      y: e.clientY,
    };

    const mouseMoveHandler = (event) => {
      const el = ref.current;
      if (!el) return;
      const dx = event.clientX - position.current.x;
      const dy = event.clientY - position.current.y;
      const rect = el.getBoundingClientRect();
      const live = measure();

      if (live.vertical) {
        el.scrollTop = position.current.top - dy;
        const atEnd = el.scrollTop > (el.scrollHeight - rect.height - 1);
        setIsScrollable(!atEnd);
      }
      if (live.horizontal) {
        el.scrollLeft = position.current.left - dx;
        const remaining = el.scrollWidth - el.scrollLeft - rect.width;
        setIsScrollable(remaining > 1);
      }
    };
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.removeEventListener('mouseleave', mouseUpHandler);
      const el = ref.current;
      if (el?.style) {
        el.style.cursor = 'grab';
        el.style.removeProperty('user-select');
      }
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    document.addEventListener('mouseleave', mouseUpHandler);
  }, [measure, ref]);

  return { grabToScroll, isScrollable };
};

export default useGrabToScroll;
