
export enum UserRole {
  CITIZEN = 'CITIZEN',
  OFFICER = 'OFFICER',
  ADMIN = 'ADMIN'
}

export enum GrievanceStatus {
  SUBMITTED = 'Submitted',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected'
}

export enum GrievancePriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum KYCStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  department?: string; // Only for officers
  mobile?: string;     // Added for profile display
  kycStatus?: KYCStatus;
}

export interface Feedback {
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface TimelineEvent {
  title: string;
  date?: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Grievance {
  id: string; // Internal DB ID
  gceID?: string; // Official Display ID (GCE-XXX)
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  location: string;
  createdAt: string; // ISO string
  resolvedAt?: string; // ISO string for resolution time calculation
  imageUrl?: string;
  aiAnalysis?: string; // Summary from AI
  feedback?: Feedback;
  expectedResolution?: string; // Calculated ETA
  department?: string; // Assigned Dept
  upvotes?: string[]; // Array of user UIDs
  comments?: Comment[];
}

export interface GrievanceDraft {
  description: string;
  location: string;
  title?: string;
  lastSaved: string;
}

export interface AIAnalysisResult {
  category: string;
  priority: GrievancePriority;
  summary: string;
  department?: string;
  sentiment?: string;
}

export interface SystemLog {
  id: string;
  action: string;
  actorName: string;
  details: string;
  timestamp: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
}
