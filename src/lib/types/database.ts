export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "student" | "teacher" | "admin";
export type MembershipRole = "member" | "teacher" | "admin";
export type MessageKind = "message" | "system" | "file" | "call";
export type AssignmentStatus = "open" | "closed" | "archived";
export type SubmissionStatus = "submitted" | "reviewed" | "needs_changes";
export type HelpRequestStatus = "open" | "matched" | "resolved" | "cancelled";
export type NotificationKind =
  | "assignment_posted"
  | "assignment_due"
  | "submission_received"
  | "help_requested"
  | "help_matched"
  | "help_resolved"
  | "announcement_posted"
  | "badge_unlocked"
  | "message_mention";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          handle: string;
          avatar_url: string | null;
          role: AppRole;
          headline: string | null;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
          handle: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          emoji: string | null;
          color: string;
          is_lobby: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["departments"]["Row"]> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["departments"]["Row"]>;
        Relationships: [];
      };
      memberships: {
        Row: {
          department_id: string;
          user_id: string;
          role: MembershipRole;
          joined_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["memberships"]["Row"]> & {
          department_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["memberships"]["Row"]>;
        Relationships: [];
      };
      direct_threads: {
        Row: {
          id: string;
          title: string | null;
          is_group: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["direct_threads"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["direct_threads"]["Row"]>;
        Relationships: [];
      };
      direct_thread_members: {
        Row: {
          thread_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["direct_thread_members"]["Row"]
        > & {
          thread_id: string;
          user_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["direct_thread_members"]["Row"]
        >;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          author_id: string | null;
          body: string;
          department_id: string | null;
          direct_thread_id: string | null;
          parent_message_id: string | null;
          kind: MessageKind;
          attachment: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
      message_reactions: {
        Row: {
          message_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["message_reactions"]["Row"]
        > & {
          message_id: string;
          user_id: string;
          emoji: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["message_reactions"]["Row"]
        >;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          department_id: string;
          author_id: string | null;
          title: string;
          body: string;
          pinned: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["announcements"]["Row"]> & {
          department_id: string;
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: [];
      };
      department_resources: {
        Row: {
          id: string;
          department_id: string;
          author_id: string | null;
          title: string;
          body: string | null;
          link_url: string | null;
          attachment: Json | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["department_resources"]["Row"]
        > & {
          department_id: string;
          title: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["department_resources"]["Row"]
        >;
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          department_id: string;
          author_id: string | null;
          title: string;
          instructions: string;
          due_at: string;
          points: number;
          status: AssignmentStatus;
          attachment: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["assignments"]["Row"]> & {
          department_id: string;
          title: string;
          instructions: string;
          due_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["assignments"]["Row"]>;
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          body: string | null;
          attachment: Json | null;
          status: SubmissionStatus;
          score: number | null;
          feedback: string | null;
          submitted_at: string;
          graded_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["submissions"]["Row"]> & {
          assignment_id: string;
          student_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["submissions"]["Row"]>;
        Relationships: [];
      };
      help_requests: {
        Row: {
          id: string;
          department_id: string;
          author_id: string;
          volunteer_id: string | null;
          title: string;
          description: string;
          topic_tags: string[];
          status: HelpRequestStatus;
          points_reward: number;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["help_requests"]["Row"]> & {
          department_id: string;
          author_id: string;
          title: string;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["help_requests"]["Row"]>;
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          points_threshold: number;
        };
        Insert: Partial<Database["public"]["Tables"]["badges"]["Row"]> & {
          slug: string;
          name: string;
          description: string;
          icon: string;
          points_threshold: number;
        };
        Update: Partial<Database["public"]["Tables"]["badges"]["Row"]>;
        Relationships: [];
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          awarded_at: string;
          source_help_request_id: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["user_badges"]["Row"]> & {
          user_id: string;
          badge_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_badges"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: NotificationKind;
          title: string;
          body: string;
          department_id: string | null;
          assignment_id: string | null;
          help_request_id: string | null;
          message_id: string | null;
          direct_thread_id: string | null;
          dedupe_key: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["notifications"]["Row"]
        > & {
          user_id: string;
          kind: NotificationKind;
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_school_defaults: {
        Args: Record<string, never>;
        Returns: void;
      };
      toggle_message_reaction: {
        Args: {
          target_message: string;
          reaction_emoji: string;
        };
        Returns: void;
      };
      volunteer_for_help_request: {
        Args: {
          target_help_request: string;
        };
        Returns: void;
      };
      resolve_help_request: {
        Args: {
          target_help_request: string;
        };
        Returns: void;
      };
      mark_all_notifications_read: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      app_role: AppRole;
      membership_role: MembershipRole;
      message_kind: MessageKind;
      assignment_status: AssignmentStatus;
      submission_status: SubmissionStatus;
      help_request_status: HelpRequestStatus;
      notification_kind: NotificationKind;
    };
    CompositeTypes: Record<string, never>;
  };
}
