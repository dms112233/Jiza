import { User, Project, Task, Comment, TaskStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Demo data
const demoUsers: User[] = [
  { id: 'u1', email: 'admin@taskflow.ru', name: 'Алексей Петров', avatar: '👨‍💻', role: 'admin', createdAt: '2024-01-01' },
  { id: 'u2', email: 'dev@taskflow.ru', name: 'Мария Иванова', avatar: '👩‍💼', role: 'member', createdAt: '2024-01-05' },
  { id: 'u3', email: 'design@taskflow.ru', name: 'Дмитрий Козлов', avatar: '👨‍🎨', role: 'member', createdAt: '2024-01-10' },
  { id: 'u4', email: 'qa@taskflow.ru', name: 'Елена Смирнова', avatar: '👩‍🔬', role: 'viewer', createdAt: '2024-02-01' },
];

const demoProjects: Project[] = [
  { id: 'p1', name: 'TaskFlow Platform', key: 'TF', description: 'Основная платформа управления задачами', ownerId: 'u1', members: ['u1', 'u2', 'u3', 'u4'], createdAt: '2024-01-01', color: '#0052CC' },
  { id: 'p2', name: 'Mobile App', key: 'MA', description: 'Мобильное приложение для трекинга задач', ownerId: 'u1', members: ['u1', 'u2', 'u3'], createdAt: '2024-02-01', color: '#00875A' },
  { id: 'p3', name: 'API Gateway', key: 'AG', description: 'API шлюз для микросервисной архитектуры', ownerId: 'u2', members: ['u1', 'u2'], createdAt: '2024-03-01', color: '#FF5630' },
];

const demoTasks: Task[] = [
  { id: 't1', projectId: 'p1', title: 'Настроить CI/CD пайплайн', description: 'Настроить автоматическую сборку и деплой через GitHub Actions', status: 'done', priority: 'high', type: 'task', assigneeId: 'u2', reporterId: 'u1', storyPoints: 5, labels: ['devops'], createdAt: '2024-01-15', updatedAt: '2024-01-20', order: 0 },
  { id: 't2', projectId: 'p1', title: 'Дизайн Kanban доски', description: 'Создать макет Kanban доски в Figma', status: 'done', priority: 'medium', type: 'story', assigneeId: 'u3', reporterId: 'u1', storyPoints: 8, labels: ['design', 'ui'], createdAt: '2024-01-10', updatedAt: '2024-01-18', order: 1 },
  { id: 't3', projectId: 'p1', title: 'Реализовать drag & drop', description: 'Добавить перетаскивание задач между колонками', status: 'in_progress', priority: 'high', type: 'task', assigneeId: 'u2', reporterId: 'u1', storyPoints: 13, labels: ['frontend'], createdAt: '2024-02-01', updatedAt: '2024-02-05', order: 0 },
  { id: 't4', projectId: 'p1', title: 'Авторизация пользователей', description: 'JWT токены, refresh tokens, middleware', status: 'in_progress', priority: 'highest', type: 'story', assigneeId: 'u2', reporterId: 'u1', storyPoints: 8, labels: ['backend', 'security'], createdAt: '2024-02-03', updatedAt: '2024-02-07', order: 1 },
  { id: 't5', projectId: 'p1', title: 'REST API для проектов', description: 'CRUD операции для проектов и задач', status: 'review', priority: 'high', type: 'task', assigneeId: 'u2', reporterId: 'u1', storyPoints: 5, labels: ['backend'], createdAt: '2024-02-05', updatedAt: '2024-02-10', order: 0 },
  { id: 't6', projectId: 'p1', title: 'Интеграция с PostgreSQL', description: 'Настроить подключение к БД, миграции', status: 'todo', priority: 'highest', type: 'task', assigneeId: 'u2', reporterId: 'u1', storyPoints: 3, labels: ['backend', 'database'], createdAt: '2024-02-08', updatedAt: '2024-02-08', order: 0 },
  { id: 't7', projectId: 'p1', title: 'Оптимизация запросов', description: 'Добавить индексы и оптимизировать медленные запросы', status: 'backlog', priority: 'low', type: 'task', assigneeId: null, reporterId: 'u1', storyPoints: 5, labels: ['performance'], createdAt: '2024-02-10', updatedAt: '2024-02-10', order: 0 },
  { id: 't8', projectId: 'p1', title: 'Кнопка не работает на Safari', description: 'При нажатии на кнопку "Создать задачу" в Safari ничего не происходит', status: 'todo', priority: 'high', type: 'bug', assigneeId: 'u3', reporterId: 'u4', storyPoints: 2, labels: ['bug', 'frontend'], createdAt: '2024-02-12', updatedAt: '2024-02-12', order: 1 },
  { id: 't9', projectId: 'p1', title: 'Добавить тёмную тему', description: 'Реализовать переключение между светлой и тёмной темой', status: 'backlog', priority: 'medium', type: 'story', assigneeId: null, reporterId: 'u3', storyPoints: 8, labels: ['ui', 'frontend'], createdAt: '2024-02-15', updatedAt: '2024-02-15', order: 1 },
  { id: 't10', projectId: 'p1', title: 'Написать документацию API', description: 'Swagger/OpenAPI спецификация для всех эндпоинтов', status: 'backlog', priority: 'medium', type: 'task', assigneeId: null, reporterId: 'u1', storyPoints: 5, labels: ['docs'], createdAt: '2024-02-18', updatedAt: '2024-02-18', order: 2 },
  // Mobile App tasks
  { id: 't11', projectId: 'p2', title: 'Дизайн мобильного UI', description: 'Создать дизайн экранов мобильного приложения', status: 'in_progress', priority: 'high', type: 'story', assigneeId: 'u3', reporterId: 'u1', storyPoints: 13, labels: ['design', 'mobile'], createdAt: '2024-02-01', updatedAt: '2024-02-10', order: 0 },
  { id: 't12', projectId: 'p2', title: 'Настроить React Native', description: 'Инициализировать проект и настроить навигацию', status: 'done', priority: 'medium', type: 'task', assigneeId: 'u2', reporterId: 'u1', storyPoints: 5, labels: ['mobile'], createdAt: '2024-02-01', updatedAt: '2024-02-03', order: 0 },
  { id: 't13', projectId: 'p2', title: 'Push уведомления', description: 'Интеграция с Firebase Cloud Messaging', status: 'todo', priority: 'high', type: 'task', assigneeId: 'u2', reporterId: 'u1', storyPoints: 8, labels: ['mobile', 'backend'], createdAt: '2024-02-10', updatedAt: '2024-02-10', order: 0 },
];

const demoComments: Comment[] = [
  { id: 'c1', taskId: 't3', authorId: 'u2', content: 'Использую @dnd-kit для реализации. Работает отлично!', createdAt: '2024-02-06' },
  { id: 'c2', taskId: 't3', authorId: 'u1', content: 'Отлично! Не забудь про accessibility.', createdAt: '2024-02-07' },
  { id: 'c3', taskId: 't4', authorId: 'u2', content: 'JWT + refresh tokens готовы. Тестирую middleware.', createdAt: '2024-02-08' },
];

// Store
interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'taskflow_state';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return {
    currentUser: null,
    users: demoUsers,
    projects: demoProjects,
    tasks: demoTasks,
    comments: demoComments,
    isAuthenticated: false,
  };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let listeners: (() => void)[] = [];

function notify() {
  saveState(state);
  listeners.forEach(l => l());
}

export const store = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  },

  // Auth
  login: (email: string, _password: string) => {
    const user = state.users.find(u => u.email === email);
    if (user) {
      state = { ...state, currentUser: user, isAuthenticated: true };
      notify();
      return true;
    }
    return false;
  },

  logout: () => {
    state = { ...state, currentUser: null, isAuthenticated: false };
    notify();
  },

  // Users
  addUser: (name: string, email: string, role: 'admin' | 'member' | 'viewer') => {
    const user: User = {
      id: uuidv4(),
      name,
      email,
      role,
      avatar: '👤',
      createdAt: new Date().toISOString(),
    };
    state = { ...state, users: [...state.users, user] };
    notify();
    return user;
  },

  // Projects
  createProject: (name: string, key: string, description: string) => {
    const project: Project = {
      id: uuidv4(),
      name,
      key,
      description,
      ownerId: state.currentUser!.id,
      members: [state.currentUser!.id],
      createdAt: new Date().toISOString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    };
    state = { ...state, projects: [...state.projects, project] };
    notify();
    return project;
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    state = { ...state, projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p) };
    notify();
  },

  deleteProject: (id: string) => {
    state = {
      ...state,
      projects: state.projects.filter(p => p.id !== id),
      tasks: state.tasks.filter(t => t.projectId !== id),
    };
    notify();
  },

  addMemberToProject: (projectId: string, userId: string) => {
    state = {
      ...state,
      projects: state.projects.map(p =>
        p.id === projectId && !p.members.includes(userId)
          ? { ...p, members: [...p.members, userId] }
          : p
      ),
    };
    notify();
  },

  // Tasks
  createTask: (projectId: string, title: string, type: Task['type'], priority: Task['priority']) => {
    const projectTasks = state.tasks.filter(t => t.projectId === projectId && t.status === 'backlog');
    const task: Task = {
      id: uuidv4(),
      projectId,
      title,
      description: '',
      status: 'backlog',
      priority,
      type,
      assigneeId: null,
      reporterId: state.currentUser!.id,
      storyPoints: 0,
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: projectTasks.length,
    };
    state = { ...state, tasks: [...state.tasks, task] };
    notify();
    return task;
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    state = {
      ...state,
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    };
    notify();
  },

  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    state = {
      ...state,
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus, order: newOrder, updatedAt: new Date().toISOString() } : t
      ),
    };
    notify();
  },

  deleteTask: (id: string) => {
    state = {
      ...state,
      tasks: state.tasks.filter(t => t.id !== id),
      comments: state.comments.filter(c => c.taskId !== id),
    };
    notify();
  },

  // Comments
  addComment: (taskId: string, content: string) => {
    const comment: Comment = {
      id: uuidv4(),
      taskId,
      authorId: state.currentUser!.id,
      content,
      createdAt: new Date().toISOString(),
    };
    state = { ...state, comments: [...state.comments, comment] };
    notify();
    return comment;
  },

  resetToDemo: () => {
    state = {
      currentUser: null,
      users: demoUsers,
      projects: demoProjects,
      tasks: demoTasks,
      comments: demoComments,
      isAuthenticated: false,
    };
    notify();
  },
};
