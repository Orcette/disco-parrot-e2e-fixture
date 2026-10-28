const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const dialog = document.querySelector("#remove-confirmation");
const dialogTitle = document.querySelector("#remove-title");
const removeError = document.querySelector("#remove-error");
const cancelRemove = document.querySelector("#cancel-remove");
const confirmRemove = document.querySelector("#confirm-remove");
let selectedMember;

function renderMessage(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 3;
  cell.textContent = message;
  row.append(cell);
  roster.replaceChildren(row);
}

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
  removeButton.setAttribute("aria-label", `Remove ${member.name}`);
  removeButton.addEventListener("click", () => openRemoveDialog(member));
  actions.append(removeButton);
  row.append(actions);
  return row;
}

function openRemoveDialog(member) {
  selectedMember = member;
  dialogTitle.textContent = `Remove ${member.name}?`;
  removeError.textContent = "";
  confirmRemove.disabled = false;
  dialog.showModal();
}

cancelRemove.addEventListener("click", () => dialog.close());

confirmRemove.addEventListener("click", async () => {
  if (!selectedMember) return;
  confirmRemove.disabled = true;
  removeError.textContent = "";
  try {
    const response = await fetch(`/api/members/${encodeURIComponent(selectedMember.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Removal failed");
    roster.querySelector(`[data-member-id="${CSS.escape(selectedMember.id)}"]`)?.remove();
    if (!roster.querySelector("tr")) renderMessage("No team members.");
    dialog.close();
    selectedMember = undefined;
  } catch {
    removeError.textContent = `Could not remove ${selectedMember.name}. Please try again.`;
    confirmRemove.disabled = false;
  }
});

async function load() {
  renderMessage("Loading team members…");
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("Loading failed");
    const { members } = await response.json();
    if (!members.length) return renderMessage("No team members.");
    roster.replaceChildren(...members.map(renderRow));
  } catch {
    renderMessage("Could not load team members.");
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
