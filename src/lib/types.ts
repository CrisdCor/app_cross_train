export type Role = "admin" | "head_coach" | "coach" | "user";

export interface Profile {
  id: string;
  role: Role;
  first_name: string;
  last_name: string;
  alias: string | null;
  document_id: string | null;
  email: string;
  avatar_url: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export type MembershipStatus = "active" | "inactive";

export interface Membership {
  id: string;
  user_id: string;
  community_id: string;
  status: MembershipStatus;
  invited_by: string | null;
  joined_at: string;
  activated_at: string | null;
  deactivated_at: string | null;
}
