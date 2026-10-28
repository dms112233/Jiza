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
  deadline: string | null;
  startDate: string | null;
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

export type DeadlineStatus = 'overdue' | 'due_soon' | 'normal' | 'none';

export function getDeadlineStatus(deadline: string | null): DeadlineStatus {
  if (!deadline) return 'none';
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 2) return 'due_soon';
  return 'normal';
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
