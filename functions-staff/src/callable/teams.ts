import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { db } from "../lib/admin";
import { requireAdmin } from "../lib/authz";
import { writeAuditLog } from "../lib/audit";

interface CreateTeamInput {
  name: string;
  teamLeadUid: string;
  memberUids: string[];
  overrideRatePercent: number;
}

interface UpdateTeamInput {
  teamId: string;
  name?: string;
  teamLeadUid?: string;
  memberUids?: string[];
  overrideRatePercent?: number;
}

interface DeleteTeamInput {
  teamId: string;
}

function validateOverrideRate(rate: unknown): number {
  if (typeof rate !== "number" || Number.isNaN(rate) || rate < 0 || rate > 100) {
    throw new HttpsError("invalid-argument", "overrideRatePercent must be a number between 0 and 100.");
  }
  return rate;
}

/**
 * A team's roster lives on the team doc (memberUids) and is denormalized
 * onto each agents/{uid}.teamId for cheap "which team am I in" lookups from
 * the agent's own doc (used by the Team Lead performance page and by
 * logCall()'s commission-override lookup). This helper keeps both in sync
 * within the same batch — every write path below goes through it rather
 * than writing memberUids without touching agents/{uid}.
 */
async function syncMemberTeamIds(
  batch: FirebaseFirestore.WriteBatch,
  teamId: string | null,
  uids: string[],
): Promise<void> {
  for (const uid of uids) {
    batch.set(db.doc(`agents/${uid}`), { teamId }, { merge: true });
  }
}

/**
 * Admin-only. Creates a team with a Team Lead and a roster of member
 * agents, plus the commission override rate the Team Lead earns on their
 * team's closed deals (see logCall.ts's override computation). Team Lead
 * and members both get agents/{uid}.teamId set so "my team" lookups work
 * uniformly for either.
 */
export const createTeam = onCall<CreateTeamInput>(async (request) => {
  const { uid: adminUid } = requireAdmin(request);
  const { name, teamLeadUid, memberUids, overrideRatePercent } = request.data ?? ({} as CreateTeamInput);

  if (!name?.trim()) throw new HttpsError("invalid-argument", "name is required.");
  if (!teamLeadUid || typeof teamLeadUid !== "string") {
    throw new HttpsError("invalid-argument", "teamLeadUid is required.");
  }
  const uniqueMembers = Array.from(new Set((memberUids ?? []).filter((u) => u && u !== teamLeadUid)));
  const rate = validateOverrideRate(overrideRatePercent);

  const leadSnap = await db.doc(`agents/${teamLeadUid}`).get();
  if (!leadSnap.exists) throw new HttpsError("not-found", "Team Lead agent not found.");

  const teamRef = db.collection("teams").doc();
  const batch = db.batch();

  batch.set(teamRef, {
    name: name.trim(),
    teamLeadUid,
    memberUids: uniqueMembers,
    overrideRatePercent: rate,
    status: "active",
    createdBy: adminUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await syncMemberTeamIds(batch, teamRef.id, [teamLeadUid, ...uniqueMembers]);

  writeAuditLog(batch, {
    actorUid: adminUid,
    action: "teams.create",
    targetCollection: "teams",
    targetId: teamRef.id,
    after: { name: name.trim(), teamLeadUid, memberUids: uniqueMembers, overrideRatePercent: rate },
  });

  await batch.commit();
  return { teamId: teamRef.id };
});

/**
 * Admin-only. Partial update — any of name/teamLeadUid/memberUids/
 * overrideRatePercent may be omitted to leave that field unchanged. When
 * memberUids or teamLeadUid changes, reconciles agents/{uid}.teamId for
 * everyone added or removed from the roster (not just the new roster) so
 * a removed member's own doc doesn't keep pointing at a team they've left.
 */
export const updateTeam = onCall<UpdateTeamInput>(async (request) => {
  const { uid: adminUid } = requireAdmin(request);
  const { teamId, name, teamLeadUid, memberUids, overrideRatePercent } = request.data ?? ({} as UpdateTeamInput);

  if (!teamId || typeof teamId !== "string") {
    throw new HttpsError("invalid-argument", "teamId is required.");
  }

  const teamRef = db.doc(`teams/${teamId}`);
  const teamSnap = await teamRef.get();
  if (!teamSnap.exists) throw new HttpsError("not-found", "Team not found.");
  const before = teamSnap.data()!;

  const nextTeamLeadUid = teamLeadUid ?? before.teamLeadUid;
  const nextMemberUids =
    memberUids !== undefined
      ? Array.from(new Set(memberUids.filter((u) => u && u !== nextTeamLeadUid)))
      : (before.memberUids as string[]);

  if (teamLeadUid) {
    const leadSnap = await db.doc(`agents/${teamLeadUid}`).get();
    if (!leadSnap.exists) throw new HttpsError("not-found", "Team Lead agent not found.");
  }

  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (name?.trim()) update.name = name.trim();
  if (teamLeadUid) update.teamLeadUid = teamLeadUid;
  if (memberUids !== undefined) update.memberUids = nextMemberUids;
  if (overrideRatePercent !== undefined) update.overrideRatePercent = validateOverrideRate(overrideRatePercent);

  const batch = db.batch();
  batch.update(teamRef, update);

  // Reconcile agents/{uid}.teamId for the full symmetric difference between
  // the old roster (lead + members) and the new one.
  const oldRoster = new Set<string>([before.teamLeadUid, ...(before.memberUids ?? [])]);
  const newRoster = new Set<string>([nextTeamLeadUid, ...nextMemberUids]);
  const removed = [...oldRoster].filter((u) => !newRoster.has(u));
  const added = [...newRoster].filter((u) => !oldRoster.has(u));

  await syncMemberTeamIds(batch, null, removed);
  await syncMemberTeamIds(batch, teamId, added);

  writeAuditLog(batch, {
    actorUid: adminUid,
    action: "teams.update",
    targetCollection: "teams",
    targetId: teamId,
    before: { name: before.name, teamLeadUid: before.teamLeadUid, memberUids: before.memberUids, overrideRatePercent: before.overrideRatePercent },
    after: update,
  });

  await batch.commit();
  return { teamId };
});

/**
 * Admin-only. Soft-delete (status: "archived") — matches the rest of the
 * app's no-hard-deletes convention (see firestore.rules) so historical
 * teamOverrides entries still resolve to a real team name. Clears teamId
 * off every current member so they're not left pointing at an archived team.
 */
export const deleteTeam = onCall<DeleteTeamInput>(async (request) => {
  const { uid: adminUid } = requireAdmin(request);
  const { teamId } = request.data ?? ({} as DeleteTeamInput);
  if (!teamId || typeof teamId !== "string") {
    throw new HttpsError("invalid-argument", "teamId is required.");
  }

  const teamRef = db.doc(`teams/${teamId}`);
  const teamSnap = await teamRef.get();
  if (!teamSnap.exists) throw new HttpsError("not-found", "Team not found.");
  const team = teamSnap.data()!;

  const batch = db.batch();
  batch.update(teamRef, { status: "archived", updatedAt: FieldValue.serverTimestamp() });
  await syncMemberTeamIds(batch, null, [team.teamLeadUid, ...(team.memberUids ?? [])]);

  writeAuditLog(batch, {
    actorUid: adminUid,
    action: "teams.delete",
    targetCollection: "teams",
    targetId: teamId,
  });

  await batch.commit();
  return { teamId };
});
