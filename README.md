# Team Roster

Small authored web-UI repository input for Disco Parrot's real agent E2E
journeys (tag `fixture-web-ui-v1`). It is a separate fixture line from the Run
Ledger CLI (`fixture-v1`) in this repository.

Team Roster is a single-page web app that lists a team's members and lets a
person add one. Planned work includes removing a member after a confirmation.
Agents must discover this repository and plan and implement that feature
through the real workflow; this repository contains no generated plan, review
or completed workflow output.

- `npm start` serves the app on http://127.0.0.1:4173 (Node.js 22, no runtime
  dependencies).
- `npm ci` then `npm run test:browser` runs the browser tests in
  `tests/browser/` with Playwright. Inside a Disco Parrot Agent Sandbox the
  tests attach to the pod's workspace browser over CDP; elsewhere they launch a
  local Chromium (`npx playwright install chromium` once).

Read `docs/architecture.md` for the authored product context. Every UI
behaviour is proved by a Playwright browser test in `tests/browser/`.

The fixture is read-only upstream during routine qualification. Publish
releases as immutable tags and change the version when content changes.
