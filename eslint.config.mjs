import antfu from '@antfu/eslint-config';

// ESLint is the formatter too - there is no separate Prettier step to fight it.
// Local overrides go at the bottom, each with a one-line reason: an override
// without a stated reason is indistinguishable from an accident.
export default antfu(
  {
    typescript: true,
    lessOpinionated: true,
    isInEditor: false,
    stylistic: { semi: true },
    ignores: ['coverage/**', 'reports/**', '.stryker-tmp/**'],
  },
  {
    rules: {
      // `type` everywhere: one way to declare a shape, and it composes with unions.
      'ts/consistent-type-definitions': ['error', 'type'],
      // ts-ignore rots silently; ts-expect-error fails once the problem is gone.
      'ts/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' }],
      'ts/no-explicit-any': 'error',
    },
  },
  {
    // Hook scripts and repo tooling run as plain Node CLIs and talk to stdout/stderr.
    files: ['.claude/hooks/**', 'scripts/**'],
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
    },
  },
);
