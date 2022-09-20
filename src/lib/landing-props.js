const avatars = [
  {
    firstName: 'Jhon',
    lastName: 'Johnson',
    picture: '/static/images/p1.png',
  },
  {
    firstName: 'Jhon',
    lastName: 'Module',
    picture: '/static/images/p2.png',
  },
  {
    firstName: 'Harry',
    lastName: 'Jackson',
    picture: '/static/images/p5.png',
  },
  {
    firstName: 'Jimmy',
    lastName: 'Tomato',
    picture: '/static/images/p4.png',
  },
  {
    firstName: 'Jhonny',
    lastName: 'Johnson',
    picture: '/static/images/p3.png',
  },
  {
    firstName: 'Doe',
    lastName: 'Doe',
    picture: '/static/images/p6.png',
  },
  {
    firstName: 'Brian',
    lastName: 'Castro',
    picture: '/static/images/image1.png',
  },
  {
    firstName: 'George',
    lastName: 'Vegas',
    picture: '/static/images/code1.png',
  },
  {
    firstName: 'Jessie',
    lastName: 'Kamp',
    picture: '/static/images/person-smile1.png',
  },
  {
    firstName: 'Claudia',
    lastName: 'Casas',
    picture: '/static/images/person-smile2.png',
  },
  {
    firstName: 'Kevin',
    lastName: 'Read',
    picture: '/static/images/person-smile3.png',
  },
  {
    firstName: 'Mike',
    lastName: 'Torres',
    picture: '/static/images/person-smile4.png',
  },
];

const parallax1 = [
  {
    start: 0,
    end: 300,
    properties: [
      {
        startValue: 0.8,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },
];
const parallax2 = [
  {
    start: 400,
    end: 800,
    properties: [
      {
        startValue: 0.8,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },
];

const parallaxAvatars = [
  {
    start: 0,
    end: 400,
    properties: [
      {
        startValue: 0.3,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },
];
const parallaxAvatars2 = [
  {
    start: 300,
    end: 800,
    properties: [
      {
        startValue: 0.3,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },
];
const parallax3 = [
  {
    start: 900,
    end: 1200,
    properties: [
      {
        startValue: 0.4,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },
];
const parallax4 = [
  {
    start: 1200,
    end: 1800,
    properties: [
      {
        startValue: 0.6,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },
];
const parallax5 = [
  {
    start: 2400,
    end: 2800,
    properties: [
      {
        startValue: 0.6,
        endValue: 1,
        property: 'scale',
      },
    ],
  },
];

export {
  avatars, parallax1, parallax2, parallax3, parallax4, parallax5, parallaxAvatars, parallaxAvatars2,
};
