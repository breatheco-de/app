import { Box } from '@chakra-ui/layout';
import React from 'react';
import Icon from '../common/components/Icon';

export default {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 350,
      },
    },
    icon: {
      options: ['verified', 'book'],
      control: 'select',
    },
  },
};

const Component = (args) => (
  <Box width={`${args.width}px`}>
    <Icon {...args} />
  </Box>
);
export const Default = Component.bind({});
Default.args = {
  icon: 'verified',
  width: 200,
};
