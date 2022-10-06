import React from 'react';
import { addMinutes, subMinutes } from 'date-fns';
import LiveEvent from '../common/components/LiveEvent';

export default {
  title: 'Components/LiveEvent',
  component: LiveEvent,
  argTypes: {
    liveStartsAt: {
      control: {
        type: 'date'
      }
    },
    featureLabel: {
      control: {
        type: 'text'
      }
    },
    liveUrl: {
      control: {
        type: 'text'
      }
    },
    otherEvents: {
      control: {
        type: 'object'
      }
    },
    startingSoonDelta: {
      control: {
        type: 'number'
      }
    },
  }
};

const Component = (args, context) => {
  return <LiveEvent stTranslation={context.parameters.i18n.store.data} {...args} />
};
export const Default = Component.bind({});
Default.args = {
  liveStartsAt: subMinutes(new Date(), 40),
  liveUrl: 'https://www.google.co.ve/',
  featureLabel: 'Live clases, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: 'https://www.google.co.ve/',
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    starts_at: subMinutes(new Date(), 0),
    icon: 'group',
    fill: '#25BF6C',
  }, {
    title: 'Coding Jamming',
    starts_at: addMinutes(new Date(), 15),
    icon: 'codeBg',
  }],
};