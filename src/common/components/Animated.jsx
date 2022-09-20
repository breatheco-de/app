import { motion } from 'framer-motion';
import {
  Avatar, Box, Button, Link, Tab,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

export const MotionBox = motion(Box);
export const MotionButton = motion(Button);
export const MotionAvatar = motion(Avatar);

export const AnimatedButton = ({
  children, onClick, toUppercase, rest,
}) => (
  <MotionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 1 }} variant="default" onClick={onClick} {...rest} fontSize="13px" m="20px 0" width="fit-content" letterSpacing="0.05em" textTransform={toUppercase ? 'uppercase' : ''}>
    {children}
  </MotionButton>
);
export const AnimatedAvatar = ({
  src, width, height, top, bottom, left, right, style, onClick,
}) => (
  <MotionAvatar whileHover={{ scale: 1.05 }} onClick={onClick} whileTap={{ scale: 0.95 }} src={src} width={width} height={height} style={{ ...style, userSelect: 'none' }} left={left} right={right} top={top} bottom={bottom} position="absolute" bg="transparent" zIndex={2} />
);

export const CustomTab = ({
  children, onClick, top, bottom, left, right, style,
}) => (
  <Tab _selected={{ backgroundColor: 'blue.default', color: 'white' }} style={style} p="20px 0" width="178px" fontSize="15px" background="blue.light" color="blue.default" onClick={onClick} textTransform="uppercase" position="absolute" left={left} right={right} top={top} bottom={bottom} borderRadius="22px" fontWeight="700">
    {children}
  </Tab>
);

export const ShadowCard = ({
  data, style, index, onMouseLeave, ...rest
}) => (
  <MotionBox position="absolute" boxShadow="lg" {...rest} onMouseLeave={onMouseLeave} style={style} display="flex" flexDirection="column" borderRadius="8px" background="white" zIndex={0} initial="hidden" animate="visible" exit="hidden" layoutId={`${index}-${data.fullNameSlug}`} transition={{ duration: 0.4 }}>
    <MotionBox color="black" fontSize="15px" fontWeight="900" textAlign="center">
      {data.fullName}
    </MotionBox>
    <Box color="black" fontSize="15px" fontWeight="400" textAlign="center" letterSpacing="0.05em">
      {data?.workPosition || 'Ceo @ Globant'}
    </Box>
    <Link href="#schedule" variant="default" fontSize="15px" fontWeight="700" letterSpacing="0.05em" textAlign="center">
      Schedule a mentoring session
    </Link>
  </MotionBox>
);

AnimatedButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  key: PropTypes.string,
  toUppercase: PropTypes.bool,
  rest: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func,
};
AnimatedAvatar.propTypes = {
  src: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  left: PropTypes.string,
  right: PropTypes.string,
  top: PropTypes.string,
  bottom: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
  onClick: PropTypes.func,
};
CustomTab.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  left: PropTypes.string,
  right: PropTypes.string,
  top: PropTypes.string,
  bottom: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.objectOf(PropTypes.any),
};
ShadowCard.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  style: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number,
  onMouseLeave: PropTypes.func,
};

CustomTab.defaultProps = {
  left: '',
  right: '',
  top: '',
  bottom: '',
  onClick: () => {},
  style: {},
};
AnimatedButton.defaultProps = {
  key: '1',
  toUppercase: false,
  rest: [],
  onClick: () => {},
};
AnimatedAvatar.defaultProps = {
  src: '',
  width: '',
  height: '',
  left: '',
  right: '',
  top: '',
  bottom: '',
  style: {},
  onClick: () => {},
};
ShadowCard.defaultProps = {
  data: {},
  style: {},
  index: 0,
  onMouseLeave: () => {},
};
