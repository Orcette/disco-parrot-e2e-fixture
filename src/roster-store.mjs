/** In-memory roster store; a fresh store per server start. */
export class RosterStore {
  #members = new Map();
  #next = 1;

  constructor(seed = [
    { name: "Ada Lovelace", role: "Engineer" },
    { name: "Grace Hopper", role: "Lead" },
    { name: "Alan Turing", role: "Researcher" },
  ]) {
    for (const member of seed) this.add(member);
  }

  list() {
    return [...this.#members.values()];
  }

  add({ name, role }) {
    const member = { id: String(this.#next++), name, role: role || "Member" };
    this.#members.set(member.id, member);
    return member;
  }

  remove(id) {
    return this.#members.delete(String(id));
  }
}
