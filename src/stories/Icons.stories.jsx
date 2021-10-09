import { Box } from '@chakra-ui/layout';
import React from 'react';
import Icon from '../common/components/Icon';
const iconDict = require("../common/utils/iconDict.json")

export default {
  title: 'Components/Icons',
  component: Icon,
  argTypes: {

    icon: {
      options: iconDict,
      control: 'select',
    },
    style: {
      control: {
        type: 'object'
      },
    },
    fill: {
      control: 'color',
      table: {
        category: 'Icon Colors'
      }
    },
    color: {
      control: 'color',
      table: {
        category: 'Icon Colors'
      }
    },

    width: {
      control: {
        type: 'range',
        min: 15,
        max: 350,
      },
      table: {
        category: 'Size in px'
      }
    },
    height: {
      control: {
        type: null
      },
      table: {
        category: 'Size in px'
      }
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
  icon: 'book',
  width: 200,
};
