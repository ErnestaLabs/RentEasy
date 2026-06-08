import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const repo = 'ErnestaLabs/RentEasy';
const head = 'app-ui-uplift';
const base = 'main';
const title = 'Launch RentEazy app MVP';
const bodyFile = 'docs/LAUNCH_PR_BODY.md';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
    shell: false,
  });
}

function fail(message, detail = '') {
  console.error(message);
  if (detail) console.error(detail.trim());
  process.exit(1);
}

if (!existsSync(bodyFile)) {
  fail(`${bodyFile} is missing`);
}

const branch = run('git', ['branch', '--show-current']);
if (branch.status !== 0) {
  fail('Could not detect current git branch.', branch.stderr);
}

if (branch.stdout.trim() !== head) {
  fail(`Run launch:pr from ${head}. Current branch is ${branch.stdout.trim() || '(unknown)'}.`);
}

const status = run('git', ['status', '--porcelain']);
if (status.status !== 0) {
  fail('Could not inspect git status.', status.stderr);
}

const trackedDirty = status.stdout
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => !line.startsWith('?? '));

if (trackedDirty.length) {
  fail('Tracked files are dirty. Commit or revert them before creating the launch PR.', trackedDirty.join('\n'));
}

const auth = run('gh', ['auth', 'status', '--hostname', 'github.com']);
if (auth.status !== 0) {
  fail(
    'GitHub CLI is not authenticated. Run `gh auth login --hostname github.com`, then rerun `npm run launch:pr`.',
    auth.stderr || auth.stdout,
  );
}

const view = run('gh', ['pr', 'view', head, '--repo', repo, '--json', 'url', '--jq', '.url']);
if (view.status === 0 && view.stdout.trim()) {
  console.log(`Launch PR already exists: ${view.stdout.trim()}`);
  process.exit(0);
}

const create = run('gh', [
  'pr',
  'create',
  '--repo',
  repo,
  '--base',
  base,
  '--head',
  head,
  '--title',
  title,
  '--body-file',
  bodyFile,
], { stdio: 'inherit' });

if (create.status !== 0) {
  process.exit(create.status || 1);
}
