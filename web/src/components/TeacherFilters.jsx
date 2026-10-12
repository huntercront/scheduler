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
        <input
          type="text"
          list="teachers-list"
          value={teacher}
          placeholder="начните вводить ФИО"
          onChange={(e) => onTeacherChange(e.target.value)}
        />
        <datalist id="teachers-list">
          {teachers.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
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
