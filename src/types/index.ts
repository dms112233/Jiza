export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  color: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
export type TaskType = 'story' | 'bug' | 'task' | 'epic';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId: string | null;
  reporterId: string;
  storyPoints: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export const STATUS_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Бэклог', color: '#6b7280' },
  { id: 'todo', title: 'К выполнению', color: '#3b82f6' },
  { id: 'in_progress', title: 'В работе', color: '#f59e0b' },
  { id: 'review', title: 'На ревью', color: '#8b5cf6' },
  { id: 'done', title: 'Готово', color: '#10b981' },
];

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  lowest: '#6b7280',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  highest: '#ef4444',
};

export const TYPE_ICONS: Record<TaskType, string> = {
  story: '📗',
  bug: '🐛',
  task: '✅',
  epic: '⚡',
};
