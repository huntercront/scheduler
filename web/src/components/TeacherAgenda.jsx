import { DAYS, compareTime } from "../lib/schedule.js";

export default function TeacherAgenda({ lessons }) {
  const byDay = new Map(DAYS.map((d) => [d, []]));
  for (const l of lessons) {
    byDay.get(l.day)?.push(l);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => compareTime(a.time, b.time));
  }

  const nonEmptyDays = DAYS.filter((d) => byDay.get(d).length > 0);

  return (
    <div className="agenda">
      {nonEmptyDays.map((day) => (
        <section key={day} className="agenda-day">
          <h3>{day}</h3>
          <ul>
            {byDay.get(day).map((l, i) => (
              <li key={i} className="agenda-item">
                <span className="agenda-time">{l.time}</span>
                <div className="agenda-body">
                  <div className="subject">{l.subject}</div>
                  <div className="muted">
                    гр. {l.group}
                    {l.room ? ` · ауд. ${l.room}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
