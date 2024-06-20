/* eslint-disable react/no-array-index-key */
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Box,
} from '@chakra-ui/react';
import Text from './Text';
import CustomTheme from '../../../styles/theme';

function MktTechnologiesPills({ id, technologies, ...rest }) {
  const ref = useRef();
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const cleanTeachs = technologies.length > 0 && typeof technologies[0] === 'string' ? technologies : technologies.map((obj) => obj.text);

  const colors = [
    CustomTheme.colors.green.light,
    CustomTheme.colors.blue.light,
    CustomTheme.colors.yellow.light,
  ];
  const colorsLength = colors.length;

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
    const walk = (x - startX) * 3; //scroll-fast
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <Container maxW="container.xl" px={{ base: '10px', md: '2rem' }} id={id} width="100%" overflowX="hidden" {...rest}>
      <Box
        ref={ref}
        width="100%"
        height="32px"
        display="flex"
        gridGap="20px"
        justifyContent="space-between"
        overflowX="hidden"
        cursor="grab"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onTouchStart={onMouseDown}
        onTouchMove={onMouseMove}
        onTouchEnd={onMouseLeave}
      >
        {cleanTeachs.map((tech, i) => (
          <Text
            key={`${tech}-${i}`}
            height="32px"
            fontSize="16px"
            fontWeight="bold"
            padding="10px"
            borderRadius="25px"
            textTransform="uppercase"
            background={colors[((i % colorsLength) + colorsLength) % colorsLength]}
            display="flex"
            justifyContent="center"
            flexDirection="column"
            color="#000"
            minWidth="fit-content"
          >
            {tech}
          </Text>
        ))}
      </Box>
    </Container>
  );
}

MktTechnologiesPills.propTypes = {
  technologies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  id: PropTypes.string,
};

MktTechnologiesPills.defaultProps = {
  technologies: [],
  id: '',
};

export default MktTechnologiesPills;
