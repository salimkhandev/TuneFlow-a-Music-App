import { ensureSchema, pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!pool) {
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  }
  await ensureSchema();
  const { rows } = await pool.query(
    "select song_json as song from liked_songs where user_email = $1 order by liked_at desc",
    [session.user.email]
  );
  return new Response(JSON.stringify({ items: rows.map(r => r.song) }), { status: 200 });
}

export async function POST(request) {
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
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!pool) {
    return new Response(JSON.stringify({ ok: false, message: "DB not configured" }), { status: 200 });
  }
  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get("songId");
  if (!songId) {
    return new Response(JSON.stringify({ error: "songId required" }), { status: 400 });
  }
  await pool.query(
    "delete from liked_songs where user_email = $1 and song_id = $2",
    [session.user.email, String(songId)]
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}


