import { expect, test } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cli = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "dist", "index.js");
const run = (...args: string[]) => {
  const r = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
};

test("--help lists commands", () => {
  const { code, out } = run("--help");
  expect(code).toBe(0);
  expect(out).toContain("Commands:");
});

test("--version prints the package version", () => {
  expect(run("--version").out.trim()).toMatch(/^\d+\.\d+\.\d+/);
});

test("rejects unknown commands, stray arguments and options the command doesn't take", () => {
  expect(run("bogus")).toMatchObject({ code: 1 });
  expect(run("bogus").out).toContain("Unknown command: bogus");
  expect(run("new", "foo").out).toContain("Unexpected argument: foo");
  expect(run("config", "get", "--force").out).toContain("Unknown option for config: --force");
  expect(run("new", "--frob").out).toContain("Unknown option '--frob'");
  expect(run("new", "--offset", "abc").out).toContain("--offset must be an integer");
});
