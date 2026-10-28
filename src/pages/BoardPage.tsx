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
import { STATUS_COLUMNS, PRIORITY_COLORS, TYPE_ICONS, type Task, type TaskStatus } from '../types';
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

function DraggableCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-sm">{TYPE_ICONS[task.type]}</span>
        <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{task.title}</p>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
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
          {task.storyPoints > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {task.storyPoints} SP
            </span>
          )}
        </div>
        {task.assigneeId && (
          <span className="text-sm" title="Assignee">
            👤
          </span>
        )}
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, tasks, users, currentUser, moveTask, updateTask } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
                  <span className="text-xs text-gray-400">{activeTask.storyPoints} SP</span>
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
