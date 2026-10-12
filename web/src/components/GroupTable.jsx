import { DAYS, compareTime } from "../lib/schedule.js";
import LessonCell from "./LessonCell.jsx";

export default function GroupTable({ group, highlightTeacher }) {
  const rows = [...group.schedule].sort((a, b) => compareTime(a.time, b.time));
  return (
    <div className="table-wrap">
      <h2>
        Группа {group.group} <span className="muted">· {group.specialty}</span>
      </h2>
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
          {rows.map((row) => (
            <tr key={row.time}>
              <td className="time">{row.time}</td>
              {DAYS.map((day) => (
                <td key={day}>
                  <LessonCell
                    value={row[day]}
                    highlightTeacher={highlightTeacher}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
