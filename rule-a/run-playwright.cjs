const { realpathSync } = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const dir = realpathSync.native(__dirname);
const args = process.argv[2] === "install" ? process.argv.slice(2) : ["test", ...process.argv.slice(2)];
const run = spawnSync(process.execPath, [path.join(dir, "node_modules", "@playwright", "test", "cli.js"), ...args], { cwd: dir, stdio: "inherit" });
process.exit(run.status ?? 1);
