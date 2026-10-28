const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const rosterStatus = document.querySelector("#roster-status");
const rosterError = document.querySelector("#roster-error");
const removeDialog = document.querySelector("#remove-dialog");
const removeMessage = document.querySelector("#remove-message");
const removeError = document.querySelector("#remove-error");
const confirmRemoval = document.querySelector("#confirm-removal");
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
  removeButton.setAttribute("aria-label", "Remove " + member.name);
  removeButton.addEventListener("click", () => {
    memberToRemove = member;
    removeMessage.textContent = "Are you sure you want to remove " + member.name + "?";
    removeError.hidden = true;
    removeError.textContent = "";
    removeDialog.showModal();
  });
  actionCell.append(removeButton);
  row.append(actionCell);
  return row;
}

async function load() {
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("Could not load team members.");
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

confirmRemoval.addEventListener("click", async () => {
  if (!memberToRemove) return;
  confirmRemoval.disabled = true;
  removeError.hidden = true;
  try {
    const response = await fetch("/api/members/" + encodeURIComponent(memberToRemove.id), { method: "DELETE" });
    if (!response.ok) throw new Error("Member could not be removed.");
    roster.querySelector("[data-member-id=\"" + CSS.escape(memberToRemove.id) + "\"]")?.remove();
    removeDialog.close();
    if (!roster.querySelector("tr")) rosterStatus.textContent = "No team members yet.";
    memberToRemove = undefined;
  } catch {
    removeError.textContent = "This member could not be removed. Please try again.";
    removeError.hidden = false;
  } finally {
    confirmRemoval.disabled = false;
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
  rosterStatus.textContent = "";
  form.reset();
});

await load();
