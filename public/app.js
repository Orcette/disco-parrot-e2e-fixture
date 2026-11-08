const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const removeDialog = document.querySelector("#remove-dialog");
const removeMessage = document.querySelector("#remove-message");
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
  const action = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    pendingMember = member;
    removeMessage.textContent = `Are you sure you want to remove ${member.name}?`;
    removeError.textContent = "";
    removeDialog.showModal();
  });
  action.append(removeButton);
  row.append(action);
  return row;
}

document.querySelector("#cancel-remove").addEventListener("click", () => {
  removeDialog.close();
});

removeDialog.addEventListener("close", () => {
  pendingMember = undefined;
});

document.querySelector("#confirm-remove").addEventListener("click", async () => {
  if (!pendingMember) return;
  try {
    const response = await fetch(`/api/members/${encodeURIComponent(pendingMember.id)}`, { method: "DELETE" });
    if (!response.ok) {
      removeError.textContent = "Unable to remove this member. Please try again.";
      return;
    }
    roster.querySelector(`[data-member-id="${CSS.escape(pendingMember.id)}"]`)?.remove();
    removeDialog.close();
  } catch {
    removeError.textContent = "Unable to remove this member. Please try again.";
  }
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
