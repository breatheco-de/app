import React from 'react';
import CohortSideBar from '../common/components/CohortSideBar';

export default {
  title: 'Components/CohortSideBar',
  component: CohortSideBar,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 200,
        max: 450,
      },
    },
  },
};

const Component = (args) => <CohortSideBar width={`${args.width}px`} {...args} />;

export const Default = Component.bind({});
Default.args = {
  width: 352,
  title: 'Cohort',
  cohortCity: 'Miami Downtown',
  professor: {
    name: 'Paolo lucano',
    image: 'https://bit.ly/dan-abramov',
    active: true,
  },
  assistant: [
    {
      active: false,
      image: '',
      name: 'Initial Names',
    },
  ],
  classmates: [
    {
      active: true,
      image: 'https://bit.ly/kent-c-dodds',
      name: 'jhon',
    },
    {
      active: true,
      image: 'https://bit.ly/ryan-florence',
      name: 'alex',
    },
    {
      active: true,
      image: 'https://bit.ly/sage-adebayo',
      name: 'jeff',
    },
    {
      active: true,
      image: 'https://bit.ly/code-beast',
      name: 'doe',
    },
    {
      active: true,
      image: 'https://bit.ly/prosper-baba',
      name: 'harry',
    },
    {
      active: true,
      image: 'https://bit.ly/ryan-florence',
      name: 'alex',
    },
    {
      active: true,
      image: 'https://bit.ly/sage-adebayo',
      name: 'jeff',
    },
    {
      active: true,
      image: 'https://bit.ly/code-beast',
      name: 'doe',
    },
    {
      active: true,
      image: 'https://bit.ly/prosper-baba',
      name: 'harry',
    },
  ],
};
