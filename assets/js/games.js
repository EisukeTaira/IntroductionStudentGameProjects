import { loadGames } from "./data-loader.js";
import { gameCard } from "./game-card.js";

const elements = {
  search: document.querySelector("#search"), genre: document.querySelector("#genre"), year: document.querySelector("#year"), reset: document.querySelector("#reset-filters"), count: document.querySelector("[data-result-count]"), grid: document.querySelector("[data-games-grid]")
};
let games = [];

function normalize(value) { return String(value ?? "").normalize("NFKC").toLocaleLowerCase("ja"); }
function render() {
  const keyword = normalize(elements.search.value.trim());
  const genre = elements.genre.value;
  const year = elements.year.value;
  const filtered = games.filter((game) => {
    const haystack = normalize([game.title, game.summary, game.description, game.teamName].join(" "));
    return (!keyword || haystack.includes(keyword)) && (!genre || game.genre === genre) && (!year || String(game.productionYear) === year);
  });
  elements.count.textContent = `${filtered.length}作品が見つかりました`;
  elements.grid.innerHTML = filtered.length ? filtered.map((game) => gameCard(game)).join("") : '<p class="empty-state">条件に一致する作品がありません。検索条件を変更してください。</p>';
}

try {
  games = await loadGames();
  [...new Set(games.map((game) => game.genre))].sort().forEach((value) => elements.genre.add(new Option(value, value)));
  [...new Set(games.map((game) => game.productionYear))].sort((a, b) => b - a).forEach((value) => elements.year.add(new Option(`${value}年度`, value)));
  [elements.search, elements.genre, elements.year].forEach((element) => element.addEventListener(element.tagName === "INPUT" ? "input" : "change", render));
  elements.reset.addEventListener("click", () => { elements.search.value = ""; elements.genre.value = ""; elements.year.value = ""; render(); elements.search.focus(); });
  render();
} catch (error) {
  elements.count.textContent = "";
  elements.grid.innerHTML = `<p class="error-state" role="alert">${error.message}</p>`;
}
