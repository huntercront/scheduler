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

/* ------------------ нормализация преподавателей ------------------ */

/**
 * Приводит строку преподавателя к единому виду:
 *  - схлопывает пробелы, обрезает края;
 *  - запятая/точка с запятой в инициалах -> точка;
 *  - инициалы в верхний регистр;
 *  - убирает пробелы между инициалами;
 *  - фамилия с заглавной.
 * Примеры:
 *   "Гичкина Е.В,"  -> "Гичкина Е.В."
 *   "Шатилова е.М." -> "Шатилова Е.М."
 *   "Прилипа С.и."  -> "Прилипа С.И."
 */
export function normalizeTeacher(raw) {
  if (!raw) return "";
  let s = String(raw)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // запятая/точка с запятой на конце инициалов -> точка
  s = s.replace(/([А-Яа-яЁё])[.,;]\s*([А-Яа-яЁё])[.,;]?\s*$/u, "$1.$2.");
  s = s.replace(/([А-Яа-яЁё])[.,;]\s*$/u, "$1.");

  // инициалы в верхний регистр: "е.М." -> "Е.М."
  s = s.replace(/\b([А-Яа-яЁё])\./gu, (_, c) => c.toUpperCase() + ".");

  // убрать пробелы между инициалами: "Е. В." -> "Е.В."
  s = s.replace(/([А-ЯЁ])\.\s+([А-ЯЁ])\./gu, "$1.$2.");

  // фамилия с заглавной
  s = s.replace(/^([а-яё])/u, (_, c) => c.toUpperCase());

  return s;
}

/**
 * Разбивает составное значение на массив преподавателей.
 * "Пташинский  / Дмитриев" -> ["Пташинский", "Дмитриев"]
 */
export function splitTeachers(raw) {
  if (!raw) return [];
  return String(raw).split("/").map(normalizeTeacher).filter(Boolean);
}

/**
 * Ключ для сравнения: фамилия + инициалы без точек и пробелов, нижний регистр.
 * "Гичкина Е.В," и "Гичкина Е.В." -> "гичкинаев"
 */
export function teacherKey(raw) {
  return normalizeTeacher(raw).replace(/[.\s]/g, "").toLowerCase();
}

/**
 * Ключ только по фамилии.
 * "Малинин Н.Н." и "Малинин" -> "малинин"
 */
export function teacherSurnameKey(raw) {
  const n = normalizeTeacher(raw);
  const m = n.match(/^([А-ЯЁ][а-яё-]+)/u);
  return m ? m[1].toLowerCase() : "";
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
      merged[key] =
        key === "teacher" ? normalizeTeacher(overlay[key]) : overlay[key];
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
 *  - помечает результат continuation: true;
 *  - нормализует строки преподавателей.
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

      // Обычная ячейка: сохраняем как есть (с нормализованным teacher)
      // и обновляем якорь.
      const cleaned = lessons.map(({ continuation, ...rest }) => ({
        ...rest,
        teacher: rest.teacher ? normalizeTeacher(rest.teacher) : rest.teacher,
      }));
      result[idx][day] = cleaned;
      anchor = cleaned;
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
 *
 * Если в ячейке несколько преподавателей через "/", занятие разворачивается
 * в несколько записей — по одной на каждого преподавателя. Это нужно, чтобы
 * фильтры и collectTeachers работали с отдельными людьми.
 */
export function flattenWeek(groups, week) {
  const out = [];
  for (const g of groups) {
    if (g.week !== week) continue;
    for (const row of g.schedule) {
      for (const day of DAYS) {
        for (const lesson of asLessons(row[day])) {
          const teachers = splitTeachers(lesson.teacher || "");
          const base = {
            day,
            time: row.time,
            group: g.group,
            specialty: g.specialty,
            subject: lesson.subject || "",
            room: lesson.room || "",
            continuation: !!lesson.continuation,
          };
          if (teachers.length === 0) {
            out.push({ ...base, teacher: "" });
          } else {
            for (const t of teachers) out.push({ ...base, teacher: t });
          }
        }
      }
    }
  }
  return out;
}

/**
 * Уникальные преподаватели, сгруппированные по каноническому ключу.
 * "Гичкина Е.В," и "Гичкина Е.В." дают одного преподавателя —
 * остаётся более полное написание.
 */
export function collectTeachers(lessons) {
  const byKey = new Map(); // teacherKey -> самое полное написание
  for (const l of lessons) {
    for (const t of splitTeachers(l.teacher || "")) {
      const k = teacherKey(t);
      if (!k) continue;
      const prev = byKey.get(k);
      if (!prev || t.length > prev.length) byKey.set(k, t);
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "ru"));
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
  const q = teacherKey(query);
  if (!q) return true;

  return group.schedule.some((row) =>
    DAYS.some((day) =>
      asLessons(row[day]).some((lesson) => {
        for (const t of splitTeachers(lesson?.teacher || "")) {
          const k = teacherKey(t);
          if (k.includes(q)) return true;
          // запасной вариант: запрос без инициалов ("Малинин")
          // должен находить "Малинин Н.Н."
          if (!/\d/.test(q) && teacherSurnameKey(t) === q) return true;
        }
        return false;
      }),
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
