const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");
const confirmation = document.querySelector("#remove-confirmation");
const confirmationMessage = document.querySelector("#confirmation-message");
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
  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    memberToRemove = member;
    confirmationMessage.textContent = `Remove ${member.name} from the team?`;
    removeError.textContent = "";
    confirmation.showModal();
  });
  actions.append(remove);
  row.append(actions);
  return row;
}

confirmation.addEventListener("close", async () => {
  if (confirmation.returnValue !== "confirm" || !memberToRemove) return;
  removeError.textContent = "";
  try {
    const response = await fetch(`/api/members/${encodeURIComponent(memberToRemove.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Member removal failed");
  } catch {
    removeError.textContent = "The member could not be removed. Try again.";
    confirmation.showModal();
    return;
  }
  roster.querySelector(`tr[data-member-id="${CSS.escape(memberToRemove.id)}"]`)?.remove();
  memberToRemove = undefined;
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
