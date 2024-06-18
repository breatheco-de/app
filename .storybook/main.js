const path = require('path');
const toPath = (_path) => path.join(process.cwd(), _path);

/** @type { import('@storybook/nextjs').StorybookConfig } */
module.exports = {
  staticDirs: ['../public'],
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-actions',
    "@storybook/addon-knobs",
  ],
  webpackFinal: async (config, { configType }) => {
    config.resolve.alias['@emotion/core'] = toPath('node_modules/@emotion/react');
    config.resolve.alias['emotion-theming'] = toPath('node_modules/@emotion/react');

    return config;
  },
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  // docs: {
  //   autodocs: "tag",
  // },
};
