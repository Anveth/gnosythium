# Gnosythium — repository instructions

## Read before working

Read `docs/CONCEPT.md`, `docs/ROADMAP.md`, and `docs/HANDOFF.md`. Distinguish confirmed requirements from assistant proposals and future scope. Update durable documentation when a decision materially changes.

## Boundaries

- This is an independent game repository. Do not modify, import private data from, or publish changes to GameLogs. A GameLogs link is explicitly deferred.
- Use Phaser, TypeScript, and Vite. Target desktop web and keyboard/mouse; no mobile controls, mobile layout work, or Capacitor. Native desktop packaging is future scope.
- Work directly in this saved local project unless the user requests a worktree. Avoid parallel edits by multiple chats.
- Explain progress and code in Polish; keep comments and names clear. UI language beyond the initial English technical prototype remains open to user choice.
- Do not install paid services or assets. No generative image calls without an image-generation request. Use code-drawn placeholders for the initial arena.
- Do not create or modify production cloud databases, accounts, auth settings, RLS or storage. Account saves are required later, not implemented by pretending localStorage is an account backend.

## Implementation

- Keep game mechanics modular: scene orchestration, player controls, combat, enemy behavior, checkpoint state and HUD should not become a single giant file.
- Separate input actions from keyboard bindings and persistence from gameplay, enabling later changes without rewriting combat.
- Strict TypeScript. Inspect current package documentation and compatible versions before installing. Commit a lockfile. Avoid speculative dependencies or React unless there is a concrete need.
- Respect the GitHub Pages project base path `/gnosythium/` (lowercase, matching the renamed repository). Resolve assets through the configured base; do not hardcode root-relative game asset paths.
- If local saves are introduced, use namespaced keys such as `gnosythium:*`, never `gamelogs:*`. Both Pages sites may share an origin; different URL paths do not isolate browser storage.
- Never put secret/service-role keys in frontend code or commits. Do not add unrelated user details or conversation transcripts containing personal information.
- Do not copy copyrighted characters, names, maps, music or assets from reference games.

## Verification and Git

- User preference from the source chat: run automated test suites or browser/Chrome verification only when the user explicitly asks. Typecheck, build and static diff checks are allowed implementation checks. Report what was and was not checked.
- Do not touch existing user changes unrelated to the task. Use apply_patch for file edits.
- Initial public repository creation and GitHub Pages setup are authorized in the setup chat; coordinate them rather than creating a duplicate remote or racing pushes. Subsequent commits/pushes require a new user request. In this project, “robimy pusha” means provide commands; “zrób pusha” means execute.
- Do not claim a deployment works before observing a successful build/deploy. A placeholder-only build is not a complete game.

## First implementation task

Implement only milestone 1 from `docs/ROADMAP.md`, then report a concrete handoff. Do not silently expand into account integration, full RPG progression, all five elements, or paid/production infrastructure.
