const path = require('path');

const toPath = (_path) => path.join(process.cwd(), _path);
module.exports = {
  staticDirs: ['../public'],
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    "@storybook/addon-knobs",
    'storybook-react-i18next',
  ],
  webpackFinal: async (config) => ({
    ...config,
    node: { ...config.node, fs: 'empty' },
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@emotion/core': toPath('node_modules/@emotion/react'),
        'emotion-theming': toPath('node_modules/@emotion/react'),
      },
    },
  }),
};
