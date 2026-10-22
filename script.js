/*
  FANTUBE ARCHIVE MEDIA
  영상 아카이브 + 페이지네이션 + 뉴스 읽음 상태
*/

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let language = document.documentElement.lang === "en" ? "en" : "ko";
  let videos = [];
  let currentFilter = "ALL";
  let currentPage = 1;

  const grid = $("#videoGrid");

  // PC: 6개 / 모바일: 4개
  function getPageSize() {
    return window.matchMedia("(max-width: 600px)").matches ? 4 : 6;
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  // 데이터베이스 카테고리를 홈페이지 필터에 맞춤
  function normalizeCategory(category = "") {
    const value = String(category).trim().toUpperCase();

    if (
      value === "STAGE" ||
      value.includes("STAGE") ||
      value.includes("FANCAM") ||
      value.includes("FAN CAM")
    ) {
      return "STAGE";
    }

    if (value.includes("FAN EVENT")) return "FAN EVENT";
    if (value.includes("FESTIVAL")) return "FESTIVAL";
    if (value === "OTHER") return "OTHER";

    return "OTHER";
  }

  // D1 영상 데이터를 화면 표시용으로 변환
  function normalizeVideo(video) {
    return {
      id: video.id,
      youtubeId: video.youtube_id || "",
      url: video.youtube_id
        ? `https://www.youtube.com/watch?v=${encodeURIComponent(video.youtube_id)}`
        : "",
      category: normalizeCategory(video.category),
      titleKo: video.title || "제목 없음",
      titleEn: video.title || "Untitled video",
      subtitleKo: video.description || "",
      subtitleEn: video.description || "",
      date: video.shoot_date || "",
      graphic: video.category || "VIDEO"
    };
  }

  // 페이지네이션 영역 생성
  let pagination = $("#videoPagination");

  if (!pagination && grid) {
    pagination = document.createElement("nav");
    pagination.id = "videoPagination";
    pagination.className = "video-pagination";
    pagination.setAttribute("aria-label", "영상 페이지 이동");
    pagination.setAttribute("hidden", "");
    grid.insertAdjacentElement("afterend", pagination);
  }

  // 페이지네이션 디자인
  if (!$("#videoPaginationStyles")) {
    const style = document.createElement("style");
    style.id = "videoPaginationStyles";

    style.textContent = `
      .video-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin: 32px 0 12px;
      }

      .video-pagination button {
        min-width: 38px;
        min-height: 38px;
        padding: 8px 12px;
        border: 1px solid var(--line, #444);
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .video-pagination button.active {
        background: var(--text, #fff);
        color: var(--bg, #111);
        border-color: var(--text, #fff);
      }

      .video-pagination button:disabled {
        opacity: .35;
        cursor: not-allowed;
      }

      .video-pagination button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 3px;
      }

      .video-pagination[hidden] {
        display: none !important;
      }

      @media (max-width: 600px) {
        .video-pagination {
          gap: 5px;
          margin-top: 24px;
        }

        .video-pagination button {
          min-width: 34px;
          min-height: 36px;
          padding: 7px 9px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getFilteredVideos() {
    return videos.filter(video =>
      currentFilter === "ALL" || video.category === currentFilter
    );
  }

  function renderPagination(totalPages) {
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.hidden = true;
      pagination.innerHTML = "";
      return;
    }

    pagination.hidden = false;

    const buttons = [];

    buttons.push(`
      <button
        type="button"
        data-page="${currentPage - 1}"
        ${currentPage === 1 ? "disabled" : ""}
        aria-label="${language === "ko" ? "이전 페이지" : "Previous page"}"
      >‹</button>
    `);

    // 페이지 수가 많아져도 버튼이 무한히 늘어나지 않도록 표시
    let pages = new Set([1, totalPages]);

    for (
      let page = Math.max(1, currentPage - 2);
      page <= Math.min(totalPages, currentPage + 2);
      page++
    ) {
      pages.add(page);
    }

    const sortedPages = [...pages].sort((a, b) => a - b);
    let previousPage = 0;

    sortedPages.forEach(page => {
      if (previousPage && page - previousPage > 1) {
        buttons.push(`<span aria-hidden="true">…</span>`);
      }

      buttons.push(`
        <button
          type="button"
          data-page="${page}"
          class="${page === currentPage ? "active" : ""}"
          ${page === currentPage ? 'aria-current="page"' : ""}
          aria-label="${page}${language === "ko" ? "페이지" : " page"}"
        >${page}</button>
      `);

      previousPage = page;
    });

    buttons.push(`
      <button
        type="button"
        data-page="${currentPage + 1}"
        ${currentPage === totalPages ? "disabled" : ""}
        aria-label="${language === "ko" ? "다음 페이지" : "Next page"}"
      >›</button>
    `);

    pagination.innerHTML = buttons.join("");

    pagination.querySelectorAll("button[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        const nextPage = Number(button.dataset.page);

        if (
          nextPage < 1 ||
          nextPage > totalPages ||
          nextPage === currentPage
        ) {
          return;
        }

        currentPage = nextPage;
        renderVideos();

        $("#archive")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  // 영상 카드 표시
  function renderVideos() {
    if (!grid) return;

    const filteredVideos = getFilteredVideos();
    const pageSize = getPageSize();
    const totalPages = Math.ceil(filteredVideos.length / pageSize);

    if (totalPages > 0 && currentPage > totalPages) {
      currentPage = totalPages;
    }

    if (filteredVideos.length === 0) {
      grid.innerHTML = `
        <p class="empty-state">
          ${language === "ko"
            ? "이 카테고리에 등록된 영상이 없습니다."
            : "No videos in this category yet."}
        </p>
      `;

      renderPagination(0);
      return;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const pageVideos = filteredVideos.slice(
      startIndex,
      startIndex + pageSize
    );

    grid.innerHTML = pageVideos.map(video => {
      const title = language === "ko"
        ? video.titleKo
        : video.titleEn;

      const subtitle = language === "ko"
        ? video.subtitleKo
        : video.subtitleEn;

      const thumbnail = video.youtubeId
        ? `https://img.youtube.com/vi/${encodeURIComponent(video.youtubeId)}/hqdefault.jpg`
        : "";

      const image = thumbnail
        ? `
          <img
            src="${thumbnail}"
            alt="${escapeHtml(title)}"
            loading="lazy"
          >
        `
        : `
          <div class="thumb-placeholder">
            <span>FANTUBE ARCHIVE / ${escapeHtml(video.category)}</span>
            <strong>VIDEO ARCHIVE</strong>
          </div>
        `;

      const inner = `
        <div class="video-thumb">
          ${image}
          <span class="play-icon">▶</span>
        </div>

        <div class="video-meta">
          <span>${escapeHtml(video.category)}</span>
          <span>${escapeHtml(video.date)}</span>
        </div>

        <h3 class="video-title">${escapeHtml(title)}</h3>

        <p class="video-subtitle">${escapeHtml(subtitle)}</p>
      `;

      if (video.url) {
        return `
          <a
            class="video-card"
            href="${escapeHtml(video.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >${inner}</a>
        `;
      }

      return `<article class="video-card">${inner}</article>`;
    }).join("");

    renderPagination(totalPages);
  }

  // 공개된 영상 목록을 Cloudflare D1 API에서 불러오기
  async function loadVideos() {
    if (!grid) return;

    grid.innerHTML = `
      <p class="news-loading">
        ${language === "ko" ? "영상을 불러오는 중입니다..." : "Loading videos..."}
      </p>
    `;

    try {
      const response = await fetch("/api/videos", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`영상 조회 실패: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.videos)) {
        throw new Error("영상 데이터 형식이 올바르지 않습니다.");
      }

      videos = data.videos.map(normalizeVideo);
      currentPage = 1;
      renderVideos();
    } catch (error) {
      console.error("FANTUBE 영상 로딩 오류:", error);

      grid.innerHTML = `
        <p class="empty-state">
          ${language === "ko"
            ? "영상을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요."
            : "Could not load videos. Please try again later."}
        </p>
      `;

      if (pagination) {
        pagination.hidden = true;
        pagination.innerHTML = "";
      }
    }
  }

  // 언어 전환
  function setLanguage(nextLanguage) {
    language = nextLanguage;
    document.documentElement.lang = nextLanguage;

    const langToggle = $("#langToggle");

    if (langToggle) {
      langToggle.textContent = nextLanguage === "ko" ? "EN" : "KO";
    }

    $$("[data-ko][data-en]").forEach(element => {
      const value = element.dataset[nextLanguage];

      if (value !== undefined) {
        element.innerHTML = value;
      }
    });

    renderVideos();
  }

  $("#langToggle")?.addEventListener("click", () => {
    setLanguage(language === "ko" ? "en" : "ko");
  });

  // 모바일 메뉴
  $("#menuToggle")?.addEventListener("click", () => {
    $(".desktop-nav")?.classList.toggle("open");
  });

  $$(".desktop-nav a").forEach(link => {
    link.addEventListener("click", () => {
      $(".desktop-nav")?.classList.remove("open");
    });
  });

  // 카테고리 필터
  $$(".filter").forEach(button => {
    button.addEventListener("click", () => {
      $$(".filter").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      currentFilter = button.dataset.filter || "ALL";
      currentPage = 1;
      renderVideos();
    });
  });

  // 화면 크기가 PC와 모바일 사이에서 바뀌면 페이지 재계산
  let lastPageSize = getPageSize();

  window.addEventListener("resize", () => {
    const newPageSize = getPageSize();

    if (newPageSize !== lastPageSize) {
      lastPageSize = newPageSize;
      currentPage = 1;
      renderVideos();
    }
  });

  // 연락처 및 외부 링크 설정은 videos.js의 FAM_SETTINGS 사용
  const settings = window.FAM_SETTINGS || {};

  if (settings.email) {
    if ($("#emailLink")) {
      $("#emailLink").href = `mailto:${settings.email}`;
    }

    if ($("#emailText")) {
      $("#emailText").textContent = settings.email;
    }
  } else {
    $("#emailLink")?.addEventListener("click", event => {
      event.preventDefault();

      alert(language === "ko"
        ? "videos.js 파일에서 문의 이메일을 설정해 주세요."
        : "Please set your contact email in videos.js.");
    });
  }

  if (settings.youtube) {
    if ($("#youtubeLink")) {
      $("#youtubeLink").href = settings.youtube;
    }
  } else {
    $("#youtubeLink")?.addEventListener("click", event => {
      event.preventDefault();

      alert(language === "ko"
        ? "videos.js 파일에서 유튜브 채널 주소를 설정해 주세요."
        : "Please set your YouTube channel URL in videos.js.");
    });
  }

  if (settings.social) {
    if ($("#socialLink")) {
      $("#socialLink").href = settings.social;
    }
  } else {
    $("#socialLink")?.addEventListener("click", event => {
      event.preventDefault();

      alert(language === "ko"
        ? "videos.js 파일에서 SNS 주소를 설정해 주세요."
        : "Please set your social link in videos.js.");
    });
  }

  if ($("#year")) {
    $("#year").textContent = new Date().getFullYear();
  }

  // 뉴스 읽음 상태 표시
  const pageName = location.pathname.split("/").pop() || "index.html";

  if (pageName === "index.html" || pageName === "") {
    $$(".news-card").forEach(card => {
      const link = card.querySelector(".news-art[href]");

      if (!link) return;

      const articlePage = link.getAttribute("href");

      if (
        localStorage.getItem("fantube-read-" + articlePage) === "true"
      ) {
        card.classList.add("is-read");
      }
    });
  }

  if (/^gisa\d*\.html$/i.test(pageName)) {
    localStorage.setItem("fantube-read-" + pageName, "true");
  }

  // 영상 목록 시작
  loadVideos();
})();
