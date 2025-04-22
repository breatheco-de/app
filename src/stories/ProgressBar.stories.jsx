import React from 'react';
import ProgressBar from '../components/ProgressBar';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
  },
};



const taskTodo = [
  {
    associated_slug: "what-is-javascript-learn-to-code-in-javascript",
    description: "",
    github_url: null,
    id: 60153,
    live_url: null,
    revision_status: "PENDING",
    task_status: "PENDING",
    task_type: "LESSON",
    title: "Learning to code with JS",
  },
  {
    associated_slug: "bootstrap",
    description: "",
    github_url: null,
    id: 25144,
    live_url: null,
    revision_status: "PENDING",
    task_status: "PENDING",
    task_type: "QUIZ",
    title: "Bootstrap",
  },
  {
    associated_slug: "css-exercises",
    description: "",
    github_url: null,
    id: 25145,
    live_url: null,
    revision_status: "PENDING",
    task_status: "PENDING",
    task_type: "EXERCISE",
    title: "Learn CSS Interactively",
  },
  {
    associated_slug: "bootstrap-exercises",
    description: "",
    github_url: null,
    id: 25147,
    live_url: null,
    revision_status: "PENDING",
    task_status: "PENDING",
    task_type: "EXERCISE",
    title: "Learn Bootstrap Tutorial",
  },
  {
    associated_slug: "html",
    description: "",
    github_url: null,
    id: 47095,
    live_url: null,
    revision_status: "PENDING",
    task_status: "DONE",
    task_type: "EXERCISE",
    title: "Learn HTML",
  },
  {
    associated_slug: "conditional-profile-card",
    description: "",
    github_url: "",
    id: 57622,
    live_url: null,
    revision_status: "PENDING",
    task_status: "PENDING",
    task_type: "PROJECT",
    title: "Conditional Profile Card Generator",
  }
]

const Component = (args) => (
  <ProgressBar {...args} width={`${args.width}%`} />
);
export const Default = Component.bind({});
Default.args = {
  taskTodo,
  progressText: 'progress in the program',
  width: 50,
};
