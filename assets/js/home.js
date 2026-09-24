import { loadGames, isPickupActive } from "./data-loader.js";
import { gameCard } from "./game-card.js";

const pickupContainer = document.querySelector("[data-pickup-games]");
const recentContainer = document.querySelector("[data-recent-games]");
const pickupSection = document.querySelector("[data-pickup-section]");

try {
  const games = await loadGames();
  const pickups = games.filter((game) => isPickupActive(game)).sort((a, b) => (a.pickupOrder ?? 99) - (b.pickupOrder ?? 99)).slice(0, 3);
  const recent = [...games].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 6);
  if (pickups.length) pickupContainer.innerHTML = pickups.map((game) => gameCard(game, { showPickup: true })).join("");
  else pickupSection.hidden = true;
  recentContainer.innerHTML = recent.map((game) => gameCard(game)).join("");
} catch (error) {
  pickupSection.hidden = true;
  recentContainer.innerHTML = `<p class="error-state" role="alert">${error.message}</p>`;
}
