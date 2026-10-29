export type ModuleId = 
  | 'overview'
  | 'academic-hub'
  | 'ride-pooling'
  | 'sustainable-compute'
  | 'digital-wellbeing'
  | 'exam-monitoring';

export type UserRole = 
  | 'student'
  | 'peer-mentor'
  | 'transit-coordinator'
  | 'sustainability-analyst'
  | 'exam-proctor';

export interface UserProfile {
  name: string;
  role: UserRole;
  roleDisplay: string;
  department: string;
  avatarUrl?: string;
  studentId: string;
}

export interface ActivityNotification {
  id: string;
  module: ModuleId;
  title: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
}
