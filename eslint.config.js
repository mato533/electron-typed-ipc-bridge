/* eslint-env node */
import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: [
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
    ],
    settings: {
      'import/internal-regex': ['^@/'],
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'unicorn/prefer-node-protocol': 'error',
      'import/extensions': [
        'error',
        {
          js: 'never',
          vue: 'always',
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['parent', 'sibling'], 'index', 'object', 'type'],
          distinctGroup: true,
          pathGroups: [
            {
              pattern: '@/**',
              group: 'parent',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['**/*.{spec,test}.ts', '**/*.{spec,test}.e2e.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': ['off'],
    },
  },
  {
    ignores: ['node_modules/*', 'dist/*', '**/*/.gitignore', 'coverage/*'],
  },
]
