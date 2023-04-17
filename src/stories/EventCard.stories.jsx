import React from 'react';
import EventCard from '../common/components/EventCard';

export default {
  title: 'Components/EventCard',
  component: EventCard,
  argTypes: {},
};

const Template = (args) => (
  <EventCard />
);

export const Default = Template.bind({});
Default.args = {};
