import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
} from '@chakra-ui/react';

function DraggableContainer({ children, ...rest }) {
  const ref = useRef();
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollSpeed = 1;

  const onMouseDown = (e) => {
    setIsDown(true);
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDown(false);
  };

  const onMouseUp = () => {
    setIsDown(false);
  };

  const onMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const x = pageX - ref.current.offsetLeft;
    const walk = (x - startX) * scrollSpeed; //scroll-fast
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <Container
      ref={ref}
      padding="0"
      className="hideOverflowX__"
      cursor={ref.current?.clientWidth !== ref.current?.scrollWidth && 'grab'}
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
}

DraggableContainer.propTypes = {
  children: PropTypes.element.isRequired,
};

export default DraggableContainer;
