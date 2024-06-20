import React from 'react';
// import {addDecorators} from '@storybook/react';
import {ChakraProvider} from '@chakra-ui/react';
import { Provider } from 'react-redux';
import I18nProvider from 'next-translate/I18nProvider'
import { useGlobals } from '@storybook/client-api';
import { initStore } from '../src/store';
import CustomTheme from '../styles/theme';
import '../styles/globals.css';
import '../styles/markdown.css';
import '../styles/react-tags-input.css';
import namespaces from './generated/namespaces.json';

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
  locale: 'en',
  locales: {
    en: 'English',
    es: 'Spanish',  
  },
}

const myDecorator = (Story, context) => {
  const [{ locale }] = useGlobals();
  return (
    <I18nProvider lang={locale || 'en'} namespaces={namespaces[locale]}>
      <Story />
    </I18nProvider>
  );
};

const store = initStore();

const ProviderWrapper = ({ children }) => (
  <Provider store={store}>
    {children}
  </Provider>
);

export const decorators = [
  (Story) => (
    <ChakraProvider resetCSS theme={CustomTheme}>
      {Story()}
    </ChakraProvider>
  ),
  (Story) => (
    <ProviderWrapper>
      {Story()}
    </ProviderWrapper>
  ),
  myDecorator,
];

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'en',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', right: '🇺🇸', title: 'English' },
        { value: 'es', right: '🇪🇸', title: 'Spanish' },
      ],
    },
  },
};

export const decoratorsPreview = [
  (Story, { globals }) => {
    const locale = globals.locale;
    return (
      <I18nProvider lang={locale || 'en'}>
        <Story {...globals} />
      </I18nProvider>
    );
  },
];
