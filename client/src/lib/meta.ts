// Catalog metadata — fetched once and cached in memory.
import { get } from "./api";
import type { Category, Condition, University } from "./types";

export interface CatalogMeta {
  categories: Category[];
  conditions: Condition[];
  eventCategories: { code: string; label: string }[];
  universities: University[];
}

let cache: CatalogMeta | null = null;
let loading: Promise<CatalogMeta> | null = null;

export async function meta(): Promise<CatalogMeta> {
  if (cache) return cache;
  if (!loading) {
    loading = get<{ categories: Category[]; conditions: Condition[]; eventCategories: { code: string; label: string }[] }>("/api/meta/catalog")
      .then((d): CatalogMeta => {
        cache = { ...d, universities: [] };
        return cache;
      })
      .catch((): CatalogMeta => {
        cache = { categories: [], conditions: [], eventCategories: [], universities: [] };
        return cache;
      });
  }
  return loading;
}

export async function universities(): Promise<University[]> {
  const m = await meta();
  if (m.universities.length) return m.universities;
  try {
    const d = await get<{ universities: University[] }>("/api/meta/universities");
    m.universities = d.universities;
    return d.universities;
  } catch {
    return [];
  }
}

export function catName(code: string): string {
  const found = cache?.categories.find((c) => c.code === code);
  return found?.label || code;
}
