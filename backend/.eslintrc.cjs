/**
 *  @type {import('eslint').ESLint.ConfigData}
 */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  plugins: ["perfectionist", "unused-imports", "@typescript-eslint", "prettier"],
  extends: ["airbnb", "airbnb-typescript", "airbnb/hooks", "prettier"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.json",
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  /**
   * 0 ~ 'off'
   * 1 ~ 'warn'
   * 2 ~ 'error'
   */
  rules: {
    // general
    "arrow-body-style": "off",
    "no-alert": 0,
    camelcase: 0,
    "no-console": "warn",
    "no-unused-vars": 0,
    "no-nested-ternary": 0,
    "no-param-reassign": 0,
    "no-underscore-dangle": 0,
    "no-restricted-exports": 0,
    "no-promise-executor-return": 0,
    "import/prefer-default-export": 0,
    "prefer-destructuring": [1, { object: true, array: false }],
    // typescript
    "@typescript-eslint/naming-convention": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/consistent-type-exports": 0,
    "@typescript-eslint/consistent-type-imports": 0,
    "@typescript-eslint/no-unused-vars": [1, { args: "none" }],
    "@typescript-eslint/no-empty-function": [
      "warn",
      {
        allow: [],
      },
    ],
    "@typescript-eslint/no-explicit-any": 0,
    // react
    "react/boolean-prop-naming": 0,
    "react/prop-types": 0,
    "react/self-closing-comp": 0,
    "react/no-children-prop": 0,
    "react/react-in-jsx-scope": 0,
    "react/no-array-index-key": 0,
    "react/require-default-props": 0,
    "react/jsx-props-no-spreading": 0,
    "react/function-component-definition": 0,
    "react/destructuring-assignment": 0,
    "react/jsx-filename-extension": 0,
    "react/jsx-no-duplicate-props": [1, { ignoreCase: false }],
    "react/jsx-no-useless-fragment": [1, { allowExpressions: true }],
    "react/no-unstable-nested-components": 0,
    // jsx-a11y
    "jsx-a11y/anchor-is-valid": 0,
    "jsx-a11y/control-has-associated-label": 0,
    // unused imports
    "unused-imports/no-unused-imports": 1,
    "unused-imports/no-unused-vars": [
      0,
      { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
    ],
    // perfectionist
    "perfectionist/sort-exports": "off",
    "perfectionist/sort-named-imports": "off",
    "perfectionist/sort-named-exports": "off",
    "perfectionist/sort-imports": "off",
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "useQuery",
      },
    ],
  },
};
