
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    
    // 자동 사이트맵 생성
    if (path === "/sitemap.xml" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          `SELECT slug, updated_at
           FROM articles
           WHERE published = 1
           ORDER BY created_at DESC`
        ).all();

        const escapeXml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        const urls = [
          `<url>
            <loc>https://fantubearchive.com/</loc>
          </url>`,
          ...results.map((article) => {
            const loc =
              "https://fantubearchive.com/gisa?slug=" +
              encodeURIComponent(article.slug);

            const lastmod = article.updated_at
              ? `<lastmod>${escapeXml(
                  new Date(article.updated_at).toISOString()
                )}</lastmod>`
              : "";

            return `<url>
              <loc>${escapeXml(loc)}</loc>
              ${lastmod}
            </url>`;
          })
        ];

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.join("\n") +
          `\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300"
          }
        });
      } catch (error) {
        return new Response("사이트맵 생성에 실패했습니다.", {
          status: 500,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      }
    }

    
    if (path === "/api/admin/login" && request.method === "POST") {
      return adminLogin(request, env);
    }

    if (path === "/api/articles" || path.startsWith("/api/articles/")) {
      return handleArticles(request, env, url);
    }

    if (path === "/api/videos" || path.startsWith("/api/videos/")) {
      return handleVideos(request, env, url);
    }

    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function adminLogin(request, env) {
  const body = await readBody(request);

  if (!body || typeof body.password !== "string") {
    return json({ error: "비밀번호를 입력해 주세요." }, 400);
  }

  if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
    return json({ error: "비밀번호가 올바르지 않습니다." }, 401);
  }

  return json({ ok: true });
}

function isAdmin(request, env) {
  const header = request.headers.get("Authorization") || "";
  const password = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  return Boolean(env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD);
}

function slugify(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `article-${crypto.randomUUID()}`;
}

async function handleArticles(request, env, url) {
  const id = url.pathname.match(/^\/api\/articles\/(\d+)$/)?.[1];
  const admin = url.searchParams.get("admin") === "1";

  if (admin && !isAdmin(request, env)) {
    return json({ error: "관리자 로그인이 필요합니다." }, 401);
  }

  if (request.method === "GET") {
    try {
      
      // 기사 상세 조회: ID 또는 slug로 기사 한 건 가져오기
      const slug = url.searchParams.get("slug");

      if (id || slug) {
        const article = await env.DB.prepare(
          `SELECT id, title, slug, excerpt, body, category,
                  thumbnail_url, created_at, updated_at
           FROM articles
           WHERE ${id ? "id = ?" : "slug = ?"}
             AND published = 1
           LIMIT 1`
        ).bind(id ? Number(id) : slug).first();

        if (!article) {
          return json({ error: "기사를 찾을 수 없습니다." }, 404);
        }

        return json({ article });
      }

      const query = admin
        ? `SELECT id, title, slug, excerpt, body, category,
             thumbnail_url, published, created_at, updated_at
           FROM articles ORDER BY created_at DESC`
        : `SELECT id, title, slug, excerpt, category,
             thumbnail_url, created_at
           FROM articles WHERE published = 1
           ORDER BY created_at DESC`;

      const { results } = await env.DB.prepare(query).all();
      return json({ articles: results });
    } catch {
      return json({ error: "기사 조회에 실패했습니다." }, 500);
    }
  }

  if (!isAdmin(request, env)) {
    return json({ error: "관리자 로그인이 필요합니다." }, 401);
  }

  if (request.method === "POST" || request.method === "PUT") {
    if (request.method === "PUT" && !id) {
      return json({ error: "기사 ID가 필요합니다." }, 400);
    }

    const body = await readBody(request);

    if (!body || !String(body.title || "").trim()) {
      return json({ error: "기사 제목을 입력해 주세요." }, 400);
    }

    const now = new Date().toISOString();
    const title = String(body.title).trim();
    const slug = slugify(body.slug || title);
    const excerpt = String(body.excerpt || "");
    const articleBody = String(body.body || "");
    const category = String(body.category || "NEWS");
    const thumbnail = String(body.thumbnail_url || "");
    const published = body.published ? 1 : 0;

    try {
      if (request.method === "POST") {
        const result = await env.DB.prepare(
          `INSERT INTO articles
          (title, slug, excerpt, body, category, thumbnail_url,
           published, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          title, slug, excerpt, articleBody, category,
          thumbnail, published, now, now
        ).run();

        return json({ ok: true, id: result.meta.last_row_id }, 201);
      }

      const result = await env.DB.prepare(
        `UPDATE articles SET title=?, slug=?, excerpt=?, body=?,
         category=?, thumbnail_url=?, published=?, updated_at=?
         WHERE id=?`
      ).bind(
        title, slug, excerpt, articleBody, category,
        thumbnail, published, now, Number(id)
      ).run();

      if (!result.meta.changes) {
        return json({ error: "해당 기사를 찾을 수 없습니다." }, 404);
      }

      return json({ ok: true });
    } catch {
      return json({ error: "기사 저장에 실패했습니다." }, 500);
    }
  }

  if (request.method === "DELETE" && id) {
    try {
      const result = await env.DB.prepare(
        "DELETE FROM articles WHERE id=?"
      ).bind(Number(id)).run();

      if (!result.meta.changes) {
        return json({ error: "해당 기사를 찾을 수 없습니다." }, 404);
      }

      return json({ ok: true });
    } catch {
      return json({ error: "기사 삭제에 실패했습니다." }, 500);
    }
  }

  return json({ error: "지원하지 않는 요청입니다." }, 405);
}

