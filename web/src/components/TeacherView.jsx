import { useMemo, useState } from "react";
import TeacherFilters from "./TeacherFilters.jsx";
import TeacherTable from "./TeacherTable.jsx";
import TeacherAgenda from "./TeacherAgenda.jsx";
import { flattenWeek, collectTeachers } from "../lib/schedule.js";

export default function TeacherView({ data }) {
  const weeks = data.weeks;
  const [week, setWeek] = useState(weeks[0]);
  const [teacher, setTeacher] = useState("");
  const [layout, setLayout] = useState("table"); // 'table' | 'agenda'

  const weekLessons = useMemo(
    () => flattenWeek(data.groups, week),
    [data.groups, week],
  );

  const teachers = useMemo(() => collectTeachers(weekLessons), [weekLessons]);

  const teacherLessons = useMemo(
    () => (teacher ? weekLessons.filter((l) => l.teacher === teacher) : []),
    [weekLessons, teacher],
  );

  return (
    <>
      <TeacherFilters
        weeks={weeks}
        week={week}
        onWeekChange={setWeek}
        teachers={teachers}
        teacher={teacher}
        onTeacherChange={setTeacher}
        layout={layout}
        onLayoutChange={setLayout}
      />

      {!teacher && (
        <p className="muted">
          Выберите преподавателя, чтобы увидеть расписание.
        </p>
      )}

      {teacher && teacherLessons.length === 0 && (
        <p className="muted">
          В эту неделю занятий у выбранного преподавателя нет.
        </p>
      )}

      {teacher && teacherLessons.length > 0 && layout === "table" && (
        <TeacherTable lessons={teacherLessons} />
      )}

      {teacher && teacherLessons.length > 0 && layout === "agenda" && (
        <TeacherAgenda lessons={teacherLessons} />
      )}
    </>
  );
}
