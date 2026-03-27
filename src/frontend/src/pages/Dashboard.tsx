import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Download,
  Globe,
  Plus,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NewLeadModal } from "../components/modals/NewLeadModal";
import { NewPostModal } from "../components/modals/NewPostModal";
import { NewTaskModal } from "../components/modals/NewTaskModal";
import {
  LeadStage,
  useAllLeads,
  useAllPosts,
  useAllTasks,
  useCountActiveLeads,
  useTotalReach,
} from "../hooks/useQueries";

interface DashboardProps {
  isAdmin: boolean;
}

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

const STAGE_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  [LeadStage.inquiry]: {
    label: "Inquiry",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.15)",
  },
  [LeadStage.applied]: {
    label: "Applied",
    color: "#22D3EE",
    bgColor: "rgba(34,211,238,0.15)",
  },
  [LeadStage.visa]: {
    label: "Visa",
    color: "#22C55E",
    bgColor: "rgba(34,197,94,0.15)",
  },
  [LeadStage.enrolled]: {
    label: "Enrolled",
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.15)",
  },
};

function StageBadge({ stage }: { stage: string }) {
  const cfg = STAGE_CONFIG[stage] ?? {
    label: stage,
    color: "#9AAABD",
    bgColor: "rgba(154,170,189,0.15)",
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.bgColor }}
    >
      {cfg.label}
    </span>
  );
}

const SKELETON_ROWS = ["a", "b", "c", "d", "e"];
const SKELETON_ROWS_4 = ["a", "b", "c", "d"];

