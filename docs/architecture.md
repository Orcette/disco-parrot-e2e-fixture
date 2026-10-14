# Architecture

Team Roster is a web application with one page.

- `server.mjs` is a dependency-free Node HTTP server. It serves `public/` and a
  small JSON API backed by an in-memory store (`src/roster-store.mjs`), seeded
  with three members on every start.
  - `GET /api/members` → `{ members: [{ id, name, role }] }`
  - `POST /api/members` `{ name, role }` → `201 { member }`; an empty name is `400`.
  - `GET /health` → `200 ok`
- `public/index.html` and `public/app.js` render the roster table and the
  "Add member" form, and call the API with `fetch`.

The store is injected into the request handler (`createApp(store)`). There is
no authentication and no database.

## Proposed (not implemented)

Removing a member: each roster row gets a "Remove" button. The page asks for
confirmation in an in-page dialog (not `window.confirm`) that names the member.
Confirming calls `DELETE /api/members/:id` and removes the row; cancelling
leaves the roster unchanged. Removing an unknown id is `404`.
