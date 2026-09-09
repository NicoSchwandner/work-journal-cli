import { mkdirSync, copyFileSync, readdirSync, existsSync, statSync } from "fs";
import { join } from "path";
import { packageTemplatesDir } from "../lib/pathHelpers";

export function runInit(force: boolean, destDir: string, sourceDir: string): void {
  if (existsSync(destDir) && !force) {
    throw new Error("templates/ already exists – use --force to overwrite");
  }
  if (!existsSync(sourceDir)) {
    throw new Error(`Source templates directory not found: ${sourceDir}`);
  }

  mkdirSync(destDir, { recursive: true });
  for (const f of readdirSync(sourceDir)) {
    const sourceFile = join(sourceDir, f);
    if (existsSync(sourceFile) && statSync(sourceFile).isFile()) {
      copyFileSync(sourceFile, join(destDir, f));
    } else if (!existsSync(sourceFile)) {
      console.warn(`Warning: Source template file not found: ${sourceFile}`);
    }
  }
}
