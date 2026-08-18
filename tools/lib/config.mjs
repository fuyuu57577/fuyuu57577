// Purpose-built parser for this repo's config files. Supports the subset of
// YAML actually used here: top-level `key: value`, inline flow arrays
// (`key: [a, b, c]`), and one level of block lists of flat maps
// (`key:` followed by `  - prop: val` / `    prop2: val2`). Not a general
// YAML parser — do not extend beyond what these configs need.

export function unquote(s) {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseInlineArray(s) {
  const inner = s.trim().slice(1, -1).trim();
  if (inner === "") return [];
  return inner.split(",").map((x) => unquote(x.trim()));
}

export function parseConfig(text) {
  const lines = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").replace(/\s+$/, "");
    if (!line.trim()) continue;
    lines.push({ indent: line.match(/^ */)[0].length, text: line.trim() });
  }

  const top = {};
  let i = 0;
  while (i < lines.length) {
    const { indent, text } = lines[i];
    if (indent !== 0) {
      i++;
      continue;
    }
    const m = text.match(/^([\w-]+):\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const [, key, value] = m;
    if (value === "") {
      const list = [];
      i++;
      while (i < lines.length && lines[i].indent > indent) {
        const itemIndent = lines[i].indent;
        const itemMatch = lines[i].text.match(/^-\s*([\w-]+):\s*(.*)$/);
        if (!itemMatch) {
          i++;
          continue;
        }
        const item = { [itemMatch[1]]: unquote(itemMatch[2]) };
        i++;
        while (i < lines.length && lines[i].indent > itemIndent) {
          const propMatch = lines[i].text.match(/^([\w-]+):\s*(.*)$/);
          if (propMatch) item[propMatch[1]] = unquote(propMatch[2]);
          i++;
        }
        list.push(item);
      }
      top[key] = list;
    } else if (value.startsWith("[")) {
      top[key] = parseInlineArray(value);
      i++;
    } else {
      top[key] = unquote(value);
      i++;
    }
  }
  return top;
}

export function replaceBetweenMarkers(source, startMarker, endMarker, block) {
  const re = new RegExp(`[ \\t]*<!-- ${startMarker}[\\s\\S]*?<!-- ${endMarker} -->`);
  if (!re.test(source)) {
    throw new Error(`could not find ${startMarker}/${endMarker} markers`);
  }
  return source.replace(re, block);
}
