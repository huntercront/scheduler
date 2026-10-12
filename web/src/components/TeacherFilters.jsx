export default function TeacherFilters({
  weeks,
  week,
  onWeekChange,
  teachers,
  teacher,
  onTeacherChange,
  layout,
  onLayoutChange,
}) {
  return (
    <div className="controls">
      <label>
        Неделя:
        <select value={week} onChange={(e) => onWeekChange(e.target.value)}>
          {weeks.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </label>

      <label>
        Преподаватель:
        <select
          value={teacher}
          onChange={(e) => onTeacherChange(e.target.value)}
        >
          <option value="">— выберите —</option>
          {teachers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label>
        Вид:
        <select value={layout} onChange={(e) => onLayoutChange(e.target.value)}>
          <option value="table">Таблица день × время</option>
          <option value="agenda">Список по дням</option>
        </select>
      </label>
    </div>
  );
}
