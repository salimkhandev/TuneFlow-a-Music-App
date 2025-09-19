import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("[db] DATABASE_URL is not set. Database features will be disabled.");
}

export const pool = connectionString
  ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  : null;

export async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    create table if not exists liked_songs (
      id serial primary key,
      user_email text not null,
      song_id text not null,
      song_json jsonb not null,
      liked_at timestamptz not null default now(),
      unique (user_email, song_id)
    );
    create index if not exists idx_liked_songs_user on liked_songs(user_email);
  `);
}


