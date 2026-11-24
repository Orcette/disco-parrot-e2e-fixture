import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countMembers } from "../rtb1/count-members.mjs";

describe("countMembers", () => {
  it("counts every member of the roster", () => {
    assert.equal(countMembers(["a", "b", "c"]), 3);
    assert.equal(countMembers([]), 0);
  });
});
