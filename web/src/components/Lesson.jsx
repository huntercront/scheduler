export default function Lesson({
  subject,
  room,
  teacher,
  group,
  highlight,
  continuation,
}) {
  return (
    <div
      className={
        "lesson" +
        (highlight ? " hl" : "") +
        (continuation ? " continuation" : "")
      }
    >
      {subject && <div className="subject">{subject}</div>}
      {group && <div className="group">гр. {group}</div>}
      {room && <div className="room">ауд. {room}</div>}
      {teacher && <div className="teacher">{teacher}</div>}
    </div>
  );
}
