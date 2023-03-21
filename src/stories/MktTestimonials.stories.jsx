import React from 'react';
import MktTestimonials from '../common/components/MktTestimonials';

export default {
  title: 'Components/MktTestimonials',
  component: MktTestimonials,
  argTypes: {
    title: {
      control: {
        type: 'text'
      }
    },
    testimonials: {
      control: {
        type: 'object'
      }
    },
  }
};

const Component = (args, context) => {
  return <MktTestimonials stTranslation={context.parameters.i18n.store.data} {...args} />
};

export const Default = Component.bind({});
Default.args = {
  title: 'What our community have to say...',
  testimonials: [{
    name: 'Nombre y apellido',
    occupation: 'CEO @ Globant',
    picture: 'https://www.rd.com/wp-content/uploads/2017/09/01-shutterstock_476340928-Irina-Bg.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et.',
  }, {
    name: 'Nombre y apellido',
    occupation: 'CEO @ Globant',
    picture: 'https://www.rd.com/wp-content/uploads/2017/09/01-shutterstock_476340928-Irina-Bg.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et.',
  }, {
    name: 'Nombre y apellido',
    occupation: 'CEO @ Globant',
    picture: 'https://www.rd.com/wp-content/uploads/2017/09/01-shutterstock_476340928-Irina-Bg.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et.',
  }, {
    name: 'Nombre y apellido',
    occupation: 'CEO @ Globant',
    picture: 'https://www.rd.com/wp-content/uploads/2017/09/01-shutterstock_476340928-Irina-Bg.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et.',
  }],
};

