
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
      `SELECT id, title, youtube_id, category,
              description, shoot_date, created_at
       FROM videos
       WHERE published = 1
       ORDER BY created_at DESC`
    ).all();

    return json({ videos: results });
  } catch (error) {
    return json({
      error: "영상 목록을 불러오지 못했습니다."
    }, 500);
  }
}

export async function onRequestPost() {
  return json({
    error: "관리자 인증 설정 후 사용할 수 있습니다."
  }, 501);
}
