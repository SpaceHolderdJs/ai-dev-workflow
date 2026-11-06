// Tests for the agent guard hook: feeds it the JSON Claude Code would send and
// checks the exit code. Exit 2 = blocked, 0 = allowed.
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

const run = command => spawnSync('node', ['.claude/hooks/guard-bash.mjs'], {
  input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }),
  encoding: 'utf8',
}).status;

it('blocks hook bypass, force push and secret reads', () => {
  for (const command of [
    'git commit -m "feat: x" --no-verify',
    'git push origin main --force',
    'git push -f',
    'cat .env.local',
    'grep KEY .env.production.local',
    'npx vitest run --passWithNoTests',
  ]) {
    expect(run(command), command).toBe(2);
  }
});

it('allows the normal gate', () => {
  for (const command of [
    'npm run lint',
    'npm test',
    'git diff --stat',
    'git push origin feature/x',
    'cat .env.example',
  ]) {
    expect(run(command), command).toBe(0);
  }
});
