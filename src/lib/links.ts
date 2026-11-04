import type { Lang } from "@/content/types";

export function unitHrefClient(lang: Lang, levelId: string, unitId: string) {
  return `/learn/${lang}/${levelId}/${unitId}`;
}
