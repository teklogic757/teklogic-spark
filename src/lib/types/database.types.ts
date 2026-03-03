export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface ContestPrize {
    place: number
    description: string
    value: string
}

export interface ContestConfig {
    title: string
    description: string
    prizes: ContestPrize[]
    rules: string[]
    is_active: boolean
}

export interface Database {
    public: {
        Tables: {
            admin_audit_events: {
                Row: {
                    id: string
                    actor_user_id: string | null
                    actor_email: string | null
                    action: string
                    target_type: string
                    target_id: string | null
                    target_label: string | null
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    actor_user_id?: string | null
                    actor_email?: string | null
                    action: string
                    target_type: string
                    target_id?: string | null
                    target_label?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    actor_user_id?: string | null
                    actor_email?: string | null
                    action?: string
                    target_type?: string
                    target_id?: string | null
                    target_label?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
            }
            invitations: {
                Row: {
                    id: string
                    organization_id: string
                    email: string
                    token: string
                    role: 'user' | 'super_admin'
                    status: 'pending' | 'accepted' | 'expired'
                    created_by: string | null
                    created_at: string
                    expires_at: string | null
                }
                Insert: {
                    id?: string
                    organization_id: string
                    email: string
                    token: string
                    role?: 'user' | 'super_admin'
                    status?: 'pending' | 'accepted' | 'expired'
                    created_by?: string | null
                    created_at?: string
                    expires_at?: string | null
                }
                Update: {
                    id?: string
                    organization_id?: string
                    email?: string
                    token?: string
                    role?: 'user' | 'super_admin'
                    status?: 'pending' | 'accepted' | 'expired'
                    created_by?: string | null
                    created_at?: string
                    expires_at?: string | null
                }
            }
            organizations: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    domain: string | null
                    industry: string | null
                    brand_voice: string | null
                    annual_it_budget: string | null
                    marketing_strategy: string | null
                    estimated_revenue: string | null
                    employee_count: string | null
                    primary_language: string
                    brand_colors: Json | null
                    logo_url: string | null
                    contest_starts_at: string | null
                    contest_ends_at: string | null
                    contest_config: ContestConfig | null
                    last_contest_digest_sent_at: string | null
                    is_leaderboard_enabled: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    domain?: string | null
                    industry?: string | null
                    brand_voice?: string | null
                    annual_it_budget?: string | null
                    marketing_strategy?: string | null
                    estimated_revenue?: string | null
                    employee_count?: string | null
                    primary_language?: string
                    brand_colors?: Json | null
                    logo_url?: string | null
                    contest_starts_at?: string | null
                    contest_ends_at?: string | null
                    contest_config?: ContestConfig | null
                    last_contest_digest_sent_at?: string | null
                    is_leaderboard_enabled?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    domain?: string | null
                    industry?: string | null
                    brand_voice?: string | null
                    annual_it_budget?: string | null
                    marketing_strategy?: string | null
                    estimated_revenue?: string | null
                    employee_count?: string | null
                    primary_language?: string
                    brand_colors?: Json | null
                    logo_url?: string | null
                    contest_starts_at?: string | null
                    contest_ends_at?: string | null
                    contest_config?: ContestConfig | null
                    last_contest_digest_sent_at?: string | null
                    is_leaderboard_enabled?: boolean
                    created_at?: string
                }
            }
            training_videos: {
                Row: {
                    id: string
                    title: string
                    youtube_url: string
                    youtube_video_id: string
                    thumbnail_url: string
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    youtube_url: string
                    youtube_video_id: string
                    thumbnail_url: string
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    youtube_url?: string
                    youtube_video_id?: string
                    thumbnail_url?: string
                    created_by?: string | null
                    created_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    organization_id: string
                    email: string | null
                    full_name: string | null
                    role: 'user' | 'super_admin'
                    job_role: string | null
                    ai_context: string | null
                    is_active: boolean
                    total_points: number
                    created_at: string
                }
                Insert: {
                    id: string
                    organization_id: string
                    email?: string | null
                    full_name?: string | null
                    role?: 'user' | 'super_admin'
                    job_role?: string | null
                    ai_context?: string | null
                    is_active?: boolean
                    total_points?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    email?: string | null
                    full_name?: string | null
                    role?: 'user' | 'super_admin'
                    job_role?: string | null
                    ai_context?: string | null
                    is_active?: boolean
                    total_points?: number
                    created_at?: string
                }
            }
            ideas: {
                Row: {
                    id: string
                    organization_id: string
                    user_id: string
                    title: string
                    description: string
                    status: 'new' | 'processed'
                    is_high_impact: boolean
                    admin_bonus_points: number
                    ai_score: number | null
                    ai_reframed_text: string | null
                    ai_feedback: string | null
                    ai_analysis_json: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    user_id: string
                    title: string
                    description: string
                    status?: 'new' | 'reviewed' | 'implemented' | 'archived'
                    is_high_impact?: boolean
                    admin_bonus_points?: number
                    ai_score?: number | null
                    ai_reframed_text?: string | null
                    ai_feedback?: string | null
                    ai_analysis_json?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    user_id?: string
                    title?: string
                    description?: string
                    status?: 'new' | 'reviewed' | 'implemented' | 'archived'
                    is_high_impact?: boolean
                    admin_bonus_points?: number
                    ai_score?: number | null
                    ai_reframed_text?: string | null
                    ai_feedback?: string | null
                    ai_analysis_json?: Json | null
                    created_at?: string
                }
            }
            prompts: {
                Row: {
                    id: string
                    organization_id: string | null
                    title: string
                    content: string
                    category: string | null
                    tags: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id?: string | null
                    title: string
                    content: string
                    category?: string | null
                    tags?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string | null
                    title?: string
                    content?: string
                    category?: string | null
                    tags?: string[] | null
                    created_at?: string
                }
            }
        }
        Functions: {
            get_invite_by_token: {
                Args: {
                    token_input: string
                }
                Returns: Json
            }
            accept_invite: {
                Args: {
                    token_input: string
                    user_id: string
                }
                Returns: void
            }
        }
    }
}
