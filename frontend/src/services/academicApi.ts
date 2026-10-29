import type { 
  StudentProfile, 
  PlacementTask, 
  PlacementProgress, 
  PeerMentor, 
  MentorshipRequest, 
  AcademicResource,
  TaskCategory 
} from '../types/academic';
import type { ActivityNotification } from '../types/navigation';

const API_BASE_URL = 'http://localhost:8000/api';

// Fallback in-memory stores in case the backend server is not active
let fallbackTasks: PlacementTask[] = [
  { id: 'task-01', student_id: 'STU-2026-0842', title: 'Solve 30 Medium Graph & DP Problems on LeetCode', category: 'DSA', status: 'completed', created_at: '2026-10-25' },
  { id: 'task-02', student_id: 'STU-2026-0842', title: 'Review Dijkstra and A* Shortest Path Graph Implementations', category: 'DSA', status: 'pending', due_date: '2026-11-05', created_at: '2026-10-26' },
  { id: 'task-03', student_id: 'STU-2026-0842', title: 'Build Full-Stack FastAPI & SQLite RESTful API Microservice', category: 'Development', status: 'completed', created_at: '2026-10-27' },
  { id: 'task-04', student_id: 'STU-2026-0842', title: 'Optimize React State Management & Component Render Latency', category: 'Development', status: 'pending', due_date: '2026-11-10', created_at: '2026-10-28' },
  { id: 'task-05', student_id: 'STU-2026-0842', title: 'Review OS Virtual Memory, Page Tables, and Concurrency Primitives', category: 'CS Fundamentals', status: 'completed', created_at: '2026-10-24' },
  { id: 'task-06', student_id: 'STU-2026-0842', title: 'Study Relational Database ACID Properties & B-Tree Indexing', category: 'CS Fundamentals', status: 'pending', due_date: '2026-11-12', created_at: '2026-10-25' },
  { id: 'task-07', student_id: 'STU-2026-0842', title: 'Complete 5 Quantitative Aptitude & Speed Mathematics Drills', category: 'Aptitude', status: 'completed', created_at: '2026-10-26' },
  { id: 'task-08', student_id: 'STU-2026-0842', title: 'Conduct Peer Mock Interview on Scalable System Architecture', category: 'Interview Prep', status: 'pending', due_date: '2026-11-14', created_at: '2026-10-28' },
];

let fallbackMentors: PeerMentor[] = [
  {
    id: 'mentor-1',
    name: 'Sarah Lin',
    role_title: 'Final Year Senior • Incoming SWE at CloudScale',
    department: 'Computer Science',
    bio: 'Passionate about graph traversal algorithms, distributed databases, and helping peers conquer technical interviews.',
    skills: ['Graph Algorithms', 'System Design', 'Python', 'FastAPI'],
    expertise: ['DSA Coding Rounds', 'Mock Interviews', 'Resume Critique'],
    availability: 'available',
    rating: 4.95,
    sessions_count: 28,
  },
  {
    id: 'mentor-2',
    name: 'Dev Patel',
    role_title: '4th Year CSE • Ex-Fintech Platform Intern',
    department: 'Computer Science',
    bio: 'Experienced with enterprise full-stack development, modern frontend architectures, and deployment pipelines.',
    skills: ['React', 'TypeScript', 'SQL', 'Docker'],
    expertise: ['Full-Stack Project Reviews', 'Git Workflows', 'Portfolio Audits'],
    availability: 'available',
    rating: 4.88,
    sessions_count: 19,
  },
  {
    id: 'mentor-3',
    name: 'Priya Sharma',
    role_title: 'M.Tech Data Science • Green Computing Fellow',
    department: 'Data Science',
    bio: 'Specializes in algorithmic efficiency, sustainability telemetry, and statistical analysis for tech interviews.',
    skills: ['PyTorch', 'Energy Modeling', 'Data Structures'],
    expertise: ['ML & Data Engineering Roles', 'Research Publications'],
    availability: 'busy',
    rating: 4.92,
    sessions_count: 34,
  },
  {
    id: 'mentor-4',
    name: 'Kevin Zhang',
    role_title: '4th Year Systems • Open Source Kernel Contributor',
    department: 'Computer Engineering',
    bio: 'Focuses on core CS fundamentals: OS internals, network sockets, compilers, and low-latency programming.',
    skills: ['C++', 'Linux Kernel', 'Concurrency', 'Networks'],
    expertise: ['Core CS Fundamentals', 'Low-Level Coding', 'System Debugging'],
    availability: 'available',
    rating: 4.85,
    sessions_count: 15,
  },
];

