import { Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { db } from "../lib/admin";
import { requireAuth } from "../lib/authz";

interface GetTeamPerformanceInput {
  teamId?: string;
}

interface MemberPerformance {
  agentUid: string;
  leadsCount: number;
  interested: number;
  closedWon: number;
  closedLost: number;
  callsToday: number;
  revenue: number;
  commission: number;
}

interface GetTeamPerformanceResult {
  teamId: string;
  members: MemberPerformance[];
}

/**
 * A Team Lead's own Firestore rules only let them read their own leads/
 * deals/callLogs (see firestore.rules) — they have no client-side way to
 * see a team member's numbers, by design (same "never trust the client"
 * boundary as commission math). This is the one legitimate hole a Team
 * Lead needs punched through it, so it's a narrow server-side aggregation:
 * admin-SDK reads, but only ever returns rollup numbers (counts, totals),
 * never the underlying lead/deal documents themselves.
 */
export const getTeamPerformance = onCall<GetTeamPerformanceInput>(async (request) => {
  const { uid, role } = requireAuth(request);
  const isAdmin = role === "admin";

  let teamId = request.data?.teamId;
  let teamSnap: FirebaseFirestore.DocumentSnapshot;

  if (teamId) {
    teamSnap = await db.doc(`teams/${teamId}`).get();
  } else {
    const asLead = await db.collection("teams").where("teamLeadUid", "==", uid).limit(1).get();
    if (asLead.empty) {
      throw new HttpsError("not-found", "You're not leading a team.");
    }
    teamSnap = asLead.docs[0];
    teamId = teamSnap.id;
  }

  if (!teamSnap.exists) {
    throw new HttpsError("not-found", "Team not found.");
  }
  const team = teamSnap.data()!;

  if (!isAdmin && team.teamLeadUid !== uid) {
    throw new HttpsError("permission-denied", "Only this team's Team Lead (or an admin) can view its performance.");
  }

  const memberUids: string[] = team.memberUids ?? [];
  const startOfToday = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));

  const members: MemberPerformance[] = await Promise.all(
    memberUids.map(async (agentUid) => {
      const [leadsSnap, dealsSnap, callsSnap] = await Promise.all([
        db.collection("leads").where("assignedAgentUid", "==", agentUid).get(),
        db.collection("deals").where("agentUid", "==", agentUid).get(),
        db.collection("callLogs").where("agentUid", "==", agentUid).where("at", ">=", startOfToday).get(),
      ]);

      let interested = 0;
      let closedWon = 0;
      let closedLost = 0;
      for (const doc of leadsSnap.docs) {
        const status = doc.data().status;
        if (status === "Interested") interested++;
        if (status === "Closed Won") closedWon++;
        if (status === "Closed Lost") closedLost++;
      }

      let revenue = 0;
      let commission = 0;
      for (const doc of dealsSnap.docs) {
        const deal = doc.data();
        revenue += deal.value ?? 0;
        commission += deal.commission ?? 0;
      }

      return {
        agentUid,
        leadsCount: leadsSnap.size,
        interested,
        closedWon,
        closedLost,
        callsToday: callsSnap.size,
        revenue,
        commission,
      };
    }),
  );

  return { teamId, members } satisfies GetTeamPerformanceResult;
});
