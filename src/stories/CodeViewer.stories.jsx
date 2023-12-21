import React from 'react';
import CodeViewer from '../common/components/CodeViewer';
import { Box } from '@chakra-ui/react';

export default {
  title: 'components/Code Viewer',
  component: CodeViewer,
  argTypes: {
    allowNotLogged: {
      control: {
        type: 'boolean'
      }
    },
    languagesData: {
      control: {
        type: 'object'
      }
    },
  }
};

const Component = (args, context) => {
  return (
    <Box width={args?.width || '500px'}>
      <CodeViewer stTranslation={context.parameters.i18n.store.data} {...args} />
    </Box>
  )
};

export const Default = Component.bind({});
Default.args = {
  languagesData: [{
    label: 'JS',
    language: 'javascript',
    code: 'console.log(1)',
  }, {
    label: 'Python',
    language: 'python',
    code: 'print(1)',
  }],
};

export const Logged = Component.bind({});
Logged.args = {
  languagesData: [{
    label: 'JS',
    language: 'javascript',
    code: 'console.log(1)',
  }, {
    label: 'Python',
    language: 'python',
    code: 'print(1)',
  }],
  allowNotLogged: true,
};
