// PreToolUse hook for Bash. Claude Code pipes the pending tool call as JSON on
// stdin; exiting with code 2 blocks the call and feeds stderr back to the agent.
//
// Permissions in settings.json cover exact commands. This hook covers the
// patterns a permission list can't express: a bypass flag in the middle of an
// otherwise allowed command, or a secret file reached through cat/grep/sed.

import { readFileSync } from 'node:fs';

const BLOCKED = [
  { pattern: /--no-verify\b/, reason: 'Hooks are the fast copy of CI. Fix what they report instead of skipping them.' },
  { pattern: /\bgit\s+push\b.*\s(?:--force|-f)(?:\s|$)/, reason: 'Force-push rewrites shared history. Ask the human.' },
  { pattern: /\.env\.local\b|\.env\.[\w-]+\.local\b/, reason: '.env.local holds real credentials and stays out of the agent context.' },
  { pattern: /\b(?:vitest|playwright)\b.*\s--(?:passWithNoTests|bail=0)\b/, reason: 'Do not change what counts as a passing test run.' },
  { pattern: /\beslint\b.*--no-eslintrc|\beslint-disable\b/, reason: 'Disabling lint is a config change: propose it in the PR with a reason.' },
];

const input = JSON.parse(readFileSync(0, 'utf8'));
const command = String(input?.tool_input?.command ?? '');

for (const { pattern, reason } of BLOCKED) {
  if (pattern.test(command)) {
    process.stderr.write(`Blocked by .claude/hooks/guard-bash.mjs: ${reason}\nCommand: ${command}\n`);
    process.exit(2);
  }
}

process.exit(0);
