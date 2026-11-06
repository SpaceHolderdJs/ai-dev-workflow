// PostToolUse hook for Edit/Write. Lints (and auto-fixes) the one file the
// agent just changed, so formatting and obvious errors are corrected at the
// moment they are introduced instead of piling up for the pre-commit hook.
// Exit code 2 returns the remaining errors to the agent as feedback.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const file = input?.tool_input?.file_path;

if (typeof file !== 'string' || !/\.(?:[cm]?[jt]sx?|json|md|ya?ml)$/.test(file)) {
  process.exit(0);
}

const result = spawnSync('npx', ['--no', '--', 'eslint', '--fix', '--no-warn-ignored', file], {
  encoding: 'utf8',
});

if (result.status !== 0) {
  process.stderr.write(`ESLint still reports problems in ${file} after --fix:\n${result.stdout}${result.stderr}`);
  process.exit(2);
}

process.exit(0);
