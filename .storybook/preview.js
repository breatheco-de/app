import React from 'react';
import {addDecorator} from '@storybook/react';
import {ChakraProvider} from '@chakra-ui/react';
import { Provider } from 'react-redux';
import I18nProvider from 'next-translate/I18nProvider'
import { useGlobals } from '@storybook/client-api';
import i18n from './i18next.js';
import { initStore } from '../src/store';
import CustomTheme from '../styles/theme';
import '../styles/globals.css';
import '../styles/markdown.css';

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
  i18n,
  locale: 'en',
  locales: {
    en: 'English',
    es: 'Spanish',  
  },
}

const myDecorator = (story, context, ...props) => {
  const [{ locale }] = useGlobals();
  const Story =  story;
  return (
    <I18nProvider lang={locale || 'en'} >
      {/* {story({stTranslation: context.parameters.i18n.store.data})} */}
      <Story stTranslation={context.parameters.i18n.store.data} />
    </I18nProvider>);
};

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

addDecorator(myDecorator);
