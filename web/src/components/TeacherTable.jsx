import { DAYS, collectTimes } from "../lib/schedule.js";

export default function TeacherTable({ lessons }) {
  const times = collectTimes(lessons);

  // индекс: time -> day -> [lessons]
  const grid = new Map();
  for (const l of lessons) {
    if (!grid.has(l.time)) grid.set(l.time, new Map());
    const byDay = grid.get(l.time);
    if (!byDay.has(l.day)) byDay.set(l.day, []);
    byDay.get(l.day).push(l);
  }

  return (
    <div className="table-wrap">
      <h2>Расписание преподавателя</h2>
      <table>
        <thead>
          <tr>
            <th>Время</th>
            {DAYS.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td className="time">{time}</td>
              {DAYS.map((day) => {
                const items = grid.get(time)?.get(day) || [];
                return (
                  <td key={day}>
                    {items.length === 0 ? (
                      <span className="muted">—</span>
                    ) : (
                      items.map((l, i) => (
                        <div key={i} className="lesson">
                          <div className="subject">{l.subject}</div>
                          <div className="group">гр. {l.group}</div>
                          {l.room && <div className="room">ауд. {l.room}</div>}
                        </div>
                      ))
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
