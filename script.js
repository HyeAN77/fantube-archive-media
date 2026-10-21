(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  let language = "ko";
  const grid = $("#videoGrid");
  const videos = window.FAM_VIDEOS || [];

  function escapeHtml(value="") {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function renderVideos(filter="ALL") {
    const visible = videos.filter(v => filter === "ALL" || v.category === filter);
    if (!visible.length) {
      grid.innerHTML = `<p class="empty-state">${language === "ko" ? "이 카테고리에 등록된 영상이 없습니다." : "No videos in this category yet."}</p>`;
      return;
    }
    grid.innerHTML = visible.map(v => {
      const url = v.url || (v.youtubeId ? `https://www.youtube.com/watch?v=${encodeURIComponent(v.youtubeId)}` : "");
      const title = language === "ko" ? (v.titleKo || v.titleEn) : (v.titleEn || v.titleKo);
      const subtitle = language === "ko" ? (v.subtitleKo || "") : (v.subtitleEn || "");
      const thumb = v.youtubeId ? `https://img.youtube.com/vi/${encodeURIComponent(v.youtubeId)}/hqdefault.jpg` : "";
      const image = thumb ? `<img src="${thumb}" alt="${escapeHtml(title)}" loading="lazy">` : `<div class="thumb-placeholder"><span>FANTUBE ARCHIVE / ${escapeHtml(v.category || "MEDIA")}</span><strong>${escapeHtml(v.graphic || "VIDEO<br>ARCHIVE").replace(/&lt;br&gt;/g,"<br>")}</strong></div>`;
      const inner = `<div class="video-thumb">${image}<span class="play-icon">▶</span></div><div class="video-meta"><span>${escapeHtml(v.category || "VIDEO")}</span><span>${escapeHtml(v.date || "")}</span></div><h3 class="video-title">${escapeHtml(title || "Untitled video")}</h3><p class="video-subtitle">${escapeHtml(subtitle)}</p>`;
      return url ? `<a class="video-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : `<article class="video-card" aria-label="${escapeHtml(title)}">${inner}</article>`;
    }).join("");
  }
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next;
    $("#langToggle").textContent = next === "ko" ? "EN" : "KO";
    $$("[data-ko][data-en]").forEach(el => {
      const value = el.dataset[next];
      if (value !== undefined) el.innerHTML = value;
    });
    renderVideos($(".filter.active")?.dataset.filter || "ALL");
  }
  $("#langToggle").addEventListener("click", () => setLanguage(language === "ko" ? "en" : "ko"));
  $("#menuToggle").addEventListener("click", () => $(".desktop-nav").classList.toggle("open"));
  $$(".desktop-nav a").forEach(a => a.addEventListener("click", () => $(".desktop-nav").classList.remove("open")));
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b => b.classList.toggle("active", b === btn));
    renderVideos(btn.dataset.filter);
  }));

  const settings = window.FAM_SETTINGS || {};
  if (settings.email) {
    $("#emailLink").href = `mailto:${settings.email}`;
    $("#emailText").textContent = settings.email;
  } else {
    $("#emailLink").addEventListener("click", e => { e.preventDefault(); alert(language === "ko" ? "videos.js 파일에서 문의 이메일을 설정해 주세요." : "Please set your contact email in videos.js."); });
  }
  if (settings.youtube) $("#youtubeLink").href = settings.youtube;
  else $("#youtubeLink").addEventListener("click", e => { e.preventDefault(); alert(language === "ko" ? "videos.js 파일에서 유튜브 채널 주소를 설정해 주세요." : "Please set your YouTube channel URL in videos.js."); });
  if (settings.social) $("#socialLink").href = settings.social;
  else $("#socialLink").addEventListener("click", e => { e.preventDefault(); alert(language === "ko" ? "videos.js 파일에서 SNS 주소를 설정해 주세요." : "Please set your social link in videos.js."); });
  $("#year").textContent = new Date().getFullYear();
  renderVideos();
})();
