import { test } from "node:test";
import { writeFileSync } from "node:fs";

// Journey fixture: keep as is. It is outside the plan and records only a check run that executes it.
test("rtb1 sentinel outside the selection", () => { if (process.env.RTB1_CHECK_RUN === "1") writeFileSync(".rtb1-sentinel-ran", new Date().toISOString()); });