function downloadReport(params: {
  activeLeadsNum: number;
  roas: string;
  totalReachNum: number;
  blendedCAC: string;
  funnelData: { stage: string; count: number }[];
  recentLeads: { name: string; source: string; stage: string }[];
  channelData: { platform: string; reach: number }[];
}) {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Origo Abroad Marketing Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #1a1a2e; }
    h1 { color: #0a0a1a; border-bottom: 3px solid #3B82F6; padding-bottom: 12px; }
    h2 { color: #1e3a5f; margin-top: 32px; }
    .date { color: #666; font-size: 14px; margin-top: 4px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin: 24px 0; }
    .kpi-card { background: #f5f8ff; border: 1px solid #d1e0ff; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-value { font-size: 24px; font-weight: bold; color: #1e3a5f; margin: 8px 0 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th { background: #e8f0fe; text-align: left; padding: 10px 12px; font-size: 12px; color: #444; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:last-child td { border-bottom: none; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Origo Abroad Marketing Report</h1>
  <p class="date">Generated on ${date}</p>

  <h2>Key Performance Indicators</h2>
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Active Leads</div><div class="kpi-value">${params.activeLeadsNum}</div></div>
    <div class="kpi-card"><div class="kpi-label">ROAS</div><div class="kpi-value">${params.roas}</div></div>
    <div class="kpi-card"><div class="kpi-label">Pipeline Velocity</div><div class="kpi-value">22 days</div></div>
    <div class="kpi-card"><div class="kpi-label">Creator Reach</div><div class="kpi-value">${formatK(params.totalReachNum)}</div></div>
    <div class="kpi-card"><div class="kpi-label">Blended CAC</div><div class="kpi-value">${params.blendedCAC}</div></div>
  </div>

  <h2>Lead Stage Distribution</h2>
  <table>
    <thead><tr><th>Stage</th><th>Count</th></tr></thead>
    <tbody>
      ${params.funnelData
        .map(
          (d) =>
            `<tr><td>${STAGE_CONFIG[d.stage]?.label ?? d.stage}</td><td>${d.count}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <h2>Recent Leads</h2>
  <table>
    <thead><tr><th>Name</th><th>Source</th><th>Stage</th></tr></thead>
    <tbody>
      ${params.recentLeads
        .map(
          (l) =>
            `<tr><td>${l.name}</td><td>${l.source}</td><td>${STAGE_CONFIG[l.stage]?.label ?? l.stage}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <h2>Channel Performance</h2>
  <table>
    <thead><tr><th>Platform</th><th>Total Reach</th></tr></thead>
    <tbody>
      ${params.channelData
        .map(
          (c) => `<tr><td>${c.platform}</td><td>${formatK(c.reach)}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

export function Dashboard({ isAdmin }: DashboardProps) {
  const { data: activeLeads, isLoading: leadsCountLoading } =
    useCountActiveLeads();
  const { data: leads, isLoading: leadsLoading } = useAllLeads(isAdmin);
  const { data: posts, isLoading: postsLoading } = useAllPosts();
  const { data: totalReach, isLoading: reachLoading } = useTotalReach();
  const { data: tasks, isLoading: tasksLoading } = useAllTasks(isAdmin);

  const activeLeadsNum = Number(activeLeads ?? 0);
  const totalReachNum = Number(totalReach ?? 0);
  const roas =
    totalReachNum > 0 ? `${(totalReachNum / 10000).toFixed(1)}x` : "--";
  const totalBudget = (leads ?? []).reduce((s, l) => s + Number(l.budget), 0);
  const blendedCAC =
    activeLeadsNum > 0 ? `$${Math.round(totalBudget / activeLeadsNum)}` : "--";

  const funnelData = useMemo(() => {
    const counts: Record<string, number> = {
      [LeadStage.inquiry]: 0,
      [LeadStage.applied]: 0,
      [LeadStage.visa]: 0,
      [LeadStage.enrolled]: 0,
    };
    for (const l of leads ?? []) {
      if (counts[l.stage] !== undefined) counts[l.stage]++;
    }
    return [
      { stage: LeadStage.inquiry, count: counts[LeadStage.inquiry] },
      { stage: LeadStage.applied, count: counts[LeadStage.applied] },
      { stage: LeadStage.visa, count: counts[LeadStage.visa] },
      { stage: LeadStage.enrolled, count: counts[LeadStage.enrolled] },
    ];
  }, [leads]);

  const maxFunnelCount = Math.max(...funnelData.map((d) => d.count), 1);

  const pieData = useMemo(
    () =>
      funnelData
        .filter((d) => d.count > 0)
        .map((d) => ({
          name: STAGE_CONFIG[d.stage]?.label ?? d.stage,
          value: d.count,
          color: STAGE_CONFIG[d.stage]?.color ?? "#9AAABD",
        })),
    [funnelData],
  );

  const channelData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of posts ?? []) {
      map[p.platform] = (map[p.platform] ?? 0) + Number(p.reach);
    }
    return Object.entries(map).map(([platform, reach]) => ({
      platform,
      reach,
    }));
  }, [posts]);

  const recentLeads = useMemo(() => (leads ?? []).slice(-5).reverse(), [leads]);

  const allKpiCards = [
    {
      id: "active_leads",
      label: "Active Leads",
      value: leadsCountLoading ? null : activeLeadsNum.toString(),
      icon: Users,
      color: "text-blue-400",
      trend: "+12% this week",
      adminOnly: false,
    },
    {
      id: "roas",
      label: "ROAS",
      value: reachLoading ? null : roas,
      icon: TrendingUp,
      color: "text-teal-400",
      trend: "Return on ad spend",
      adminOnly: true,
    },
    {
      id: "pipeline_velocity",
      label: "Pipeline Velocity",
      value: "22 days",
      icon: Zap,
      color: "text-green-400",
      trend: "Avg. close time",
      adminOnly: false,
    },
    {
      id: "creator_reach",
      label: "Creator Reach",
      value: reachLoading ? null : formatK(totalReachNum),
      icon: Globe,
      color: "text-orange-400",
      trend: "Total impressions",
      adminOnly: false,
    },
    {
      id: "blended_cac",
      label: "Blended CAC",
      value: leadsCountLoading || leadsLoading ? null : blendedCAC,
      icon: DollarSign,
      color: "text-purple-400",
      trend: "Cost per acquisition",
      adminOnly: true,
    },
  ];

  const kpiCards = isAdmin
    ? allKpiCards
    : allKpiCards.filter((c) => !c.adminOnly);

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* Header row with Download button */}
      <div className="flex items-center justify-between">
        <div />
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5"
          data-ocid="dashboard.download.button"
          onClick={() =>
            downloadReport({
              activeLeadsNum,
              roas,
              totalReachNum,
              blendedCAC,
              funnelData,
              recentLeads,
              channelData,
            })
          }
        >
          <Download className="w-3.5 h-3.5" /> Download Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div
        className={`grid gap-4 ${isAdmin ? "grid-cols-5" : "grid-cols-3"}`}
        data-ocid="dashboard.kpi.panel"
      >
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              data-ocid={`dashboard.kpi.card.${i + 1}`}
              className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {card.label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              {card.value === null ? (
                <Skeleton className="h-7 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-display font-bold text-foreground">
                  {card.value}
                </div>
              )}
              <div className="text-[11px] text-muted-foreground mt-1">
                {card.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Funnel + Stage Donut + Recent Leads */}
      <div className="grid grid-cols-3 gap-4">
        {/* Lead Funnel */}
        <div
          className="rounded-xl bg-card border border-border p-5"
          data-ocid="dashboard.funnel.panel"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">
              Lead Funnel
            </h2>
            <NewLeadModal>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                data-ocid="dashboard.add_lead.button"
              >
                <Plus className="w-3 h-3 mr-1" /> New Lead
              </Button>
            </NewLeadModal>
          </div>
          {leadsLoading ? (
            <div className="space-y-3">
              {SKELETON_ROWS_4.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {funnelData.map((item) => {
                const cfg = STAGE_CONFIG[item.stage];
                const widthPct =
                  maxFunnelCount > 0 ? (item.count / maxFunnelCount) * 100 : 0;
                return (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {cfg.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-8 w-full rounded-lg bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${Math.max(widthPct, item.count > 0 ? 5 : 0)}%`,
                          backgroundColor: cfg.color,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stage Distribution Donut */}
        <div
          className="rounded-xl bg-card border border-border p-5"
          data-ocid="dashboard.stage_distribution.panel"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">
            Stage Distribution
          </h2>
          {leadsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : pieData.length === 0 ? (
            <div
              className="flex items-center justify-center h-40 text-muted-foreground text-sm"
              data-ocid="dashboard.stage_distribution.empty_state"
            >
              No lead data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111A22",
                    border: "1px solid #223240",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#E7EEF6" }}
                  itemStyle={{ color: "#9AAABD" }}
                />
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: "#9AAABD" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Leads */}
        <div
          className="rounded-xl bg-card border border-border p-5"
          data-ocid="dashboard.recent_leads.panel"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">
              Recent Leads
            </h2>
          </div>
          {leadsLoading ? (
            <div className="space-y-3">
              {SKELETON_ROWS.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div
              className="flex items-center justify-center h-32 text-muted-foreground text-sm"
              data-ocid="dashboard.recent_leads.empty_state"
            >
              No leads yet
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground h-8">
                      Name
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-8">
                      Source
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-8">
                      Stage
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead, i) => (
                    <TableRow
                      key={Number(lead.id)}
                      className="border-border hover:bg-muted/20"
                      data-ocid={`dashboard.recent_leads.item.${i + 1}`}
                    >
                      <TableCell className="text-sm text-foreground font-medium py-2">
                        {lead.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2">
                        {lead.source}
                      </TableCell>
                      <TableCell className="py-2">
                        <StageBadge stage={lead.stage} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Channel Performance + Content Overview */}
      <div className="grid grid-cols-2 gap-4">
        {/* Channel Performance */}
        <div
          className="rounded-xl bg-card border border-border p-5"
          data-ocid="dashboard.channel_performance.panel"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">
              Channel Performance
            </h2>
            <NewPostModal>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                data-ocid="dashboard.add_post.button"
              >
                <Plus className="w-3 h-3 mr-1" /> New Post
              </Button>
            </NewPostModal>
          </div>
          {postsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : channelData.length === 0 ? (
            <div
              className="flex items-center justify-center h-40 text-muted-foreground text-sm"
              data-ocid="dashboard.channel_performance.empty_state"
            >
              No post data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={channelData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.214 0.03 218)"
                />
                <XAxis
                  dataKey="platform"
                  tick={{ fontSize: 11, fill: "#9AAABD" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9AAABD" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatK(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111A22",
                    border: "1px solid #223240",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#E7EEF6" }}
                  itemStyle={{ color: "#22D3EE" }}
                />
                <Bar dataKey="reach" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Content Overview */}
        <div
          className="rounded-xl bg-card border border-border p-5"
          data-ocid="dashboard.content_overview.panel"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">
            Content Overview
          </h2>
          {postsLoading ? (
            <div className="space-y-2">
              {SKELETON_ROWS_4.map((k) => (
                <Skeleton key={k} className="h-8 w-full" />
              ))}
            </div>
          ) : (posts ?? []).length === 0 ? (
            <div
              className="flex items-center justify-center h-32 text-muted-foreground text-sm"
              data-ocid="dashboard.content_overview.empty_state"
            >
              No content posts yet
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground h-8">
                      Campaign
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-8">
                      Platform
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-8 text-right">
                      Reach
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-8 text-right">
                      Eng.
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(posts ?? []).slice(0, 5).map((post, i) => (
                    <TableRow
                      key={Number(post.id)}
                      className="border-border hover:bg-muted/20"
                      data-ocid={`dashboard.content_overview.item.${i + 1}`}
                    >
                      <TableCell className="text-xs text-foreground py-2 max-w-[100px] truncate">
                        {post.campaignName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2">
                        {post.platform}
                      </TableCell>
                      <TableCell className="text-xs text-foreground py-2 text-right">
                        {formatK(Number(post.reach))}
                      </TableCell>
                      <TableCell className="text-xs text-foreground py-2 text-right">
                        {formatK(Number(post.engagement))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div
        className="rounded-xl bg-card border border-border p-5"
        data-ocid="dashboard.tasks.panel"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-foreground">Tasks</h2>
          <NewTaskModal>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              data-ocid="dashboard.add_task.button"
            >
              <Plus className="w-3 h-3 mr-1" /> New Task
            </Button>
          </NewTaskModal>
        </div>
        {tasksLoading ? (
          <div className="space-y-2">
            {SKELETON_ROWS_4.map((k) => (
              <Skeleton key={k} className="h-10 w-full" />
            ))}
          </div>
        ) : (tasks ?? []).length === 0 ? (
          <div
            className="flex items-center justify-center h-20 text-muted-foreground text-sm"
            data-ocid="dashboard.tasks.empty_state"
          >
            No tasks yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
            {(tasks ?? []).map((task, i) => (
              <div
                key={Number(task.id)}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
                data-ocid={`dashboard.tasks.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        task.priority === "High"
                          ? "#EF4444"
                          : task.priority === "Medium"
                            ? "#F59E0B"
                            : "#22C55E",
                    }}
                  />
                  <span className="text-sm text-foreground">{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 px-2"
                    style={{
                      borderColor:
                        task.priority === "High"
                          ? "rgba(239,68,68,0.4)"
                          : task.priority === "Medium"
                            ? "rgba(245,158,11,0.4)"
                            : "rgba(34,197,94,0.4)",
                      color:
                        task.priority === "High"
                          ? "#EF4444"
                          : task.priority === "Medium"
                            ? "#F59E0B"
                            : "#22C55E",
                    }}
                  >
                    {task.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-5 px-2">
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
