import { useState } from "react";
import {
  BarChart3,
  TrendingDown,
  Layers,
  Target,
  Building2,
  PieChart,
  Table2,
  FileText,
  Scroll,
  Globe,
  BookOpen,
  Briefcase,
  Columns2,
  MessageCircle,
  ChevronRight,
  Check,
} from "lucide-react";
import { usePathProgress, type PathTrack } from "../../hooks/usePathProgress";
import {
  PATH_FLOW_TRACKS,
  type PathFlowNode,
  type PathFlowTrack,
} from "./pathFlowData";

interface PathFlowMapProps {
  onSelectSimulator: (sim: "pe" | "vc" | "ib") => void;
  onSelectPETab: (tab: string) => void;
  onSelectVCTab: (tab: string) => void;
  onSelectIBView: (view: "simulator" | "compare" | "roleplay") => void;
}

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  BarChart3,
  TrendingDown,
  Layers,
  Target,
  Building2,
  PieChart,
  Table2,
  FileText,
  Scroll,
  Globe,
  BookOpen,
  Briefcase,
  Columns2,
  MessageCircle,
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function PathFlowMap({
  onSelectSimulator,
  onSelectPETab,
  onSelectVCTab,
  onSelectIBView,
}: PathFlowMapProps) {
  const [activeTrack, setActiveTrack] = useState<PathTrack>("pe");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { markVisited, isVisited } = usePathProgress();

  const track: PathFlowTrack =
    PATH_FLOW_TRACKS.find((t) => t.id === activeTrack) ?? PATH_FLOW_TRACKS[0];

  function handleNode(node: PathFlowNode) {
    markVisited(activeTrack, node.id);
    onSelectSimulator(activeTrack);
    if (activeTrack === "pe") onSelectPETab(node.id);
    else if (activeTrack === "vc") onSelectVCTab(node.id);
    else onSelectIBView(node.id as "simulator" | "compare" | "roleplay");
  }

  return (
    <section
      style={{
        background: "#0A0F1C",
        padding: "40px 24px 60px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              color: "#F9FAFB",
              fontWeight: 600,
            }}
          >
            Learning Path
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Follow the sequence to build a complete mental model of each asset
            class.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {PATH_FLOW_TRACKS.map((t) => {
            const active = t.id === activeTrack;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTrack(t.id)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: active ? hexToRgba(t.color, 0.15) : "transparent",
                  border: active
                    ? `1px solid ${hexToRgba(t.color, 0.5)}`
                    : "1px solid #374151",
                  color: active ? t.color : "rgba(255,255,255,0.5)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            paddingBottom: 8,
            gap: 0,
          }}
        >
          {track.nodes.map((node, idx) => {
            const Icon = ICON_MAP[node.iconName];
            const visited = isVisited(activeTrack, node.id);
            const hovered = hoveredNode === node.id;
            return (
              <div
                key={node.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  onClick={() => handleNode(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    position: "relative",
                    minWidth: 140,
                    padding: "14px 16px",
                    background: "#111827",
                    border: `1px solid ${
                      hovered ? hexToRgba(track.color, 0.4) : "#1F2937"
                    }`,
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  {Icon ? <Icon size={20} color={track.color} /> : null}
                  <div
                    style={{
                      fontSize: 13,
                      color: "#F9FAFB",
                      fontWeight: 600,
                    }}
                  >
                    {node.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {node.sublabel}
                  </div>
                  {visited ? (
                    <div
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#10B981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={10} color="#FFFFFF" />
                    </div>
                  ) : null}
                </div>
                {idx < track.nodes.length - 1 ? (
                  <div
                    style={{
                      margin: "0 6px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ChevronRight size={16} color="#374151" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
