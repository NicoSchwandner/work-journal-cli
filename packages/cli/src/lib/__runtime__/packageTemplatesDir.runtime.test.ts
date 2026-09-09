import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { packageTemplatesDir } from "../pathHelpers";

describe("packageTemplatesDir [runtime]", () => {
  it("resolves to a valid templates folder with template files", () => {
    const dir = packageTemplatesDir();
    // Installed: .../node_modules/work-journal/templates — checkout: .../packages/cli/templates
    expect(dir).toMatch(/(node_modules[\\/]work-journal|packages[\\/]cli)[\\/]templates$/);
    expect(existsSync(join(dir, "daily_template.md"))).toBe(true);
  });
});
