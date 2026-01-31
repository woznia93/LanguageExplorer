import { useMemo, useState } from "react";
import { styles } from "../styles/astExplorerStyles.js";
import Tree from "./Tree.jsx";
import NodeInspector from "./NodeInspector.jsx";
import TokensList from "./TokensList.jsx";
import BubbleGraph from "./BubbleGraph.jsx";

export default function AstPanel({ ast, selectedNode, setSelectedNode, tokens }) {
  const [viewMode, setViewMode] = useState("tree");
  const canRender = Boolean(ast);
  const headerRight = useMemo(() => {
    if (!canRender) return null;
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <ToggleButton
          active={viewMode === "tree"}
          onClick={() => setViewMode("tree")}
        >
          Tree
        </ToggleButton>
        <ToggleButton
          active={viewMode === "bubble"}
          onClick={() => setViewMode("bubble")}
        >
          Bubble Graph
        </ToggleButton>
      </div>
    );
  }, [canRender, viewMode]);

  return (
    <section style={styles.cardWide}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={styles.h2}>AST</h2>
        {headerRight}
      </div>
      {!ast ? (
        <div style={styles.placeholder}>
          Click <b>Parse</b> to generate an AST.
        </div>
      ) : viewMode === "bubble" ? (
        <div style={styles.outputGrid}>
          <div style={styles.treePane}>
            <BubbleGraph
              ast={ast}
              selectedId={selectedNode?.id}
              onSelect={setSelectedNode}
            />
          </div>

          <div style={styles.inspectorPane}>
            <NodeInspector node={selectedNode} />
            <TokensList tokens={tokens} />
          </div>
        </div>
      ) : (
        <div style={styles.outputGrid}>
          <div style={styles.treePane}>
            <Tree
              node={ast}
              onSelect={(n) => setSelectedNode(n)}
              selectedId={selectedNode?.id}
            />
          </div>

          <div style={styles.inspectorPane}>
            <NodeInspector node={selectedNode} />
            <TokensList tokens={tokens} />
          </div>
        </div>
      )}
    </section>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: active ? "1px solid #3b82f6" : "1px solid #223055",
        background: active ? "rgba(59,130,246,0.2)" : "#0b1020",
        color: active ? "#bfdbfe" : "#cbd5e1",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
