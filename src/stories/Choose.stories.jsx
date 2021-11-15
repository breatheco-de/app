import React from 'react';
import Choose from '../common/components/Choose';
import { action } from '@storybook/addon-actions';
import { withKnobs } from "@storybook/addon-knobs";

export default {
  title: 'Components/Choose',
  component: Choose,
  argTypes: {
    width: {
        control: {
          type: 'range',
          min: 0,
          max: 100,
      }
  },
  decorators:[withKnobs]
  }
};

const Component = (args) => (
  <Choose {...args} width={`${args.width}%`}/> 
);
export const Default = Component.bind({});
Default.args = {
    chooseList: [
        {
            id: 1,
            cohort: 'Miami Prework',
            certificate: 'PRE WORK',
            slug: 'pre-work'
        }
    ]
};