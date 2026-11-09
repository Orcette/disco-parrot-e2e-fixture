const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");

function renderEmptyState() {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  const message = document.createElement("p");
  row.dataset.emptyState = "true";
  cell.colSpan = 2;
  message.textContent = "No members yet";
  cell.append(message);
  row.append(cell);
  return row;
}

function renderRow(member) {
  const row = document.createElement("tr");
  row.dataset.memberId = member.id;
  for (const value of [member.name, member.role]) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  }
  return row;
}

async function load() {
  const response = await fetch("/api/members");
  const { members } = await response.json();
  roster.replaceChildren(...(members.length ? members.map(renderRow) : [renderEmptyState()]));
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
  roster.querySelector("[data-empty-state]")?.remove();
  roster.append(renderRow(member));
  form.reset();
});

await load();
