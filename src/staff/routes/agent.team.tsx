import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Users2, TrendingUp, PhoneCall, ThumbsUp, Wallet } from "lucide-react";
import { AppShell } from "@staff/components/layout/app-shell";
import { PageHeader } from "@staff/components/shared/page-header";
import { EmptyState } from "@staff/components/shared/empty-state";
import { SectionCard } from "@staff/components/shared/section-card";
import { KpiCard, KpiGrid } from "@staff/components/shared/kpi-card";
import { AvatarChip } from "@staff/components/shared/avatar-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@staff/components/ui/table";
import { useAgents } from "@staff/lib/agents-data";
import { useMyTeam, useMyTeamOverrides } from "@staff/lib/teams-data";
import { callGetTeamPerformance } from "@staff/lib/functions";
import { firebaseAuth, getMockStaffProfile } from "@staff/lib/auth";
import { formatZAR } from "@staff/lib/format";

export const Route = createFileRoute("/agent/team")({
  head: () => ({
    meta: [
      { title: "My Team — Empirial CRM" },
      { name: "description", content: "Your team's performance and your Team Lead override earnings." },
      { property: "og:title", content: "My Team — Empirial CRM" },
      { property: "og:description", content: "Your team's performance and your Team Lead override earnings." },
    ],
  }),
  component: PageAgentTeam,
});

function PageAgentTeam() {
  const mockProfile = getMockStaffProfile();
  const myUid = firebaseAuth.currentUser?.uid ?? (mockProfile ? "ag-1" : undefined);
  const { data: team, isLoading: teamLoading } = useMyTeam(myUid);
  const { data: agents = [] } = useAgents();
  const { data: overrides = [] } = useMyTeamOverrides(myUid);

  const isLead = Boolean(team && myUid && team.teamLeadUid === myUid);

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["teamPerformance", team?.id],
    queryFn: async () => (await callGetTeamPerformance({ teamId: team!.id })).data,
    enabled: isLead && Boolean(team),
  });

  const agentById = (id: string) => agents.find((a) => a.id === id);
  const totalOverrideEarned = overrides.reduce((sum, o) => sum + o.overrideAmount, 0);

  if (teamLoading) {
    return (
      <AppShell>
        <PageHeader title="My Team" crumbs={[{ label: "Agent", to: "/agent/dashboard" }, { label: "My Team" }]} />
        <div className="mt-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  if (!team) {
    return (
      <AppShell>
        <PageHeader
          title="My Team"
          subtitle="See your team's performance, and your override earnings if you lead one."
          crumbs={[{ label: "Agent", to: "/agent/dashboard" }, { label: "My Team" }]}
        />
        <div className="mt-6">
          <EmptyState icon={Users2} title="You're not part of a team yet" description="Your admin assigns agents to teams from Admin → Teams." />
        </div>
      </AppShell>
    );
  }

  const lead = agentById(team.teamLeadUid);
  const members = team.memberUids.map(agentById).filter((a) => a !== undefined);

  return (
    <AppShell>
      <PageHeader
        title={team.name}
        subtitle={isLead ? "Your team's performance and your override earnings." : `Led by ${lead?.name ?? "—"}.`}
        crumbs={[{ label: "Agent", to: "/agent/dashboard" }, { label: "My Team" }]}
      />

      {!isLead ? (
        <div className="mt-6 space-y-6">
          <SectionCard title="Your team">
            <div className="space-y-3">
              {lead ? (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Team Lead</p>
                  <AvatarChip name={lead.name} subtitle={lead.email} size="md" />
                </div>
              ) : null}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Teammates ({members.length})
                </p>
                <div className="space-y-2">
                  {members.filter((m) => m!.id !== myUid).map((m) => (
                    <AvatarChip key={m!.id} name={m!.name} subtitle={m!.role} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <KpiGrid>
            <KpiCard label="Team members" value={members.length} icon={Users2} tone="primary" />
            <KpiCard label="Override rate" value={`${team.overrideRatePercent}%`} icon={TrendingUp} />
            <KpiCard label="Override earned (all time)" value={formatZAR(totalOverrideEarned, { compact: true })} icon={Wallet} tone="success" />
            <KpiCard
              label="Team calls today"
              value={performance ? performance.members.reduce((s, m) => s + m.callsToday, 0) : "—"}
              icon={PhoneCall}
            />
          </KpiGrid>

          <SectionCard title="Team performance" description="Real numbers from each member's leads, calls and deals">
            {performanceLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !performance || performance.members.length === 0 ? (
              <EmptyState icon={Users2} title="No members yet" description="Add agents to this team from Admin → Teams." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Calls today</TableHead>
                      <TableHead className="text-right">Interested</TableHead>
                      <TableHead className="text-right">Closed Won</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.members.map((m) => {
                      const agent = agentById(m.agentUid);
                      return (
                        <TableRow key={m.agentUid}>
                          <TableCell><AvatarChip name={agent?.name ?? m.agentUid} subtitle={agent?.role} size="sm" /></TableCell>
                          <TableCell className="text-right tabular-nums">{m.leadsCount}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.callsToday}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.interested}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.closedWon}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatZAR(m.revenue, { compact: true })}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatZAR(m.commission, { compact: true })}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Recent override earnings" description="A % of each member's commission, credited when they close a deal">
            {overrides.length === 0 ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ThumbsUp className="size-4" /> No overrides earned yet — they show up here as soon as a team member closes a deal.
              </div>
            ) : (
              <div className="space-y-2">
                {overrides
                  .slice()
                  .sort((a, b) => +new Date(b.closedAt) - +new Date(a.closedAt))
                  .slice(0, 10)
                  .map((o) => {
                    const agent = agentById(o.agentUid);
                    return (
                      <div key={o.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">{o.business}</span>
                          <span className="text-muted-foreground"> · closed by {agent?.name ?? o.agentUid}</span>
                        </div>
                        <span className="font-semibold text-success">+{formatZAR(o.overrideAmount)}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}
