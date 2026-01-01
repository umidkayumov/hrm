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