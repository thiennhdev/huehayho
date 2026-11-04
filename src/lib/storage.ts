import "server-only";
// Lưu trữ dạng khoá → JSON. Tự nhận database được nối trên Vercel (ưu tiên theo thứ tự):
//   1. Postgres (Neon / Vercel Postgres)  — DATABASE_URL hoặc POSTGRES_URL
//   2. MongoDB (Atlas)                    — MONGODB_URI
//   3. Redis (Upstash)                    — KV_REST_API_URL + KV_REST_API_TOKEN
//   4. Chạy local: bộ nhớ tạm của server
import { Redis } from "@upstash/redis";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { MongoClient, type Collection } from "mongodb";

export type StorageKind = "postgres" | "mongodb" | "redis" | "memory" | "none";

const env = process.env;
const PREFIX = "hcn:";

function findEnvEndingWith(suffix: string): string | undefined {
  const k = Object.keys(env).find((key) => key.endsWith(suffix) && env[key]);
  return k ? env[k] : undefined;
}

// ---------- Postgres ----------
const pgUrl = env.DATABASE_URL || env.POSTGRES_URL || findEnvEndingWith("_DATABASE_URL") || findEnvEndingWith("_POSTGRES_URL");
let sql: NeonQueryFunction<false, false> | null = null;
let pgReady: Promise<void> | null = null;
function pg() {
  if (!pgUrl) return null;
  sql ??= neon(pgUrl);
  pgReady ??= sql`CREATE TABLE IF NOT EXISTS hcn_kv (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`.then(() => undefined);
  return sql;
}

// ---------- MongoDB ----------
const mongoUrl = env.MONGODB_URI || env.MONGODB_URL || findEnvEndingWith("_MONGODB_URI");
const g = globalThis as unknown as { __hcnMongo?: Promise<MongoClient>; __hcnMem?: Map<string, unknown> };
type KvDoc = { _id: string; value: unknown; updatedAt: Date };
async function mongo(): Promise<Collection<KvDoc> | null> {
  if (!mongoUrl) return null;
  g.__hcnMongo ??= new MongoClient(mongoUrl, { maxPoolSize: 5 }).connect();
  const client = await g.__hcnMongo;
  return client.db(env.MONGODB_DB || "hoc_cung_nhau").collection<KvDoc>("kv");
}

// ---------- Redis ----------
function findRedisEnv(): { url: string; token: string } | null {
  const pairs: [string | undefined, string | undefined][] = [
    [env.KV_REST_API_URL, env.KV_REST_API_TOKEN],
    [env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN],
  ];
  for (const k of Object.keys(env)) {
    if (k.endsWith("KV_REST_API_URL")) pairs.push([env[k], env[k.replace(/URL$/, "TOKEN")]]);
    if (k.endsWith("UPSTASH_REDIS_REST_URL")) pairs.push([env[k], env[k.replace(/URL$/, "TOKEN")]]);
  }
  for (const [url, token] of pairs) if (url && token) return { url, token };
  return null;
}
let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const cfg = findRedisEnv();
  redis = cfg ? new Redis({ url: cfg.url, token: cfg.token }) : null;
  return redis;
}

// ---------- Bộ nhớ tạm (local) ----------
const mem = (g.__hcnMem ??= new Map<string, unknown>());

export function storageKind(): StorageKind {
  if (pgUrl) return "postgres";
  if (mongoUrl) return "mongodb";
  if (findRedisEnv()) return "redis";
  return env.VERCEL ? "none" : "memory";
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const k = PREFIX + key;
  switch (storageKind()) {
    case "postgres": {
      const q = pg()!;
      await pgReady;
      const rows = (await q`SELECT value FROM hcn_kv WHERE key = ${k}`) as { value: T }[];
      return rows[0]?.value ?? null;
    }
    case "mongodb": {
      const doc = await (await mongo())!.findOne({ _id: k });
      return (doc?.value as T) ?? null;
    }
    case "redis":
      return ((await getRedis()!.get<T>(k)) ?? null) as T | null;
    case "memory":
      return (mem.get(k) as T) ?? null;
    default:
      return null;
  }
}

export async function kvSet<T>(key: string, value: T): Promise<boolean> {
  const k = PREFIX + key;
  switch (storageKind()) {
    case "postgres": {
      const q = pg()!;
      await pgReady;
      await q`INSERT INTO hcn_kv (key, value, updated_at) VALUES (${k}, ${JSON.stringify(value)}::jsonb, now())
              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
      return true;
    }
    case "mongodb":
      await (await mongo())!.updateOne({ _id: k }, { $set: { value, updatedAt: new Date() } }, { upsert: true });
      return true;
    case "redis":
      await getRedis()!.set(k, value);
      return true;
    case "memory":
      mem.set(k, value);
      return true;
    default:
      return false;
  }
}
