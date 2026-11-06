import type { KnipConfig } from 'knip';

// Fails the build on unused files, exports and dependencies. If something is
// used in a way knip cannot see, list it here with a comment - not an
// eslint-disable, and never by deleting the check.
const config: KnipConfig = {
  entry: ['.claude/hooks/*.mjs', 'scripts/*.mjs'],
  project: ['src/**/*.ts', '.claude/hooks/*.mjs', 'scripts/*.mjs'],
  treatConfigHintsAsErrors: true,
};

export default config;
