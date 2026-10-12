import { useState } from "react";
import ModeSwitch from "./components/ModeSwitch.jsx";
import StudentView from "./components/StudentView.jsx";
import TeacherView from "./components/TeacherView.jsx";
import { useScheduleData } from "./hooks/useScheduleData.js";

export default function App() {
  const { data, error, loading } = useScheduleData();
  const [mode, setMode] = useState("student");

  if (loading) return <div className="container">Загрузка…</div>;
  if (error)
    return <div className="container error">Ошибка: {error.message}</div>;

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>Расписание</h1>
          <p className="muted">
            Обновлено: {new Date(data.updatedAt).toLocaleString("ru-RU")}
          </p>
        </div>
        <ModeSwitch mode={mode} onChange={setMode} />
      </header>
      {mode === "student" && <StudentView data={data} />}
      {mode === "teacher" && <TeacherView data={data} />}
    </div>
  );
}
