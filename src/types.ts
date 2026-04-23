export type Role = 'student' | 'admin';
export type UserStatus = 'Active' | 'Blocked';
export type ReportType = 'lost' | 'found';
export type ReportStatus = 'Pending' | 'Under Review' | 'Matched' | 'Resolved' | 'Rejected';
export type MatchStatus = 'Suggested' | 'Confirmed' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
  department?: string;
  role: Role;
  status: UserStatus;
  blockReason?: string;
  createdAt: string;
  passwordHash?: string; // Added for server-side persistence
}

export interface Database {
  users: User[];
  reports: Report[];
  matches: Match[];
  notifications: Notification[];
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  type: ReportType;
  itemName: string;
  category: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  status: ReportStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  lostReportId: string;
  foundReportId: string;
  status: MatchStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'flag' | 'new_report';
  reportId?: string;
  fromUserId?: string;
  fromUserName?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
