import { getStandings } from "../api";

const tbody = document.querySelector("#standings tbody");

function cell(tag, text, attrs = {}) {
    const el = document.createElement(tag);
    el.textContent = text;
    Object.assign(el, attrs);
    return el;
}

try {
    const standings = await getStandings();
    const rows = standings.map((s) => {
        const tr = document.createElement("tr");
        tr.append(
            cell("td", s.rank),
            cell("td", s.managerName, { scope: "row"}),
            cell("td", s.gameweekPoints),
            cell("td", s.totalPoints)
        );
        return tr;
    });
    tbody.replaceChildren(...rows);
} catch(err) {
    console.error(err);
    tbody.replaceChildren(
        cell("td", "Standings couldn't be loaded right now.", { colSpan: 5})
    );
}