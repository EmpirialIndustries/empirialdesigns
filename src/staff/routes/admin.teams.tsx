import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Users2 } from "lucide-react";
import { AppShell } from "@staff/components/layout/app-shell";
import { PageHeader } from "@staff/components/shared/page-header";
import { EmptyState } from "@staff/components/shared/empty-state";
import { AvatarChip } from "@staff/components/shared/avatar-chip";
import { Button } from "@staff/components/ui/button";
import { Input } from "@staff/components/ui/input";
import { Label } from "@staff/components/ui/label";
import { Card } from "@staff/components/ui/card";
import { Checkbox } from "@staff/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@staff/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@staff/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@staff/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@staff/components/ui/dropdown-menu";
import { useAgents } from "@staff/lib/agents-data";
import { useTeams } from "@staff/lib/teams-data";
import { callCreateTeam, callUpdateTeam, callDeleteTeam } from "@staff/lib/functions";
import type { Agent, Team } from "@staff/lib/types";

export const Route = createFileRoute("/admin/teams")({
  head: () => ({
    meta: [
      { title: "Teams — Empirial CRM" },
      { name: "description", content: "Manage sales teams, Team Leads, and commission override rates." },
      { property: "og:title", content: "Teams — Empirial CRM" },
      { property: "og:description", content: "Manage sales teams, Team Leads, and commission override rates." },
    ],
  }),
  component: PageAdminTeams,
});

type TeamForm = {
  id?: string;
  name: string;
  teamLeadUid: string;
  memberUids: Set<string>;
  overrideRatePercent: string;
};

function emptyForm(): TeamForm {
  return { name: "", teamLeadUid: "", memberUids: new Set(), overrideRatePercent: "10" };
}

function PageAdminTeams() {
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TeamForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeTeams = useMemo(() => teams.filter((t) => t.status !== "archived"), [teams]);
  const agentById = (id: string) => agents.find((a) => a.id === id);

  // Agents already on a different team than the one being edited are hidden
  // from the picker — createTeam/updateTeam don't reconcile a stolen
  // member's old team's memberUids array, so avoiding the overlap here is
  // simpler and safer than teaching the backend cross-team reconciliation.
  const availableAgents = useMemo(
    () => agents.filter((a) => !a.teamId || a.teamId === form.id || form.memberUids.has(a.id) || a.id === form.teamLeadUid),
    [agents, form.id, form.memberUids, form.teamLeadUid],
  );
  const teamLeadCandidates = availableAgents.filter((a) => a.role === "Team Lead");
  const memberCandidates = availableAgents.filter((a) => a.id !== form.teamLeadUid);

  function openCreate() {
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(team: Team) {
    setForm({
      id: team.id,
      name: team.name,
      teamLeadUid: team.teamLeadUid,
      memberUids: new Set(team.memberUids),
      overrideRatePercent: String(team.overrideRatePercent),
    });
    setDialogOpen(true);
  }

  function toggleMember(uid: string) {
    setForm((f) => {
      const next = new Set(f.memberUids);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return { ...f, memberUids: next };
    });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.teamLeadUid) {
      toast.error("Give the team a name and pick a Team Lead.");
      return;
    }
    const rate = Number(form.overrideRatePercent);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Override rate must be a number between 0 and 100.");
      return;
    }
    setSaving(true);
    try {
      const memberUids = Array.from(form.memberUids);
      if (form.id) {
        await callUpdateTeam({ teamId: form.id, name: form.name.trim(), teamLeadUid: form.teamLeadUid, memberUids, overrideRatePercent: rate });
      } else {
        await callCreateTeam({ name: form.name.trim(), teamLeadUid: form.teamLeadUid, memberUids, overrideRatePercent: rate });
      }
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      await queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(form.id ? "Team updated" : "Team created");
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that team — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await callDeleteTeam({ teamId: deleteTarget.id });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      await queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(`${deleteTarget.name} archived`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't archive that team — try again.");
    } finally {
      setDeleting(false);
    }
  }

  const loading = agentsLoading || teamsLoading;

  return (
    <AppShell>
      <PageHeader
        title="Teams"
        subtitle="Group agents under a Team Lead, and set the commission override they earn on the team's deals."
        crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Teams" }]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>+ Create Team</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit team" : "Create a team"}</DialogTitle>
                <DialogDescription>
                  The Team Lead earns a % of each member's own commission on their closed deals — it doesn't change
                  what the member takes home.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="team-name">Team name</Label>
                  <Input id="team-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Polokwane Team" />
                </div>
                <div className="space-y-1.5">
                  <Label>Team Lead</Label>
                  <Select value={form.teamLeadUid} onValueChange={(v) => setForm((f) => ({ ...f, teamLeadUid: v, memberUids: new Set([...f.memberUids].filter((id) => id !== v)) }))}>
                    <SelectTrigger><SelectValue placeholder="Select a Team Lead" /></SelectTrigger>
                    <SelectContent>
                      {teamLeadCandidates.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">No agents with the "Team Lead" role yet — set that on the Agents page first.</div>
                      ) : (
                        teamLeadCandidates.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="override-rate">Override rate (% of the agent's own commission)</Label>
                  <Input id="override-rate" type="number" min={0} max={100} value={form.overrideRatePercent} onChange={(e) => setForm((f) => ({ ...f, overrideRatePercent: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Team members</Label>
                  <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                    {memberCandidates.length === 0 ? (
                      <p className="p-2 text-xs text-muted-foreground">No other agents available to add.</p>
                    ) : (
                      memberCandidates.map((a) => (
                        <label key={a.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                          <Checkbox checked={form.memberUids.has(a.id)} onCheckedChange={() => toggleMember(a.id)} />
                          {a.name} <span className="text-xs text-muted-foreground">· {a.role}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : form.id ? "Save changes" : "Create team"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : activeTeams.length === 0 ? (
          <EmptyState icon={Users2} title="No teams yet" description="Create a team and assign a Team Lead to start grouping agents." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTeams.map((team) => {
              const lead = agentById(team.teamLeadUid);
              const members = team.memberUids.map(agentById).filter((a): a is Agent => Boolean(a));
              return (
                <Card key={team.id} className="gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{team.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{team.overrideRatePercent}% override rate</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Team actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(team)}>
                          <Pencil className="mr-2 size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(team)}>
                          <Trash2 className="mr-2 size-4" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {lead ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                      <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">Team Lead</p>
                      <AvatarChip name={lead.name} subtitle={lead.email} size="sm" />
                    </div>
                  ) : null}
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {members.length} member{members.length === 1 ? "" : "s"}
                    </p>
                    <div className="space-y-1">
                      {members.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No members yet</p>
                      ) : (
                        members.map((m) => <AvatarChip key={m.id} name={m.name} subtitle={m.role} size="sm" />)
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Members and the Team Lead are freed up to join another team. Past override earnings stay on record —
              this doesn't delete history, just deactivates the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Archiving…" : "Archive team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
