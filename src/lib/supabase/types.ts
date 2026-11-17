// Hand-written to match supabase/migrations/20261115000000_site_metrics.sql.
// Once the Supabase MCP/CLI is connected, regenerate with `supabase gen types typescript`.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
type AdminRange = { p_from: string; p_to: string; p_country: string | null };

type ReleaseRow = {
  id: number;
  version: string;
  file_name: string;
  url: string;
  size_bytes: number;
  sha256: string;
  notes: string | null;
  published_at: string;
  is_latest: boolean;
};

export type Database = {
  public: {
    Tables: {
      releases: {
        Row: ReleaseRow;
        Insert: Omit<ReleaseRow, "id" | "published_at" | "is_latest" | "notes"> & Partial<Pick<ReleaseRow, "published_at" | "is_latest" | "notes">>;
        Update: Partial<ReleaseRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      vote_counts: { Args: { p_game: string }; Returns: { up: number; down: number }[] };
      cast_vote: { Args: { p_game: string; p_author: string; p_value: number; p_country: string | null }; Returns: { up: number; down: number; mine: number | null }[] };
      game_feedback: { Args: { p_game: string; p_author: string | null; p_limit: number; p_before: number | null }; Returns: Json };
      post_comment: { Args: { p_game: string; p_author: string; p_name: string; p_body: string; p_ip: string | null; p_country: string | null }; Returns: Json };
      edit_comment: { Args: { p_id: number; p_author: string; p_name: string; p_body: string }; Returns: Json };
      admin_is_locked: { Args: { p_ip: string | null }; Returns: boolean };
      admin_login_attempt: { Args: { p_ip: string | null; p_ok: boolean }; Returns: undefined };
      admin_overview: { Args: AdminRange & { p_device: string | null; p_path: string | null }; Returns: Json };
      admin_audience: { Args: AdminRange & { p_device: string | null; p_path: string | null }; Returns: Json };
      admin_downloads: { Args: Omit<AdminRange, never>; Returns: Json };
      admin_signups: { Args: { p_from: string; p_to: string; p_search: string | null; p_page: number }; Returns: Json };
      admin_games: { Args: AdminRange; Returns: Json };
      admin_comments: { Args: AdminRange & { p_game: string | null; p_search: string | null; p_page: number }; Returns: Json };
      admin_filter_options: { Args: Record<string, never>; Returns: Json };
      track_hit: { Args: { p_visitor: Record<string, unknown>; p_session: Record<string, unknown>; p_event: Record<string, unknown> }; Returns: undefined };
      subscribe: { Args: { p_email: string; p_source: string; p_ip: string | null }; Returns: string };
      unsubscribe: { Args: { p_token: string }; Returns: boolean };
      record_health_check: {
        Args: { p_status: string };
        Returns: { check_count: number; previous_checked_at: string | null; checked_at: string }[];
      };
      log_download: {
        Args: { p_release_id: number; p_visitor_id: string | null; p_ip: string | null; p_country: string | null; p_referrer: string | null };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
