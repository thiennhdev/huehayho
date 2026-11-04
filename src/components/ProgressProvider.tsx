"use client";
// Giữ tiến độ học trong bộ nhớ, lưu tạm trên máy và đồng bộ lên server (Postgres / MongoDB / Redis)
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/content/types";
import { emptyProgress, mergeProgress, normalize, type Progress } from "@/lib/progress";

export interface SessionUser {
  id: string;
  name: string;
  lang: Lang;
}

type SyncState = "idle" | "saving" | "saved" | "offline" | "error";
type StorageKind = "postgres" | "mongodb" | "redis" | "memory" | "none" | "unknown";

interface Ctx {
  user: SessionUser;
  partner: SessionUser;
  progress: Progress;
  loaded: boolean;
  update: (fn: (p: Progress) => Progress) => void;
  replace: (p: Progress) => void;
  sync: SyncState;
  storage: StorageKind;
  lang: Lang;
  name: string;
}

const ProgressCtx = createContext<Ctx | null>(null);

export function useProgress(): Ctx {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("useProgress must be inside ProgressProvider");
  return c;
}

const localKey = (uid: string) => `hcn:progress:${uid}`;

function readLocal(uid: string): Progress | null {
  try {
    const raw = localStorage.getItem(localKey(uid));
    return raw ? normalize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocal(uid: string, p: Progress) {
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(p));
  } catch {}
}

export function ProgressProvider({
  user,
  partner,
  children,
}: {
  user: SessionUser;
  partner: SessionUser;
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [loaded, setLoaded] = useState(false);
  const [sync, setSync] = useState<SyncState>("idle");
  const [storage, setStorage] = useState<StorageKind>("unknown");
  const latest = useRef(progress);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  const push = useCallback(async () => {
    if (!dirty.current) return;
    dirty.current = false;
    setSync("saving");
    try {
      const res = await fetch("/api/progress", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(latest.current),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { progress: Progress; storage: StorageKind };
      setStorage(data.storage);
      if (data.storage === "none") {
        setSync("offline");
        return;
      }
      // Gộp lại phòng khi có thay đổi trong lúc đang gửi
      const merged = mergeProgress(latest.current, normalize(data.progress));
      latest.current = merged;
      setProgress(merged);
      writeLocal(user.id, merged);
      setSync("saved");
    } catch {
      dirty.current = true;
      setSync("error");
    }
  }, [user.id]);

  const schedule = useCallback(() => {
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(push, 1200);
  }, [push]);

  // Tải lần đầu: bản trên máy + bản trên server → gộp
  useEffect(() => {
    let cancelled = false;
    const local = readLocal(user.id);
    if (local) {
      latest.current = local;
      setProgress(local);
    }
    (async () => {
      try {
        const res = await fetch("/api/progress", { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = (await res.json()) as { progress: Progress | null; storage: StorageKind };
        if (cancelled) return;
        setStorage(data.storage);
        const remote = data.progress ? normalize(data.progress) : null;
        const merged = remote && local ? mergeProgress(local, remote) : remote ?? local ?? emptyProgress();
        latest.current = merged;
        setProgress(merged);
        writeLocal(user.id, merged);
        if (data.storage !== "none" && local && (!remote || local.t > remote.t)) schedule();
        setSync(data.storage === "none" ? "offline" : "saved");
      } catch {
        setSync("error");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id, schedule]);

  // Lưu ngay khi rời trang / chuyển tab
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && dirty.current) push();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [push]);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      const next = { ...fn(latest.current), t: Date.now() };
      latest.current = next;
      setProgress(next);
      writeLocal(user.id, next);
      schedule();
    },
    [user.id, schedule],
  );

  const replace = useCallback(
    (p: Progress) => {
      const next = { ...normalize(p), t: Date.now() };
      latest.current = next;
      setProgress(next);
      writeLocal(user.id, next);
      schedule();
    },
    [user.id, schedule],
  );

  const value = useMemo<Ctx>(
    () => ({
      user,
      partner,
      progress,
      loaded,
      update,
      replace,
      sync,
      storage,
      lang: progress.profile.lang ?? user.lang,
      name: progress.profile.name || user.name,
    }),
    [user, partner, progress, loaded, update, replace, sync, storage],
  );

  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}
