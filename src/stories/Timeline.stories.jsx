// import React from 'react';
// import { action } from '@storybook/addon-actions';
// import { withKnobs } from '@storybook/addon-knobs';
// import Timeline from '../common/components/Timeline';

// const onClickAssignment = (e, item) => {
//   console.log('event: ', e);
//   console.log('item: ', item);
//   action('onClickAssignment')
// };

// export default {
//   title: 'Components/Timeline',
//   component: Timeline,
//   argTypes: {
//     width: {
//       control: {
//         type: 'range',
//         min: 0,
//         max: 100,
//       },
//     },
//   },
//   decorators: [withKnobs],
// };

// const Component = (args) => <Timeline {...args} width={`${args.width}%`} />;

// export const Default = Component.bind({});
// Default.args = {
//   onClickAssignment,
//   title: '<HTML/CSS>',
//   width: 100,
//   assignments: [
//     {
//       id: 1,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: true,
//     },
//     {
//       id: 2,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: false,
//     },
//     {
//       id: 3,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: false,
//     },
//     {
//       id: 4,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: false,
//     },
//     {
//       id: 5,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: false,
//     },
//     {
//       id: 6,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: false,
//     },
//     {
//       id: 7,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: false,
//     },
//     {
//       id: 8,
//       type: 'Read',
//       title: 'Introduction to prework',
//       icon: 'book',
//       muted: false,
//     },
//   ],
// };
