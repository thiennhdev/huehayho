import "server-only";
import { Redis } from "@upstash/redis";

export type StorageKind = "redis" | "memory" | "none";

function findRedisEnv(): { url: string; token: string } | null {
  const env = process.env;
  const pairs: [string | undefined, string | undefined][] = [
    [env.KV_REST_API_URL, env.KV_REST_API_TOKEN],
    [env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN],
  ];
  // Hỗ trợ cả trường hợp đặt prefix tuỳ chỉnh khi kết nối (vd: STORAGE_KV_REST_API_URL)
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

// Bộ nhớ tạm khi chạy local (npm run dev) chưa có Redis
const g = globalThis as unknown as { __hcnMem?: Map<string, unknown> };
const mem = (g.__hcnMem ??= new Map<string, unknown>());

export function storageKind(): StorageKind {
  if (getRedis()) return "redis";
  return process.env.VERCEL ? "none" : "memory";
}

const PREFIX = "hcn:";

export async function kvGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (r) return ((await r.get<T>(PREFIX + key)) ?? null) as T | null;
  if (storageKind() === "memory") return (mem.get(PREFIX + key) as T) ?? null;
  return null;
}

export async function kvSet<T>(key: string, value: T): Promise<boolean> {
  const r = getRedis();
  if (r) {
    await r.set(PREFIX + key, value);
    return true;
  }
  if (storageKind() === "memory") {
    mem.set(PREFIX + key, value);
    return true;
  }
  return false;
}
