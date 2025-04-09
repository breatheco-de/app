import { Provider } from 'react-redux';
import { initStore } from '../src/store';
import {addDecorator} from '@storybook/react';

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