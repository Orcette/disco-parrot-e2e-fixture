const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const removeDialog = document.querySelector("#remove-dialog");
const removeDialogTitle = document.querySelector("#remove-dialog-title");
const removeDialogMessage = document.querySelector("#remove-dialog-message");
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
  const actionCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    selectedMember = member;
    removeError.textContent = "";
    removeDialogTitle.textContent = `Remove ${member.name}?`;
    removeDialogMessage.textContent = `Are you sure you want to remove ${member.name}?`;
    removeDialog.showModal();
  });
  actionCell.append(removeButton);
  row.append(actionCell);
  return row;
}

removeDialog.addEventListener("close", async () => {
  if (removeDialog.returnValue !== "confirm" || !selectedMember) return;
  const member = selectedMember;
  selectedMember = undefined;
  try {
    const response = await fetch(`/api/members/${encodeURIComponent(member.id)}`, { method: "DELETE" });
    if (response.ok) {
      roster.querySelector(`[data-member-id="${CSS.escape(member.id)}"]`)?.remove();
      return;
    }
  } catch {
    // Keep the row in place and show the failed request below.
  }
  removeError.textContent = `Could not remove ${member.name}. Please try again.`;
});

async function load() {
  const response = await fetch("/api/members");
  const { members } = await response.json();
  roster.replaceChildren(...members.map(renderRow));
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
