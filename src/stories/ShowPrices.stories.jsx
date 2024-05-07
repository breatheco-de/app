import React from 'react';
import ShowPrices from '../common/components/ShowPrices';
import { Box } from '@chakra-ui/react';

export default {
  title: 'components/Show Prices',
  component: ShowPrices,
  argTypes: {
    title: {
      control: {
        type: 'text'
      }
    },
    onePaymentLabel: {
      control: {
        type: 'text'
      }
    },
    financeTextLabel: {
      control: {
        type: 'text'
      }
    },
    notReady: {
      control: {
        type: 'text'
      }
    },
    list: {
      control: {
        type: 'object'
      }
    },
    finance: {
      control: {
        type: 'object'
      }
    },
    defaultIndex: {
      control: {
        type: 'number'
      }
    },
    defaultFinanceIndex: {
      control: {
        type: 'number'
      }
    },
  }
};

const Component = (args, context) => {
  return (
    <Box width={args?.width || '520px'}>
      <ShowPrices stTranslation={context.parameters.i18n.store.data} {...args} />
    </Box>
  )
};

const list = [
  {
    "type": "pro",
    "show": true,
    "title": "One time payment",
    "price": "$200",
    "offerTitle": "Limited offer",
    "description": "Full access to all features for the duration of the course",
    "highlightText": "",
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
    },
  },
  {
    "type": "pro",
    "show": true,
    "title": "One time payment",
    "price": "$199",
    "lastPrice": "$399",
    "offerTitle": "Limited offer",
    "description": "Full access to all features for the duration of the course",
    "highlightText": "",
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
    },
  },
  {
    "type": "trial",
    "show": true,
    "isFreeTier": true,
    "title": "Free trial",
    "price": "7 Days trial",
    "lastPrice": "",
    "description": "No card needed. Full access to all features for 7 days",
    "highlightText": "",
    "offerTitle": "",
    "bullets": {
      "title": "What you will get",
      "list": [
        {
          "title": "1 mentoring session per month."
        },
        {
          "title": "Limited access to workshops."
        },
        {
          "title": "Access to module 1 of the cohort."
        }
      ]
    },
    "button": {
      "title": "Start trial",
      "link": "#start"
    }
  }
];

const finance = [
  {
    "type": "schoolarship-t1",
    "show": true,
    "title": "scholarship level 1",
    "price": "$45 x 5",
    "months": "3 months",
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
    },
  },
  {
    "type": "schoolarship-t2",
    "show": true,
    "title": "scholarship level 2",
    "price": "$70 x 3",
    "months": "5 months",
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
    },
  },
  {
    "type": "schoolarship-trial",
    "show": true,
    "isFreeTier": true,
    "title": "Free trial",
    "price": "7 days trial",
    "months": "",
    "highlightText": "",
    "description": "No card needed. Full access to all features for 7 days",
    "bullets": {
      "title": "What you will get",
      "list": [
        {
          "title": "Free trial - featured 1"
        },
        {
          "title": "Free trial - featured 2"
        },
        {
          "title": "Free trial - featured 3"
        },
        {
          "title": "Free trial - featured 4"
        }
      ]
    },
  }
];

const financeNoFree = [
  {
    "type": "schoolarship-t1",
    "show": true,
    "title": "scholarship level 1",
    "price": "$45 x 5",
    "months": "3 months",
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
    },
  },
  {
    "type": "schoolarship-t2",
    "show": true,
    "title": "scholarship level 2",
    "price": "$70 x 3",
    "months": "5 months",
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
    },
  },
];

const noConsumablesList = [
  {
    "type": "pro",
    "show": true,
    "title": "5 mentoring sessions",
    "price": "$199",
    "offerTitle": "Limited offer",
    "description": "Full access to all features for the duration of the course",
    "highlightText": "",
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
    },
  },
  {
    "type": "pro",
    "show": true,
    "title": "10 mentoring sessions",
    "price": "$199",
    "offerTitle": "Limited offer",
    "description": "Full access to all features for the duration of the course",
    "highlightText": "",
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
    },
  },
];

export const Default = Component.bind({});
Default.args = {
  title: 'Choose your plan',
  onePaymentLabel: 'One payment',
  financeTextLabel: 'Finance',
  notReady: 'Not ready to commit?',
  list,
  finance,
};

export const OnePaymentOnly = Component.bind({});
OnePaymentOnly.args = {
  title: 'Choose your plan',
  onePaymentLabel: 'One payment',
  financeTextLabel: 'Finance',
  notReady: 'Not ready to commit?',
  list: [{
    "type": "pro",
    "show": true,
    "title": "Monthly Payment",
    "price": "$200",
    "offerTitle": "Limited offer",
    "description": "Full access to all features for the duration of the course",
    "highlightText": "",
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
    },
  }],
  finance: financeNoFree,
};

export const OutOfConsumables = Component.bind({});
OutOfConsumables.args = {
  title: 'Choose your plan',
  onePaymentLabel: 'One payment',
  financeTextLabel: 'Finance',
  notReady: 'Not ready to commit?',
  list: noConsumablesList,
  outOfConsumables: true,
};

export const WithFreeTrial = Component.bind({});
WithFreeTrial.args = {
  title: 'Choose your plan',
  onePaymentLabel: 'One payment',
  financeTextLabel: 'Finance',
  notReady: 'Not ready to commit?',
  list,
  outOfConsumables: false,
};
