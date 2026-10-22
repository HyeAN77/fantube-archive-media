
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 기사 API
    if (url.pathname === "/api/articles") {
      return handleArticles(request, env);
    }

    // 영상 API
    if (url.pathname === "/api/videos") {
      return handleVideos(request, env);
    }

    // 그 외 요청은 기존 정적 파일로 전달
    return env.ASSETS.fetch(request);
  }
};

async function handleArticles(request, env) {
  if (request.method !== "GET") {
    return json({ error: "지원하지 않는 요청입니다." }, 405);
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, title, slug, excerpt, category,
              thumbnail_url, created_at
       FROM articles
       WHERE published = 1
       ORDER BY created_at DESC`
    ).all();

    return json({ articles: results });
  } catch {
    return json({ error: "기사 데이터베이스 연결을 확인해 주세요." }, 500);
  }
}

async function handleVideos(request, env) {
  if (request.method !== "GET") {
    return json({ error: "지원하지 않는 요청입니다." }, 405);
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, title, youtube_id, category,
              description, shoot_date, created_at
       FROM videos
       WHERE published = 1
       ORDER BY created_at DESC`
    ).all();

    return json({ videos: results });
  } catch {
    return json({ error: "영상 데이터베이스 연결을 확인해 주세요." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
