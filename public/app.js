const roster = document.querySelector("#roster");
const rosterStatus = document.querySelector("#roster-status");
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
  const actionCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    removeError.textContent = "";
    memberToRemove = member;
    removeDialogTitle.textContent = `Remove ${member.name}?`;
    removeDialog.showModal();
  });
  actionCell.append(removeButton);
  row.append(actionCell);
  return row;
}

removeDialog.addEventListener("close", async () => {
  const member = memberToRemove;
  memberToRemove = undefined;
  if (removeDialog.returnValue !== "confirm" || !member) return;
  try {
    const response = await fetch(`/api/members/${encodeURIComponent(member.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Removal failed");
    roster.querySelector(`[data-member-id="${CSS.escape(member.id)}"]`)?.remove();
    if (!roster.children.length) rosterStatus.textContent = "No team members yet.";
  } catch {
    removeError.textContent = `Could not remove ${member.name}. Please try again.`;
  }
});

async function load() {
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("Roster load failed");
    const { members } = await response.json();
    roster.replaceChildren(...members.map(renderRow));
    rosterStatus.textContent = members.length ? "" : "No team members yet.";
  } catch {
    roster.replaceChildren();
    rosterStatus.setAttribute("role", "alert");
    rosterStatus.textContent = "Could not load team members. Please try again.";
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
  rosterStatus.textContent = "";
  form.reset();
});

await load();
