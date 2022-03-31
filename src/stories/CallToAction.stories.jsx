// import React from 'react';
// import { action } from '@storybook/addon-actions';
// import { withKnobs } from '@storybook/addon-knobs';
// import CallToAction from '../common/components/CallToAction';

// export default {
//   title: 'Components/CallToAction',
//   component: CallToAction,
//   argTypes: {
//     width: {
//       control: {
//         type: 'range',
//         min: 0,
//         max: 100,
//       },
//     },
//     decorators: [withKnobs],
//   },
// };

// const Component = (args) => (
//   <CallToAction {...args} width={`${args.width}%`} />
// );
// export const Default = Component.bind({});
// Default.args = {
//   title: 'What is next!',
//   text: 'Your lesson today is Internet Architecture in First Time Website Module.',
//   buttonText: 'Start Today\'s module',
//   href: '#tasks_remain',
//   background: 'blue',
//   width: '100%',
//   margin: '0 auto',
//   onClick: (e) => {
//     action('onClick')(e);
//   }
// };
