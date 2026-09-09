import { expect, test } from "vitest";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

test("CLI boots", () => {
  const cliBinPath = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "dist", "index.js");
  const stdout = execFileSync(process.execPath, [cliBinPath, "--help"], { encoding: "utf8" });
  expect(stdout).toContain("Commands:");
});
