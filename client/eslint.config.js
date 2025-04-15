// eslint.config.js
import eslintPluginReact from "eslint-plugin-react";

export default [
  {
    ignores: ["node_modules/", "dist/", "build/", ".next/"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      react: eslintPluginReact,
    },
    rules: {
      "no-unused-vars": "warn",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
