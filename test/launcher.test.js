import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

test("double-click launcher reports missing PowerShell and preserves startup failures", { skip: process.platform !== "win32" }, () => {
  const where = join(process.env.SystemRoot, "System32", "where.exe");
  const found = spawnSync(where, ["pwsh.exe"], { encoding: "utf8" });
  assert.equal(found.status, 0, "PowerShell 7 is needed to test the Windows launcher");
  const pwshDir = dirname(found.stdout.trim().split(/\r?\n/)[0]);
  const temp = mkdtempSync(join(tmpdir(), "copilot zh launcher "));
  try {
    copyFileSync(fileURLToPath(new URL("../start.cmd", import.meta.url)), join(temp, "start.cmd"));
    const run = path => spawnSync(process.env.ComSpec, ["/d", "/c", join(temp, "start.cmd")], {
      cwd: temp, env: { ...process.env, PATH: path }, encoding: "utf8", input: "\r\n", timeout: 10000
    });
    writeFileSync(join(temp, "start.ps1"), "Write-Output 'LAUNCHER_TEST_SUCCESS'; exit 0\n");
    const success = run(pwshDir);
    assert.equal(success.status, 0, success.stderr);
    assert.match(success.stdout, /LAUNCHER_TEST_SUCCESS/);
    writeFileSync(join(temp, "start.ps1"), "Write-Error 'LAUNCHER_TEST_FAILURE'; exit 42\n");
    const failed = run(pwshDir);
    assert.equal(failed.status, 42, failed.stderr);
    assert.match(failed.stderr, /LAUNCHER_TEST_FAILURE/);
    assert.match(failed.stdout, /Read the message above/);
    const missing = run(temp);
    assert.equal(missing.status, 1, missing.stderr);
    assert.match(missing.stdout, /PowerShell 7 or later/);
    const direct = spawnSync(join(pwshDir, "pwsh.exe"), [
      "-NoLogo", "-NoProfile", "-File", fileURLToPath(new URL("../start.ps1", import.meta.url)),
      "-AppPath", join(temp, "missing-github.exe")
    ], { encoding: "utf8", input: "\r\n", timeout: 10000 });
    assert.equal(direct.status, 1, direct.stderr);
    assert.match(direct.stdout + direct.stderr, /Launcher failed:/);
    assert.match(direct.stdout + direct.stderr, /Press Enter to close/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
