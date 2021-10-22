import React from 'react';
import CallToAction from '../common/components/CallToAction';
import { action } from '@storybook/addon-actions';
import { withKnobs } from "@storybook/addon-knobs";

export default {
  title: 'Components/CallToAction',
  component: CallToAction,
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
  <CallToAction {...args} width={`${args.width}%`}/> 
);
export const Default = Component.bind({});
Default.args = {
    background: "blue.default",
    title: 'Todays lessons',
    text: 'Your lesson today is Internet Architecture in First Time Website Module.',
    width: 100, 
    onClick:(e) => {
      action("onClick")(e)
    }
};