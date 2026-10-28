import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useStore } from '../hooks/useStore';
import { STATUS_COLUMNS, PRIORITY_COLORS, TYPE_ICONS, getDeadlineStatus, formatDeadline, type Task, type TaskStatus, type TaskType, type TaskPriority } from '../types';
import TaskModal from '../components/TaskModal';

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] rounded-xl transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
      }`}
    >
      {children}
    </div>
  );
}

function InlineTaskForm({
  status,
  onClose,
  onCreate,
}: {
  status: TaskStatus;
  onClose: () => void;
  onCreate: (title: string, description: string, type: TaskType, priority: TaskPriority, deadline: string | null, startDate: string | null, assigneeId: string | null, labels: string[]) => void;
}) {
  const { users, projects } = useStore();
  const { projectId } = useParams<{ projectId: string }>();
  const project = projects.find(p => p.id === projectId);
  const projectMembers = project ? users.filter(u => project.members.includes(u.id)) : [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('task');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [assigneeId, setAssigneeId] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(
        title.trim(),
        description.trim(),
        type,
        priority,
        deadline || null,
        startDate || null,
        assigneeId || null,
        labels
      );
      setTitle('');
      setDescription('');
      setType('task');
      setPriority('medium');
      setDeadline('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setAssigneeId('');
      setLabels([]);
      setShowOptions(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-3 shadow-md border border-blue-200 animate-in fade-in"
      onClick={e => e.stopPropagation()}
    >
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose();
        }}
        placeholder="Введите название задачи..."
        className="w-full text-sm font-medium text-gray-800 placeholder-gray-400 outline-none resize-none mb-2"
      />

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose();
        }}
        placeholder="Добавьте описание задачи..."
        rows={2}
        className="w-full text-xs text-gray-600 placeholder-gray-400 outline-none resize-none mb-2 p-2 bg-gray-50 rounded border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-500"
      />

      {showOptions && (
        <div className="space-y-2 mb-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <select
              value={type}
              onChange={e => setType(e.target.value as TaskType)}
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="task">✅ Задача</option>
              <option value="story">📗 История</option>
              <option value="bug">🐛 Баг</option>
              <option value="epic">⚡ Эпик</option>
            </select>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="lowest">🔽 Низший</option>
              <option value="low">⬇️ Низкий</option>
              <option value="medium">➡️ Средний</option>
              <option value="high">⬆️ Высокий</option>
              <option value="highest">🔼 Критический</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none flex-1"
              placeholder="Дедлайн"
            />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none flex-1"
              placeholder="Дата начала"
            />
          </div>

          <select
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white w-full"
          >
            <option value="">Исполнитель не назначен</option>
            {projectMembers.map(u => (
              <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              placeholder="Добавить тег..."
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none flex-1"
            />
            <button
              type="button"
              onClick={handleAddLabel}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
            >
              +
            </button>
          </div>

          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {labels.map(label => (
                <span key={label} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1">
                  #{label}
                  <button
                    type="button"
                    onClick={() => setLabels(labels.filter(l => l !== label))}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <i className={`fas ${showOptions ? 'fa-eye-slash' : 'fa-sliders-h'}`}></i>
          {showOptions ? 'Скрыть' : 'Подробнее'}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Создать
          </button>
        </div>
      </div>
    </form>
  );
}

function DraggableCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { users } = useStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const assignee = users.find(u => u.id === task.assigneeId);
  const deadlineStatus = getDeadlineStatus(task.deadline);

  const deadlineBadge = () => {
    if (!task.deadline) return null;
    const colors = {
      overdue: 'bg-red-100 text-red-700',
      due_soon: 'bg-amber-100 text-amber-700',
      normal: 'bg-gray-100 text-gray-600',
      none: '',
    };
    const icons = {
      overdue: '⚠️',
      due_soon: '⏰',
      normal: '📅',
      none: '',
    };
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${colors[deadlineStatus]} flex items-center gap-1`}>
        <span>{icons[deadlineStatus]}</span>
        <span>{formatDeadline(task.deadline)}</span>
      </span>
    );
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${deadlineStatus === 'overdue' ? 'border-l-4 border-l-red-400' : deadlineStatus === 'due_soon' ? 'border-l-4 border-l-amber-400' : ''}`}
    >
      <div className="flex items-start gap-2 mb-1">
        <span className="text-sm">{TYPE_ICONS[task.type]}</span>
        <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{task.title}</p>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2 pl-6 leading-relaxed">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center gap-2 flex-wrap pl-6">
        {task.labels.slice(0, 2).map(label => (
          <span key={label} className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
            {label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
            title={task.priority}
          ></div>
          {deadlineBadge()}
        </div>
        {assignee && (
          <span className="text-sm" title={assignee.name}>
            {assignee.avatar}
          </span>
        )}
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, tasks, users, currentUser, moveTask, updateTask, createTask } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);

  const project = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Проект не найден</p>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = projectTasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const columnTasks = projectTasks.filter(t => t.status === newStatus);
    const newOrder = columnTasks.length;

    moveTask(taskId, newStatus, newOrder);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: project.color + '20', color: project.color }}
            >
              {project.key}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
              <p className="text-xs text-gray-500">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map(memberId => {
                const user = users.find(u => u.id === memberId);
                return user ? (
                  <span key={memberId} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white" title={user.name}>
                    {user.avatar}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max">
            {STATUS_COLUMNS.map(column => {
              const columnTasks = projectTasks
                .filter(t => t.status === column.id)
                .sort((a, b) => a.order - b.order);
              const isAdding = addingToColumn === column.id;

              return (
                <DroppableColumn key={column.id} id={column.id}>
                  <div className="p-3">
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }}></div>
                        <h3 className="text-sm font-semibold text-gray-700">{column.title}</h3>
                        <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setAddingToColumn(isAdding ? null : column.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition ${
                          isAdding
                            ? 'bg-blue-100 text-blue-600 rotate-45'
                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Добавить задачу"
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2 min-h-[100px]">
                      {columnTasks.map(task => (
                        <DraggableCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedTask(task)}
                        />
                      ))}

                      {/* Inline add form */}
                      {isAdding && (
                        <InlineTaskForm
                          status={column.id}
                          onClose={() => setAddingToColumn(null)}
                          onCreate={(title, description, type, priority, deadline, startDate, assigneeId, labels) => {
                            createTask(project!.id, title, type, priority, column.id, {
                              description,
                              deadline,
                              startDate,
                              assigneeId,
                              labels,
                            });
                          }}
                        />
                      )}

                      {/* Add button at the bottom */}
                      {!isAdding && (
                        <button
                          onClick={() => setAddingToColumn(column.id)}
                          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition flex items-center justify-center gap-2 border border-dashed border-gray-200 hover:border-gray-300"
                        >
                          <i className="fas fa-plus text-xs"></i>
                          <span>Добавить задачу</span>
                        </button>
                      )}
                    </div>
                  </div>
                </DroppableColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white rounded-lg p-3 shadow-xl border border-blue-200 rotate-2 max-w-[280px]">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-sm">{TYPE_ICONS[activeTask.type]}</span>
                  <p className="text-sm font-medium text-gray-800">{activeTask.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[activeTask.priority] }}></div>
                  {activeTask.deadline && (
                    <span className="text-xs text-gray-500">📅 {formatDeadline(activeTask.deadline)}</span>
                  )}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
