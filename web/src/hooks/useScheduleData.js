import { useEffect, useState } from "react";
import { normalizeSchedule } from "../lib/schedule.js";

export function useScheduleData(
  url = `${import.meta.env.BASE_URL}schedule.json`,
) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status} для ${url}`);

        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await r.text();
          const preview = text.slice(0, 60).replace(/\s+/g, " ");
          throw new Error(
            `Ожидался JSON, но пришёл "${ct || "unknown"}": ${preview}… ` +
              `Проверь, что файл schedule.json лежит в web/public/.`,
          );
        }

        const raw = await r.json();
        const groups = raw.groups.map((g) => ({
          ...g,
          schedule: normalizeSchedule(g.schedule),
        }));

        if (!cancelled) setData({ ...raw, groups });
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, error, loading };
}
