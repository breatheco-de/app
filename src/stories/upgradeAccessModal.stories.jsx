import React from 'react';

import UpgradeAccessModal from '../components/UpgradeAccessModal';

export default {
  title: 'Components/UpgradeAccessModal',
  component: UpgradeAccessModal,
  argTypes: {
    isOpen: {
      control: 'boolean'
    },
  },
};

const Component = (args) => <UpgradeAccessModal storySettings={{...args}} />;

export const Default = Component.bind({});
Default.args = {
  isOpen: true,
  plans: [
    {
      "type": "pro",
      "show": true,
      "title": "One time payment",
      "price": "$199",
      "lastPrice": "<s>$399</s>",
      "offerTitle": "Limited offer",
      "payment": "One time payment",
      "description": "Full access to all features for the duration of the course",
      "bullets": {
        "title": "What you will get",
        "list": [
          {
            "title": "Unlimited access to group masterclasses"
          },
          {
            "title": "Unlimited access to workshops"
          },
          {
            "title": "Unlimited access to course content"
          },
          {
            "title": "Certificate endorsed by industry leaders"
          }
        ]
      }
    },
    {
      "type": "schoolarship-t1",
      "show": true,
      "title": "scholarship level 1",
      "price": "$70",
      "payment": "3 months",
      "highlightText": "",
      "description": "Full access to all features for the duration of the course.",
      "bullets": {
        "title": "What you will get",
        "list": [
          {
            "title": "scholarship level 1 - featured 1"
          },
          {
            "title": "scholarship level 1 - featured 2"
          },
          {
            "title": "scholarship level 1 - featured 3"
          },
          {
            "title": "scholarship level 1 - featured 4"
          }
        ]
      }
    },
    {
      "type": "schoolarship-t2",
      "show": true,
      "title": "scholarship level 2",
      "price": "$50",
      "payment": "5 months",
      "highlightText": "",
      "description": "Full access to all features for the duration of the course.",
      "bullets": {
        "title": "What you will get",
        "list": [
          {
            "title": "scholarship level 2 - featured 1"
          },
          {
            "title": "scholarship level 2 - featured 2"
          },
          {
            "title": "scholarship level 2 - featured 3"
          },
          {
            "title": "scholarship level 2 - featured 4"
          }
        ]
      }
    },
  ],
  image: 'static/images/meeting.png'
};
