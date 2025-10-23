import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'social_worker';
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'admin' | 'social_worker';
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'social_worker';
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          profile_data: any;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          profile_data?: any;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          profile_data?: any;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          client_id: string;
          session_date: string;
          current_status: string | null;
          actions_taken: string | null;
          next_steps: string | null;
          network_involvement: string | null;
          raw_transcript: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          session_date: string;
          current_status?: string | null;
          actions_taken?: string | null;
          next_steps?: string | null;
          network_involvement?: string | null;
          raw_transcript?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          session_date?: string;
          current_status?: string | null;
          actions_taken?: string | null;
          next_steps?: string | null;
          network_involvement?: string | null;
          raw_transcript?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          client_id: string;
          report_type: 'anamnese' | 'interim' | 'final';
          title: string;
          content: string;
          metadata: any;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          report_type: 'anamnese' | 'interim' | 'final';
          title: string;
          content: string;
          metadata?: any;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          report_type?: 'anamnese' | 'interim' | 'final';
          title?: string;
          content?: string;
          metadata?: any;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      progress_indicators: {
        Row: {
          id: string;
          client_id: string;
          session_id: string;
          indicator_type: 'finances' | 'health' | 'job_applications' | 'family_situation' | 'child_welfare' | 'other';
          value: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          session_id: string;
          indicator_type: 'finances' | 'health' | 'job_applications' | 'family_situation' | 'child_welfare' | 'other';
          value: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          session_id?: string;
          indicator_type?: 'finances' | 'health' | 'job_applications' | 'family_situation' | 'child_welfare' | 'other';
          value?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
