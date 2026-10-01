# Architecture

Run Ledger is a local command-line application. `src/ledger.mjs` summarizes
authored receipt inputs; `src/cli.mjs` is the application entry point.

A future export must take a single run identity, collect only that run's
receipts and audit records, and write an archive into an explicit destination.
The application has no hosted server, remote database or authentication system.
Keep archive persistence behind an injected storage interface so a caller can
select a local filesystem implementation.

Preserve the source records. A missing run must produce a clear failure, and
an archive must contain a manifest identifying the selected run and files.
Retention cleanup must remove only archives this application created and must
respect the declared retention period. Avoid scanning or deleting unrelated
folders. These are proposed requirements, not implemented export behavior.
