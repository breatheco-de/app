import React from 'react';
import { addMinutes, subMinutes, addDays, addHours } from 'date-fns';
import LiveEvent from '../common/components/LiveEvent';
import { Box } from '@chakra-ui/react';
import { ORIGIN_HOST } from '../utils/variables';

export default {
  title: 'components/Live Event',
  component: LiveEvent,
  argTypes: {
    // liveStartsAt: {
    //   control: {
    //     type: 'date'
    //   }
    // },
    // liveEndsAt: {
    //   control: {
    //     type: 'date'
    //   }
    // },
    mainClasses: {
      control: {
        type: 'object'
      }
    },
    featureLabel: {
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
  // liveStartsAt: new Date(subMinutes(new Date(), 40)),
  // liveEndsAt: new Date(addHours(new Date(), 1)),
  mainClasses: [{
    starting_at: new Date(subMinutes(new Date(), 40)),
    ending_at: new Date(addHours(new Date(), 1)),
    title: 'Miami 53',
    subLabel: 'Master Class',
    liveClassHash: 'dfsdf',
  }],
  featureLabel: 'Live clases, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: 'https://www.google.co.ve/',
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    type: 'Workshop',
    icon_url: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582748_960_720.png',
    starting_at: subMinutes(new Date(), 0),
    ending_at: addMinutes(new Date(), 180),
    icon: 'group',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    type: 'Workshop',
    starting_at: new Date(addMinutes(new Date(), 15)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/'
  }],
};

export const TwoMainEvents = Component.bind({});
TwoMainEvents.args = {
  mainClasses: [{
    starting_at: new Date(subMinutes(new Date(), 40)),
    ending_at: new Date(addHours(new Date(), 1)),
    title: 'Miami 53',
    subLabel: 'Master Class',
    liveClassHash: 'dfsdf',
  },{
    starting_at: new Date(subMinutes(new Date(), 40)),
    ending_at: new Date(addHours(new Date(), 1)),
    title: 'Miami 53',
    subLabel: 'Master Class',
    liveClassHash: 'dfsdf',
  }],
  featureLabel: 'Live clases, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: 'https://www.google.co.ve/',
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    type: 'Workshop',
    icon_url: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582748_960_720.png',
    starting_at: subMinutes(new Date(), 0),
    ending_at: addMinutes(new Date(), 180),
    icon: 'group',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    type: 'Workshop',
    starting_at: new Date(addMinutes(new Date(), 15)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/'
  }],
};

export const OneLiveOnly = Component.bind({});
OneLiveOnly.args = {
  mainClasses: [{
    starting_at: new Date(addHours(new Date(), 5)),
    ending_at: new Date(addHours(new Date(), 8)),
    title: 'Miami 53',
    subLabel: 'Master Class',
    liveClassHash: 'dfsdf',
  },{
    starting_at: new Date(subMinutes(new Date(), 40)),
    ending_at: new Date(addHours(new Date(), 1)),
    title: 'Miami 53',
    subLabel: 'Master Class',
    liveClassHash: 'dfsdf',
  }],
  featureLabel: 'Live clases, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: 'https://www.google.co.ve/',
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    type: 'Workshop',
    icon_url: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582748_960_720.png',
    starting_at: subMinutes(new Date(), 0),
    ending_at: addMinutes(new Date(), 180),
    icon: 'group',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    type: 'Workshop',
    starting_at: new Date(addMinutes(new Date(), 15)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/'
  }],
};

export const StartsIn5Hours = Component.bind({});
StartsIn5Hours.args = {
  width: '320px',
  mainClasses: [{
    subLabel: 'Master Class',
    featureReadMoreUrl: `${ORIGIN_HOST}/lesson/live-events-workshops-and-classes`,
    startingSoonDelta: 30,
    starting_at: new Date(addHours(new Date(), 5)),
    ending_at: new Date(addHours(new Date(), 6)),
    liveClassHash: 'dfsdf',
  }],
  featureLabel: 'Live classes, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: `${ORIGIN_HOST}/lesson/live-events-workshops-and-classes`,
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    type: 'Workshop',
    starting_at: addHours(new Date(), 20),
    ending_at: addHours(new Date(), 22),
    icon: 'group',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    type: 'Workshop',
    starting_at: addHours(new Date(), 12),
    ending_at: addHours(new Date(), 13),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/'
  }],
};

export const NoTodayClass = Component.bind({});
NoTodayClass.args = {
  mainClasses:[],
  featureLabel: 'Live classes, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: `${ORIGIN_HOST}/lesson/live-events-workshops-and-classes`,
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.',
    type: 'Workshop',
    starting_at: addMinutes(new Date(), 120),
    ending_at: addMinutes(new Date(), 200),
    icon: 'group',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/'
  }, {
    title: '4Geeks GeeksTALKS Europe - Meet our Web- dev Students',
    type: 'Workshop',
    starting_at: new Date(addMinutes(new Date(), 32)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/'
  }],
};

