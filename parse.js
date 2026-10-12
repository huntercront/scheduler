import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import vm from "node:vm";

const TARGET = "https://tvermedcollege.gitverse.site/tmk_schedule/";
const OUTPUT = "schedule.json";

async function main() {
  console.log("→ Загружаю", TARGET);
  const res = await fetch(TARGET, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "ru-RU,ru;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const html = await res.text();
  console.log("→ Получено", html.length, "символов");

  const marker = html.match(/(?:const|let|var|window\.)\s*templates\s*=\s*/);
  if (!marker) throw new Error("Не найден объект templates в HTML");

  const start = marker.index + marker[0].length;
  if (html[start] !== "{") {
    throw new Error('После "templates =" ожидался "{"');
  }

  const end = findMatchingBrace(html, start);
  if (end === -1) {
    throw new Error("Не найдена закрывающая скобка объекта templates");
  }

  const objectLiteral = html.slice(start, end + 1);

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`templates = ${objectLiteral}`, sandbox, { timeout: 2000 });
  const templates = sandbox.templates;

  if (!templates || typeof templates !== "object") {
    throw new Error("templates не является объектом");
  }

  const weeks = Object.keys(templates);
  const groups = [];
  for (const weekName of weeks) {
    const week = templates[weekName];
    for (const g of week.data || []) {
      groups.push({
        week: weekName,
        group: g.group,
        group_number: g.group_number,
        specialty: g.specialty,
        schedule: g.schedule,
      });
    }
  }

  const output = {
    updatedAt: new Date().toISOString(),
    source: TARGET,
    weeks,
    groupsCount: groups.length,
    templates,
    groups,
  };

  await writeFile(OUTPUT, JSON.stringify(output, null, 2), "utf8");
  console.log(`✓ Сохранено. Недель: ${weeks.length}, групп: ${groups.length}`);

  const publicPath = "web/public/schedule.json";
  await mkdir(dirname(publicPath), { recursive: true });
  await copyFile(OUTPUT, publicPath);
  console.log(`✓ Скопировано в ${publicPath}`);
}

function findMatchingBrace(str, start) {
  let depth = 0;
  let i = start;
  let inString = null;
  let inLineComment = false;
  let inBlockComment = false;

  while (i < str.length) {
    const ch = str[i];
    const next = str[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      i++;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }

    if (ch === "/" && next === "/") {
      inLineComment = true;
      i += 2;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      i++;
      continue;
    }

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

main().catch((err) => {
  console.error("✗ Ошибка:", err);
  process.exit(1);
});
