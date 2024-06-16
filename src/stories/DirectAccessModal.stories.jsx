import React from 'react';
import DirectAccessModal from '../common/components/DirectAccessModal';

export default {
  title: 'Components/DirectAccessModal',
  component: DirectAccessModal,
  argTypes: {
    modalIsOpen: {
      control: 'boolean',
    },  
    title: {
      control: 'text',
    },
  },
};

const Template = (args, etc) => {
  return (
    <DirectAccessModal {...args} />
  )
};

export const Default = Template.bind({});
Default.args = {
  modalIsOpen: true,
  title: 'Python for beginners',
};
