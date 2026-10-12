import { asLessons } from "../lib/schedule.js";
import Lesson from "./Lesson.jsx";

export default function LessonCell({ value, highlightTeacher }) {
  const lessons = asLessons(value);

  if (lessons.length === 0) {
    return <span className="muted">—</span>;
  }

  const q = highlightTeacher?.trim().toLowerCase();

  return (
    <>
      {lessons.map((lesson, i) => {
        const highlight =
          !!q && (lesson.teacher || "").toLowerCase().includes(q);

        return (
          <Lesson
            key={i}
            subject={lesson.subject}
            room={lesson.room}
            teacher={lesson.teacher}
            continuation={lesson.continuation}
            highlight={highlight}
          />
        );
      })}
    </>
  );
}
