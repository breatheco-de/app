import React from 'react';
import { Box } from '@chakra-ui/layout';
import Text from '../components/Text';

export default {
  title: 'Components/Text',
  component: Text,
  argTypes: {
    size: {
      options: ['l', 'md', 'sm', 'xs'],
      control: 'select',
    },
    color: {
      options: ['gray.light', 'gray.default', 'gray.dark', 'blue.light', 'blue.default', 'blue.800', 'white', 'black'],
      control: 'select',
    },
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
  },
};

const Template = (args) => (
  <Box width={`${args.width}%`}>
    <Text {...args} width={`${args.width}%`}>{args.text}</Text>
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  size: 'md',
  color: 'gray',
  width: 100,
  text: 'During the pre-work you learn some basic CSS and HTML, and hopefully how to use the flex-box to create simple layouts. The first day we will review the pre-work completion and introduce a more evolved CSS that enables amazing layouts and the amazing Bootstrap framework that wil',
};
