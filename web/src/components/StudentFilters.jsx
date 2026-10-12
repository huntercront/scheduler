export default function StudentFilters({
  weeks,
  week,
  onWeekChange,
  teacherQuery,
  onTeacherQueryChange,
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
        <input
          type="text"
          value={teacherQuery}
          placeholder="например: Иванов"
          onChange={(e) => onTeacherQueryChange(e.target.value)}
        />
      </label>

      <label>
        Вид:
        <select value={layout} onChange={(e) => onLayoutChange(e.target.value)}>
          <option value="table">Таблица</option>
          <option value="agenda">Список по дням</option>
        </select>
      </label>
    </div>
  );
}
