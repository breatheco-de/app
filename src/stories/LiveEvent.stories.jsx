import React from 'react';
import { addMinutes, subMinutes, subHours, addHours } from 'date-fns';
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
    liveEndsAt: {
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
  liveStartsAt: new Date(subMinutes(new Date(), 40)),
  liveEndsAt: new Date(addHours(new Date(), 1)),
  // liveStartsAt: new Date(subHours(new Date(), 3)),
  // liveEndsAt: new Date(subMinutes(new Date(), 10)),
  liveUrl: 'https://www.google.co.ve/',
  featureLabel: 'Live clases, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: 'https://www.google.co.ve/',
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    starting_at: subMinutes(new Date(), 0),
    ending_at: addMinutes(new Date(), 180),
    icon: 'group',
    fill: '#25BF6C',
    liveUrl: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    // starting_at: subHours(new Date(), 2),
    // ending_at: subMinutes(new Date(), 15),
    starting_at: new Date(addMinutes(new Date(), 15)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    liveUrl: 'https://www.google.co.ve/'
  }],
};