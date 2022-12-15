import React from 'react';
import FilterBox from '../common/components/FilterBox';

export default {
  title: 'Components/FilterBox',
  component: FilterBox,
  argTypes: {
    technologies: {
      control: {
        type: 'object'
      }
    },
    techLimit: {
      control: {
        type: 'number'
      }
    },
  }
};

const technologies = [
  'python',
  'javascript',
  'java',
  'html',
  'css',
  'javascript',
  'javascript',
  'java',
  'python',
  'html',
  'java',
  'javascript',
  'html',
  'css',
  'javascript',
  'java',
  'python',
  'html',
  'css',
  'java',
  'html',
  'css',
  'javascript',
];

const Component = (args, context) => {
  return <FilterBox stTranslation={context.parameters.i18n.store.data} {...args} />
};

export const Default = Component.bind({});
Default.args = {
  technologies,
  techLimit: 18,
};
