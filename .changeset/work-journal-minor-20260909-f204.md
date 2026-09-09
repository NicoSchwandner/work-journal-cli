---
"work-journal": minor
---

Drop yargs and date-fns in favour of node:util parseArgs and built-in Date helpers; the CLI now has zero runtime dependencies. Adds -v/--version (now reporting the CLI's own version) and -h.
