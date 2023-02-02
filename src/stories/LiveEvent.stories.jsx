import React from 'react';
import { addMinutes, subMinutes, subHours, addHours } from 'date-fns';
import LiveEvent from '../common/components/LiveEvent';
import { Box } from '@chakra-ui/react';

export default {
  title: 'components/Live Event',
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
  return (
    <Box width={args?.width || '320px'}>
      <LiveEvent stTranslation={context.parameters.i18n.store.data} {...args} />
    </Box>
  )
};
export const Default = Component.bind({});
Default.args = {
  liveStartsAt: new Date(subMinutes(new Date(), 40)),
  liveEndsAt: new Date(addHours(new Date(), 1)),
  liveUrl: 'https://www.google.co.ve/',
  featureLabel: 'Live clases, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: 'https://www.google.co.ve/',
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    icon_url: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582748_960_720.png',
    starting_at: subMinutes(new Date(), 0),
    ending_at: addMinutes(new Date(), 180),
    icon: 'group',
    fill: '#25BF6C',
    liveUrl: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    starting_at: new Date(addMinutes(new Date(), 15)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    liveUrl: 'https://www.google.co.ve/'
  }],
};

export const StartsIn5Hours = Component.bind({});
StartsIn5Hours.args = {
  width: '320px',
  startingSoonDelta: 30,
  liveStartsAt: new Date(addHours(new Date(), 5)),
  liveEndsAt: new Date(addHours(new Date(), 6)),
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    starting_at: addHours(new Date(), 20),
    ending_at: addHours(new Date(), 22),
    icon: 'group',
    fill: '#25BF6C',
    liveUrl: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    starting_at: addHours(new Date(), 12),
    ending_at: addHours(new Date(), 13),
    icon: 'codeBg',
    liveUrl: 'https://www.google.co.ve/'
  }],
};

export const NoTodayClass = Component.bind({});
NoTodayClass.args = {
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    starting_at: addMinutes(new Date(), 120),
    ending_at: addMinutes(new Date(), 200),
    icon: 'group',
    fill: '#25BF6C',
    liveUrl: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    starting_at: new Date(addMinutes(new Date(), 32)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    liveUrl: 'https://www.google.co.ve/'
  }],
};

export const UpcomingEventsTomorrow = Component.bind({});
UpcomingEventsTomorrow.args = {
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    starting_at: addHours(new Date(), 23),
    ending_at: addHours(new Date(), 24),
    icon: 'group',
    fill: '#25BF6C',
    liveUrl: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    starting_at: new Date(addHours(new Date(), 25)),
    ending_at: new Date(addHours(new Date(), 26)),
    icon: 'codeBg',
    liveUrl: 'https://www.google.co.ve/'
  }],
};

export const UpcomingEventToday = Component.bind({});
UpcomingEventToday.args = {
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'Login flow with React',
    starting_at: addMinutes(new Date(), 27),
    ending_at: addMinutes(new Date(), 73),
    icon: 'codeBg',
    fill: '#25BF6C',
    liveUrl: 'https://www.google.co.ve/#login-flow-with-react'
  }, {
    title: 'Coding Jamming',
    starting_at: new Date(addHours(new Date(), 25)),
    ending_at: new Date(addHours(new Date(), 26)),
    icon: 'codeBg',
    liveUrl: 'https://www.google.co.ve/#coding-jamming'
  }, {
    title: 'Final Project Presentation',
    starting_at: new Date(addHours(new Date(), 52)),
    ending_at: new Date(addHours(new Date(), 54)),
    icon: 'group',
    liveUrl: 'https://www.google.co.ve/#final-project-presentation'
  }],
};

export const NoClassAndEventsAvailable = Component.bind({});
NoClassAndEventsAvailable.args = {
  startingSoonDelta: 30,
};