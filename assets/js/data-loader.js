const DATA_URL = new URL("../../data/games.json", import.meta.url);

export async function loadGames() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`作品データを読み込めませんでした（${response.status}）`);
  const data = await response.json();
  if (!Array.isArray(data.games)) throw new Error("作品データの形式が正しくありません。");
  return data.games.filter((game) => game.published !== false);
}

export function isPickupActive(game, today = new Date()) {
  if (!game.pickup) return false;
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = game.pickupStartDate ? new Date(`${game.pickupStartDate}T00:00:00`) : null;
  const end = game.pickupEndDate ? new Date(`${game.pickupEndDate}T23:59:59`) : null;
  return (!start || current >= start) && (!end || current <= end);
}
