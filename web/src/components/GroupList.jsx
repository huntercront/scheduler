export default function GroupList({ groups, selectedGroup, onSelect }) {
  if (groups.length === 0) {
    return <p className="muted">Ничего не найдено</p>;
  }

  return (
    <div className="groups-list">
      {groups.map((g) => (
        <button
          key={g.group}
          className={"group-btn" + (selectedGroup === g.group ? " active" : "")}
          onClick={() => onSelect(g.group)}
        >
          <strong>{g.group}</strong>
          <span>{g.specialty}</span>
        </button>
      ))}
    </div>
  );
}
