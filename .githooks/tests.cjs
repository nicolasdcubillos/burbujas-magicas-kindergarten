const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const hooksPath = __dirname.replaceAll('\\', '/');

test('commit-msg filters only Copilot trailers and reports failures', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'armadesk-hook-'));
  try {
    const init = spawnSync('git', ['-c', `core.hooksPath=${hooksPath}`, 'init', '--quiet', directory],
      { encoding: 'utf8' });
    assert.equal(init.status, 0, init.stderr);
    const messageFile = path.join(directory, 'message.txt');
    const cases = [
      ['empty message', '', ''],
      ['only Copilot', 'Co-authored-by: Copilot <bot@example.invalid>\n', ''],
      ['unterminated attribution', 'co-authored-by: COPILOT <bot@example.invalid>', ''],
      ['ordinary message', 'Keep Copilot in the description', 'Keep Copilot in the description'],
      ['human coauthor', 'Title\n\nCo-authored-by: Human <human@example.invalid>\n',
        'Title\n\nCo-authored-by: Human <human@example.invalid>\n'],
      ['mixed trailers', 'Title\n\nCo-authored-by: CoPiLoT <bot@example.invalid>\nCo-authored-by: Human <human@example.invalid>\nSigned-off-by: Human <human@example.invalid>\n\n',
        'Title\n\nCo-authored-by: Human <human@example.invalid>\nSigned-off-by: Human <human@example.invalid>\n\n'],
      ['body reference', 'Title\n\nCo-authored-by: Copilot is an example here.\nThis is body text.\n\nReviewed-by: Human\n',
        'Title\n\nCo-authored-by: Copilot is an example here.\nThis is body text.\n\nReviewed-by: Human\n'],
      ['CRLF', 'Title\r\n\r\nCo-authored-by: Copilot <bot@example.invalid>\r\nCo-authored-by: Human <human@example.invalid>\r\n',
        'Title\r\n\r\nCo-authored-by: Human <human@example.invalid>\r\n'],
      ['no final newline', 'Title\n\nCo-authored-by: Copilot <bot@example.invalid>\nReviewed-by: Human',
        'Title\n\nReviewed-by: Human'],
      ['continued human trailer', 'Title\n\nCo-authored-by: Copilot <bot@example.invalid>\nReviewed-by: Human\n continued detail\n',
        'Title\n\nReviewed-by: Human\n continued detail\n'],
      ['inline mention', 'Title\n\nReviewed-by: Copilot\n', 'Title\n\nReviewed-by: Copilot\n'],
      ['editor comments', 'Title\n\nCo-authored-by: Copilot <bot@example.invalid>\nCo-authored-by: Human <human@example.invalid>\n\n# Please enter the commit message.\n# Co-authored-by: Copilot is an example.\n',
        'Title\n\nCo-authored-by: Human <human@example.invalid>\n\n# Please enter the commit message.\n# Co-authored-by: Copilot is an example.\n'],
    ];
    const hookArgs = (...args) => [
      '-c', `core.hooksPath=${hooksPath}`, 'hook', 'run', 'commit-msg', '--', ...args,
    ];
    const runHook = (...args) => spawnSync('git', hookArgs(...args),
      { cwd: directory, encoding: 'utf8' });
    for (const [label, before, after] of cases) {
      fs.writeFileSync(messageFile, before);
      const result = runHook(messageFile);
      assert.equal(result.status, 0, `${label}: ${result.stderr}`);
      assert.equal(fs.readFileSync(messageFile, 'utf8'), after, label);
      assert.equal(runHook(messageFile).status, 0, `${label}: repeat invocation`);
      assert.equal(fs.readFileSync(messageFile, 'utf8'), after, `${label}: idempotence`);
      assert.deepEqual(fs.readdirSync(directory).filter(name => name.includes('.copilot.')), []);
    }
    assert.notEqual(runHook().status, 0, 'missing argument must fail');
    assert.notEqual(runHook(path.join(directory, 'missing.txt')).status, 0, 'missing file must fail');
    assert.notEqual(runHook(directory).status, 0, 'directory must fail');

    const binaryBody = Buffer.from([0xff, 0x80, 0x0a, 0x0a]);
    fs.writeFileSync(messageFile, Buffer.concat([binaryBody,
      Buffer.from('Co-authored-by: Copilot <bot@example.invalid>\n')]));
    assert.equal(runHook(messageFile).status, 0, 'non-UTF-8 message');
    assert.deepEqual(fs.readFileSync(messageFile), binaryBody);

    const config = spawnSync('git', ['config', 'core.commentChar', ';'],
      { cwd: directory, encoding: 'utf8' });
    assert.equal(config.status, 0, config.stderr);
    fs.writeFileSync(messageFile, 'Title\n\nCo-authored-by: Copilot <bot@example.invalid>\n\n; Editor comment\n');
    assert.equal(runHook(messageFile).status, 0, 'custom comment prefix');
    assert.equal(fs.readFileSync(messageFile, 'utf8'), 'Title\n\n\n; Editor comment\n');

    const failedRuntime = path.join(directory, 'failed-runtime');
    fs.mkdirSync(failedRuntime);
    fs.writeFileSync(path.join(failedRuntime, 'node'), '#!/bin/sh\nexit 73\n', { mode: 0o755 });
    const env = { ...process.env };
    const pathKey = Object.keys(env).find(key => key.toLowerCase() === 'path') || 'PATH';
    env[pathKey] = `${failedRuntime}${path.delimiter}${env[pathKey] || ''}`;
    const original = 'Title\n\nCo-authored-by: Copilot <bot@example.invalid>\n';
    fs.writeFileSync(messageFile, original);
    const failure = spawnSync('git', hookArgs(messageFile),
      { cwd: directory, encoding: 'utf8', env });
    assert.equal(failure.status, 73, failure.stderr);
    assert.equal(fs.readFileSync(messageFile, 'utf8'), original, 'filter failure preserves original');
    assert.deepEqual(fs.readdirSync(directory).filter(name => name.includes('.copilot.')), []);

    fs.writeFileSync(path.join(directory, 'tracked.txt'), 'fixture\n');
    const add = spawnSync('git', ['add', 'tracked.txt'], { cwd: directory, encoding: 'utf8' });
    assert.equal(add.status, 0, add.stderr);
    const commit = spawnSync('git', [
      '-c', `core.hooksPath=${hooksPath}`,
      '-c', 'user.name=Hook Test', '-c', 'user.email=hook-test@example.invalid',
      'commit', '--quiet', '-m',
      'Fixture\n\nCo-authored-by: Copilot <bot@example.invalid>\nCo-authored-by: Human <human@example.invalid>',
    ], { cwd: directory, encoding: 'utf8' });
    assert.equal(commit.status, 0, commit.stderr);
    const log = spawnSync('git', ['log', '-1', '--format=%B'], { cwd: directory, encoding: 'utf8' });
    assert.equal(log.status, 0, log.stderr);
    assert.doesNotMatch(log.stdout, /Co-authored-by:.*Copilot/i);
    assert.match(log.stdout, /Co-authored-by: Human <human@example.invalid>/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
