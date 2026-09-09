#!/usr/bin/env node
import { parseArgs } from "node:util";
import { createRequire } from "node:module";
import { runInit } from "./commands/init";
import { runNew } from "./commands/new";
import { runConfigGet, runConfigSet } from "./lib/config";
import { packageTemplatesDir } from "./lib/pathHelpers";
import { resolveScope } from "./lib/paths";
import { addDays } from "./lib/dateLogic";

const HELP = `Usage: work-journal <command> [options]

Commands:
  init                      seed templates into ./templates
  new                       create or append to today's journal entry
  config get [key]          read configuration value(s)
  config set <key> <value>  set a configuration value

Options:
  --force          init: overwrite an existing templates directory
                   new:  overwrite an existing journal entry
  --user           init: copy templates into your user config dir instead of the project
                   config set: save to user config instead of project config
  --offset <days>  new:  day offset from today, e.g. -1 for yesterday (default 0)
  --open           new:  open the journal entry after creation
  -h, --help       show help
  -v, --version    show version`;

// Which options each command accepts; anything else is rejected like yargs' strict mode did.
const ALLOWED: Record<string, string[]> = {
  init: ["force", "user"],
  new: ["offset", "open", "force"],
  config: ["user"],
};

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
  const { values, positionals, tokens } = parseArgs({
    args: normalizeNegativeOffset(argv),
    allowPositionals: true,
    tokens: true,
    options: {
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
      force: { type: "boolean", default: false },
      user: { type: "boolean", default: false },
      open: { type: "boolean", default: false },
      offset: { type: "string", default: "0" },
    },
  });
  if (values.help) return console.log(HELP);
  if (values.version) return console.log(createRequire(import.meta.url)("../package.json").version);

  const [command, ...rest] = positionals;
  if (!command) fail("Please specify a command.");
  if (!(command in ALLOWED)) fail(`Unknown command: ${command}`);
  const stray = tokens.find((t) => t.kind === "option" && !ALLOWED[command].includes(t.name));
  if (stray?.kind === "option") fail(`Unknown option for ${command}: ${stray.rawName}`);

  switch (command) {
    case "init": {
      if (rest.length) fail(`Unexpected argument: ${rest[0]}`);
      const dest = resolveScope(values.user).templates;
      runInit(values.force, dest, packageTemplatesDir());
      return console.log(`✅ templates copied to ${dest}`);
    }
    case "new": {
      if (rest.length) fail(`Unexpected argument: ${rest[0]}`);
      const offset = Number(values.offset);
      if (!Number.isInteger(offset)) fail(`--offset must be an integer, got "${values.offset}"`);
      return console.log(`Journal entry ready: ${runNew(addDays(new Date(), offset), values.open, values.force)}`);
    }
    case "config": {
      const [sub, ...args] = rest;
      if (sub === "get" && args.length <= 1) {
        const { merged, sources } = runConfigGet(args[0]);
        console.log(merged);
        if (sources.length) console.log("Loaded from:", sources.join(", "));
        return;
      }
      if (sub === "set" && args.length === 2) {
        runConfigSet(resolveScope(values.user).configFile, args[0], args[1]);
        return console.log(`✅ saved (${values.user ? "user" : "project"} scope)`);
      }
      return fail("Usage: work-journal config get [key] | config set <key> <value> [--user]");
    }
  }
}

try {
  main(process.argv.slice(2));
} catch (error: any) {
  // parseArgs appends a long hint about "--" for positionals; the first sentence is the useful part
  console.error(`Error: ${error.message.split(". To specify")[0]}`);
  process.exit(1);
}
