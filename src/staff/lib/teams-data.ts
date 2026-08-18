import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, query, Timestamp, where, type DocumentData } from "firebase/firestore";

import { db } from "./firebase";
import { getMockStaffProfile } from "./auth";
import type { Team, TeamOverride } from "./types";

function mapTeamDoc(id: string, data: DocumentData): Team {
  return {
    id,
    name: data.name,
    teamLeadUid: data.teamLeadUid,
    memberUids: data.memberUids ?? [],
    overrideRatePercent: data.overrideRatePercent ?? 0,
    status: data.status ?? "active",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

function mapTeamOverrideDoc(id: string, data: DocumentData): TeamOverride {
  return {
    id,
    teamId: data.teamId,
    teamLeadUid: data.teamLeadUid,
    agentUid: data.agentUid,
    dealId: data.dealId,
    leadId: data.leadId,
    business: data.business,
    agentCommission: data.agentCommission ?? 0,
    overrideRatePercent: data.overrideRatePercent ?? 0,
    overrideAmount: data.overrideAmount ?? 0,
    closedAt: data.closedAt instanceof Timestamp ? data.closedAt.toDate().toISOString() : new Date().toISOString(),
  };
}

/** Admin-only: every team (active and archived — admin.teams.tsx filters as needed). */
export function useTeams() {
  return useQuery({
    queryKey: ["teams", "all"],
    queryFn: async (): Promise<Team[]> => {
      if (getMockStaffProfile()) return [];
      const snap = await getDocs(collection(db, "teams"));
      return snap.docs.map((d) => mapTeamDoc(d.id, d.data()));
    },
  });
}

/**
 * The signed-in agent's own team, whether they're the Team Lead or a
 * regular member — null if they're not on a team. Two queries (Firestore
 * can't OR across different fields in one query) merged into one result;
 * in practice an agent matches at most one.
 */
export function useMyTeam(uid: string | undefined) {
  return useQuery({
    queryKey: ["teams", "mine", uid],
    queryFn: async (): Promise<Team | null> => {
      if (getMockStaffProfile()) return null;
      if (!uid) return null;

      const asLead = await getDocs(query(collection(db, "teams"), where("teamLeadUid", "==", uid)));
      if (!asLead.empty) return mapTeamDoc(asLead.docs[0].id, asLead.docs[0].data());

      const asMember = await getDocs(query(collection(db, "teams"), where("memberUids", "array-contains", uid)));
      if (!asMember.empty) return mapTeamDoc(asMember.docs[0].id, asMember.docs[0].data());

      return null;
    },
    enabled: Boolean(uid),
  });
}

export function useTeam(teamId: string | undefined) {
  return useQuery({
    queryKey: ["teams", "one", teamId],
    queryFn: async (): Promise<Team | null> => {
      if (getMockStaffProfile() || !teamId) return null;
      const snap = await getDoc(doc(db, "teams", teamId));
      return snap.exists() ? mapTeamDoc(snap.id, snap.data()) : null;
    },
    enabled: Boolean(teamId),
  });
}

/** Admin-only: every Team Lead override across every team, for the Commissions page. */
export function useTeamOverrides() {
  return useQuery({
    queryKey: ["teamOverrides", "all"],
    queryFn: async (): Promise<TeamOverride[]> => {
      if (getMockStaffProfile()) return [];
      const snap = await getDocs(collection(db, "teamOverrides"));
      return snap.docs.map((d) => mapTeamOverrideDoc(d.id, d.data()));
    },
  });
}

/** The signed-in Team Lead's own override earnings. */
export function useMyTeamOverrides(uid: string | undefined) {
  return useQuery({
    queryKey: ["teamOverrides", "mine", uid],
    queryFn: async (): Promise<TeamOverride[]> => {
      if (getMockStaffProfile() || !uid) return [];
      const snap = await getDocs(query(collection(db, "teamOverrides"), where("teamLeadUid", "==", uid)));
      return snap.docs.map((d) => mapTeamOverrideDoc(d.id, d.data()));
    },
    enabled: Boolean(uid),
  });
}