let fallbackRequests: MentorshipRequest[] = [
  {
    id: 'req-seed-01',
    mentor_id: 'mentor-1',
    mentor_name: 'Sarah Lin',
    student_id: 'STU-2026-0842',
    student_name: 'Alex Rivera',
    topic: 'Graph Shortest Path & Detour Routing Prep',
    message: 'Hi Sarah, I would love to schedule a mock session focusing on Dijkstra edge constraints and system design.',
    status: 'accepted',
    created_at: '2026-10-28 14:30:00',
  },
];

let fallbackResources: AcademicResource[] = [
  {
    id: 'res-01',
    title: 'CS301: Advanced Data Structures & Graph Algorithms Notes',
    subject: 'Algorithms',
    resource_type: 'Lecture Notes',
    tags: ['Graphs', 'Dijkstra', 'Trees', 'Dynamic Programming'],
    description: 'Comprehensive semester lecture notes covering adjacency representations, shortest path algorithms, and NP-completeness.',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-notes/',
    is_placeholder: false,
    uploaded_by: 'Prof. Kelling (Dept Chair)',
    created_at: '2026-10-15 10:00:00',
    downloads_count: 342,
  },
  {
    id: 'res-02',
    title: 'CS302: Operating Systems Final Examination Question Papers (2023-2025)',
    subject: 'Operating Systems',
    resource_type: 'Question Paper',
    tags: ['PYQ', 'Concurrency', 'Virtual Memory', 'Semaphores'],
    description: 'Archived mid-term and end-semester university examination papers with detailed solutions and rubric breakdowns.',
    url: 'https://cs.stanford.edu/people/eroberts/courses/cs106b/',
    is_placeholder: false,
    uploaded_by: 'Academic Affairs Archive',
    created_at: '2026-10-18 11:20:00',
    downloads_count: 512,
  },
  {
    id: 'res-03',
    title: 'CS303: Database Normalization & B+ Tree Indexing Practice Set',
    subject: 'Database Systems',
    resource_type: 'Practice Exercise',
    tags: ['B-Trees', 'SQL', 'Transactions', 'ACID'],
    description: 'Curated problem set containing 25 normalization proofs (3NF, BCNF) and B+ tree insertion/deletion drill problems.',
    url: 'placeholder://university-resources/db-exercises-sheet.pdf',
    is_placeholder: true,
    uploaded_by: 'Sarah Lin (Peer Mentor)',
    created_at: '2026-10-20 16:45:00',
    downloads_count: 189,
  },
  {
    id: 'res-04',
    title: 'CS304: Computer Networks Socket Programming & RFC Reference Guide',
    subject: 'Computer Networks',
    resource_type: 'Reference Guide',
    tags: ['TCP/IP', 'Sockets', 'HTTP/3', 'Flow Control'],
    description: 'Practical laboratory reference guide detailing POSIX socket programming, packet headers, and sliding window protocols.',
    url: 'placeholder://university-resources/networks-socket-lab.pdf',
    is_placeholder: true,
    uploaded_by: 'Kevin Zhang (Peer Mentor)',
    created_at: '2026-10-22 09:15:00',
    downloads_count: 214,
  },
  {
    id: 'res-05',
    title: 'CS305: Distributed Consensus Protocols (Raft & Paxos Simplified)',
    subject: 'Algorithms',
    resource_type: 'Lecture Notes',
    tags: ['Distributed Systems', 'Raft', 'Consensus', 'Fault Tolerance'],
    description: 'Visual step-by-step primer on leader election, log replication, and heartbeat fault recovery in distributed systems.',
    url: 'https://pdos.csail.mit.edu/6.824/schedule.html',
    is_placeholder: false,
    uploaded_by: 'Dev Patel (Peer Mentor)',
    created_at: '2026-10-24 14:30:00',
    downloads_count: 295,
  },
  {
    id: 'res-06',
    title: 'CS306: Quantitative Aptitude Speed Drill Question Bank',
    subject: 'Aptitude',
    resource_type: 'Practice Exercise',
    tags: ['Speed Math', 'Permutations', 'Logic', 'Probability'],
    description: '100 timed aptitude questions curated from top tech campus placement screening rounds with analytical shortcuts.',
    url: 'placeholder://university-resources/aptitude-speed-drill.pdf',
    is_placeholder: true,
    uploaded_by: 'Placement Training Cell',
    created_at: '2026-10-26 18:00:00',
    downloads_count: 428,
  },
];

