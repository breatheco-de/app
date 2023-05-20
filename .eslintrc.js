module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@next/next/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-console': 'off',
    'max-len': 'off',
    'object-curly-newline': 'off',
    'spaced-comment': 'off',
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
    'react/jsx-no-useless-fragment': 'off',
    'default-param-last': 'off',
  },
  ignorePatterns: [
    'src/__tests__/*', 'cypress', 'src/stories/**/*.jsx',
    'src/stories/**/*.js',
  ],
};
