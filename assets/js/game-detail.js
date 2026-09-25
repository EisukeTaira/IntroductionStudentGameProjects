import { loadGames } from "./data-loader.js";

const root = document.querySelector("[data-game-detail]");
const id = new URLSearchParams(location.search).get("id");
const esc = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

function createVideoPlayer(videoUrl, title) {
  if (!videoUrl) return "";

  let url;
  try {
    url = new URL(videoUrl, location.href);
  } catch {
    return "";
  }

  const driveId = url.hostname === "drive.google.com"
    ? url.searchParams.get("id") || url.pathname.match(/\/file\/d\/([^/]+)/)?.[1]
    : null;
  const youtubeId = url.hostname === "youtu.be"
    ? url.pathname.split("/").filter(Boolean)[0]
    : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)
      ? url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]
      : null;

  if (driveId) {
    const src = `https://drive.google.com/file/d/${encodeURIComponent(driveId)}/preview`;
    return `<iframe src="${src}" title="${esc(title)}の紹介動画" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
  }
  if (youtubeId && /^[A-Za-z0-9_-]+$/.test(youtubeId)) {
    const src = `https://www.youtube-nocookie.com/embed/${youtubeId}`;
    return `<iframe src="${src}" title="${esc(title)}の紹介動画" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`;
  }
  if (/\.(?:mp4|webm|ogg)(?:$|\?)/i.test(url.href)) {
    return `<video controls preload="metadata"><source src="${esc(url.href)}">お使いのブラウザは動画再生に対応していません。</video>`;
  }

  return `<p><a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">紹介動画を別のページで見る</a></p>`;
}

function createMediaGallery(game) {
  const imageUrls = [game.mainImage || game.thumbnail, ...(game.screenshots || [])]
    .filter((url, index, urls) => url && urls.indexOf(url) === index);
  const items = imageUrls.map((url, index) => ({
    type: "image",
    content: `<img src="${esc(url)}" alt="${esc(game.title)}のゲーム画面${index ? ` ${index + 1}` : ""}">`,
    thumbnail: `<img src="${esc(url)}" alt="">`,
    label: index ? `スクリーンショット${index + 1}` : "メイン画像",
  }));
  const video = createVideoPlayer(game.videoUrl, game.title);
  if (video) {
    const poster = game.thumbnail || game.mainImage;
    items.push({
      type: "video",
      content: video,
      thumbnail: `${poster ? `<img src="${esc(poster)}" alt="">` : ""}<span class="gallery-play" aria-hidden="true">▶</span>`,
      label: "紹介動画",
    });
  }

  if (!items.length) {
    return `<div class="game-image-placeholder" style="--placeholder-a:#2563eb;--placeholder-b:#f59e0b"><strong>${esc(game.title)}</strong></div>`;
  }

  const buttons = items.map((item, index) => `<button class="gallery-thumbnail${index === 0 ? " is-active" : ""}" type="button" role="tab" data-gallery-item="${index}" aria-label="${esc(item.label)}を表示" aria-selected="${index === 0}">${item.thumbnail}</button>`).join("");
  return `<div class="media-gallery"><div class="gallery-viewer${items[0].type === "video" ? " is-video" : ""}" data-gallery-viewer>${items[0].content}</div>${items.length > 1 ? `<div class="gallery-thumbnails" role="tablist" aria-label="作品の画像と動画">${buttons}</div>` : ""}</div>`;
}

try {
  const games = await loadGames();
  const game = games.find((item) => item.id === id);
  if (!game) throw new Error("指定された作品が見つかりませんでした。");
  document.title = `${game.title} | Student Game Gallery`;
  const media = createMediaGallery(game);
  const download = game.downloadUrl ? `<a class="button" href="${esc(game.downloadUrl)}" target="_blank" rel="noopener noreferrer">Google Driveからダウンロード</a>` : '<span class="button" aria-disabled="true">配布準備中</span>';
  root.innerHTML = `<div class="breadcrumbs"><a href="index.html">トップ</a> › <a href="games.html">ゲーム一覧</a> › ${esc(game.title)}</div><section class="detail-header"><div class="detail-main-image">${media}</div><div class="detail-summary"><ul class="tag-list"><li class="tag">${esc(game.genre)}</li><li class="tag">${esc(game.players)}</li></ul><h1>${esc(game.title)}</h1><p class="detail-description">${esc(game.description)}</p><dl class="facts"><div class="fact"><dt>制作チーム</dt><dd>${esc(game.teamName)}</dd></div><div class="fact"><dt>学年</dt><dd>${esc(game.grade)}</dd></div><div class="fact"><dt>制作年度</dt><dd>${esc(game.productionYear)}年度</dd></div><div class="fact"><dt>想定プレイ時間</dt><dd>${esc(game.playTime || "―")}</dd></div></dl>${download}<p class="download-meta">${esc(game.supportedOs.join(" / "))}・${esc(game.fileSize)}・v${esc(game.version)}</p></div></section><section class="detail-layout"><div class="content-stack"><div class="panel"><h2>ゲームの特徴</h2><ul class="feature-list">${game.features.map((feature) => `<li>${esc(feature)}</li>`).join("")}</ul></div><div class="panel"><h2>起動方法</h2><p>${esc(game.launchInstructions)}</p>${game.notes ? `<div class="notice warning">${esc(game.notes)}</div>` : ""}</div></div><aside class="panel"><h2>操作方法</h2><ul class="control-list">${game.controls.map((control) => `<li><strong>${esc(control.key)}</strong><span>${esc(control.action)}</span></li>`).join("")}</ul><h2 class="section">動作環境</h2><p>${esc(game.systemRequirements || game.supportedOs.join(" / "))}</p><p class="download-meta">更新日：${esc(game.updatedAt)}</p></aside></section>`;

  const galleryItems = [game.mainImage || game.thumbnail, ...(game.screenshots || [])]
    .filter((url, index, urls) => url && urls.indexOf(url) === index)
    .map((url, index) => ({ type: "image", content: `<img src="${esc(url)}" alt="${esc(game.title)}のゲーム画面${index ? ` ${index + 1}` : ""}">` }));
  const galleryVideo = createVideoPlayer(game.videoUrl, game.title);
  if (galleryVideo) galleryItems.push({ type: "video", content: galleryVideo });
  const viewer = root.querySelector("[data-gallery-viewer]");
  root.querySelectorAll("[data-gallery-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = galleryItems[Number(button.dataset.galleryItem)];
      if (!viewer || !item) return;
      viewer.innerHTML = item.content;
      viewer.classList.toggle("is-video", item.type === "video");
      root.querySelectorAll("[data-gallery-item]").forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-selected", String(active));
      });
    });
  });
} catch (error) {
  root.innerHTML = `<div class="error-state" role="alert"><p>${esc(error.message)}</p><a class="button secondary" href="games.html">ゲーム一覧へ戻る</a></div>`;
}
