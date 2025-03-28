import { Box } from '@chakra-ui/layout';
import React from 'react';
import KPI from '../common/components/KPI';
const iconDict = require('../iconDict.json');

export default {
  title: 'Components/KPI',
  component: KPI,
  argTypes: {
    icon: {
      options: iconDict,
      control: 'select',
    },
    max: {
      control: 'number',
    },
    icon: {
      table: {
        category: 'Icon Settings',
      },
    },
    variationColor: {
      table: {
        category: 'Icon Settings',
      },
    }
  }
};

const Component = (args) => (
  <KPI {...args} />
);
export const Default = Component.bind({});
Default.args = {
  label: 'Student rating',
  icon: 'smile',
  value: 8.5,
  max: null,
  variation: "4",
  fontSize: 'l',
  iconSize: '26px',
  labelSize: '15px',
};
