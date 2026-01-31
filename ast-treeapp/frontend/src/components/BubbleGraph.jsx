import { useMemo } from "react";

export default function BubbleGraph({ ast, selectedId, onSelect }) {
  const { nodes, links, width, height } = useMemo(() => layoutGraph(ast), [ast]);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      <g>
        {links.map((l) => (
          <line
            key={l.id}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#1f2a44"
            strokeWidth={1}
          />
        ))}
      </g>

      <g>
        {nodes.map((n) => {
          const isSelected = n.id && n.id === selectedId;
          return (
            <g key={n.key} onClick={() => onSelect(n.raw)} style={{ cursor: "pointer" }}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={isSelected ? "rgba(59,130,246,0.45)" : "rgba(15,23,42,0.95)"}
                stroke={isSelected ? "#60a5fa" : "#223055"}
                strokeWidth={isSelected ? 2 : 1}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize={11}
                fill="#e2e8f0"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function layoutGraph(ast) {
  const nodes = [];
  const links = [];
  const columnWidth = 200;
  const rowHeight = 90;
  const paddingX = 30;
  const paddingY = 30;

  const levels = [];

  function getChildren(n) {
    if (!n || typeof n !== "object") return [];
    if (Array.isArray(n.children)) return n.children;
    if (Array.isArray(n.body)) return n.body;
    if (n.left && n.right) return [n.left, n.right].filter(Boolean);
    return [];
  }

  function walk(node, depth) {
    if (!node) return;
    if (!levels[depth]) levels[depth] = [];
    const index = levels[depth].length;
    levels[depth].push(node);

    nodes.push({
      id: node.id,
      key: node.id ?? `${depth}-${index}`,
      raw: node,
      depth,
      index,
      label: node.type ?? "Node",
    });

    const kids = getChildren(node);
    kids.forEach((child) => {
      links.push({ from: node, to: child });
      walk(child, depth + 1);
    });
  }

  walk(ast, 0);

  nodes.forEach((n) => {
    n.x = paddingX + n.index * columnWidth;
    n.y = paddingY + n.depth * rowHeight;
    n.r = 18 + Math.min(22, Math.max(0, childCount(n.raw) * 2));
  });

  const maxCols = levels.reduce((m, level) => Math.max(m, level.length), 1);
  const width = Math.max(600, paddingX * 2 + (maxCols - 1) * columnWidth + 120);
  const height = Math.max(320, paddingY * 2 + (levels.length - 1) * rowHeight + 120);

  const idToNode = new Map(nodes.map((n) => [n.raw, n]));
  links.forEach((l, i) => {
    const fromNode = idToNode.get(l.from);
    const toNode = idToNode.get(l.to);
    l.id = `edge-${i}`;
    l.x1 = fromNode.x;
    l.y1 = fromNode.y + fromNode.r;
    l.x2 = toNode.x;
    l.y2 = toNode.y - toNode.r;
  });

  return { nodes, links, width, height };
}

function childCount(node) {
  const kids = getKids(node);
  let count = kids.length;
  for (const k of kids) count += childCount(k);
  return count;

  function getKids(n) {
    if (!n || typeof n !== "object") return [];
    if (Array.isArray(n.children)) return n.children;
    if (Array.isArray(n.body)) return n.body;
    if (n.left && n.right) return [n.left, n.right].filter(Boolean);
    return [];
  }
}
