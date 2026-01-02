export type FieldType = 'text' | 'number' | 'photo' | 'long_text' | 'date';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  isSystem?: boolean; // For the mandatory photo field
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  active: boolean;
}

export interface Submission {
  id: string;
  formId: string;
  candidateName: string;
  photoUrl: string;
  role: string;
  email: string; // Extracted for convenience
  answers: Record<string, string | number>;
  submittedAt: string; // ISO date
  status: 'new' | 'reviewed' | 'rejected' | 'hired';
  aiSummary?: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend: number;
  trendLabel: string;
}

export type CalendarEventType = 'interview' | 'leave' | 'shift' | 'event' | 'reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  start: string; // ISO date string
  end: string;   // ISO date string
  employeeId?: string;
  candidateId?: string;
  status?: 'pending' | 'approved' | 'rejected'; // For leave requests
  description?: string;
  location?: string;
  teamId?: string;
  color?: string; // Optional custom color override
}

export interface CalendarFilter {
  type: CalendarEventType;
  enabled: boolean;
  label: string;
  color: string;
  icon: string;
}