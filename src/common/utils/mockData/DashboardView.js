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

const supportSideBar = {
  title: 'Don’t Get Stuck',
  subtitle: 'Did you know you can schedule mentoring sessions any time or ask in the Support Chat?',
  actionButtons: [
    {
      title: 'SCHEDULE MENTORING',
      icon: 'conversation',
    },
    {
      title: 'ASK IN SUPPORT CHAT',
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
  title: 'Todays lessons',
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

export default {
  navbar,
  cohortSideBar,
  moduleMap,
  supportSideBar,
  tapCapsule,
  callToAction,
  progressBar,
};
