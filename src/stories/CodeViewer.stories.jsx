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
      <CodeViewer {...args} />
    </Box>
  )
};

const htmlCode = `
  <h1>Hello world!</h1>
  <div>
    <p>
      This is the html test
    </p>
  </div>
`;

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
  }, {
    label: 'Html',
    language: 'html',
    code: htmlCode,
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
