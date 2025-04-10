import { AnimatePresence, motion } from 'framer-motion';
import {
  Avatar, Box, Button, Link, Tab, keyframes,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';

export const MotionBox = motion(Box);
export const MotionButton = motion(Button);
export const MotionAvatar = motion(Avatar);

// Animate shadow in right direction
const animateShadow = keyframes`
  0% {
    box-shadow: 0 0 40px 14px rgb(0 0 0 / 25%);
  }
  70% {
    box-shadow: 0 0 80px 24px rgb(0 0 0 / 40%);
  }
  100% {
    box-shadow: 0 0 40px 14px rgb(0 0 0 / 25%);
  }
`;

const animateBreathing = keyframes`
  0% {
    right: 0;
    transform: scale(1);
  }
  50% {
    right: 10px;
    transform: scale(1.1);
  }
  100% {
    right: 0%;
    transform: scale(1);
  }
`;

const pulseBlue = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(64, 166, 250, 0.5), 0 0 0 0 rgba(77, 225, 241, 0.2), 0 0 0 0 rgba(6, 197, 255, 0.14);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(255, 82, 82, 0), 0 0 0 18px rgba(255, 82, 82, 0), 0 0 0 22px rgba(255, 82, 82, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0), 0 0 0 25px rgba(255, 82, 82, 0), 0 0 0 25px rgba(255, 82, 82, 0);
  }
`;
const pulseAnimation = `${pulseBlue} infinite 2s ease-in-out`;

const breathAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.5,
    },
  },
};

export function AnimatedContainer({ children, isScrollable, ...rest }) {
  return (
    <Box
      {...rest}
    >
      {children}
      <AnimatePresence>
        {isScrollable && (
          <>
            <MotionBox position="absolute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} animation={`${animateShadow} 2s infinite`} top="0px" right="0px" width="0px" height="25px" boxShadow="0 0 80px 34px rgb(0 0 0 / 75%)" zIndex="1" background="#000000" />
            <MotionBox initial="hidden" animate="show" exit="hidden" variants={breathAnimation} animation={`${animateBreathing} 2s infinite`} style={{ position: 'absolute', top: '4.4px', right: '0px' }} zIndex="1">
              <Icon icon="arrowRight" width="15px" height="15px" />
            </MotionBox>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
}

export function AnimatedButton({
  children, onClick, toUppercase, rest,
}) {
  return (
    <MotionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 1 }} variant="default" onClick={onClick} {...rest} fontSize="13px" m="20px 0" width="fit-content" letterSpacing="0.05em" textTransform={toUppercase ? 'uppercase' : ''}>
      {children}
    </MotionButton>
  );
}
export function AnimatedAvatar({
  src, width, height, top, bottom, left, right, style, onClick,
}) {
  return <MotionAvatar whileHover={{ scale: 1.05 }} onClick={onClick} whileTap={{ scale: 0.95 }} src={src} width={width} height={height} style={{ ...style, userSelect: 'none' }} left={left} right={right} top={top} bottom={bottom} position="absolute" bg="transparent" zIndex={2} />;
}

export function CustomTab({
  children, onClick, top, bottom, left, right, style, ...rest
}) {
  return (
    <Tab className="pulse-blue" animation={pulseAnimation} _selected={{ backgroundColor: 'blue.default', color: 'white', animation: 'none' }} style={style} p="20px 0" width="178px" fontSize="15px" background="blue.light" color="blue.default" onClick={onClick} textTransform="uppercase" position="absolute" left={left} right={right} top={top} bottom={bottom} borderRadius="22px" fontWeight="700" {...rest}>
      {children}
    </Tab>
  );
}

export function ShadowCard({
  data, style, index, onMouseLeave, ...rest
}) {
  return (
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
}

AnimatedButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  key: PropTypes.string,
  toUppercase: PropTypes.bool,
  rest: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  onClick: PropTypes.func,
};
AnimatedContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  rest: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  isScrollable: PropTypes.bool,
};
AnimatedAvatar.propTypes = {
  src: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  left: PropTypes.string,
  right: PropTypes.string,
  top: PropTypes.string,
  bottom: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
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
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
ShadowCard.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
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
AnimatedContainer.defaultProps = {
  rest: [],
  isScrollable: false,
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
