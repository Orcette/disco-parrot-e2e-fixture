const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const status = document.querySelector("#roster-status");
const rosterError = document.querySelector("#roster-error");
const removeDialog = document.querySelector("#remove-dialog");
const removeTitle = document.querySelector("#remove-dialog-title");
const removeDescription = document.querySelector("#remove-dialog-description");
const removeError = document.querySelector("#remove-error");
let pendingMember;

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
  removeButton.setAttribute("aria-label", `Remove ${member.name}`);
  removeButton.addEventListener("click", () => openRemoveDialog(member));
  actionCell.append(removeButton);
  row.append(actionCell);
  return row;
}

function openRemoveDialog(member) {
  pendingMember = member;
  removeTitle.textContent = `Remove ${member.name}?`;
  removeDescription.textContent = `Are you sure you want to remove ${member.name} from the roster?`;
  removeError.hidden = true;
  removeDialog.showModal();
}

function updateStatus() {
  status.textContent = roster.children.length ? "" : "No team members yet.";
  status.hidden = roster.children.length > 0;
}

async function load() {
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("Roster request failed");
    const { members } = await response.json();
    roster.replaceChildren(...members.map(renderRow));
    updateStatus();
  } catch {
    status.hidden = true;
    rosterError.textContent = "The roster could not be loaded. Try refreshing the page.";
    rosterError.hidden = false;
  }
}

document.querySelector("#cancel-remove").addEventListener("click", () => {
  pendingMember = undefined;
  removeDialog.close();
});

document.querySelector("#confirm-remove").addEventListener("click", async () => {
  if (!pendingMember) return;
  const member = pendingMember;
  const response = await fetch(`/api/members/${encodeURIComponent(member.id)}`, { method: "DELETE" });
  if (!response.ok) {
    removeError.textContent = "The member could not be removed. Try again.";
    removeError.hidden = false;
    return;
  }
  roster.querySelector(`[data-member-id="${CSS.escape(member.id)}"]`)?.remove();
  pendingMember = undefined;
  removeDialog.close();
  updateStatus();
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
  status.hidden = true;
  form.reset();
});

await load();
