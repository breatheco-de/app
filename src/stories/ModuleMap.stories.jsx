import React from 'react';
import ModuleMap from '../common/components/ModuleMap';
import useModuleMap from '../common/store/actions/moduleMapAction';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/ModuleMap',
  component: ModuleMap,
  argTypes: {
    modules: {
      control: { type: 'object' },
    },
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
    },
  }
}
};

const Component = (args) => { 
 const { updateModuleStatus } = useModuleMap();
 const handleModuleStatus = (event, module) => {
  event.stopPropagation()
  if(module.status === 'inactive') updateModuleStatus({...module, status: 'active'})
  else if (module.status === 'active') updateModuleStatus({...module, status: 'finished'})
  else if (module.status === 'finished') updateModuleStatus({...module, status: 'active'})
 };
  return <ModuleMap {...args} handleModuleStatus={handleModuleStatus} width={`${args.width}%`}/>
};

export const Default = Component.bind({});
Default.args = {
  width: 100,
  title: 'HTML/CSS/Bootstrap',
  description: 'During the pre-work you learn some basic CSS and HTML, and hopefully how to use the flex-box to create simple layouts. The first day we will review the pre-work completion and introduce a more evolved CSS that enables amazing layouts and the amazing Bootstrap framework that will make you life so much easier with the "component oriented" approach.',
  modules: [
    {
      title: 'Read',
      text: 'Introduction to the pre-work',
      icon: 'verified',
      status:'inactive',
    },
    {
      title: 'Practice',
      text: 'Practice pre-work',
      icon: 'book',
      status:'active',
    },
    {
      title: 'Practice',
      text: 'Star wars',
      icon: 'verified',
      status:'finished',
    },
  ],
  handleModuleStatus: action("click")
};
