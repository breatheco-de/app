import React from 'react';
import DirectAccessModal from '../common/components/DirectAccessModal';

export default {
  title: 'Components/DirectAccessModal',
  component: DirectAccessModal,
  argTypes: {
    modalIsOpen: {
      control: 'boolean',
    },
  },
};

const Template = (args, etc) => {
  return (
    <DirectAccessModal storySettings={{ locale: args.locale, translation: args?.translation }} {...args} />
  )
};

export const Default = Template.bind({});
Default.args = {
  modalIsOpen: true,
};
