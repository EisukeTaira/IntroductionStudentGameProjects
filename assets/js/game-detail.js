import { loadGames } from "./data-loader.js";

const root = document.querySelector("[data-game-detail]");
const id = new URLSearchParams(location.search).get("id");
const esc = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

try {
  const games = await loadGames();
  const game = games.find((item) => item.id === id);
  if (!game) throw new Error("指定された作品が見つかりませんでした。");
  document.title = `${game.title} | Student Game Gallery`;
  const media = game.mainImage ? `<img src="${esc(game.mainImage)}" alt="${esc(game.title)}のゲーム画面">` : `<div class="game-image-placeholder" style="--placeholder-a:#2563eb;--placeholder-b:#f59e0b"><strong>${esc(game.title)}</strong></div>`;
  const download = game.downloadUrl ? `<a class="button" href="${esc(game.downloadUrl)}" target="_blank" rel="noopener noreferrer">Google Driveからダウンロード</a>` : '<span class="button" aria-disabled="true">配布準備中</span>';
  root.innerHTML = `<div class="breadcrumbs"><a href="index.html">トップ</a> › <a href="games.html">ゲーム一覧</a> › ${esc(game.title)}</div><section class="detail-header"><div class="detail-main-image">${media}</div><div class="detail-summary"><ul class="tag-list"><li class="tag">${esc(game.genre)}</li><li class="tag">${esc(game.players)}</li></ul><h1>${esc(game.title)}</h1><p class="detail-description">${esc(game.description)}</p><dl class="facts"><div class="fact"><dt>制作チーム</dt><dd>${esc(game.teamName)}</dd></div><div class="fact"><dt>学年</dt><dd>${esc(game.grade)}</dd></div><div class="fact"><dt>制作年度</dt><dd>${esc(game.productionYear)}年度</dd></div><div class="fact"><dt>想定プレイ時間</dt><dd>${esc(game.playTime || "―")}</dd></div></dl>${download}<p class="download-meta">${esc(game.supportedOs.join(" / "))}・${esc(game.fileSize)}・v${esc(game.version)}</p></div></section><section class="detail-layout"><div class="content-stack"><div class="panel"><h2>ゲームの特徴</h2><ul class="feature-list">${game.features.map((feature) => `<li>${esc(feature)}</li>`).join("")}</ul></div><div class="panel"><h2>起動方法</h2><p>${esc(game.launchInstructions)}</p>${game.notes ? `<div class="notice warning">${esc(game.notes)}</div>` : ""}</div></div><aside class="panel"><h2>操作方法</h2><ul class="control-list">${game.controls.map((control) => `<li><strong>${esc(control.key)}</strong><span>${esc(control.action)}</span></li>`).join("")}</ul><h2 class="section">動作環境</h2><p>${esc(game.systemRequirements || game.supportedOs.join(" / "))}</p><p class="download-meta">更新日：${esc(game.updatedAt)}</p></aside></section>`;
} catch (error) {
  root.innerHTML = `<div class="error-state" role="alert"><p>${esc(error.message)}</p><a class="button secondary" href="games.html">ゲーム一覧へ戻る</a></div>`;
}
