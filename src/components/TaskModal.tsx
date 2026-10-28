import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { STATUS_COLUMNS, PRIORITY_COLORS, TYPE_ICONS, type Task, type Project, type TaskStatus, type TaskPriority, type TaskType } from '../types';

interface Props {
  task: Task;
  project: Project;
  onClose: () => void;
}

export default function TaskModal({ task, project, onClose }: Props) {
  const { users, updateTask, deleteTask, comments, addComment } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [commentText, setCommentText] = useState('');

  const assignee = users.find(u => u.id === task.assigneeId);
  const reporter = users.find(u => u.id === task.reporterId);
  const taskComments = comments.filter(c => c.taskId === task.id);
  const projectMembers = users.filter(u => project.members.includes(u.id));

  const handleSave = () => {
    updateTask(task.id, { title, description });
    setEditing(false);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(task.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleDelete = () => {
    if (confirm('Удалить задачу?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{TYPE_ICONS[task.type]}</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">{project.key}-{task.id.slice(0, 4).toUpperCase()}</p>
                {editing ? (
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="text-lg font-bold text-gray-900 border-b border-blue-300 outline-none w-full"
                  />
                ) : (
                  <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(!editing)} className="p-2 text-gray-400 hover:text-gray-600 transition">
                <i className={`fas ${editing ? 'fa-save' : 'fa-edit'}`}></i>
              </button>
              {editing && (
                <button onClick={handleSave} className="p-2 text-blue-600 hover:text-blue-700 transition">
                  <i className="fas fa-check"></i>
                </button>
              )}
              <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600 transition">
                <i className="fas fa-trash"></i>
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Описание</h3>
                {editing ? (
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Добавьте описание..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                    {task.description || 'Нет описания'}
                  </p>
                )}
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Комментарии ({taskComments.length})</h3>
                <div className="space-y-3 mb-4">
                  {taskComments.map(comment => {
                    const author = users.find(u => u.id === comment.authorId);
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <span className="text-lg">{author?.avatar || '👤'}</span>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800">{author?.name}</span>
                            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('ru')}</span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Написать комментарий..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Статус</label>
                <select
                  value={task.status}
                  onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {STATUS_COLUMNS.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Исполнитель</label>
                <select
                  value={task.assigneeId || ''}
                  onChange={e => updateTask(task.id, { assigneeId: e.target.value || null })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Не назначен</option>
                  {projectMembers.map(u => (
                    <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Приоритет</label>
                <select
                  value={task.priority}
                  onChange={e => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="lowest">🔽 Самый низкий</option>
                  <option value="low">⬇️ Низкий</option>
                  <option value="medium">➡️ Средний</option>
                  <option value="high">⬆️ Высокий</option>
                  <option value="highest">🔼 Самый высокий</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Тип</label>
                <select
                  value={task.type}
                  onChange={e => updateTask(task.id, { type: e.target.value as TaskType })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="story">📗 История</option>
                  <option value="bug">🐛 Баг</option>
                  <option value="task">✅ Задача</option>
                  <option value="epic">⚡ Эпик</option>
                </select>
              </div>

              {/* Story Points */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Story Points</label>
                <input
                  type="number"
                  value={task.storyPoints}
                  onChange={e => updateTask(task.id, { storyPoints: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  min={0}
                />
              </div>

              {/* Reporter */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Автор</label>
                <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-50 rounded-lg">
                  <span>{reporter?.avatar}</span>
                  <span className="text-sm text-gray-700">{reporter?.name}</span>
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Создано</label>
                <p className="text-sm text-gray-600 mt-1">{new Date(task.createdAt).toLocaleDateString('ru')}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Обновлено</label>
                <p className="text-sm text-gray-600 mt-1">{new Date(task.updatedAt).toLocaleDateString('ru')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
