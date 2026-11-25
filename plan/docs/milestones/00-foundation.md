# 00 · Boot a static game shell

Deliver a clickable page from the existing lockfile and make it reproducible under a project subpath.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## F1 · Restore the HTML entry

**Prerequisites** None  
**Required reading** [architecture/decisions.md](../architecture/decisions.md), [architecture/runtime.md](../architecture/runtime.md)  
**Files in scope** `index.html`, `src/main.js`, `src/app/game.js`  
**Interfaces** createGame({mount}), start(), dispose()

**Requirements** Mount a canvas host and a keyboard-focusable Start button. Keep the existing npm scripts. Use local modules and show a readable boot error.

**Acceptance** A fresh install and production build resolve the entry. Start changes the shell to its running state once.  
**Verify** Run npm ci, npm run build and npm run preview; press Start twice.  
**Out of scope** World content.  
**Model** Fast · low

## F2 · Make the shell portable

**Prerequisites** F1  
**Required reading** [architecture/assets.md](../architecture/assets.md)  
**Files in scope** `vite.config.js`, `index.html`  
**Interfaces** Vite base and dist entry

**Requirements** Set a relative base. Verify favicon and production chunks resolve under a nested path. Keep publishing for release.

**Acceptance** Opening and refreshing /dreamweek/ loads the same shell.  
**Verify** Copy dist into a temporary server root under dreamweek and serve its parent. Inspect browser Network for missing files.  
**Out of scope** Publishing or remote setup.  
**Model** Fast · low

## F3 · Provide local playcheck entry points

**Prerequisites** F1  
**Required reading** [architecture/world-lifecycle.md](../architecture/world-lifecycle.md), [architecture/progression.md](../architecture/progression.md)  
**Files in scope** `src/dev/preview.js`, `src/app/game.js`  
**Interfaces** Development-only preview selector

**Requirements** Expose a small local QA panel only behind import.meta.env.DEV and ?qa. Begin with Shell/reset; later cards register their fixtures, stage seeds and counters. Restart destroys the prior instance. Production follows the normal Start path.

**Acceptance** Local QA starts fresh on reset. Production has no selectable fixtures.  
**Verify** Open dev /?qa, reset twice, then open production preview with ?qa.  
**Out of scope** General level editor, automated tests.  
**Model** General · low

## Human milestone acceptance

**How to test**

1. From the project folder run `npm run dev`. Open the printed address. Use Tab then Enter on Start and look for the running shell.
2. Open the same address with `?qa`, select Shell and reset it twice. Each reset should leave one Start button.
3. Run `npm run build`. Copy the contents of `dist/` into a temporary server folder named `dreamweek`, serve its parent (for example `python3 -m http.server 8000`), then open and refresh `/dreamweek/`. Start should work there too.

**Milestone passes when** both addresses work on refresh, the browser shows a single shell, and production offers no QA panel.
