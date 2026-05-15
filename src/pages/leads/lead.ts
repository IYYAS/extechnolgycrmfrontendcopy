export type InterestLevel = 'hot' | 'warm' | 'cold';
export type ConversionStatus = 'new' | 'contacted' | 'proposal_sent' | 'negotiation' | 'approved' | 'closed' | 'denied';

export type FollowUpStatus = 'yes' | 'no';
export type InteractionType = 'call' | 'meeting' | 'whatsapp' | 'email' | 'other';


export interface FollowUp {
    id: number;
    lead: number;
    note: string;
    followup_date: string | null;
    interest_level?: InterestLevel;
    conversion_status?: ConversionStatus;
    interaction_date: string;
    interaction_type: InteractionType;
    is_project_created: boolean;
    created_at: string;

}

export interface Lead {
    id: number;
    company_name: string;
    nature_of_business?: string;
    location?: string;
    address?: string;
    contact_number: string;
    contact_person: string;
    email?: string;
    website?: string;
    contacted_date?: string;
    service_required: string;
    description?: string;
    interest_level: InterestLevel;
    follow_up: FollowUpStatus;
    next_followup_date?: string;
    conversion_status: ConversionStatus;
    remark?: string;
    lead_source?: string;
    assigned_to?: number | null;
    assigned_to_name?: string;
    assigned_role?: number | null;
    assigned_role_name?: string;
    attachment?: string;
    created_at: string;
    updated_at: string;
    followups?: FollowUp[];
}

export interface LeadDashboardStats {
    interest_stats: Record<string, number>;
    status_stats: Record<string, number>;
    upcoming_followups: number;
    overdue_followups: number;
    total_leads: number;
}
