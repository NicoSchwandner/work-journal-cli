---
"work-journal": minor
---

Drop yargs and date-fns in favour of node:util parseArgs and built-in Date; the CLI now has zero runtime dependencies. The implicit --version flag is gone.
