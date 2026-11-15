// Hand-written to match supabase/migrations/20261115000000_site_metrics.sql.
// Once the Supabase MCP/CLI is connected, regenerate with `supabase gen types typescript`.

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
