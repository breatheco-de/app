import React from 'react';

import SubTasks from '../common/components/MarkDownParser/SubTasks';

export default {
  title: 'Components/SubTasks',
  component: SubTasks,
  argTypes: {
    subTasks: {
      control: { type: 'object' },
    },
  },
};

const Component = (args, context) => {
  return <SubTasks {...args} />
};

export const Default = Component.bind({});
Default.args = {
  subTasks: [
    {
        "id": "example-1",
        "label": "Simple example 1",
        "status": "DONE"
    },
    {
        "id": "example-2",
        "label": "Simple example 2",
        "status": "PENDING"
    },
    {
        "id": "example-3",
        "label": "Simple example 3",
        "status": "PENDING"
    },
    {
        "id": "example-4",
        "label": "Simple example 4",
        "status": "PENDING"
    }
  ],
};
