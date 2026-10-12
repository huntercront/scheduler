const MODES = [
  { id: "student", label: "Студент" },
  { id: "teacher", label: "Преподаватель" },
];

export default function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-switch" role="tablist">
      {MODES.map((m) => (
        <button
          key={m.id}
          role="tab"
          aria-selected={mode === m.id}
          className={"mode-btn" + (mode === m.id ? " active" : "")}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
