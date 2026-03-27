import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LeadStage,
  useAllCampaigns,
  useAllLeads,
  useAllProfiles,
  useAllTasks,
} from "../hooks/useQueries";

type Period = "daily" | "weekly" | "monthly" | "custom";

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function getPeriodRange(
  period: Period,
  customStart: string,
  customEnd: string,
): { start: number; end: number } {
  const now = Date.now();
  const end = now;
  if (period === "daily") return { start: now - 86_400_000, end };
  if (period === "weekly") return { start: now - 7 * 86_400_000, end };
  if (period === "monthly") return { start: now - 30 * 86_400_000, end };
  const s = customStart
    ? new Date(customStart).getTime()
    : now - 30 * 86_400_000;
  const e = customEnd ? new Date(customEnd).getTime() + 86_400_000 : now;
  return { start: s, end: e };
}

const PILL_CLASSES =
  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer";

export function ReportsPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { data: leads, isLoading: leadsLoading } = useAllLeads(true);
  const { data: campaigns, isLoading: campaignsLoading } = useAllCampaigns();
  const { data: tasks } = useAllTasks(true);
  const { data: profiles } = useAllProfiles();

  const isLoading = leadsLoading || campaignsLoading;

  const { start, end } = getPeriodRange(period, customStart, customEnd);

  const filteredLeads = (leads ?? []).filter((l) => {
    const ms = Number(l.createdAt) / 1_000_000;
    return ms >= start && ms <= end;
  });

  const enrolledCount = filteredLeads.filter(
    (l) => l.stage === LeadStage.enrolled,
  ).length;
  const totalReach = (campaigns ?? []).reduce(
    (sum, c) => sum + Number(c.reach),
    0,
  );

  // Lead stage distribution
  const stageData = [
    {
      stage: "Inquiry",
      count: filteredLeads.filter((l) => l.stage === LeadStage.inquiry).length,
    },
    {
      stage: "Applied",
      count: filteredLeads.filter((l) => l.stage === LeadStage.applied).length,
    },
    {
      stage: "Visa",
      count: filteredLeads.filter((l) => l.stage === LeadStage.visa).length,
    },
    {
      stage: "Enrolled",
      count: filteredLeads.filter((l) => l.stage === LeadStage.enrolled).length,
    },
  ];

  // Top 5 campaigns by reach
  const topCampaigns = [...(campaigns ?? [])]
    .sort((a, b) => Number(b.reach) - Number(a.reach))
    .slice(0, 5)
    .map((c) => ({
      name: c.name.length > 16 ? `${c.name.slice(0, 14)}\u2026` : c.name,
      reach: Number(c.reach),
      engagement: Number(c.engagement),
    }));

  // Staff activity: count leads and tasks per assignee principal
  const staffActivity = (profiles ?? []).map((p) => {
    const pid = p.userId.toString();
    const leadCount = (leads ?? []).filter(
      (l) => l.assignedTo.toString() === pid,
    ).length;
    const taskCount = (tasks ?? []).filter(
      (t) => t.assignedTo.toString() === pid,
    ).length;
    const doneTasks = (tasks ?? []).filter(
      (t) => t.assignedTo.toString() === pid && t.status === "Done",
    ).length;
    return {
      name: p.fullName || `${pid.slice(0, 8)}...`,
      role: p.role,
      leads: leadCount,
      tasks: taskCount,
      done: doneTasks,
    };
  });

  function downloadReport() {
    const activeCampaigns = (campaigns ?? []).filter(
      (c) => c.status === "active",
    ).length;
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
    const generatedAt = new Date().toLocaleString();

    const stageRows = stageData
      .map(
        (s) => `
    <tr>
      <td>${s.stage}</td>
      <td style="text-align:right">${s.count}</td>
      <td style="text-align:right">${filteredLeads.length > 0 ? ((s.count / filteredLeads.length) * 100).toFixed(1) : 0}%</td>
    </tr>`,
      )
      .join("");

    const staffRows = staffActivity
      .map(
        (s) => `
    <tr>
      <td>${s.name}</td>
      <td>${s.role}</td>
      <td style="text-align:right">${s.leads}</td>
      <td style="text-align:right">${s.tasks}</td>
      <td style="text-align:right">${s.done}</td>
    </tr>`,
      )
      .join("");

    const campaignRows = (campaigns ?? [])
      .slice(0, 5)
      .map(
        (c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.status}</td>
      <td style="text-align:right">${Number(c.reach).toLocaleString()}</td>
      <td style="text-align:right">${Number(c.engagement).toLocaleString()}</td>
    </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Origo Abroad \u2013 ${periodLabel} Report</title>
  <style>
    @page { margin: 20mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; font-size: 12px; line-height: 1.5; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 24px 32px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header .subtitle { font-size: 12px; opacity: 0.75; margin-top: 4px; }
    .header .meta { display: flex; gap: 24px; margin-top: 12px; font-size: 11px; opacity: 0.8; }
    .body { padding: 0 32px; }
    h2 { font-size: 13px; font-weight: 700; color: #0f3460; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid #0f3460; padding-bottom: 5px; margin: 20px 0 12px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
    .kpi-card { background: #f0f4ff; border-radius: 8px; padding: 14px 16px; border-left: 4px solid #0f3460; }
    .kpi-card .kpi-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card .kpi-value { font-size: 24px; font-weight: 700; color: #0f3460; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead tr { background: #0f3460; color: white; }
    thead th { padding: 8px 10px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody tr:nth-child(even) { background: #f7f8fc; }
    tbody td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
    .footer { margin-top: 32px; padding: 16px 32px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Origo Abroad Marketing Command Center</h1>
    <div class="subtitle">Performance Report \u2013 ${periodLabel} Period</div>
    <div class="meta">
      <span>Generated: ${generatedAt}</span>
      <span>Period: ${periodLabel}</span>
    </div>
  </div>
  <div class="body">
    <h2>Summary</h2>
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Total Leads</div><div class="kpi-value">${filteredLeads.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Enrolled</div><div class="kpi-value">${enrolledCount}</div></div>
      <div class="kpi-card"><div class="kpi-label">Active Campaigns</div><div class="kpi-value">${activeCampaigns}</div></div>
      <div class="kpi-card"><div class="kpi-label">Total Reach</div><div class="kpi-value">${formatK(totalReach)}</div></div>
    </div>

    <h2>Lead Stage Distribution</h2>
    <table>
      <thead><tr><th>Stage</th><th style="text-align:right">Count</th><th style="text-align:right">% of Total</th></tr></thead>
      <tbody>${stageRows || '<tr><td colspan="3" style="text-align:center;padding:16px;color:#9ca3af">No leads in this period</td></tr>'}</tbody>
    </table>

    <h2>Campaign Performance</h2>
    <table>
      <thead><tr><th>Campaign</th><th>Status</th><th style="text-align:right">Reach</th><th style="text-align:right">Engagement</th></tr></thead>
      <tbody>${campaignRows || '<tr><td colspan="4" style="text-align:center;padding:16px;color:#9ca3af">No campaigns found</td></tr>'}</tbody>
    </table>

    <h2>Staff Activity</h2>
    <table>
      <thead><tr><th>Name</th><th>Role</th><th style="text-align:right">Leads</th><th style="text-align:right">Tasks Assigned</th><th style="text-align:right">Tasks Done</th></tr></thead>
      <tbody>${staffRows || '<tr><td colspan="5" style="text-align:center;padding:16px;color:#9ca3af">No staff profiles found</td></tr>'}</tbody>
    </table>
  </div>
  <div class="footer">
    <span>Origo Abroad Marketing Command Center</span>
    <span>Confidential \u2013 Internal Use Only</span>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }

  const CHART_STYLE = {
    fill: "hsl(var(--muted-foreground))",
    fontSize: 11,
  };

  return (
    <div className="space-y-6" data-ocid="reports.page">
      {/* Period filter + Download button */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 flex-wrap"
          data-ocid="reports.filter.tab"
        >
          {(["daily", "weekly", "monthly", "custom"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`${PILL_CLASSES} ${
                period === p
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-muted/30 text-muted-foreground border border-border hover:text-foreground"
              }`}
              data-ocid={`reports.${p}.tab`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex items-center gap-2 ml-2">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 w-36 bg-muted/30 border-border text-xs"
                data-ocid="reports.custom_start.input"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 w-36 bg-muted/30 border-border text-xs"
                data-ocid="reports.custom_end.input"
              />
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={downloadReport}
          className="gap-2 border-border bg-muted/30 hover:bg-muted/60 text-foreground"
          data-ocid="reports.download_pdf.button"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Summary cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="reports.section"
      >
        {[
          {
            label: "Total Leads",
            value: isLoading ? null : filteredLeads.length,
            color: "text-blue-400",
          },
          {
            label: "Enrolled",
            value: isLoading ? null : enrolledCount,
            color: "text-emerald-400",
          },
          {
            label: "Active Campaigns",
            value: isLoading
              ? null
              : (campaigns ?? []).filter((c) => c.status === "active").length,
            color: "text-violet-400",
          },
          {
            label: "Total Reach",
            value: isLoading ? null : totalReach,
            color: "text-amber-400",
            format: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-card border border-border p-5"
            data-ocid="reports.card"
          >
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            {card.value === null ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className={`text-2xl font-semibold ${card.color}`}>
                {card.format ? formatK(card.value as number) : card.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead stages chart */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Lead Stage Distribution
          </h3>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageData} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="stage"
                  tick={CHART_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={CHART_STYLE}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Campaign performance chart */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Campaign Performance (Top 5)
          </h3>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : topCampaigns.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No campaigns yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCampaigns} barSize={16}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={CHART_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                />
                <Bar
                  dataKey="reach"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Reach"
                />
                <Bar
                  dataKey="engagement"
                  fill="#22D3EE"
                  radius={[4, 4, 0, 0]}
                  name="Engagement"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Staff activity table */}
      <div
        className="rounded-xl bg-card border border-border overflow-hidden"
        data-ocid="reports.table"
      >
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Staff Activity
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Leads
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Tasks Assigned
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Tasks Done
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffActivity.length === 0 ? (
              <TableRow className="border-border">
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="reports.empty_state"
                >
                  No staff profiles found.
                </TableCell>
              </TableRow>
            ) : (
              staffActivity.map((s, i) => (
                <TableRow
                  key={`${s.name}-${i}`}
                  className="border-border hover:bg-muted/20"
                  data-ocid={`reports.item.${i + 1}`}
                >
                  <TableCell className="font-medium text-foreground">
                    {s.name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        s.role === "admin" || s.role === "marketing_head"
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground bg-muted/30"
                      }`}
                    >
                      {s.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    {s.leads}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    {s.tasks}
                  </TableCell>
                  <TableCell className="text-right text-sm text-emerald-400">
                    {s.done}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