export const UpcomingEventsTomorrow = Component.bind({});
UpcomingEventsTomorrow.args = {
  featureLabel: 'Live classes, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: `${ORIGIN_HOST}/lesson/live-events-workshops-and-classes`,
  startingSoonDelta: 30,
  mainClasses:[],
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    type: 'Workshop',
    starting_at: addHours(new Date(), 23),
    ending_at: addHours(new Date(), 24),
    icon: 'group',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    type: 'Workshop',
    starting_at: new Date(addHours(new Date(), 25)),
    ending_at: new Date(addHours(new Date(), 26)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/'
  }],
};

export const UpcomingEventToday = Component.bind({});
UpcomingEventToday.args = {
  featureLabel: 'Live classes, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: `${ORIGIN_HOST}/lesson/live-events-workshops-and-classes`,
  startingSoonDelta: 30,
  mainClasses:[],
  otherEvents: [{
    title: '4Geeks GeeksTALKS Europe - Meet our Web- dev Students',
    type: 'Workshop',
    starting_at: addMinutes(new Date(), 27),
    ending_at: addMinutes(new Date(), 73),
    icon: 'codeBg',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/#login-flow-with-react'
  }, {
    title: 'Coding Jamming - ut aliquam massa nisl quis neque. Suspendisse in orci enim.',
    type: 'Workshop',
    starting_at: new Date(addHours(new Date(), 25)),
    ending_at: new Date(addHours(new Date(), 26)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/#coding-jamming'
  }, {
    title: 'Final Project Presentation',
    type: 'Workshop',
    starting_at: new Date(addHours(new Date(), 52)),
    ending_at: new Date(addHours(new Date(), 54)),
    icon: 'group',
    live_stream_url: 'https://www.google.co.ve/#final-project-presentation'
  }],
};


export const EventsIn2DaysOrMore = Component.bind({});
EventsIn2DaysOrMore.args = {
  featureLabel: 'Live classes, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: `${ORIGIN_HOST}/lesson/live-events-workshops-and-classes`,
  startingSoonDelta: 30,
  mainClasses:[],
  otherEvents: [{
    title: 'Login flow with React',
    type: 'Workshop',
    starting_at: addHours(new Date(), 53),
    ending_at: addHours(new Date(), 54),
    icon: 'codeBg',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/#login-flow-with-react'
  }, {
    title: 'Coding Jamming',
    type: 'Workshop',
    starting_at: new Date(addHours(new Date(), 98)),
    ending_at: new Date(addHours(new Date(), 99)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/#coding-jamming'
  }, {
    title: 'Final Project Presentation',
    type: 'Workshop',
    starting_at: new Date(addDays(new Date(), 106)),
    ending_at: new Date(
      addHours(
        addDays(new Date(), 106),
        2
      )
    ),
    icon: 'group',
    live_stream_url: 'https://www.google.co.ve/#final-project-presentation'
  }],
};
export const StartsFewSeconds = Component.bind({});
StartsFewSeconds.args = {
  mainClasses: [{
    starting_at: new Date(addMinutes(new Date(), 1)),
    ending_at: new Date(addHours(new Date(), 1)),
    title: 'Miami 53',
    subLabel: 'Master Class',
    liveClassHash: 'dfsdf',
  }],
  featureLabel: 'Live clases, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: 'https://www.google.co.ve/',
  startingSoonDelta: 30,
  otherEvents: [{
    title: 'My Wonderful HTML Email Workflow',
    type: 'Workshop',
    icon_url: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582748_960_720.png',
    starting_at: subMinutes(new Date(), 0),
    ending_at: addMinutes(new Date(), 180),
    icon: 'group',
    fill: '#25BF6C',
    live_stream_url: 'https://www.google.co.ve/'
  }, {
    title: 'Coding Jamming',
    type: 'Workshop',
    starting_at: new Date(addMinutes(new Date(), 15)),
    ending_at: new Date(addHours(new Date(), 2)),
    icon: 'codeBg',
    live_stream_url: 'https://www.google.co.ve/'
  }],
};

export const NoClassAndEventsAvailable = Component.bind({});
NoClassAndEventsAvailable.args = {
  mainClasses:[],
  featureLabel: 'Live classes, coding sessions, workshops and hangouts every few hours.',
  featureReadMoreUrl: `${ORIGIN_HOST}/lesson/live-events-workshops-and-classes`,
  startingSoonDelta: 30,
};