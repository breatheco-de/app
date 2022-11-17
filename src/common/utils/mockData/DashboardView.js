const navbar = {
  width: '100%',
  handleChange: () => {
    alert('Handle User Function Clicked');
  },
  menuList: [
    {
      icon: 'home',
      title: 'Dashboard',
      link: '/',
    },
    {
      icon: 'book',
      title: 'Learn',
      link: '/learn',
    },
    {
      icon: 'message',
      title: 'Mentoring',
      link: '/mentoring',
    },
    {
      icon: 'people',
      title: 'Community',
      link: '/community',
    },
  ],
  user: {
    avatar: 'https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a',
    handleUser: () => { },
    notifies: true,
  },
};

const moduleMap = {
  width: 100,
  title: 'HTML/CSS/Bootstrap',
  description: 'During the pre-work you learn some basic CSS and HTML, and hopefully how to use the flex-box to create simple layouts. The first day we will review the pre-work completion and introduce a more evolved CSS that enables amazing layouts and the amazing Bootstrap framework that will make you life so much easier with the "component oriented" approach.',
  modules: [
    {
      title: 'Read',
      text: 'Introduction to the pre-work',
      icon: 'verified',
      status: 'inactive',
    },
    {
      title: 'Practice',
      text: 'Practice pre-work',
      icon: 'book',
      status: 'active',
    },
    {
      title: 'Practice',
      text: 'Star wars',
      icon: 'verified',
      status: 'finished',
    },
  ],
  handleModuleStatus: () => {},
};

// used in dashboard page
const supportSideBar = {
  title: 'Don’t Get Stuck',
  subtitle: 'Did you know you can schedule mentoring sessions any time or ask in the Support Chat?',
  actionButtons: [
    {
      title: 'SCHEDULE MENTORING',
      href: '#',
      icon: 'conversation',
    },
    {
      title: 'ASK IN SUPPORT CHAT',
      href: 'https://4geeksacademy.slack.com/',
      icon: 'slack',
    },
  ],
};

const cohortSideBar = {
  width: 100,
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

const tapCapsule = {
  tags: [
    {
      name: 'html',
    },
    {
      name: 'css',
    },
    {
      name: 'javascript',
    },
    {
      name: 'react',
    },
    {
      name: 'python',
    },
  ],
  separator: '/',
};

const callToAction = {
  background: 'blue.default',
  title: 'Today\'s lessons',
  text: 'Your lesson today is Internet Architecture in First Time Website Module.',
  width: 'auto',
};

const progressBar = {
  programs: [
    {
      title: 'Lessons',
      Icon: 'book',
      taskLength: 30,
      taskCompleted: 12,
    },
    {
      title: 'Projects',
      icon: 'book',
      taskLength: 15,
      taskCompleted: 5,
    },
    {
      title: 'Exercises',
      icon: 'book',
      taskLength: 15,
      taskCompleted: 5,
    },
  ],
  progressText: 'progress in the program',
  width: '100%',
};

const attendanceDots = [
  {
    id: 1,
    user: {
      first_name: 'Juan',
      last_name: 'Perez',
      profile: {
        avatar_url: '/static/images/p1.png',
      },
      status: 'pending',
    },
    days: [
      {
        label: 'Day 1 - 4 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 2 - 5 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 3 - 6 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 4 - 7 Mar',
        color: '#CD0000',
      },
      {
        label: 'Day 5 - 8 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 6 - 9 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 7 - 10 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 8 - 11 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 9 - 12 Mar',
        color: '#CD0000',
      },
      {
        label: 'Day 10 - 13 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 11 - 14 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 12 - 15 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 13 - 16 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 14 - 17 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 15 - 18 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 16 - 19 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 17 - 20 Mar',
        color: '#CD0000',
      },
      {
        label: 'Day 18 - 21 Mar',
        color: '#CD0000',
      },
      {
        label: 'Day 19 - 22 Mar',
        color: '#CD0000',
      },
      {
        label: 'Day 20 - 23 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 21 - 24 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 22 - 25 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 23 - 26 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 24 - 27 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 25 - 28 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 26 - 29 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 27 - 30 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 28 - 31 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 29 - 1 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 30 - 2 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 31 - 3 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 32 - 4 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 33 - 5 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 34 - 6 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 35 - 7 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 36 - 8 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 37 - 9 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 38 - 10 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 39 - 11 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 40 - 12 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 41 - 13 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 42 - 14 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 43 - 15 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 44 - 16 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 45 - 17 Apr',
        color: '#FFB718',
      },
      {
        label: 'Day 46 - 18 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 47 - 19 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 48 - 20 Apr',
        color: '#25BF6C',
      },
      {
        label: 'Day 49 - 21 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 50 - 22 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 51 - 23 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 52 - 23 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 53 - 24 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 54 - 25 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 55 - 26 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 56 - 27 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 57 - 28 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 58 - 29 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 59 - 30 Apr',
        color: '#C4C4C4',
      },
      {
        label: 'Day 60 - 1 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 61 - 2 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 62 - 3 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 63 - 4 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 64 - 5 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 65 - 6 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 66 - 7 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 67 - 8 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 68 - 9 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 69 - 10 May',
        color: '#C4C4C4',
      },
      {
        label: 'Day 70 - 11 May',
        color: '#C4C4C4',
      },
    ],
  },
  {
    id: 2,
    user: {
      first_name: 'Fernando',
      last_name: 'Fuentes',
      profile: {
        avatar_url: '/static/images/person-smile4.png',
      },
      status: 'pending',
    },
    days: [
      {
        label: 'Day 1 - 4 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 2 - 5 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 3 - 6 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 4 - 7 Mar',
        color: '#CD0000',
      },
      {
        label: 'Day 5 - 8 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 6 - 9 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 7 - 10 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 8 - 11 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 9 - 12 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 10 - 13 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 11 - 14 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 12 - 15 Mar',
        color: '#FFB718',
      },
      {
        label: 'Day 13 - 16 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 14 - 17 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 15 - 18 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 16 - 19 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 17 - 20 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 18 - 21 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 19 - 22 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 20 - 23 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 21 - 24 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 22 - 25 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 23 - 26 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 24 - 27 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 25 - 28 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 26 - 29 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 27 - 30 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 28 - 31 Mar',
        color: '#25BF6C',
      },
      {
        label: 'Day 29 - 1 Apr',
        color: '#25BF6C',
      },
    ],
  },
];

export default {
  navbar,
  cohortSideBar,
  moduleMap,
  supportSideBar,
  tapCapsule,
  callToAction,
  progressBar,
  attendanceDots,
};
