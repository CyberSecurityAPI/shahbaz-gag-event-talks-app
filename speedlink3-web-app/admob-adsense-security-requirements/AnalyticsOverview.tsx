import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Plus, 
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface AnalyticsOverviewProps {
  addSyncLog: (type: "sync" | "auth" | "notification" | "admob" | "system", message: string) => void;
  onTriggerNotification: (title: string, body: string) => void;
}

interface DailyMetric {
  day: string;
  date: string;
  renders: number;
  syncs: number;
  latency: number;
}

const INITIAL_7D_METRICS: DailyMetric[] = [
  { day: "Mon", date: "June 09", renders: 18, syncs: 16, latency: 45 },
  { day: "Tue", date: "June 10", renders: 24, syncs: 22, latency: 62 },
  { day: "Wed", date: "June 11", renders: 15, syncs: 15, latency: 38 },
  { day: "Thu", date: "June 12", renders: 34, syncs: 31, latency: 70 },
  { day: "Fri", date: "June 13", renders: 45, syncs: 42, latency: 85 },
  { day: "Sat", date: "June 14", renders: 22, syncs: 20, latency: 48 },
  { day: "Sun", date: "June 15", renders: 28, syncs: 27, latency: 54 },
];

const INITIAL_14D_METRICS: DailyMetric[] = [
  { day: "Mon", date: "June 02", renders: 12, syncs: 10, latency: 42 },
  { day: "Tue", date: "June 03", renders: 19, syncs: 17, latency: 49 },
  { day: "Wed", date: "June 04", renders: 14, syncs: 14, latency: 36 },
  { day: "Thu", date: "June 05", renders: 28, syncs: 24, latency: 64 },
  { day: "Fri", date: "June 06", renders: 39, syncs: 35, latency: 76 },
  { day: "Sat", date: "June 07", renders: 18, syncs: 16, latency: 44 },
  { day: "Sun", date: "June 08", renders: 20, syncs: 19, latency: 45 },
  ...INITIAL_7D_METRICS
];

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  addSyncLog,
  onTriggerNotification,
}) => {
  const [timeRange, setTimeRange] = useState<"7d" | "14d">("7d");
  const [data, setData] = useState<DailyMetric[]>(INITIAL_14D_METRICS);
  const [showRenders, setShowRenders] = useState(true);
  const [showSyncs, setShowSyncs] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeMetric, setActiveMetric] = useState<"volume" | "latency">("volume");
  const [latencyChartType, setLatencyChartType] = useState<"line" | "bar">("line");

  // Active dataset based on selected timerange
  const activeData = timeRange === "7d" ? data.slice(-7) : data;

  // D3-style layout computations for the SVG Bar Chart
  const svgWidth = 520;
  const svgHeight = 220;
  const paddingLeft = 32;
  const paddingRight = 12;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Find peak values depending on selected metric view (minimum fallback)
  const maxVal = activeMetric === "volume"
    ? Math.max(...activeData.map(d => Math.max(d.renders, d.syncs)), 10)
    : Math.max(...activeData.map(d => d.latency), 40);

  // Round up to nice interval for clean grid lines
  const yDomainMax = activeMetric === "volume"
    ? Math.ceil(maxVal / 10) * 10
    : Math.ceil(maxVal / 20) * 20;

  // Linear projection helper (maps value space to SVG coordinate space)
  const scaleY = (val: number) => {
    return chartHeight - (val / yDomainMax) * chartHeight + paddingTop;
  };

  // Ordinal position helper (determines x position of columns)
  const colWidth = chartWidth / activeData.length;
  const barGap = 6;
  const individualBarWidth = showRenders && showSyncs 
    ? (colWidth - barGap * 3) / 2
    : colWidth - barGap * 2.5;

  // Key KPI Calculations
  const totalRenders = activeData.reduce((acc, curr) => acc + curr.renders, 0);
  const totalSyncs = activeData.reduce((acc, curr) => acc + curr.syncs, 0);
  const averageSyncPercentage = totalRenders > 0 
    ? ((totalSyncs / totalRenders) * 100).toFixed(1)
    : "100.0";
  const averageLatency = Math.round(
    activeData.reduce((acc, curr) => acc + curr.latency, 0) / activeData.length
  );

  // Find peak day
  const peakDayObj = [...activeData].sort((a, b) => b.renders - a.renders)[0];

  const handleSimulateSync = () => {
    setIsSimulating(true);
    addSyncLog("system", "Analytics simulation protocol initialized: tracking thread triggered.");

    setTimeout(() => {
      // Pick random index in our total dataset to simulate past/present activity spikes
      const randomIndex = Math.floor(Math.random() * data.length);
      const isRenderSpike = Math.random() > 0.4;
      
      const targetItem = data[randomIndex];
      const addedRenders = isRenderSpike ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 4) + 1;
      const addedSyncs = isRenderSpike 
        ? Math.floor(Math.random() * (addedRenders - 1)) + 2 
        : addedRenders;

      const finalSyncs = Math.min(addedSyncs, addedRenders);
      const latencyVariation = Math.floor(Math.random() * 30) - 15; // -15ms to +15ms spike

      // Trigger workspace side effects in the event handler (safe!)
      addSyncLog("sync", `Device Node synced for ${targetItem.day}: +${finalSyncs} successes, latency adjusted to ${Math.max(20, targetItem.latency + latencyVariation)}ms.`);
      onTriggerNotification(
        "Telemetry Activity Inbound",
        `Simulated render activity synced: ${addedRenders} clips processed ($CPM active).`
      );

      setData(prev => prev.map((item, idx) => {
        if (idx === randomIndex) {
          return {
            ...item,
            renders: item.renders + addedRenders,
            syncs: item.syncs + finalSyncs,
            latency: Math.max(25, Math.min(180, item.latency + latencyVariation))
          };
        }
        return item;
      }));

      setIsSimulating(false);
    }, 850);
  };

  return (
    <div 
      className="p-8 bg-[#090a10] border border-[#131622]/90 rounded-lg space-y-6 text-left relative overflow-hidden transition-all duration-300 hover:border-[#22283a] animate-fade-in group" 
      id="analytics-overview-widget"
    >
      {/* Subtle purple backglow gradient on hover */}
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-60 bg-indigo-600/10 blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#5159ea]/10 border-b border-l border-[#5159ea]/20 text-[9px] font-mono text-indigo-400 tracking-[0.16em] rounded-bl-md uppercase font-bold">
        REAL-TIME CORE METRICS
      </div>

      {/* Widget Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#131622]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-500/10 border border-indigo-550/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/5">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white font-sans tracking-tight">Analytics & Sync Overview</h4>
            <p className="text-xs text-[#8f9cae] font-sans mt-0.5">D3 coordinate-projected volumes & latency analysis</p>
          </div>
        </div>

        {/* Filters and simulated buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setTimeRange("7d")}
            className={`px-3.5 py-1.5 text-[10px] font-mono font-bold rounded-md transition-all duration-200 border cursor-pointer ${
              timeRange === "7d" 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20" 
                : "bg-slate-950 border-[#1c223c]/50 text-slate-400 hover:text-slate-200 hover:border-slate-850"
            }`}
          >
            7D RANGE
          </button>
          <button 
            onClick={() => setTimeRange("14d")}
            className={`px-3.5 py-1.5 text-[10px] font-mono font-bold rounded-md transition-all duration-200 border cursor-pointer ${
              timeRange === "14d" 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20" 
                : "bg-slate-950 border-[#1c223c]/50 text-slate-400 hover:text-slate-200 hover:border-slate-850"
            }`}
          >
            14D RANGE
          </button>
        </div>
      </div>

      {/* Stat Panel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/60 rounded-lg border border-[#131622]/95 flex items-center gap-3.5 transition-all hover:bg-slate-950/80">
          <div className="w-9 h-9 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold font-mono">Render Volume</span>
            <span className="text-base font-bold text-slate-100 font-mono mt-0.5 block">{totalRenders} clips</span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-lg border border-[#131622]/95 flex items-center gap-3.5 animate-pulse-subtle transition-all hover:bg-slate-950/80">
          <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold font-mono">Sync Rate (Avg)</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">{averageSyncPercentage}%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-lg border border-[#131622]/95 flex items-center gap-3.5 transition-all hover:bg-slate-950/80">
          <div className="w-9 h-9 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold font-mono">Sync Latency</span>
            <span className="text-base font-bold text-purple-400 font-mono mt-0.5 block">{averageLatency} ms</span>
          </div>
        </div>
      </div>

      {/* CHART CONTAINER & SVG BOARD */}
      <div className="bg-[#0c0e16] border border-[#131622]/90 p-5 rounded-lg relative">
        
        {/* Metric Selector & Representation switch container */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3.5 mb-3 border-b border-slate-900 pb-3">
          
          {/* Main Selectable Tabs: Volume vs Latency */}
          <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-md self-start">
            <button
              onClick={() => setActiveMetric("volume")}
              className={`px-3 py-1 text-[10px] sm:text-[10.5px] font-bold rounded-md transition-all duration-200 cursor-pointer ${
                activeMetric === "volume"
                  ? "bg-blue-600 text-white shadow-md font-extrabold"
                  : "text-slate-400 hover:text-slate-350"
              }`}
            >
              Volume Telemetry
            </button>
            <button
              onClick={() => {
                setActiveMetric("latency");
                addSyncLog("system", "Analytics representation target flipped to project latency telemetry.");
              }}
              className={`px-3 py-1 text-[10px] sm:text-[10.5px] font-bold rounded-md transition-all duration-200 cursor-pointer ${
                activeMetric === "latency"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-400 hover:text-slate-350"
              }`}
            >
              Sync Latency
            </button>
          </div>

          {/* Interactive Toggle depending on active view */}
          {activeMetric === "latency" ? (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-[9.5px] font-mono text-slate-500 font-extrabold uppercase">Representation:</span>
              <div className="flex bg-slate-900 border border-slate-800/80 p-0.5 rounded-md gap-1">
                {/* Line representation selector */}
                <button
                  onClick={() => setLatencyChartType("line")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-300 cursor-pointer border ${
                    latencyChartType === "line"
                      ? "bg-slate-800 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.18)]"
                      : "border-transparent text-slate-450 hover:text-slate-300 hover:bg-slate-850/50"
                  }`}
                  id="latency-line-toggle"
                >
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>Line Chart</span>
                </button>

                {/* Bar representation selector */}
                <button
                  onClick={() => setLatencyChartType("bar")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-300 cursor-pointer border ${
                    latencyChartType === "bar"
                      ? "bg-slate-800 border-teal-500 text-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.18)]"
                      : "border-transparent text-slate-450 hover:text-slate-300 hover:bg-slate-850/50"
                  }`}
                  id="latency-bar-toggle"
                >
                  <BarChart3 className="h-3 w-3 text-teal-400" />
                  <span>Bar Chart</span>
                </button>
              </div>
            </div>
          ) : (
            /* Toggle lines legends for renders/syncs volume */
            <div className="flex items-center gap-3.5 self-start md:self-auto">
              <button 
                onClick={() => setShowRenders(!showRenders)}
                className={`flex items-center gap-1.5 text-[10px] font-bold transition duration-200 hover:opacity-85 ${showRenders ? "text-blue-400" : "text-slate-650 line-through"}`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Render Requests</span>
              </button>
              <button 
                onClick={() => setShowSyncs(!showSyncs)}
                className={`flex items-center gap-1.5 text-[10px] font-bold transition duration-200 hover:opacity-85 ${showSyncs ? "text-cyan-400" : "text-slate-650 line-through"}`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Sync Successes</span>
              </button>
            </div>
          )}
        </div>

        {/* Responsive viewport container */}
        <div className="relative overflow-x-auto select-none no-scrollbar">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-full h-auto mx-auto block overflow-visible"
          >
            {/* GRID LINES & TICK VALUES */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const value = Math.round(yDomainMax * ratio);
              const yPosition = scaleY(value);
              return (
                <g key={i} className="opacity-40">
                  <line 
                    x1={paddingLeft} 
                    y1={yPosition} 
                    x2={svgWidth - paddingRight} 
                    y2={yPosition} 
                    stroke="rgba(148, 163, 184, 0.12)" 
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text 
                    x={paddingLeft - 6} 
                    y={yPosition + 3} 
                    fill="#94a3b8" 
                    fontSize="8.5" 
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="end"
                  >
                    {value}{activeMetric === "latency" ? "ms" : ""}
                  </text>
                </g>
              );
            })}

            {/* CHART RENDER LOGIC */}
            {activeMetric === "volume" ? (
              activeData.map((d, index) => {
                const xStart = paddingLeft + index * colWidth;
                const xMiddle = xStart + colWidth / 2;

                // Left Render Bar position coordinates
                const rendersHeight = chartHeight - scaleY(d.renders) + paddingTop;
                const rendersY = scaleY(d.renders);
                
                const rendersX = showSyncs 
                  ? xMiddle - barGap / 2 - individualBarWidth 
                  : xMiddle - individualBarWidth / 2;

                // Right Sync Bar position coordinates
                const syncsHeight = chartHeight - scaleY(d.syncs) + paddingTop;
                const syncsY = scaleY(d.syncs);
                const syncsX = showRenders 
                  ? xMiddle + barGap / 2
                  : xMiddle - individualBarWidth / 2;

                const isHovered = hoveredIndex === index;

                return (
                  <g 
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer transition-opacity duration-200"
                  >
                    {/* Column interaction background slot */}
                    <rect 
                      x={xStart} 
                      y={paddingTop} 
                      width={colWidth} 
                      height={chartHeight} 
                      fill={isHovered ? "rgba(59, 130, 246, 0.04)" : "transparent"}
                      rx="4"
                    />

                    {/* Render Request Bar */}
                    {showRenders && d.renders > 0 && (
                      <rect 
                        x={rendersX} 
                        y={rendersY} 
                        width={individualBarWidth} 
                        height={Math.max(rendersHeight, 2)} 
                        fill="url(#renderGrad)"
                        rx="3"
                        className="transition-all duration-300"
                        opacity={isHovered ? 1 : 0.85}
                      />
                    )}

                    {/* Sync Success Bar */}
                    {showSyncs && d.syncs > 0 && (
                      <rect 
                        x={syncsX} 
                        y={syncsY} 
                        width={individualBarWidth} 
                        height={Math.max(syncsHeight, 2)} 
                        fill="url(#syncGrad)"
                        rx="3"
                        className="transition-all duration-300"
                        opacity={isHovered ? 1 : 0.85}
                      />
                    )}

                    {/* X Axis Day Label */}
                    <text 
                      x={xMiddle} 
                      y={svgHeight - 12} 
                      fill={isHovered ? "#60a5fa" : "#64748b"} 
                      fontSize="9.5" 
                      fontWeight={isHovered ? "bold" : "normal"}
                      fontFamily="Inter, sans-serif"
                      textAnchor="middle"
                    >
                      {d.day}
                    </text>
                    <text 
                      x={xMiddle} 
                      y={svgHeight - 2} 
                      fill="#475569" 
                      fontSize="7" 
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {d.date.replace("June ", "")}
                    </text>
                  </g>
                );
              })
            ) : (
              /* SYNC LATENCY REPRESENTATIONS (Line or Bar modes) */
              activeMetric === "latency" && (() => {
                // Precompile line coordinates
                let linePathD = "";
                let areaPathD = "";

                activeData.forEach((d, index) => {
                  const xMiddle = paddingLeft + index * colWidth + colWidth / 2;
                  const yNode = scaleY(d.latency);
                  
                  if (index === 0) {
                    linePathD += `M ${xMiddle} ${yNode}`;
                    areaPathD += `M ${xMiddle} ${chartHeight + paddingTop} L ${xMiddle} ${yNode}`;
                  } else {
                    linePathD += ` L ${xMiddle} ${yNode}`;
                    areaPathD += ` L ${xMiddle} ${yNode}`;
                  }
                });

                if (activeData.length > 0) {
                  const lastXMiddle = paddingLeft + (activeData.length - 1) * colWidth + colWidth / 2;
                  areaPathD += ` L ${lastXMiddle} ${chartHeight + paddingTop} Z`;
                }

                return (
                  <g>
                    {/* Line Chart Area Fill & Stroke Path */}
                    {latencyChartType === "line" && activeData.length > 0 && (
                      <>
                        <path 
                          d={areaPathD} 
                          fill="url(#latencyAreaGrad)" 
                          className="transition-all duration-300 animate-pulse-subtle"
                        />
                        <path 
                          d={linePathD} 
                          stroke="#10b981" 
                          strokeWidth="2.5" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="transition-all duration-300 drop-shadow-[0_2px_6px_rgba(16,185,129,0.25)]"
                        />
                      </>
                    )}

                    {/* Columns or individual dots */}
                    {activeData.map((d, index) => {
                      const xStart = paddingLeft + index * colWidth;
                      const xMiddle = xStart + colWidth / 2;
                      const latencyHeight = chartHeight - scaleY(d.latency) + paddingTop;
                      const latencyY = scaleY(d.latency);
                      
                      const isHovered = hoveredIndex === index;

                      return (
                        <g 
                          key={index}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className="cursor-pointer transition-opacity duration-200"
                        >
                          {/* Hover Background overlay bar */}
                          <rect 
                            x={xStart} 
                            y={paddingTop} 
                            width={colWidth} 
                            height={chartHeight} 
                            fill={isHovered ? "rgba(16, 185, 129, 0.04)" : "transparent"}
                            rx="4"
                          />

                          {/* Bar Chart representation */}
                          {latencyChartType === "bar" && (
                            <rect 
                              x={xMiddle - 8} 
                              y={latencyY} 
                              width={16} 
                              height={Math.max(latencyHeight, 2)} 
                              fill="url(#latencyBarGrad)"
                              rx="3.5"
                              opacity={isHovered ? 1 : 0.85}
                              className="transition-all duration-300"
                            />
                          )}

                          {/* Line Chart dots */}
                          {latencyChartType === "line" && (
                            <circle 
                              cx={xMiddle} 
                              cy={latencyY} 
                              r={isHovered ? 5.5 : 3.5} 
                              fill={isHovered ? "#34d399" : "#10b981"} 
                              stroke="#020617" 
                              strokeWidth={isHovered ? 2 : 1.5}
                              className="transition-all duration-150"
                            />
                          )}

                          {/* X-axis labels */}
                          <text 
                            x={xMiddle} 
                            y={svgHeight - 12} 
                            fill={isHovered ? "#34d399" : "#64748b"} 
                            fontSize="9.5" 
                            fontWeight={isHovered ? "bold" : "normal"}
                            fontFamily="Inter, sans-serif"
                            textAnchor="middle"
                          >
                            {d.day}
                          </text>
                          <text 
                            x={xMiddle} 
                            y={svgHeight - 2} 
                            fill="#475569" 
                            fontSize="7" 
                            fontFamily="JetBrains Mono, monospace"
                            textAnchor="middle"
                          >
                            {d.date.replace("June ", "")}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()
            )}

            {/* DEFINITION LOGICS (Gradients for chart cylinders) */}
            <defs>
              <linearGradient id="renderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="syncGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#083344" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="latencyBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="latencyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* FLOATING HOVER POPUP TOOLTIP */}
        {hoveredIndex !== null && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 border border-blue-500/40 rounded-md shadow-xl flex items-center gap-3.5 z-10 transition-all text-xs font-semibold animate-fade-in"
          >
            {activeMetric === "volume" ? (
              <>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {activeData[hoveredIndex].date} ({activeData[hoveredIndex].day})
                  </span>
                  <div className="flex gap-3.5 mt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-slate-300">Renders: <strong className="text-white font-mono">{activeData[hoveredIndex].renders}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-slate-300">Syncs: <strong className="text-white font-mono">{activeData[hoveredIndex].syncs}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="pl-2.5 border-l border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-400">Success Rate</span>
                  <strong className="block text-emerald-400">
                    {activeData[hoveredIndex].renders > 0 
                      ? `${Math.round((activeData[hoveredIndex].syncs / activeData[hoveredIndex].renders) * 100)}%` 
                      : "100%"
                    }
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {activeData[hoveredIndex].date} ({activeData[hoveredIndex].day})
                  </span>
                  <div className="flex gap-3.5 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-slate-300">Sync Latency: <strong className="text-white font-mono text-emerald-400">{activeData[hoveredIndex].latency} ms</strong></span>
                    </div>
                  </div>
                </div>
                <div className="pl-2.5 border-l border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-400">Status</span>
                  <strong className="block text-emerald-400">
                    {activeData[hoveredIndex].latency < 45 ? "Optimal" : activeData[hoveredIndex].latency < 75 ? "Nominal" : "Buffered"}
                  </strong>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* SIMULATOR ACTION FOOTER BLOCK */}
      <div className="p-3.5 bg-slate-950/55 border border-slate-850 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 text-left">
          <HelpCircle className="h-4 w-4 text-slate-500 shrink-0" />
          <span>Need to simulate additional loads to evaluate high-volume chart rendering?</span>
        </div>
        
        <button 
          onClick={handleSimulateSync}
          disabled={isSimulating}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-md flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer shadow shadow-blue-600/15"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Inject Demo Traffic</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
