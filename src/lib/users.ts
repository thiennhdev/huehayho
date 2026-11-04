import "server-only";
import type { Lang } from "@/content/types";

export type UserId = "u1" | "u2";

export interface PublicUser {
  id: UserId;
  name: string;
  lang: Lang;
}

function langOf(v: string | undefined, fallback: Lang): Lang {
  return v === "en" || v === "zh" ? v : fallback;
}

export function getUsers(): PublicUser[] {
  return [
    { id: "u1", name: process.env.USER1_NAME?.trim() || "Anh", lang: langOf(process.env.USER1_LANG, "en") },
    { id: "u2", name: process.env.USER2_NAME?.trim() || "Em", lang: langOf(process.env.USER2_LANG, "zh") },
  ];
}

export function getUser(id: string | null | undefined): PublicUser | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function partnerOf(id: UserId): UserId {
  return id === "u1" ? "u2" : "u1";
}

export function passwordFor(id: UserId): string | undefined {
  const v = id === "u1" ? process.env.USER1_PASSWORD : process.env.USER2_PASSWORD;
  return v && v.length > 0 ? v : undefined;
}

export function isConfigured(): boolean {
  return Boolean(passwordFor("u1") && passwordFor("u2"));
}
