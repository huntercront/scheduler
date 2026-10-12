import StudentView from "./components/StudentView.jsx";
import TeacherView from "./components/TeacherView.jsx";

export default function Schedule({ data, mode }) {
  return (
    <>
      {mode === "student" && <StudentView data={data} />}
      {mode === "teacher" && <TeacherView data={data} />}
    </>
  );
}
