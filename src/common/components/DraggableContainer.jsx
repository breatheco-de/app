import { useState, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Container } from '@chakra-ui/react';

const DraggableContainer = forwardRef(({ children, isDraggable, ...rest }, ref) => {
  const internalRef = useRef();
  const scrollRef = ref || internalRef;
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollSpeed = 1;

  const onMouseDown = (e) => {
    if (!isDraggable) return;
    setIsDown(true);
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDown(false);
  };

  const onMouseUp = () => {
    setIsDown(false);
  };

  const onMouseMove = (e) => {
    if (!isDown || !isDraggable) return;
    e.preventDefault();
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const x = pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * scrollSpeed;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <Container
      ref={scrollRef}
      padding="0"
      className="hideOverflowX__"
      cursor={isDraggable && scrollRef.current?.clientWidth !== scrollRef.current?.scrollWidth && 'grab'}
      maxW="container.xl"
      width="100%"
      overflowX="auto"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchStart={onMouseDown}
      onTouchMove={onMouseMove}
      onTouchEnd={onMouseLeave}
      {...rest}
    >
      {children}
    </Container>
  );
});

DraggableContainer.propTypes = {
  children: PropTypes.element.isRequired,
  isDraggable: PropTypes.bool,
};
DraggableContainer.defaultProps = {
  isDraggable: true,
};

export default DraggableContainer;
