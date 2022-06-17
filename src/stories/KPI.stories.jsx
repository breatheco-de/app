import { Box } from '@chakra-ui/layout';
import React from 'react';
import KPI from '../common/components/KPI';
const iconDict = require('../common/utils/iconDict.json');

export default {
  title: 'Components/KPI',
  component: KPI,
  argTypes: {
    icon: {
      options: iconDict,
      control: 'select',
    },
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
  max: 10,
  variation: "4",
};
