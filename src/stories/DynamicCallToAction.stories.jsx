import React from 'react';
import DynamicCallToAction from '../common/components/DynamicCallToAction';

export default {
  title: 'Components/DynamicCallToAction',
  component: DynamicCallToAction,
  argTypes: {
    assetType: {
      control: {
        type: 'string'
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
  return <DynamicCallToAction stTranslation={context.parameters.i18n.store.data} {...args} />
};

export const WeeklyCodingChallenge = Component.bind({});
WeeklyCodingChallenge.args = {
  assetType: 'lesson',
  assetId: 323,
  assetTechnologies: ['html', 'python'],
};

export const LargeWeeklyCodingChallenge = Component.bind({});
LargeWeeklyCodingChallenge.args = {
  assetType: 'lesson',
  assetId: 2223,
  assetTechnologies: ['javascript'],
};
