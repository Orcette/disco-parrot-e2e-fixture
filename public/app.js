const roster = document.querySelector("#roster");
const form = document.querySelector("#add-member");
const formError = document.querySelector("#form-error");

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
  roster.replaceChildren(...members.map(renderRow));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  const data = Object.fromEntries(new FormData(form));
  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch("/api/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) break;
    } catch {
      response = undefined;
    }
  }
  if (!response?.ok) {
    formError.textContent = "Could not save the member. Please try again.";
    return;
  }
  const { member } = await response.json();
  roster.append(renderRow(member));
  form.reset();
});

await load();
