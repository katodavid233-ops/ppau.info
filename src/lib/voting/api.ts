import { getSupabase } from "@/lib/supabase/client";

export type MemberType = "professional" | "student";
export type EligibleVoters = MemberType | "both";
export type ElectionStatus = "draft" | "open" | "closed" | "published";

export type Voter = {
  id: string;
  full_name: string;
  email: string;
  member_type: MemberType;
  member_no: string | null;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
};

export type Election = {
  id: string;
  title: string;
  description: string | null;
  eligible_voters: EligibleVoters;
  starts_at: string;
  ends_at: string;
  status: ElectionStatus;
  results_public: boolean;
  created_at: string;
};

export type Position = {
  id: string;
  election_id: string;
  title: string;
  description: string | null;
  eligible_voters: EligibleVoters;
  max_votes: number;
  sort_order: number;
};

export type Nominee = {
  id: string;
  position_id: string;
  full_name: string;
  photo_url: string | null;
  bio: string | null;
  manifesto: string | null;
  created_at: string;
};

export type ResultRow = {
  position_id: string;
  position_title: string;
  sort_order: number;
  nominee_id: string;
  nominee_name: string;
  photo_url: string | null;
  vote_count: number;
};

export type ElectionDetail = {
  election: Election;
  positions: (Position & { nominees: Nominee[] })[];
  votedPositionIds: string[];
  voter: Voter | null;
};

function sb() {
  return getSupabase();
}

export async function fetchCurrentVoter(): Promise<Voter | null> {
  const { data: userData, error: userError } = await sb().auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;

  const { data, error } = await sb()
    .from("voters")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as Voter | null) ?? null;
}

export async function ensureVoterProfile(): Promise<Voter> {
  const { data, error } = await sb().rpc("ensure_voter_profile");
  if (error) throw error;
  return data as Voter;
}

export async function listElections(): Promise<Election[]> {
  const { data, error } = await sb()
    .from("elections")
    .select("*")
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Election[];
}

export async function fetchElection(id: string): Promise<ElectionDetail> {
  const client = sb();
  const { data: userData } = await client.auth.getUser();
  const uid = userData.user?.id;

  const { data: election, error } = await client
    .from("elections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!election) throw new Error("Election not found");

  const { data: positions, error: posError } = await client
    .from("positions")
    .select("*, nominees(*)")
    .eq("election_id", id)
    .order("sort_order", { ascending: true });
  if (posError) throw posError;

  let votedPositionIds: string[] = [];
  if (uid) {
    const { data: ballots, error: ballotError } = await client
      .from("ballots")
      .select("position_id")
      .eq("voter_id", uid);
    if (!ballotError) votedPositionIds = (ballots ?? []).map((b) => b.position_id as string);
  }

  const voter = uid ? await fetchCurrentVoter().catch(() => null) : null;

  return {
    election: election as Election,
    positions: ((positions ?? []) as (Position & { nominees: Nominee[] })[]).map((p) => ({
      ...p,
      nominees: [...(p.nominees ?? [])].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    })),
    votedPositionIds,
    voter,
  };
}

export async function castVote(positionId: string, nomineeId: string): Promise<void> {
  const { error } = await sb().rpc("cast_vote", {
    p_position: positionId,
    p_nominee: nomineeId,
  });
  if (error) throw error;
}

export async function fetchResults(electionId: string): Promise<ResultRow[]> {
  const { data, error } = await sb().rpc("election_results", { p_election: electionId });
  if (error) throw error;
  return (data ?? []) as ResultRow[];
}

export function isElectionOpen(election: Election): boolean {
  const now = Date.now();
  return (
    election.status === "open" &&
    new Date(election.starts_at).getTime() <= now &&
    new Date(election.ends_at).getTime() >= now
  );
}

export function electionPhase(election: Election): string {
  const now = Date.now();
  if (election.status === "draft") return "Draft";
  if (election.status === "closed") return "Closed";
  if (election.status === "published") return "Results published";
  if (now < new Date(election.starts_at).getTime()) return "Scheduled";
  if (now > new Date(election.ends_at).getTime()) return "Awaiting results";
  return "Voting open";
}

// ---------------------------------------------------------------- admin API

export type ElectionInput = {
  title: string;
  description: string | null;
  eligible_voters: EligibleVoters;
  starts_at: string;
  ends_at: string;
  status: ElectionStatus;
  results_public: boolean;
};

export async function createElection(input: ElectionInput): Promise<Election> {
  const { data, error } = await sb().from("elections").insert(input).select().single();
  if (error) throw error;
  return data as Election;
}

export async function updateElection(id: string, input: Partial<ElectionInput>): Promise<void> {
  const { error } = await sb().from("elections").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteElection(id: string): Promise<void> {
  const { error } = await sb().from("elections").delete().eq("id", id);
  if (error) throw error;
}

export async function createPosition(
  input: Pick<Position, "election_id" | "title" | "description" | "eligible_voters" | "sort_order">,
): Promise<Position> {
  const { data, error } = await sb().from("positions").insert(input).select().single();
  if (error) throw error;
  return data as Position;
}

export async function updatePosition(id: string, input: Partial<Position>): Promise<void> {
  const { error } = await sb().from("positions").update(input).eq("id", id);
  if (error) throw error;
}

export async function deletePosition(id: string): Promise<void> {
  const { error } = await sb().from("positions").delete().eq("id", id);
  if (error) throw error;
}

export async function createNominee(
  input: Pick<Nominee, "position_id" | "full_name" | "photo_url" | "bio" | "manifesto">,
): Promise<Nominee> {
  const { data, error } = await sb().from("nominees").insert(input).select().single();
  if (error) throw error;
  return data as Nominee;
}

export async function updateNominee(id: string, input: Partial<Nominee>): Promise<void> {
  const { error } = await sb().from("nominees").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteNominee(id: string): Promise<void> {
  const { error } = await sb().from("nominees").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadNomineePhoto(file: File, positionId: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${positionId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb()
    .storage.from("nominee-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = sb().storage.from("nominee-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function listVoters(): Promise<Voter[]> {
  const { data, error } = await sb()
    .from("voters")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Voter[];
}

export async function setVoterVerified(id: string, verified: boolean): Promise<void> {
  const { error } = await sb().from("voters").update({ is_verified: verified }).eq("id", id);
  if (error) throw error;
}

export async function setVoterAdmin(id: string, isAdmin: boolean): Promise<void> {
  const { error } = await sb().from("voters").update({ is_admin: isAdmin }).eq("id", id);
  if (error) throw error;
}

export type MemberWithoutVoter = {
  id: string;
  full_name: string;
  email: string;
  membership_number: string;
  membership_type: MemberType;
};

export async function listLinkableMembers(): Promise<MemberWithoutVoter[]> {
  const client = sb();
  const { data: members, error } = await client
    .from("members")
    .select("id, full_name, email, membership_number, membership_type, user_id")
    .not("user_id", "is", null)
    .order("full_name", { ascending: true });
  if (error) throw error;

  const { data: voters, error: voterError } = await client.from("voters").select("id");
  if (voterError) throw voterError;

  const registered = new Set((voters ?? []).map((v) => v.id as string));
  return ((members ?? []) as (MemberWithoutVoter & { user_id: string })[])
    .filter((m) => m.user_id && !registered.has(m.user_id))
    .map(({ user_id: _userId, ...m }) => m);
}

export async function registerVoterFromMember(memberId: string): Promise<void> {
  const { error } = await sb().rpc("register_voter_from_member", {
    p_member_id: memberId,
    p_verify: true,
  });
  if (error) throw error;
}
