import { ensureSchema, pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    if (!pool) {
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    }
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // ids | count | summary | full(default)

    if (view === 'ids') {
      const { rows } = await pool.query(
        "select song_id from liked_songs where user_email = $1 order by liked_at desc",
        [session.user.email]
      );
      const ids = rows.map(r => r.song_id);
      return new Response(JSON.stringify({ ids }), { status: 200 });
    }

    if (view === 'count') {
      const { rows } = await pool.query(
        "select count(*)::int as count from liked_songs where user_email = $1",
        [session.user.email]
      );
      return new Response(JSON.stringify({ count: rows[0]?.count ?? 0 }), { status: 200 });
    }

    const { rows } = await pool.query(
      "select song_json as song from liked_songs where user_email = $1 order by liked_at desc",
      [session.user.email]
    );
    const items = rows.map(r => r.song);

    if (view === 'summary') {
      const summary = items.map(s => ({
        id: s?.id,
        name: s?.name,
        duration: s?.duration,
        artists: s?.artists?.primary?.map(a => a?.name) ?? [],
      }));
      return new Response(JSON.stringify({ items: summary }), { status: 200 });
    }

    console.log("[liked-songs][GET] fetched", items.length, "songs for", session.user.email);
    return new Response(JSON.stringify({ items }), { status: 200 });
  } catch (err) {
    console.error("[liked-songs][GET] error", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    if (!pool) {
      return new Response(JSON.stringify({ ok: false, message: "DB not configured" }), { status: 200 });
    }
    await ensureSchema();
    const payload = await request.json();
    const song = payload?.song;
    if (!song?.id) {
      return new Response(JSON.stringify({ error: "song.id required" }), { status: 400 });
    }
    await pool.query(
      `insert into liked_songs (user_email, song_id, song_json)
       values ($1, $2, $3)
       on conflict (user_email, song_id) do update set song_json = excluded.song_json, liked_at = now()`,
      [session.user.email, String(song.id), song]
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("[liked-songs][POST] error", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    if (!pool) {
      return new Response(JSON.stringify({ ok: false, message: "DB not configured" }), { status: 200 });
    }
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    console.log('searchParams', searchParams);
    const songId = searchParams.get("songId");
    if (!songId) {
      return new Response(JSON.stringify({ error: "songId required" }), { status: 400 });
    }
    await pool.query(
      "delete from liked_songs where user_email = $1 and song_id = $2",
      [session.user.email, String(songId)]
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("[liked-songs][DELETE] error", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}


