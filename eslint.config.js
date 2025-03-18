import eslintPluginNode from 'eslint-plugin-node';

export default [
  {
    ignores: ['node_modules/', 'dist/', 'build/'], // Ignore common directories
  },
  {
    languageOptions: {
      ecmaVersion: 'latest', // Use the latest ECMAScript version
      sourceType: 'module', // Enable ES Modules (import/export)
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      node: eslintPluginNode, // Node.js plugin for best practices
    },
    rules: {
      'node/no-unsupported-features/es-syntax': [
        'error',
        { version: '>=14.0.0' },
      ],
      'node/no-bigint': 'off', // Disable the rule causing the error
      'no-console': 'off', // Allow `console` statements
      'no-unused-vars': 'warn', // Warn on unused variables
      'no-undef': 'error', // Error on undefined variables
    },
  },
];
