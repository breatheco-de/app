import React from 'react';
import {addDecorator} from '@storybook/react';
import {ChakraProvider} from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { initStore } from '../src/store';
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

const store = initStore();

const ProviderWrapper = ({ children, store }) => (
    <Provider store={store}>
        {children}
    </Provider>
);

const withProvider = (Story) => (
    <ProviderWrapper store={store}>
        <Story />
    </ProviderWrapper>
)

addDecorator(withProvider);
