import React from 'react'
import {addDecorator} from '@storybook/react'
import {ChakraProvider} from '@chakra-ui/react'
import CustomTheme from '../styles/theme';
import "@fontsource/lato/100.css"
import "@fontsource/lato/300.css"
import "@fontsource/lato/400.css"
import "@fontsource/lato/700.css"
import "@fontsource/lato/900.css"

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