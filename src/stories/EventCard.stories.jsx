import React from 'react';
import EventCard from '../common/components/EventCard';
import { addHours, subMinutes } from 'date-fns';

export default {
  title: 'Components/EventCard',
  component: EventCard,
  argTypes: {
    startingAt: {
      control: {
        type: 'date'
      }
    },
    endingAt: {
      control: {
        type: 'date'
      }
    },
  },
};

const Template = (args, context) => (
  <EventCard
    title={args?.title}
    host={args?.host}
    description={args?.description}
    technologies={args?.technologies}
    startingAt={new Date(args?.startingAt)}
    endingAt={new Date(args?.endingAt)}
  />
);

export const Default = Template.bind({});
Default.args = {
  title: 'How to use React icons in Next.js',
  description: 'Yorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsa.',
  technologies: ['Machine Learning'],
  startingAt: new Date(addHours(new Date(), 2)),
  endingAt: new Date(addHours(new Date(), 4)),
  host: {
    full_name: 'John Doe',
    job_title: 'Software Engineer',
    avatar: 'https://via.placeholder.com/150',
  },
};
export const Started = Template.bind({});
Started.args = {
  title: 'How to use React icons in Next.js',
  description: 'Yorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsa.',
  technologies: ['Machine Learning'],
  startingAt: new Date(subMinutes(new Date(), 20)),
  endingAt: new Date(addHours(new Date(), 1)),
  host: {
    full_name: 'John Doe',
    job_title: 'Software Engineer',
    avatar: 'https://via.placeholder.com/150',
  },
};
