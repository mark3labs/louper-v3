import js from '@eslint/js'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
    rules: {
      // ESLint 10's `no-useless-assignment` has no awareness of Svelte runes.
      // It flags `let { ref = $bindable(null) } = $props()` as a useless
      // assignment because `ref` is never read inside the component, but the
      // value is the default for a two-way bound prop and is read by the parent.
      'no-useless-assignment': 'off',
    },
  },
  {
    rules: {
      // Pre-existing `any` usage throughout ABI-driven code; surfaced as warnings
      '@typescript-eslint/no-explicit-any': 'warn',
      // App uses dynamic gotos/hrefs built from user input (addresses, networks)
      'svelte/no-navigation-without-resolve': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        Bun: 'readonly',
      },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', '.backup/', 'node_modules/', 'drizzle/'],
  },
)
