import { createServer } from "node:http";
import { createApp } from "./server.mjs";
import { RosterStore } from "./src/roster-store.mjs";

createServer(createApp(new RosterStore())).listen(4173, "127.0.0.1");
