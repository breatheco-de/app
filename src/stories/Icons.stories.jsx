import { Box } from '@chakra-ui/layout';
import React from 'react';
import Icon from '../common/components/Icon';
const iconDict = require("../common/utils/iconDict.json")

export default {
  title: 'Components/Icons',
  component: Icon,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 15,
        max: 350,
      },
    },
    icon: {
      options: iconDict,
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
