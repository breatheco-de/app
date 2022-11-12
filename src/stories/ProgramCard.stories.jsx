import React from 'react';
import ProgramCard from '../common/components/ProgramCard';

export default {
  title: 'Components/ProgramCard',
  component: ProgramCard,
  argTypes: {
    programName: {
      control: {
        type: 'string'
      }
    },
  }
};

const Component = (args, context) => {
  return <ProgramCard stTranslation={context.parameters.i18n.store.data} {...args} />
};

export const Default = Component.bind({});
Default.args = {
  programName: 'Data Science',
};
