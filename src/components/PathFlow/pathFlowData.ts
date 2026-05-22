export interface PathFlowNode {
  id: string;
  label: string;
  sublabel: string;
  iconName: string;
}

export interface PathFlowTrack {
  id: "pe" | "vc" | "ib";
  label: string;
  color: string;
  nodes: PathFlowNode[];
}

export const PATH_FLOW_TRACKS: PathFlowTrack[] = [
  {
    id: "pe",
    label: "Private Equity",
    color: "#6366F1",
    nodes: [
      {
        id: "lifecycle",
        label: "Fund Lifecycle",
        sublabel: "How capital gets called and deployed over 10 years",
        iconName: "BarChart3",
      },
      {
        id: "jcurve",
        label: "J-Curve",
        sublabel: "Why funds look bad early and how NAV recovers",
        iconName: "TrendingDown",
      },
      {
        id: "waterfall",
        label: "Waterfall",
        sublabel: "How profits split between LP and GP",
        iconName: "Layers",
      },
      {
        id: "performance",
        label: "Performance",
        sublabel: "DPI, TVPI, IRR and public market comparison",
        iconName: "Target",
      },
      {
        id: "lbo",
        label: "LBO Model",
        sublabel: "Leverage, debt paydown, and exit returns",
        iconName: "Building2",
      },
      {
        id: "portfolio",
        label: "Portfolio",
        sublabel: "Power-law returns and concentration risk",
        iconName: "PieChart",
      },
    ],
  },
  {
    id: "vc",
    label: "Venture Capital",
    color: "#10B981",
    nodes: [
      {
        id: "captable",
        label: "Cap Table",
        sublabel: "Dilution across rounds — who owns what",
        iconName: "Table2",
      },
      {
        id: "safe",
        label: "SAFE Notes",
        sublabel: "Convertible instruments before priced rounds",
        iconName: "FileText",
      },
      {
        id: "termsheet",
        label: "Term Sheet",
        sublabel: "Liquidation preferences, anti-dilution, pro rata",
        iconName: "Scroll",
      },
      {
        id: "marketsizing",
        label: "Market Sizing",
        sublabel: "TAM/SAM/SOM and bottoms-up sizing",
        iconName: "Globe",
      },
      {
        id: "dealmemo",
        label: "Deal Memo",
        sublabel: "Synthesize the full investment thesis",
        iconName: "BookOpen",
      },
    ],
  },
  {
    id: "ib",
    label: "Investment Banking",
    color: "#F59E0B",
    nodes: [
      {
        id: "simulator",
        label: "Deal Simulator",
        sublabel: "DCF, comps, LBO and accretion/dilution in one deal",
        iconName: "Briefcase",
      },
      {
        id: "compare",
        label: "Compare Deals",
        sublabel: "Side-by-side analysis of two deal structures",
        iconName: "Columns2",
      },
      {
        id: "roleplay",
        label: "FinFox Roleplay",
        sublabel: "Negotiate with an AI client or counterparty",
        iconName: "MessageCircle",
      },
    ],
  },
];
