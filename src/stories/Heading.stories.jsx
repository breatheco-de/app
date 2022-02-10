import React from 'react';
import Heading from '../common/components/Heading';
import { Box } from '@chakra-ui/layout';

export default {
  title: 'Components/Heading',
  component: Heading,
  argTypes: {
    size: {
      options: ['xl', 'l', 'm', 'sm'],
      control: 'select',
    },
    color:{
      options: ['gray.light', 'gray.default', 'gray.dark', 'blue.light', 'blue.default', 'blue.800', 'white', 'black'],
      control: 'select',
    },
    width: {
        control: {
          type: 'range',
          min: 0,
          max: 100,
      },
    }
  },
};

const Template = (args) => <Box width={`${args.width}%`}>
        <Heading {...args} width={`${args.width}%`}>{args.text}</Heading>
    </Box>

export const Default = Template.bind({});
Default.args = {
  size: 'm',
  color:'gray',
  width:100,
  text: 'Fron end development',
};
