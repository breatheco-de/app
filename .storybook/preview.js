import React from 'react'
import {addDecorator} from '@storybook/react'
import {ChakraProvider} from '@chakra-ui/react'
import CustomTheme from '../styles/theme';
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}


addDecorator((storyFn) => (
  <ChakraProvider resetCSS={false} theme={CustomTheme}>
    {storyFn()}
  </ChakraProvider>
))