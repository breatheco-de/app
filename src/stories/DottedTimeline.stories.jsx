import { Avatar, Flex } from '@chakra-ui/react';
import React from 'react';

import DottedTimeline from '../components/DottedTimeline';

const dots = [
  {
    label: 'Day 1 - 4 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 2 - 5 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 3 - 6 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 4 - 7 Mar',
    color: '#CD0000',
  },
  {
    label: 'Day 5 - 8 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 6 - 9 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 7 - 10 Mar',
    color: '#FFB718',
  },
  {
    label: 'Day 8 - 11 Mar',
    color: '#FFB718',
  },
  {
    label: 'Day 9 - 12 Mar',
    color: '#CD0000',
  },
  {
    label: 'Day 10 - 13 Mar',
    color: '#FFB718',
  },
  {
    label: 'Day 11 - 14 Mar',
    color: '#FFB718',
  },
  {
    label: 'Day 12 - 15 Mar',
    color: '#FFB718',
  },
  {
    label: 'Day 13 - 16 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 14 - 17 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 15 - 18 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 16 - 19 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 17 - 20 Mar',
    color: '#CD0000',
  },
  {
    label: 'Day 18 - 21 Mar',
    color: '#CD0000',
  },
  {
    label: 'Day 19 - 22 Mar',
    color: '#CD0000',
  },
  {
    label: 'Day 20 - 23 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 21 - 24 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 22 - 25 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 23 - 26 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 24 - 27 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 25 - 28 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 26 - 29 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 27 - 30 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 28 - 31 Mar',
    color: '#25BF6C',
  },
  {
    label: 'Day 29 - 1 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 30 - 2 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 31 - 3 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 32 - 4 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 33 - 5 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 34 - 6 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 35 - 7 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 36 - 8 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 37 - 9 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 38 - 10 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 39 - 11 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 40 - 12 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 41 - 13 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 42 - 14 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 43 - 15 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 44 - 16 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 45 - 17 Apr',
    color: '#FFB718',
  },
  {
    label: 'Day 46 - 18 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 47 - 19 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 48 - 20 Apr',
    color: '#25BF6C',
  },
  {
    label: 'Day 49 - 21 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 50 - 22 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 51 - 23 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 52 - 23 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 53 - 24 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 54 - 25 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 55 - 26 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 56 - 27 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 57 - 28 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 58 - 29 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 59 - 30 Apr',
    color: '#C4C4C4',
  },
  {
    label: 'Day 60 - 1 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 61 - 2 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 62 - 3 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 63 - 4 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 64 - 5 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 65 - 6 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 66 - 7 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 67 - 8 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 68 - 9 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 69 - 10 May',
    color: '#C4C4C4',
  },
  {
    label: 'Day 70 - 11 May',
    color: '#C4C4C4',
  },
];

export default {
  title: 'Components/DottedTimeline',
  component: DottedTimeline,
  argTypes: {
    label: {
      control: {
        type: 'text',
      },
    },
  },
};

const Component = (args) => {
  const calcDaysAverage = (days) => {
    const totalDays = days.length;
    const totalDaysCompleted = days.filter((day) => day.color === '#25BF6C').length;
    const average = parseInt((totalDaysCompleted / totalDays) * 100, 10);
    return average;
  };
  return (
    <DottedTimeline
      width={`${args.width}`}
      label={args.label || (
        <Flex gridGap="10px" alignItems="center">
          <Avatar
            src='static/images/p1.png'
            width="25px"
            height="25px"
            style={{ userSelect: 'none' }}
          />
          <p>Juan Perez</p>
        </Flex>
      )}
      helpText={args.helpText || `${calcDaysAverage(args.dots)}% attendance`}
      dots={args.dots}
    />
  )
};

export const Default = Component.bind({});
Default.args = {
  width: '70%',
  label: '',
  helpText: '',
  dots
};
