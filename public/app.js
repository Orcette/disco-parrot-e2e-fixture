const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const rosterStatus = document.querySelector("#roster-status");
const rosterError = document.querySelector("#roster-error");
const rosterEmpty = document.querySelector("#roster-empty");
const removeDialog = document.querySelector("#remove-dialog");
const removeDialogTitle = document.querySelector("#remove-dialog-title");
const removeError = document.querySelector("#remove-error");
let selectedMember;

function renderRow(member) {
  const row = document.createElement("tr");
  row.dataset.memberId = member.id;
  for (const value of [member.name, member.role]) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  }
  const actions = document.createElement("td");
  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "Remove";
  remove.setAttribute("aria-label", `Remove ${member.name}`);
  remove.addEventListener("click", () => {
    selectedMember = member;
    removeDialogTitle.textContent = `Remove ${member.name}?`;
    removeError.hidden = true;
    removeError.textContent = "";
    removeDialog.showModal();
  });
  actions.append(remove);
  row.append(actions);
  return row;
}

async function load() {
  rosterStatus.hidden = false;
  rosterStatus.textContent = "Loading roster…";
  rosterError.hidden = true;
  rosterEmpty.hidden = true;
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("Roster request failed");
    const { members } = await response.json();
    roster.replaceChildren(...members.map(renderRow));
    rosterStatus.hidden = true;
    rosterEmpty.hidden = members.length > 0;
  } catch {
    roster.replaceChildren();
    rosterStatus.hidden = true;
    rosterError.textContent = "The roster could not be loaded. Please try again.";
    rosterError.hidden = false;
  }
}

removeDialog.addEventListener("close", async () => {
  if (removeDialog.returnValue !== "confirm") {
    selectedMember = undefined;
    return;
  }
  if (!selectedMember) return;
  const member = selectedMember;
  selectedMember = undefined;
  try {
    const response = await fetch(`/api/members/${encodeURIComponent(member.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Member removal failed");
    roster.querySelector(`[data-member-id="${CSS.escape(member.id)}"]`)?.remove();
    rosterEmpty.hidden = roster.children.length > 0;
  } catch {
    rosterError.textContent = "The member could not be removed. Please try again.";
    rosterError.hidden = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  const data = Object.fromEntries(new FormData(form));
  const response = await fetch("/api/members", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    formError.textContent = "Enter a name to add a member.";
    return;
  }
  const { member } = await response.json();
  roster.append(renderRow(member));
  form.reset();
});

await load();
