export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'responsible' | 'caregiver' | 'viewer';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      families: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: UserRole;
          relation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: UserRole;
          relation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_id?: string;
          role?: UserRole;
          relation?: string | null;
          created_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          nickname: string | null;
          birth_date: string;
          sex: 'male' | 'female' | 'other' | 'not_informed' | null;
          photo_url: string | null;
          blood_type: string | null;
          allergies: string | null;
          pediatrician: string | null;
          notes: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          nickname?: string | null;
          birth_date: string;
          sex?: 'male' | 'female' | 'other' | 'not_informed' | null;
          photo_url?: string | null;
          blood_type?: string | null;
          allergies?: string | null;
          pediatrician?: string | null;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          nickname?: string | null;
          birth_date?: string;
          sex?: 'male' | 'female' | 'other' | 'not_informed' | null;
          photo_url?: string | null;
          blood_type?: string | null;
          allergies?: string | null;
          pediatrician?: string | null;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
    };
  };
}
