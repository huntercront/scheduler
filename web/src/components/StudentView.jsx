import { useMemo, useState } from "react";
import StudentFilters from "./StudentFilters.jsx";
import GroupList from "./GroupList.jsx";
import GroupTable from "./GroupTable.jsx";
import GroupAgenda from "./GroupAgenda.jsx";
import { groupHasTeacher } from "../lib/schedule.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";

const MOBILE_QUERY = "(max-width: 1024px)";

export default function StudentView({ data }) {
  const weeks = data.weeks;
  const isNarrow = useMediaQuery(MOBILE_QUERY);

  const [week, setWeek] = useState(weeks[0]);
  const [groupQuery, setGroupQuery] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [layout, setLayout] = useState(() => (isNarrow ? "agenda" : "table"));

  const groupsOfWeek = useMemo(
    () => data.groups.filter((g) => g.week === week),
    [data.groups, week],
  );

  const filteredGroups = useMemo(() => {
    const q = groupQuery.trim().toLowerCase();
    return groupsOfWeek.filter((g) => {
      const matchesGroup =
        !q ||
        g.group.toLowerCase().includes(q) ||
        (g.specialty || "").toLowerCase().includes(q);
      const matchesTeacher = !teacherQuery || groupHasTeacher(g, teacherQuery);
      return matchesGroup && matchesTeacher;
    });
  }, [groupsOfWeek, groupQuery, teacherQuery]);

  const current =
    filteredGroups.find((g) => g.group === selectedGroup) ||
    filteredGroups[0] ||
    null;

  return (
    <>
      <StudentFilters
        weeks={weeks}
        week={week}
        onWeekChange={setWeek}
        groupQuery={groupQuery}
        onGroupQueryChange={setGroupQuery}
        teacherQuery={teacherQuery}
        onTeacherQueryChange={setTeacherQuery}
        layout={layout}
        onLayoutChange={setLayout}
      />

      <GroupList
        groups={filteredGroups}
        selectedGroup={current?.group || null}
        onSelect={setSelectedGroup}
      />

      {current && layout === "table" && (
        <GroupTable group={current} highlightTeacher={teacherQuery} />
      )}

      {current && layout === "agenda" && (
        <GroupAgenda group={current} highlightTeacher={teacherQuery} />
      )}

      {!current && <p className="muted">Выберите группу</p>}
    </>
  );
}
