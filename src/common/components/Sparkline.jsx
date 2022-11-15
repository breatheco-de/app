/* eslint-disable no-param-reassign */
/* eslint-disable no-cond-assign */
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import sparkline from '@fnando/sparkline';
import { Box, Flex } from '@chakra-ui/react';
import Counter from './ProgressCircle/Counter';
import useStyle from '../hooks/useStyle';
import Text from './Text';

const Sparkline = ({
  values, label, backgroundColor, fillColor, strokeColor, interactive, lineWidth, percentage,
  width, height, strokeWidth, strokeDasharray, strokeDashoffset, circleWidth, containerWidth,
}) => {
  const sparklineRef = useRef(null);
  const { fontColor2 } = useStyle();
  const [currentDatapoint, setCurrentDatapoint] = useState(values[0]);

  const findClosest = (target, tagName) => {
    if (target.tagName === tagName) {
      return target;
    }

    while ((target = target.parentNode)) {
      if (target.tagName === tagName) {
        break;
      }
    }

    return target;
  };

  const options = {
    onmousemove(event, datapoint) {
      if (interactive) {
        const svg = findClosest(event.target, 'svg');
        const tooltip = svg.nextElementSibling;
        const date = (new Date(datapoint.date)).toUTCString().replace(/^.*?, (.*?) \d{2}:\d{2}:\d{2}.*?$/, '$1');

        if (datapoint.date !== currentDatapoint.date) {
          setCurrentDatapoint(datapoint);
        }

        if (tooltip) {
          tooltip.hidden = false;
          tooltip.textContent = `${date}: ${datapoint.value.toFixed(2)}`;
          tooltip.style.top = `${event.offsetY}px`;
          tooltip.style.left = `${event.offsetX + 20}px`;
        }
      }
    },

    onmouseout(event) {
      if (interactive) {
        const svg = findClosest(event.target, 'svg');
        const tooltip = svg.nextElementSibling;

        if (tooltip) {
          tooltip.hidden = true;
          tooltip.classList.remove('active');
        }
      }
    },
    spotRadius: circleWidth,
    interactive,
    cursorWidth: lineWidth,
  };

  useEffect(() => {
    // initialize sparkline on mount after the element has rendered
    sparkline(sparklineRef.current, values, options);
  }, []);

  // const getText = (datapoint) => {
  //   const dateString = new Date(datapoint.value).toLocaleString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //   });
  //   return `${dateString}: ${datapoint.value}`;
  // };

  // motion sparklineVariants
  const sparklineVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 1,
      },
    },
  };

  return (
    <Box position="relative" width={containerWidth}>
      <Flex flexDirection="column" color={fontColor2}>
        {label && (
          <Text fontWeight={700} size="15px">
            {label}
          </Text>
        )}
        <Text fontWeight={700} size="30px">
          <Counter valueTo={percentage} totalDuration={2} />
          %
        </Text>
      </Flex>
      <Flex flexDirection="column" position="absolute" top="0px" left="100px">
        <motion.svg
          ref={sparklineRef}
          style={{ backgroundColor }}
          width={width}
          height={height}
          fill={fillColor}
          stroke={strokeColor}
          initial="initial"
          animate="animate"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          variants={sparklineVariants}
        />
        <Box
          as="span"
          className="tooltip"
          position="absolute"
          background="rgba(0, 0, 0, .7)"
          color="#fff"
          padding="2px 5px"
          font-size="12px"
          width="max-content"
          white-space="nowrap"
          z-index="99"
          letterSpacing="0.05em"
          hidden="true"
        />
      </Flex>
    </Box>
  );
};

Sparkline.propTypes = {
  values: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ),
  backgroundColor: PropTypes.string,
  label: PropTypes.string,
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string,
  width: PropTypes.string,
  containerWidth: PropTypes.string,
  height: PropTypes.string,
  strokeWidth: PropTypes.string,
  strokeDasharray: PropTypes.string,
  strokeDashoffset: PropTypes.string,
  interactive: PropTypes.bool,
  circleWidth: PropTypes.number,
  lineWidth: PropTypes.number,
  percentage: PropTypes.number,
};

Sparkline.defaultProps = {
  values: [
    {
      name: 'Ethereum', date: '2017-01-01', value: 8.3,
    },
    {
      name: 'Ethereum', date: '2017-02-01', value: 10.57,
    },
    {
      name: 'Ethereum', date: '2017-03-01', value: 15.73,
    },
    {
      name: 'Ethereum', date: '2017-04-01', value: 49.51,
    },
    {
      name: 'Ethereum', date: '2017-05-01', value: 85.69,
    },
    {
      name: 'Ethereum', date: '2017-06-01', value: 226.51,
    },
    {
      name: 'Ethereum', date: '2017-07-01', value: 246.65,
    },
    {
      name: 'Ethereum', date: '2017-08-01', value: 213.87,
    },
    {
      name: 'Ethereum', date: '2017-09-01', value: 386.61,
    },
    {
      name: 'Ethereum', date: '2017-10-01', value: 303.56,
    },
    {
      name: 'Ethereum', date: '2017-11-01', value: 298.21,
    },
  ],
  backgroundColor: 'inherit',
  label: 'Attendance',
  fillColor: 'none',
  strokeColor: '#3d85de',
  width: '300',
  containerWidth: '300px',
  height: '50',
  strokeWidth: '3',
  strokeDasharray: '0',
  strokeDashoffset: '0',
  interactive: true,
  circleWidth: 3,
  lineWidth: 2,
  percentage: 0,
};

export default Sparkline;
