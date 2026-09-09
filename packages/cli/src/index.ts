#!/usr/bin/env node
import { parseArgs } from "node:util";
import { join } from "node:path";
import { runInit } from "./commands/init";
import { runNew } from "./commands/new";
import { runConfigGet, runConfigSet } from "./commands/config";
import { packageTemplatesDir } from "./lib/pathHelpers";
import { addDays } from "./lib/dateLogic";

const HELP = `Usage: work-journal <command> [options]

Commands:
  init                      seed templates in ./templates
  new                       create or append to today's journal entry
  config get [key]          read configuration value(s)
  config set <key> <value>  set configuration value

Options:
  -h, --help       show help
  --force          init: overwrite existing templates directory
                   new:  overwrite existing journal entry
  --offset <days>  new:  day offset from today (default 0)
  --open           new:  open the journal entry after creation`;

// parseArgs rejects "--offset -1" as ambiguous, so fold it into "--offset=-1"
function normalizeNegativeOffset(argv: string[]): string[] {
  const i = argv.indexOf("--offset");
  if (i === -1 || !/^-\d+$/.test(argv[i + 1] ?? "")) return argv;
  return [...argv.slice(0, i), `--offset=${argv[i + 1]}`, ...argv.slice(i + 2)];
}

function fail(message: string): never {
  console.error(`${message}\n\n${HELP}`);
  process.exit(1);
}

function main(argv: string[]): void {
  const { values, positionals } = parseArgs({
    args: normalizeNegativeOffset(argv),
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h", default: false },
      force: { type: "boolean", default: false },
      open: { type: "boolean", default: false },
      offset: { type: "string", default: "0" },
    },
  });
  if (values.help) return console.log(HELP);

  const [command, sub, ...rest] = positionals;
  switch (command) {
    case "init":
      runInit(values.force, join(process.cwd(), "templates"), packageTemplatesDir());
      return console.log("✅ templates/ ready – hack away!");
    case "new": {
      const offset = Number(values.offset);
      if (!Number.isInteger(offset)) fail(`--offset must be an integer, got "${values.offset}"`);
      return console.log(`Journal entry ready: ${runNew(addDays(new Date(), offset), values.open, values.force)}`);
    }
    case "config":
      if (sub === "get" && rest.length <= 1) return console.log(runConfigGet(rest[0]));
      if (sub === "set" && rest.length === 2) {
        runConfigSet(rest[0], rest[1]);
        return console.log("✅ saved");
      }
      return fail("Usage: work-journal config get [key] | config set <key> <value>");
    default:
      return fail(command ? `Unknown command: ${command}` : "Please specify a command.");
  }
}

try {
  main(process.argv.slice(2));
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
