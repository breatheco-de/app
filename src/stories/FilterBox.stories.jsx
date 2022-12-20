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
  {
    id: 1,
    label: 'python',
  },
  {
    id: 2,
    label: 'javascript',
  },
  {
    id: 3,
    label: 'java',
  },
  {
    id: 4,
    label: 'html',
  },
  {
    id: 5,
    label: 'css',
  },
  {
    id: 6,
    label: 'javascript',
  },
  {
    id: 7,
    label: 'java',
  },
  {
    id: 8,
    label: 'html',
  },
  {
    id: 9,
    label: 'css',
  },
  {
    id: 10,
    label: 'python',
  },
  {
    id: 11,
    label: 'javascript',
  },
  {
    id: 12,
    label: 'html',
  },
  {
    id: 13,
    label: 'java',
  },
  {
    id: 14,
    label: 'python',
  },
  {
    id: 15,
    label: 'html',
  },
  {
    id: 16,
    label: 'javascript',
  },
  {
    id: 17,
    label: 'java',
  },
  {
    id: 18,
    label: 'html',
  },
  {
    id: 19,
    label: 'css',
  },
  {
    id: 20,
    label: 'python',
  },
  {
    id: 21,
    label: 'javascript',
  },
  {
    id: 22,
    label: 'html',
  },
  {
    id: 23,
    label: 'java',
  },
  {
    id: 24,
    label: 'python',
  },
];

const Component = (args, context) => {
  return <FilterBox stTranslation={context.parameters.i18n.store.data} {...args} />
};

export const Default = Component.bind({});
Default.args = {
  technologies,
  techLimit: 18,
};
