import React from 'react';
import MktOneColumn from '../common/components/MktOneColumn';

export default {
  title: 'Components/MktOneColumn',
  component: MktOneColumn,
  argTypes: {
    title: {
      control: {
        type: 'text'
      }
    },
    subTitle: {
      control: {
        type: 'text'
      }
    },
    description: {
      control: {
        type: 'text'
      }
    },
    buttonLabel: {
      control: {
        type: 'text'
      }
    },
    buttonUrl: {
      control: {
        type: 'text'
      }
    },
  }
};

const description = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.`;

const Component = (args, context) => {
  return <MktOneColumn stTranslation={context.parameters.i18n.store.data} {...args} />
};

export const Default = Component.bind({});
Default.args = {
  title: 'This is a long title that can have several lines like this',
  subTitle: 'This is a small subtitle',
  description,
  buttonUrl: 'https://www.google.com',
  buttonLabel: 'Button',
};
