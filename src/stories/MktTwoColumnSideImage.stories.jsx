import React from 'react';
import MktTwoColumnSideImage from '../common/components/MktTwoColumnSideImage';

export default {
  title: 'Components/MktTwoColumnSideImage',
  component: MktTwoColumnSideImage,
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
    imagePosition: {
      options: ['right', 'left'],
      control: { type: 'select' }
    },
    imageUrl: {
      control: {
        type: 'text'
      }
    },
  }
};

const description = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.`;

const Component = (args, context) => {
  return <MktTwoColumnSideImage stTranslation={context.parameters.i18n.store.data} {...args} />
};

export const Default = Component.bind({});
Default.args = {
  title: 'This is a long title that can have several lines like this',
  subTitle: 'This is a small subtitle',
  description,
  buttonUrl: 'https://www.google.com',
  buttonLabel: 'Button',
  imageUrl: "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg",
  subscriptionStatus: 'ACTIVE',
  courseProgress: 7,
};

export const LeftSide = Component.bind({});
LeftSide.args = {
  title: 'This is a long title that can have several lines like this',
  subTitle: 'This is a small subtitle',
  description,
  buttonUrl: 'https://www.google.com',
  buttonLabel: 'Button',
  imagePosition: 'left',
  imageUrl: "https://www.springboard.com/blog/wp-content/uploads/2022/01/is-programming-hard-a-guide-to-getting-started-in-2022-scaled-1.jpeg",
  subscriptionStatus: 'ACTIVE',
  courseProgress: 7,
};
