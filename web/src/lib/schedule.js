export const DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

/**
 * Регулярка для ячеек-«продолжений».
 * Совпадает со строками вида:
 *   (см. расп. по пр.)
 *   (см.расп. по пр.)
 *   (см. расп. по пр
 *   (см. расп. по пр.) (Лаврентьева)
 *   (см.расп.по пр.)
 * Регистр не важен, допускаются точки и пробелы в любых местах.
 */
const CONTINUATION_RE = /^\s*\(\s*см\.?\s*расп\.?\s*по\s*пр\.?/i;

export function isContinuation(raw) {
  if (!raw) return false;
  return CONTINUATION_RE.test(String(raw).trim());
}

/** Нормализует значение ячейки к массиву занятий. */
export function asLessons(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Мержит «продолжение» с якорем.
 * Правило: поля из overlay заполняют только те поля якоря,
 * которые пусты или отсутствуют. Существующие данные не перетираются.
 */
function mergeLesson(anchor, overlay) {
  const merged = { ...anchor };
  for (const key of ["subject", "room", "teacher"]) {
    const anchorEmpty = !merged[key] || !String(merged[key]).trim();
    const overlayFilled = overlay[key] && String(overlay[key]).trim();
    if (anchorEmpty && overlayFilled) {
      merged[key] = overlay[key];
    }
  }
  merged.continuation = true;
  return merged;
}

/**
 * Нормализует расписание одной группы:
 *  - находит ячейки-«продолжения» вида "(см. расп. по пр.)";
 *  - берёт якорь — предыдущее занятие в том же дне;
 *  - копирует якорь и, если в маркере были доп. поля,
 *    дозаполняет только отсутствующие (предмет / аудитория / преподаватель);
 *  - помечает результат continuation: true.
 *
 * Если якоря нет — ячейка становится null.
 */
export function normalizeSchedule(schedule) {
  const result = schedule.map((row) => ({ time: row.time }));

  for (const day of DAYS) {
    let anchor = null;

    schedule.forEach((row, idx) => {
      const lessons = asLessons(row[day]);

      if (lessons.length === 0) {
        result[idx][day] = null;
        return;
      }

      // Ячейка целиком — маркер(ы). Возможно с доп. данными.
      const allMarkers = lessons.every((l) => isContinuation(l?.subject ?? ""));

      if (allMarkers) {
        if (!anchor) {
          // Продолжать нечего — оставляем пустым
          result[idx][day] = null;
          return;
        }
        result[idx][day] = lessons.map((overlay, i) => {
          const base = anchor[i] || anchor[0];
          return mergeLesson(base, overlay);
        });
        // anchor НЕ трогаем — несколько продолжений подряд
        // ссылаются на один и тот же якорь.
        return;
      }

      // Обычная ячейка: сохраняем как есть и обновляем якорь.
      result[idx][day] = lessons.map(({ continuation, ...rest }) => rest);
      anchor = lessons.map(({ continuation, ...rest }) => rest);
    });
  }

  return result;
}

/* ------------------ сортировка по времени ------------------ */

/**
 * "9:15 - 10:50" → 555 (минут от полуночи).
 * Не смогли распарсить — Number.MAX_SAFE_INTEGER (уедет в конец).
 */
export function timeToMinutes(time) {
  if (!time) return Number.MAX_SAFE_INTEGER;
  const m = String(time).match(/(\d{1,2})[:.\s](\d{2})/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function compareTime(a, b) {
  return timeToMinutes(a) - timeToMinutes(b);
}

/* ------------------ teacher-режим ------------------ */

/**
 * Плоский список занятий выбранной недели.
 * Каждый элемент: { day, time, group, specialty, subject, room, teacher, continuation }
 */
export function flattenWeek(groups, week) {
  const out = [];
  for (const g of groups) {
    if (g.week !== week) continue;
    for (const row of g.schedule) {
      for (const day of DAYS) {
        for (const lesson of asLessons(row[day])) {
          out.push({
            day,
            time: row.time,
            group: g.group,
            specialty: g.specialty,
            subject: lesson.subject || "",
            room: lesson.room || "",
            teacher: lesson.teacher || "",
            continuation: !!lesson.continuation,
          });
        }
      }
    }
  }
  return out;
}

export function collectTeachers(lessons) {
  const set = new Set();
  for (const l of lessons) {
    if (l.teacher) set.add(l.teacher);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ru"));
}

export function collectTimes(lessons) {
  const seen = new Set();
  const out = [];
  for (const l of lessons) {
    if (!seen.has(l.time)) {
      seen.add(l.time);
      out.push(l.time);
    }
  }
  return out.sort(compareTime);
}

/* ------------------ фильтры ------------------ */

export function groupHasTeacher(group, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return group.schedule.some((row) =>
    DAYS.some((day) =>
      asLessons(row[day]).some((lesson) =>
        (lesson?.teacher || "").toLowerCase().includes(q),
      ),
    ),
  );
}

export function groupHasRoom(group, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return group.schedule.some((row) =>
    DAYS.some((day) =>
      asLessons(row[day]).some((lesson) =>
        (lesson?.room || "").toLowerCase().includes(q),
      ),
    ),
  );
}
