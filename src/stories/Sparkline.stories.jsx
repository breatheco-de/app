import React from 'react';

import Sparkline from '../components/Sparkline';

export default {
  title: 'Components/Sparkline',
  component: Sparkline,
  argTypes: {
    values: {
      control: 'array',
    },
    interactive: {
      control: 'boolean',
    },
    lineWidth: {
      control: 'number',
      table: {
        category: 'SVG Properties',
      },
    },
    circleWidth: {
      control: 'number',
      table: {
        category: 'SVG Properties',
      },
    },
    containerWidth: {
      control: 'text',
      table: {
        category: 'SVG Properties',
      },
    },
    width: {
      table: {
        category: 'SVG Properties',
      },
      control: {
        type: 'number',
      },
    },
    chartStyle: {
      table: {
        category: 'SVG Properties',
      },
      control: {
        type: 'object',
      },
    },
    height: {
      table: {
        category: 'SVG Properties',
      },
      control: {
        type: 'number',
      },
    },
    strokeWidth: {
      table: {
        category: 'SVG Properties',
      },
      control: {
        type: 'number',
      },
    },
    strokeDasharray: {
      table: {
        category: 'SVG Properties',
      },
      control: {
        type: 'number',
      },
    },
    strokeDashoffset: {
      table: {
        category: 'SVG Properties',
      },
      control: {
        type: 'number',
      },
    },
    backgroundColor: {
      table: {
        category: 'Colors',
      },
    },
    fillColor: {
      table: {
        category: 'Colors',
      },
    },
    strokeColor: {
      table: {
        category: 'Colors',
      },
    },
  },
};

const Component = (args) => <Sparkline {...args} />;

export const Default = Component.bind({});
Default.args = {
  values: [
    {name: "Ethereum", date: "2017-01-01", value: 8.3},
    {name: "Ethereum", date: "2017-02-01", value: 110.57},
    {name: "Ethereum", date: "2017-03-01", value: 15.73},
    {name: "Ethereum", date: "2017-04-01", value: 349.51},
    {name: "Ethereum", date: "2017-05-01", value: 85.69},
    {name: "Ethereum", date: "2017-06-01", value: 26.51},
    {name: "Ethereum", date: "2017-07-01", value: 246.65},
    {name: "Ethereum", date: "2017-08-01", value: 3.87},
    {name: "Ethereum", date: "2017-09-01", value: 386.61},
    {name: "Ethereum", date: "2017-10-01", value: 303.56},
    {name: "Ethereum", date: "2017-11-01", value: 298.21},
  ],
  tooltipContent: '{date}: {value}',
  circleWidth: 3,
  interactive: true,
  width: 300,
  height: 60,
  chartStyle: {
    top: '0px',
    left: '0px',
  },
  strokeWidth: 3,
  strokeDasharray: 0,
  strokeDashoffset: 0,
  backgroundColor: 'inherit',
  fillColor: 'none',
  strokeColor: '#0097CD',
  lineWidth: 2,
  containerWidth: '300px',
};
