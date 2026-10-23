import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RosterStore } from "./src/roster-store.mjs";

const publicDir = fileURLToPath(new URL("./public/", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

const json = (response, status, body) => {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
};

const readBody = async (request) => {
  let text = "";
  for await (const chunk of request) text += chunk;
  return text ? JSON.parse(text) : {};
};

/** The request handler over an injected store. */
export function createApp(store) {
  return async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    try {
      if (url.pathname === "/health") { response.end("ok"); return; }
      if (url.pathname === "/api/members" && request.method === "GET") return json(response, 200, { members: store.list() });
      if (url.pathname === "/api/members" && request.method === "POST") {
        const { name, role } = await readBody(request);
        if (typeof name !== "string" || !name.trim()) return json(response, 400, { error: "name_required" });
        return json(response, 201, { member: store.add({ name: name.trim(), role: typeof role === "string" ? role.trim() : "" }) });
      }
      const memberMatch = url.pathname.match(/^\/api\/members\/([^/]+)$/);
      if (memberMatch && request.method === "DELETE") {
        if (!store.remove(memberMatch[1])) return json(response, 404, { error: "not_found" });
        return json(response, 200, { success: true });
      }
      if (request.method !== "GET") return json(response, 404, { error: "not_found" });
      const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      if (file.includes("..")) return json(response, 404, { error: "not_found" });
      const body = await readFile(join(publicDir, file));
      response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
      response.end(body);
    } catch (error) {
      if (error && error.code === "ENOENT") return json(response, 404, { error: "not_found" });
      json(response, 500, { error: "internal" });
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 4173);
  createServer(createApp(new RosterStore())).listen(port, "127.0.0.1", () => {
    console.log(`Team Roster on http://127.0.0.1:${port}`);
  });
}