export const academicApi = {
  // 1. Student Profile
  async getProfile(): Promise<StudentProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/profile?student_id=STU-2026-0842`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      id: 'STU-2026-0842',
      name: 'Alex Rivera',
      student_id: 'STU-2026-0842',
      department: 'Computer Science & Engineering',
      term: 'Fall 2026 (Semester 7)',
      cgpa: 8.72,
      placement_goal: 'Full-Stack & Distributed Systems Software Engineer',
      skills: ['Python', 'TypeScript', 'React', 'FastAPI', 'Distributed Systems', 'SQL', 'Git'],
      interests: ['Cloud Systems', 'Sustainability Tech', 'Graph Theory', 'AI Engineering'],
    };
  },

  // 2. Placement Tasks
  async getTasks(): Promise<PlacementTask[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/tasks?student_id=STU-2026-0842`);
      if (res.ok) {
        const data = await res.json();
        fallbackTasks = data;
        return data;
      }
    } catch {
      // fallback
    }
    return [...fallbackTasks];
  },

  async createTask(data: { title: string; category: TaskCategory; due_date?: string }): Promise<PlacementTask> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/tasks?student_id=STU-2026-0842`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const newTask: PlacementTask = {
      id: `task-${Date.now()}`,
      student_id: 'STU-2026-0842',
      title: data.title,
      category: data.category,
      status: 'pending',
      due_date: data.due_date,
      created_at: new Date().toISOString(),
    };
    fallbackTasks.push(newTask);
    return newTask;
  },

  async updateTask(taskId: string, updates: Partial<PlacementTask>): Promise<PlacementTask> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const idx = fallbackTasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      fallbackTasks[idx] = { ...fallbackTasks[idx], ...updates };
      return fallbackTasks[idx];
    }
    throw new Error('Task not found');
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/academic/tasks/${taskId}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    fallbackTasks = fallbackTasks.filter(t => t.id !== taskId);
  },

  async getPlacementProgress(): Promise<PlacementProgress> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/progress?student_id=STU-2026-0842`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const total = fallbackTasks.length;
    const completed = fallbackTasks.filter(t => t.status === 'completed').length;
    const pct = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

    const categories: TaskCategory[] = ['DSA', 'Development', 'CS Fundamentals', 'Aptitude', 'Interview Prep'];
    const byCategory: any = {};
    for (const cat of categories) {
      const catTasks = fallbackTasks.filter(t => t.category === cat);
      const catCompleted = catTasks.filter(t => t.status === 'completed').length;
      byCategory[cat] = {
        total: catTasks.length,
        completed: catCompleted,
        percent: catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 1000) / 10 : 0,
      };
    }

    return {
      total_tasks: total,
      completed_tasks: completed,
      completion_percentage: pct,
      tasks_by_category: byCategory,
    };
  },

  // 3. Peer Mentors
  async getMentors(query?: string, availability?: string): Promise<PeerMentor[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (availability && availability !== 'all') params.append('availability', availability);
      const res = await fetch(`${API_BASE_URL}/academic/mentors?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    return fallbackMentors.filter(m => {
      if (availability && availability !== 'all' && m.availability !== availability) return false;
      if (query) {
        const q = query.toLowerCase();
        const matches = 
          m.name.toLowerCase().includes(q) ||
          m.bio.toLowerCase().includes(q) ||
          m.skills.some(s => s.toLowerCase().includes(q)) ||
          m.expertise.some(e => e.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  },

  // 4. Mentorship Requests
  async getMentorshipRequests(studentId?: string, mentorId?: string): Promise<MentorshipRequest[]> {
    try {
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId);
      if (mentorId) params.append('mentor_id', mentorId);
      const res = await fetch(`${API_BASE_URL}/academic/mentorship-requests?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [...fallbackRequests];
  },

  async createMentorshipRequest(data: { mentor_id: string; topic: string; message: string }): Promise<MentorshipRequest> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/mentorship-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          student_id: 'STU-2026-0842',
          student_name: 'Alex Rivera',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to submit mentorship request');
      }
      return await res.json();
    } catch (e: any) {
      if (e.message && e.message.includes('already have an active pending mentorship request')) {
        throw e;
      }
      // fallback check
      const existing = fallbackRequests.find(r => r.mentor_id === data.mentor_id && r.status === 'pending');
      if (existing) {
        throw new Error('You already have an active pending mentorship request with this mentor.');
      }
      const mentor = fallbackMentors.find(m => m.id === data.mentor_id);
      const newReq: MentorshipRequest = {
        id: `req-${Date.now()}`,
        mentor_id: data.mentor_id,
        mentor_name: mentor ? mentor.name : 'Peer Mentor',
        student_id: 'STU-2026-0842',
        student_name: 'Alex Rivera',
        topic: data.topic,
        message: data.message,
        status: 'pending',
        created_at: new Date().toLocaleString(),
      };
      fallbackRequests.unshift(newReq);
      return newReq;
    }
  },

  async updateMentorshipRequestStatus(requestId: string, status: 'accepted' | 'declined'): Promise<MentorshipRequest> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/mentorship-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const idx = fallbackRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      fallbackRequests[idx].status = status;
      return fallbackRequests[idx];
    }
    throw new Error('Request not found');
  },

  // 5. Academic Resources
  async getResources(query?: string, subject?: string, resourceType?: string): Promise<AcademicResource[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (subject && subject !== 'all') params.append('subject', subject);
      if (resourceType && resourceType !== 'all') params.append('resource_type', resourceType);
      const res = await fetch(`${API_BASE_URL}/academic/resources?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    return fallbackResources.filter(r => {
      if (subject && subject !== 'all' && r.subject.toLowerCase() !== subject.toLowerCase()) return false;
      if (resourceType && resourceType !== 'all' && r.resource_type.toLowerCase() !== resourceType.toLowerCase()) return false;
      if (query) {
        const q = query.toLowerCase();
        const matches = 
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  },

  async createResource(data: {
    title: string;
    subject: string;
    resource_type: string;
    tags: string[];
    description: string;
    url?: string;
  }): Promise<AcademicResource> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const isPlaceholder = !data.url || !data.url.startsWith('http');
    const newRes: AcademicResource = {
      id: `res-${Date.now()}`,
      title: data.title,
      subject: data.subject,
      resource_type: data.resource_type as any,
      tags: data.tags,
      description: data.description,
      url: data.url && data.url.startsWith('http') ? data.url : `placeholder://campus-repository/${Date.now()}.pdf`,
      is_placeholder: isPlaceholder,
      uploaded_by: 'Alex Rivera (Student)',
      created_at: new Date().toISOString(),
      downloads_count: 0,
    };
    fallbackResources.unshift(newRes);
    return newRes;
  },

  async downloadResource(resourceId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/resources/${resourceId}/download`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const r = fallbackResources.find(res => res.id === resourceId);
    if (r) {
      r.downloads_count += 1;
      return { status: 'success', downloads_count: r.downloads_count, url: r.url, is_placeholder: r.is_placeholder };
    }
  },

  // 6. Activities / Notifications
  async getActivities(): Promise<ActivityNotification[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/activities`);
      if (res.ok) {
        const rows = await res.json();
        return rows.map((r: any) => ({
          id: r.id,
          module: r.module,
          title: r.title,
          timestamp: r.timestamp,
          type: r.event_type,
          read: r.is_read,
        }));
      }
    } catch {
      // fallback
    }
    return [];
  },
};
