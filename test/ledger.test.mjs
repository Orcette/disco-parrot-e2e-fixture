import test from "node:test";
import assert from "node:assert/strict";
import { summarizeReceipts } from "../src/ledger.mjs";

test("summarizeReceipts rejects a null receipt with a clear error", () => {
  assert.throws(
    () => summarizeReceipts([null]),
    { name: "TypeError", message: "Each receipt must be an object" },
  );
});
