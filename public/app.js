const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const rosterStatus = document.querySelector("#roster-status");
const confirmation = document.querySelector("#remove-confirmation");
const confirmationTitle = document.querySelector("#remove-title");
const confirmationMessage = document.querySelector("#remove-message");
const removeError = document.querySelector("#remove-error");
let pendingRemoval;

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
    pendingRemoval = { member, row };
    confirmationTitle.textContent = `Remove ${member.name}?`;
    confirmationMessage.textContent = `Are you sure you want to remove ${member.name} from the roster?`;
    removeError.textContent = "";
    confirmation.showModal();
    document.querySelector("#cancel-remove").focus();
  });
  actions.append(removeButton);
  row.append(actions);
  return row;
}

document.querySelector("#cancel-remove").addEventListener("click", () => {
  confirmation.close();
  pendingRemoval = undefined;
});

confirmation.addEventListener("cancel", () => {
  pendingRemoval = undefined;
});

document.querySelector("#confirm-remove").addEventListener("click", async () => {
  if (!pendingRemoval) return;
  const { member, row } = pendingRemoval;
  try {
    const response = await fetch(`/api/members/${encodeURIComponent(member.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not remove member");
  } catch {
    removeError.textContent = "The member could not be removed. Please try again.";
    return;
  }
  row.remove();
  rosterStatus.textContent = roster.children.length ? "" : "No team members yet.";
  confirmation.close();
  pendingRemoval = undefined;
});

async function load() {
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("Could not load roster");
    const { members } = await response.json();
    roster.replaceChildren(...members.map(renderRow));
    rosterStatus.textContent = members.length ? "" : "No team members yet.";
  } catch {
    roster.replaceChildren();
    rosterStatus.setAttribute("role", "alert");
    rosterStatus.textContent = "The roster could not be loaded. Please try again.";
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
