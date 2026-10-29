export type TaskCategory = 
  | 'DSA' 
  | 'Development' 
  | 'CS Fundamentals' 
  | 'Aptitude' 
  | 'Interview Prep';

export type TaskStatus = 'pending' | 'completed';

export interface PlacementTask {
  id: string;
  student_id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  due_date?: string;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  student_id: string;
  department: string;
  term: string;
  cgpa: number;
  placement_goal: string;
  skills: string[];
  interests: string[];
}

export interface CategoryProgress {
  total: number;
  completed: number;
  percent: number;
}

export interface PlacementProgress {
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  tasks_by_category: Record<TaskCategory, CategoryProgress>;
}

export interface PeerMentor {
  id: string;
  name: string;
  role_title: string;
  department: string;
  bio: string;
  skills: string[];
  expertise: string[];
  availability: 'available' | 'busy' | 'away';
  rating: number;
  sessions_count: number;
}

export interface MentorshipRequest {
  id: string;
  mentor_id: string;
  mentor_name: string;
  student_id: string;
  student_name: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export type ResourceType = 
  | 'Lecture Notes' 
  | 'Question Paper' 
  | 'Practice Exercise' 
  | 'Reference Guide';

export interface AcademicResource {
  id: string;
  title: string;
  subject: string;
  resource_type: ResourceType;
  tags: string[];
  description: string;
  url: string;
  is_placeholder: boolean;
  uploaded_by: string;
  created_at: string;
  downloads_count: number;
}
