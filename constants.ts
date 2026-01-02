import { FormTemplate, Submission } from './types';

export const MOCK_FORM: FormTemplate = {
  id: 'form-1',
  title: 'Senior Product Designer Application',
  description: 'We are looking for a creative mind to join our design team.',
  active: true,
  fields: [
    { id: 'f_photo', type: 'photo', label: 'Profile Photo', required: true, isSystem: true },
    { id: 'f_name', type: 'text', label: 'Full Name', placeholder: 'e.g. Jane Doe', required: true },
    { id: 'f_email', type: 'text', label: 'Email Address', placeholder: 'jane@example.com', required: true },
    { id: 'f_dob', type: 'date', label: 'Date of Birth', placeholder: 'Select your birth date', required: true },
    { id: 'f_exp', type: 'number', label: 'Years of Experience', placeholder: 'e.g. 5', required: true },
    { id: 'f_portfolio', type: 'text', label: 'Portfolio Link', placeholder: 'https://dribbble.com/janedoe', required: true },
    { id: 'f_bio', type: 'long_text', label: 'Short Bio', placeholder: 'Tell us a bit about yourself...', required: false },
  ]
};

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    formId: 'form-1',
    candidateName: 'Alice Freeman',
    email: 'alice.freeman@example.com',
    role: 'Senior Product Designer',
    photoUrl: 'https://picsum.photos/id/64/200/200',
    submittedAt: '2023-10-24T10:00:00Z',
    status: 'new',
    answers: {
      f_name: 'Alice Freeman',
      f_email: 'alice.freeman@example.com',
      f_exp: 5,
      f_portfolio: 'dribbble.com/alice',
      f_bio: 'Passionate UI designer with a love for clean aesthetics and functional UX.'
    }
  },
  {
    id: 'sub-2',
    formId: 'form-1',
    candidateName: 'Marcus Chen',
    email: 'm.chen@design.co',
    role: 'UX Researcher',
    photoUrl: 'https://picsum.photos/id/91/200/200',
    submittedAt: '2023-10-23T14:30:00Z',
    status: 'reviewed',
    answers: {
      f_name: 'Marcus Chen',
      f_email: 'm.chen@design.co',
      f_exp: 8,
      f_portfolio: 'behance.net/marcuschen',
      f_bio: 'Senior UX researcher focusing on accessibility and enterprise software.'
    }
  },
  {
    id: 'sub-3',
    formId: 'form-1',
    candidateName: 'Sarah Jenkins',
    email: 'sarah.j@gmail.com',
    role: 'Mobile Designer',
    photoUrl: 'https://picsum.photos/id/129/200/200',
    submittedAt: '2023-10-22T09:15:00Z',
    status: 'hired',
    answers: {
      f_name: 'Sarah Jenkins',
      f_email: 'sarah.j@gmail.com',
      f_exp: 3,
      f_portfolio: 'sarahjenkins.io',
      f_bio: 'Recent grad with a strong portfolio in mobile app design.'
    }
  },
  {
    id: 'sub-4',
    formId: 'form-1',
    candidateName: 'David Ross',
    email: 'dross@example.com',
    role: 'Junior Graphic Designer',
    photoUrl: 'https://picsum.photos/id/177/200/200',
    submittedAt: '2023-10-20T11:00:00Z',
    status: 'rejected',
    answers: {
      f_name: 'David Ross',
      f_email: 'dross@example.com',
      f_exp: 1,
      f_portfolio: 'instagram.com/dross_art',
      f_bio: 'Graphic designer looking to switch to product design.'
    }
  }
];import { CalendarEvent, CalendarFilter, StatMetric } from './types';

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Sarah L. - Interview',
    type: 'interview',
    start: '2026-01-02T10:00:00Z',
    end: '2026-01-02T11:00:00Z',
    candidateId: 'c1',
    description: 'Senior Frontend Engineer interview',
    location: 'Google Meet',
    color: '#3B82F6'
  },
  {
    id: '2',
    title: 'David K. - Sick Leave',
    type: 'leave',
    start: '2026-01-02T00:00:00Z',
    end: '2026-01-04T23:59:59Z',
    employeeId: 'e1',
    status: 'approved',
    description: 'Feeling unwell, flu symptoms.',
    color: '#EF4444'
  },
  {
    id: '3',
    title: 'Morning Shift - Team A',
    type: 'shift',
    start: '2026-01-02T08:00:00Z',
    end: '2026-01-02T16:00:00Z',
    teamId: 't1',
    description: 'Regular morning shift for backend team.',
    color: '#10B981'
  },
  {
    id: '4',
    title: 'Company Townhall',
    type: 'event',
    start: '2026-01-03T15:00:00Z',
    end: '2026-01-03T16:30:00Z',
    description: 'Quarterly company updates.',
    location: 'Main Hall / Zoom',
    color: '#8B5CF6'
  }
];

export const CALENDAR_FILTERS: CalendarFilter[] = [
  { type: 'interview', enabled: true, label: 'Interviews', color: '#3B82F6', icon: 'UserCircle' },
  { type: 'leave', enabled: true, label: 'Leave', color: '#EF4444', icon: 'Plane' },
  { type: 'shift', enabled: true, label: 'Shifts', color: '#10B981', icon: 'Clock' },
  { type: 'event', enabled: true, label: 'Events', color: '#8B5CF6', icon: 'Calendar' },
  { type: 'reminder', enabled: true, label: 'Reminders', color: '#F59E0B', icon: 'Bell' }
];

// Add other constants from the original file if needed, but keeping this focused on what's new for now.
// Based on view_file output, I should probably append or merge these into the existing constants.ts if possible.
