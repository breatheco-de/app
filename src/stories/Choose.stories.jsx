import React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import ChooseProgram from '../js_modules/chooseProgram';
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/ChooseProgram',
  component: ChooseProgram,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
    decorators: [withKnobs],
  },
};

const Component = (args) => <ChooseProgram {...args} width={`${args.width}%`} />;
export const Default = Component.bind({});
Default.args = {
  chooseList: [
    {
      id: 1,
      cohort: 'Miami Prework',
      certificate: 'PRE WORK',
      slug: 'pre-work',
    },
  ],
};
