import { DAYS, asLessons, compareTime } from "../lib/schedule.js";

export default function GroupAgenda({ group, highlightTeacher }) {
  const byDay = new Map(DAYS.map((d) => [d, []]));

  for (const row of group.schedule) {
    for (const day of DAYS) {
      for (const lesson of asLessons(row[day])) {
        byDay.get(day).push({
          time: row.time,
          subject: lesson.subject || "",
          room: lesson.room || "",
          teacher: lesson.teacher || "",
          continuation: !!lesson.continuation,
        });
      }
    }
  }

  for (const list of byDay.values()) {
    list.sort((a, b) => compareTime(a.time, b.time));
  }

  const nonEmptyDays = DAYS.filter((d) => byDay.get(d).length > 0);

  if (nonEmptyDays.length === 0) {
    return <p className="muted">На эту неделю занятий нет.</p>;
  }

  const q = highlightTeacher?.trim().toLowerCase();

  return (
    <div className="agenda">
      <h2>
        Группа {group.group} <span className="muted">· {group.specialty}</span>
      </h2>
      {nonEmptyDays.map((day) => (
        <section key={day} className="agenda-day">
          <h3>{day}</h3>
          <ul>
            {byDay.get(day).map((l, i) => {
              const highlight =
                !!q && (l.teacher || "").toLowerCase().includes(q);
              return (
                <li
                  key={i}
                  className={
                    "agenda-item" +
                    (highlight ? " hl" : "") +
                    (l.continuation ? " continuation" : "")
                  }
                >
                  <span className="agenda-time">{l.time}</span>
                  <div className="agenda-body">
                    <div className="subject">{l.subject}</div>
                    <div className="muted">
                      {l.room ? `ауд. ${l.room}` : ""}
                      {l.room && l.teacher ? " · " : ""}
                      {l.teacher}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
