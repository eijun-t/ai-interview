import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          university: string | null
          faculty: string | null
          major: string | null
          graduation_year: number | null
          club_activities: string | null
          part_time_jobs: string | null
          study_abroad_experience: string | null
          language_skills: string | null
          certifications: string | null
          interests: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          university?: string | null
          faculty?: string | null
          major?: string | null
          graduation_year?: number | null
          club_activities?: string | null
          part_time_jobs?: string | null
          study_abroad_experience?: string | null
          language_skills?: string | null
          certifications?: string | null
          interests?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          university?: string | null
          faculty?: string | null
          major?: string | null
          graduation_year?: number | null
          club_activities?: string | null
          part_time_jobs?: string | null
          study_abroad_experience?: string | null
          language_skills?: string | null
          certifications?: string | null
          interests?: string | null
        }
      }
      industries: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          keywords: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          keywords?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          keywords?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          created_at: string
          name: string
          name_kana: string | null
          industry_id: string | null
          description: string | null
          employee_count: string | null
          location: string | null
          website_url: string | null
          source_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          name_kana?: string | null
          industry_id?: string | null
          description?: string | null
          employee_count?: string | null
          location?: string | null
          website_url?: string | null
          source_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          name_kana?: string | null
          industry_id?: string | null
          description?: string | null
          employee_count?: string | null
          location?: string | null
          website_url?: string | null
          source_url?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          created_at: string
          question_text: string
          category: string
          difficulty_level: number
          tags: string | null
          industry_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          question_text: string
          category: string
          difficulty_level?: number
          tags?: string | null
          industry_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          question_text?: string
          category?: string
          difficulty_level?: number
          tags?: string | null
          industry_id?: string | null
        }
      }
      question_templates: {
        Row: {
          id: string
          created_at: string
          template_name: string
          industry_id: string
          question_ids: string[]
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          template_name: string
          industry_id: string
          question_ids: string[]
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          template_name?: string
          industry_id?: string
          question_ids?: string[]
          description?: string | null
        }
      }
      interview_sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          session_name: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          started_at: string | null
          ended_at: string | null
          industry_id: string | null
          template_id: string | null
          overall_score: number | null
          feedback: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          session_name?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          started_at?: string | null
          ended_at?: string | null
          industry_id?: string | null
          template_id?: string | null
          overall_score?: number | null
          feedback?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          session_name?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          started_at?: string | null
          ended_at?: string | null
          industry_id?: string | null
          template_id?: string | null
          overall_score?: number | null
          feedback?: string | null
        }
      }
      session_qa_histories: {
        Row: {
          id: string
          created_at: string
          session_id: string
          question_id: string
          question_text: string
          user_answer: string | null
          ai_feedback: string | null
          score: number | null
          response_time: number | null
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          session_id: string
          question_id: string
          question_text: string
          user_answer?: string | null
          ai_feedback?: string | null
          score?: number | null
          response_time?: number | null
          order_index: number
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string
          question_id?: string
          question_text?: string
          user_answer?: string | null
          ai_feedback?: string | null
          score?: number | null
          response_time?: number | null
          order_index?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      session_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    }
  }
}