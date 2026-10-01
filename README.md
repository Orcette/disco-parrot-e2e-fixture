# Run Ledger

Small authored repository input for Disco Parrot's real agent E2E journeys.
This directory is the complete proposed content of a public fixture repository.

Run Ledger lists receipt summaries from a local folder. Planned work includes
exporting one run's evidence archive and removing an archive after a retention
period. Agents must discover this repository and author those features through
the real workflow; this repository contains no generated initiative, review,
commit receipt or completed workflow output.

Run `node src/cli.mjs` to show the current summary. Node.js 22 or later is sufficient;
there are no package dependencies. Read `docs/architecture.md` and
`docs/domain.md` for the authored product context.

The fixture is read-only upstream during routine qualification. Every test owns
its own clone and planning records. Publish releases as immutable tags, starting
with `fixture-v1`, and declare that tag as the test input ref. Change the fixture
version when its authored content changes.

Only files in this directory belong in the public repository. Repository
publication is separate from enabling Disco Parrot's automatic E2E CI.
