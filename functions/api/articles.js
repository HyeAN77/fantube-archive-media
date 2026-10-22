
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, title, slug, excerpt, category,
              thumbnail_url, created_at
       FROM articles
       WHERE published = 1
       ORDER BY created_at DESC`
    ).all();

    return json({ articles: results });
  } catch (error) {
    return json({ error: "기사 목록을 불러오지 못했습니다." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  return json({
    error: "관리자 인증 기능을 설정한 뒤 사용할 수 있습니다."
  }, 501);
}
