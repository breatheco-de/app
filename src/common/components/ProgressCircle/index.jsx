/* eslint-disable react/prop-types */
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Flex } from '@chakra-ui/react';
import Counter from './Counter';

const ProgressCircle = ({
  percents,
  counterString,
  counter = true,
  stroke = '#0097CD',
  emptyStroke = stroke,
  emptyStrokeOpacity = 0.25,
  duration = 3,
  delay = 0.5,
  size = 100,
  strokeWidth = 6,
  caption,
}) => {
  const radius = 45;
  const circumference = Math.ceil(2 * Math.PI * radius);
  const fillPercents = Math.abs(
    Math.ceil((circumference / 100) * (percents - 100)),
  );

  const transition = {
    duration,
    delay,
    ease: 'easeIn',
  };

  const variants = {
    hidden: {
      strokeDashoffset: circumference,
      transition,
    },
    show: {
      strokeDashoffset: fillPercents,
      transition,
    },
  };

  return (
    <>
      <Flex justifyContent="center" alignItems="center">
        {counter && (
          <Box
            position="absolute"
            // size="20px"
            size={`${Math.round(0.25 * size)}px`}
            // fontSize={size >= 100 ? 6 : 3}
            // fontWeight={2}
            fontWeight="700"
            // color="gray.250"
          >
            {counterString ? (
              <>
                {counterString}
              </>
            ) : (
              <>
                <Counter valueTo={percents} totalDuration={duration + delay} />
                %
              </>
            )}
          </Box>
        )}
        <Box height={`${size}px`} position="relative">
          <svg
            viewBox="0 0 100 100"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="circle"
              strokeWidth={strokeWidth}
              stroke={emptyStroke}
              strokeOpacity={emptyStrokeOpacity}
              fill="transparent"
            />
          </svg>
          <svg
            viewBox="0 0 100 100"
            width={size}
            height={size}
            style={{
              position: 'absolute',
              transform: 'rotate(90deg)',
              overflow: 'visible',
              // top: '1px',
              // left: '-1px',
              top: '0px',
              left: '0px',
            }}
          >
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              strokeWidth={strokeWidth}
              stroke={stroke}
              fill="transparent"
              strokeDashoffset={fillPercents}
              strokeDasharray={circumference}
              variants={variants}
              initial="hidden"
              animate="show"
            />
          </svg>
        </Box>
      </Flex>
      {caption && (
        <Box width={size} fontSize={3} color="text500" textAlign="center">
          {caption}
        </Box>
      )}
    </>
  );
};

export default ProgressCircle;
