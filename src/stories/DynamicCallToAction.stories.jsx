import React from 'react';
import DynamicCallToAction from '../common/components/DynamicCallToAction';

export default {
  title: 'Components/DynamicCallToAction',
  component: DynamicCallToAction,
  argTypes: {
    placement: {
      control: {
        type: 'text'
      }
    },
    assetType: {
      control: {
        type: 'text'
      }
    },
    assetId: {
      control: {
        type: 'number'
      }
    },
    assetTechnologies: {
      control: {
        type: 'object'
      }
    },
  }
};

const Component = (args, context) => {
  return <DynamicCallToAction {...args} />
};

export const WeeklyCodingChallenge = Component.bind({});
WeeklyCodingChallenge.args = {
  assetType: 'lesson',
  assetId: 323,
  assetTechnologies: ['html', 'python'],
  placement: 'side',
};

export const LargeWeeklyCodingChallenge = Component.bind({});
LargeWeeklyCodingChallenge.args = {
  assetType: 'exercise',
  assetId: 4,
  assetTechnologies: ['javascript'],
  placement: 'bottom',
};
