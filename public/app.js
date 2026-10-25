const roster = document.querySelector("#roster");
const rosterStatus = document.querySelector("#roster-status");
const rosterError = document.querySelector("#roster-error");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const removeDialog = document.querySelector("#remove-dialog");
const removeDialogTitle = document.querySelector("#remove-dialog-title");
const removeError = document.querySelector("#remove-error");
let memberToRemove;

function renderRow(member) {
  const row = document.createElement("tr");
  row.dataset.memberId = member.id;
  for (const value of [member.name, member.role]) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  }
  const actions = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    memberToRemove = { ...member, row };
    removeDialogTitle.textContent = `Remove ${member.name}?`;
    removeError.textContent = "";
    removeDialog.showModal();
  });
  actions.append(removeButton);
  row.append(actions);
  return row;
}

async function load() {
  rosterStatus.textContent = "Loading team members…";
  rosterError.hidden = true;
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("Roster request failed");
    const { members } = await response.json();
    roster.replaceChildren(...members.map(renderRow));
    rosterStatus.textContent = members.length ? "" : "No team members yet.";
  } catch {
    roster.replaceChildren();
    rosterStatus.textContent = "";
    rosterError.textContent = "Team members could not be loaded. Please try again.";
    rosterError.hidden = false;
  }
}

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

removeDialog.addEventListener("close", async () => {
  if (removeDialog.returnValue !== "confirm" || !memberToRemove) return;
  const target = memberToRemove;
  const response = await fetch(`/api/members/${encodeURIComponent(target.id)}`, { method: "DELETE" });
  if (!response.ok) {
    removeError.textContent = "The member could not be removed. Please try again.";
    removeDialog.showModal();
    return;
  }
  target.row.remove();
  memberToRemove = null;
});
