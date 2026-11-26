// A kit test's temp root, removed however the test file ends: node:test's after() when the tests finish (a failed test
// included), the process's exit (a run that ends early), and SIGTERM or SIGINT (a killed runner skips after(); the root
// is removed, then the process exits 128 + the signal's number). SIGKILL can't be caught: a root it leaves stays.
import { after } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { constants, tmpdir } from "node:os";
import { join } from "node:path";

export function tempRoot(prefix) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  const remove = () => rmSync(root, { recursive: true, force: true });
  after(remove);
  process.on("exit", remove);
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      remove();
      process.exit(128 + constants.signals[signal]);
    });
  }
  return root;
}
