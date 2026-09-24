const palettes = [
  ["#2563eb", "#22c55e"],
  ["#7c3aed", "#ec4899"],
  ["#f97316", "#eab308"],
  ["#0891b2", "#2563eb"],
  ["#16a34a", "#84cc16"]
];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

export function gameCard(game, { showPickup = false } = {}) {
  const index = [...game.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  const [a, b] = palettes[index];
  const media = game.thumbnail
    ? `<img src="${escapeHtml(game.thumbnail)}" alt="${escapeHtml(game.title)}のゲーム画面" loading="lazy">`
    : `<div class="game-image-placeholder" style="--placeholder-a:${a};--placeholder-b:${b}"><strong>${escapeHtml(game.title)}</strong></div>`;
  const tags = [showPickup ? '<li class="tag is-pickup">ピックアップ</li>' : "", `<li class="tag">${escapeHtml(game.genre)}</li>`, `<li class="tag">${escapeHtml(game.players)}</li>`].join("");
  return `<article class="game-card"><a href="game.html?id=${encodeURIComponent(game.id)}"><div class="game-card-media">${media}</div><div class="game-card-body"><ul class="tag-list">${tags}</ul><h3 class="game-card-title">${escapeHtml(game.title)}</h3><p class="game-card-summary">${escapeHtml(game.summary)}</p><div class="game-card-meta"><span>${escapeHtml(game.teamName)}・${escapeHtml(game.grade)}</span><span>${escapeHtml(game.productionYear)}年度</span></div></div></a></article>`;
}
