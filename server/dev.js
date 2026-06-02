import { spawn } from 'node:child_process';

const commands = [
  ['api', 'node', ['server/index.js']],
  ['vite', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev']],
];

const children = commands.map(([name, command, args]) => {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false });
  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with ${code}`);
      process.exitCode = code;
    }
  });
  return child;
});

function shutdown() {
  for (const child of children) child.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
