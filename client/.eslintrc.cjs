const path = require('path')
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
  },
  plugins: ['prettier', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:@typescript-eslint/eslint-recommended",
    'eslint-config-prettier',
    'prettier',
  ],
  settings: {
    'react': {
      'version': 'detect'
    },
    'import/resolver': {
      'node': {
        'paths': [path.resolve(__dirname)],
        'extensions': ['.js', '.jsx', '.ts', '.tsx'],
        'moduleDirectory': ['node_modules', 'src/'],
      },
      'alias': {
        'map': [
          ["@", "./src"],
          ["@/css", "./src/css"],
          ["@/data", "./src/data"],
          ["@/utils", "./src/utils"],
          ["@/redux", "./src/redux"],
          ["@/layouts", "./src/layouts"],
          ["@/assets", "./public/assets"],
          ["@/components", "./src/components"],
          ["@/constants", "./src/constants"],
          ["@/contexts", "./src/contexts"],
          // more aliases
        ],
        'extensions': ['.js', '.jsx', '.ts', '.tsx', '.json']
      }
    }
  },
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-bo-target-blank': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-unused-vars': 0,
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-unresolved': [
      'error',
      {
        'ignore': ['\.svg']
      }
    ],
    'import/named': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
  },
}