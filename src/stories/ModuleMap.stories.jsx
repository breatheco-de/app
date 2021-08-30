import React from 'react';
import ModuleMap from '../common/components/ModuleMap';
import useModuleMap from '../common/store/actions/moduleMapAction';


export default {
  title: 'Components/ModuleMap',
  component: ModuleMap,
  argTypes: {
    modules: {
      control: { type: 'object' },
    },
  },
};

const Component = (args) => { 
 const { updateModuleStatus } = useModuleMap();
 const handleModuleStatus = (event, module) => {
  event.stopPropagation()
  if(module.status === 'inactive') updateModuleStatus({...module, status: 'active'})
  else if (module.status === 'active') updateModuleStatus({...module, status: 'finished'})
  else if (module.status === 'finished') updateModuleStatus({...module, status: 'active'})
 };
  return <ModuleMap {...args} handleModuleStatus={handleModuleStatus}/>
};

export const Default = Component.bind({});
Default.args = {
  width: '40%',
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
};
