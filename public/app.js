const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const removeDialog = document.querySelector("#remove-member-dialog");
const removeMessage = document.querySelector("#remove-member-message");
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
  const actions = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.setAttribute("aria-label", `Remove ${member.name}`);
  removeButton.addEventListener("click", () => {
    pendingMember = member;
    removeMessage.textContent = `Are you sure you want to remove ${member.name}?`;
    removeError.textContent = "";
    removeDialog.showModal();
  });
  actions.append(removeButton);
  row.append(actions);
  return row;
}

removeDialog.addEventListener("close", async () => {
  if (removeDialog.returnValue !== "remove" || !pendingMember) return;
  const member = pendingMember;
  pendingMember = undefined;
  const response = await fetch(`/api/members/${encodeURIComponent(member.id)}`, { method: "DELETE" });
  if (!response.ok) {
    removeError.textContent = "Could not remove this member. Please try again.";
    return;
  }
  roster.querySelector(`[data-member-id="${CSS.escape(member.id)}"]`)?.remove();
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