async function handleVideos(request, env, url) {
  const id = url.pathname.match(/^\/api\/videos\/(\d+)$/)?.[1];
  const admin = url.searchParams.get("admin") === "1";

  if (admin && !isAdmin(request, env)) {
    return json({ error: "관리자 로그인이 필요합니다." }, 401);
  }

  if (request.method === "GET") {
    try {
      const query = admin
        ? `SELECT id, title, youtube_id, category, description,
             shoot_date, published, created_at, updated_at
           FROM videos ORDER BY created_at DESC`
        : `SELECT id, title, youtube_id, category, description,
             shoot_date, created_at
           FROM videos WHERE published = 1
           ORDER BY created_at DESC`;

      const { results } = await env.DB.prepare(query).all();
      return json({ videos: results });
    } catch {
      return json({ error: "영상 조회에 실패했습니다." }, 500);
    }
  }

  if (!isAdmin(request, env)) {
    return json({ error: "관리자 로그인이 필요합니다." }, 401);
  }

  if (request.method === "POST" || request.method === "PUT") {
    if (request.method === "PUT" && !id) {
      return json({ error: "영상 ID가 필요합니다." }, 400);
    }

    const body = await readBody(request);

    if (!body || !String(body.title || "").trim()) {
      return json({ error: "영상 제목을 입력해 주세요." }, 400);
    }

    const youtubeId = String(body.youtube_id || "").trim();

    if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      return json({
        error: "유효한 유튜브 영상 ID 11자리를 입력해 주세요."
      }, 400);
    }

    const title = String(body.title).trim();
    const category = String(body.category || "FANCAM");
    const description = String(body.description || "");
    const shootDate = String(body.shoot_date || "");
    const published = body.published ? 1 : 0;
    const now = new Date().toISOString();

    try {
      if (request.method === "POST") {
        const result = await env.DB.prepare(
          `INSERT INTO videos
          (title, youtube_id, category, description, shoot_date,
           published, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          title, youtubeId, category, description,
          shootDate, published, now, now
        ).run();

        return json({ ok: true, id: result.meta.last_row_id }, 201);
      }

      const result = await env.DB.prepare(
        `UPDATE videos SET title=?, youtube_id=?, category=?,
         description=?, shoot_date=?, published=?, updated_at=?
         WHERE id=?`
      ).bind(
        title, youtubeId, category, description,
        shootDate, published, now, Number(id)
      ).run();

      if (!result.meta.changes) {
        return json({ error: "해당 영상을 찾을 수 없습니다." }, 404);
      }

      return json({ ok: true });
    } catch {
      return json({ error: "영상 저장에 실패했습니다." }, 500);
    }
  }

  if (request.method === "DELETE" && id) {
    try {
      const result = await env.DB.prepare(
        "DELETE FROM videos WHERE id=?"
      ).bind(Number(id)).run();

      if (!result.meta.changes) {
        return json({ error: "해당 영상을 찾을 수 없습니다." }, 404);
      }

      return json({ ok: true });
    } catch {
      return json({ error: "영상 삭제에 실패했습니다." }, 500);
    }
  }

  return json({ error: "지원하지 않는 요청입니다." }, 405);
}
