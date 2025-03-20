/** @type {import("prettier").Config} */
export default {
  semi: true, // Add semicolons at the end of statements
  singleQuote: true, // Use single quotes instead of double
  tabWidth: 2, // Set indentation to 2 spaces
  useTabs: false, // Use spaces instead of tabs
  trailingComma: "es5", // Add trailing commas in ES5-compatible places
  bracketSpacing: true, // Space between brackets `{ foo: bar }`
  arrowParens: "always", // Always add parentheses around arrow function params
  printWidth: 100, // Maximum line width before wrapping
  proseWrap: "preserve", // Keep markdown line breaks as they are
};
