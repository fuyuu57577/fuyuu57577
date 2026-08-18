// General-ish recursive-descent parser for the YAML subset used by
// README.yml: nested maps, block lists of maps (including this repo's
// `- id:` shorthand where the first key has no value and acts as the
// item's name), and inline flow arrays (`key: [a, b, c]`). Not a spec
// -compliant YAML parser — do not feed it anything fancier than that.

export function unquote(s) {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseValue(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    return inner === "" ? [] : inner.split(",").map((x) => unquote(x.trim()));
  }
  return unquote(trimmed);
}

function tokenize(text) {
  const lines = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = stripComment(raw).replace(/\s+$/, "");
    if (!line.trim()) continue;
    lines.push({ indent: line.match(/^ */)[0].length, text: line.trim() });
  }
  return lines;
}

function stripComment(line) {
  let inQuote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      if (c === inQuote) inQuote = null;
    } else if (c === '"' || c === "'") {
      inQuote = c;
    } else if (c === "#") {
      return line.slice(0, i);
    }
  }
  return line;
}

function isListItem(line) {
  return line.text === "-" || line.text.startsWith("- ");
}

function matchKeyValue(text) {
  const m = text.match(/^([\w.-]+):\s*(.*)$/);
  if (!m) return null;
  return { key: m[1], raw: m[2], hasValue: m[2].trim() !== "" };
}

function parseBlock(lines, cursor, indent) {
  if (cursor.i >= lines.length) return {};
  return isListItem(lines[cursor.i]) ? parseList(lines, cursor, indent) : parseMap(lines, cursor, indent);
}

function assign(obj, kv, lines, cursor, ownIndent) {
  if (kv.hasValue) {
    obj[kv.key] = parseValue(kv.raw);
  } else if (cursor.i < lines.length && lines[cursor.i].indent > ownIndent) {
    obj[kv.key] = parseBlock(lines, cursor, lines[cursor.i].indent);
  } else {
    obj[kv.key] = "";
  }
}

function parseMap(lines, cursor, indent) {
  const obj = {};
  while (cursor.i < lines.length && lines[cursor.i].indent === indent && !isListItem(lines[cursor.i])) {
    const kv = matchKeyValue(lines[cursor.i].text);
    cursor.i++;
    if (kv) assign(obj, kv, lines, cursor, indent);
  }
  return obj;
}

function parseList(lines, cursor, indent) {
  const arr = [];
  const itemIndent = indent + 2; // assumes "- " (dash, one space)
  while (cursor.i < lines.length && lines[cursor.i].indent === indent && isListItem(lines[cursor.i])) {
    const text = lines[cursor.i].text;
    const rest = text === "-" ? "" : text.slice(2);
    cursor.i++;

    if (rest === "") {
      if (cursor.i < lines.length && lines[cursor.i].indent >= itemIndent) {
        arr.push(parseBlock(lines, cursor, lines[cursor.i].indent));
      } else {
        arr.push(null);
      }
      continue;
    }

    const kv = matchKeyValue(rest);
    if (!kv) {
      arr.push(parseValue(rest));
      continue;
    }
    const obj = {};
    assign(obj, kv, lines, cursor, itemIndent);
    while (cursor.i < lines.length && lines[cursor.i].indent === itemIndent && !isListItem(lines[cursor.i])) {
      const kv2 = matchKeyValue(lines[cursor.i].text);
      cursor.i++;
      if (kv2) assign(obj, kv2, lines, cursor, itemIndent);
    }
    arr.push(obj);
  }
  return arr;
}

export function parseYaml(text) {
  const lines = tokenize(text);
  if (lines.length === 0) return {};
  const cursor = { i: 0 };
  return parseBlock(lines, cursor, lines[0].indent);
}

// For this repo's `- id:` shorthand (first key has an empty value and
// serves as the item's name), pull that id out and drop it from the rest
// of the object's own keys.
export function idAndRest(item) {
  const [id] = Object.keys(item);
  const { [id]: _drop, ...rest } = item;
  return { id, panel: rest };
}
