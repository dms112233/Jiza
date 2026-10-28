import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { STATUS_COLUMNS, PRIORITY_COLORS, TYPE_ICONS, getDeadlineStatus, formatDeadline, type Task, type Project, type TaskStatus, type TaskPriority, type TaskType } from '../types';

interface Props {
  task: Task;
  project: Project;
  onClose: () => void;
}

export default function TaskModal({ task, project, onClose }: Props) {
  const { users, updateTask, deleteTask, comments, addComment } = useStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [commentText, setCommentText] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [editingDescription, setEditingDescription] = useState(!task.description);

  // Синхронизация состояния с пропсами при изменении задачи
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
  }, [task.id, task.title, task.description]);

  const assignee = users.find(u => u.id === task.assigneeId);
  const reporter = users.find(u => u.id === task.reporterId);
  const taskComments = comments.filter(c => c.taskId === task.id);
  const projectMembers = users.filter(u => project.members.includes(u.id));
  const deadlineStatus = getDeadlineStatus(task.deadline);

  const handleSaveTitle = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleSaveDescription = () => {
    if (description !== task.description) {
      updateTask(task.id, { description: description.trim() });
    }
    setEditingDescription(false);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(task.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!task?.id) return;
    deleteTask(task.id);
    onClose();
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !task.labels.includes(labelInput.trim())) {
      updateTask(task.id, { labels: [...task.labels, labelInput.trim()] });
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    updateTask(task.id, { labels: task.labels.filter(l => l !== label) });
  };

  const deadlineBadge = () => {
    if (!task.deadline) return null;
    const colors = {
      overdue: 'bg-red-100 text-red-700 border-red-200',
      due_soon: 'bg-amber-100 text-amber-700 border-amber-200',
      normal: 'bg-gray-100 text-gray-600 border-gray-200',
      none: '',
    };
    const icons = {
      overdue: '⚠️',
      due_soon: '⏰',
      normal: '📅',
      none: '',
    };
    const labels = {
      overdue: 'Просрочено',
      due_soon: 'Скоро истекает',
      normal: '',
      none: '',
    };
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${colors[deadlineStatus]}`}>
        <span>{icons[deadlineStatus]}</span>
        <span>{formatDeadline(task.deadline)}</span>
        {labels[deadlineStatus] && <span>• {labels[deadlineStatus]}</span>}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl">{TYPE_ICONS[task.type]}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-mono mb-1">{project.key}-{task.id.slice(0, 4).toUpperCase()}</p>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSaveTitle();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="text-lg font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full transition"
                  title="Нажмите, чтобы изменить название"
                />
                <p className="text-xs text-gray-400 mt-1 italic">💡 Все поля ниже можно редактировать — изменения сохраняются автоматически</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600 transition" title="Удалить задачу">
                <i className="fas fa-trash"></i>
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition" title="Закрыть">
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Описание</h3>
                  {!editingDescription && (
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <i className="fas fa-edit text-xs"></i>
                      Редактировать
                    </button>
                  )}
                </div>
                {editingDescription ? (
                  <div>
                    <textarea
                      autoFocus
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Добавьте подробное описание задачи..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveDescription}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => {
                          setDescription(task.description);
                          setEditingDescription(false);
                        }}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingDescription(true)}
                    className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[80px] cursor-pointer hover:bg-gray-100 transition"
                  >
                    {description || (
                      <span className="text-gray-400 italic">Нажмите, чтобы добавить описание...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Labels */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Теги</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {task.labels.map(label => (
                    <span key={label} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 flex items-center gap-1">
                      #{label}
                      <button
                        onClick={() => handleRemoveLabel(label)}
                        className="text-blue-400 hover:text-blue-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
                    className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleAddLabel}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                  >
                    + Добавить
                  </button>
                </div>
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

              {/* Deadline */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Дедлайн</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="date"
                    value={task.deadline || ''}
                    onChange={e => updateTask(task.id, { deadline: e.target.value || null })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {task.deadline && (
                    <button
                      onClick={() => updateTask(task.id, { deadline: null })}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      title="Убрать дедлайн"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
                {task.deadline && (
                  <div className="mt-1">{deadlineBadge()}</div>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Дата постановки</label>
                <input
                  type="date"
                  value={task.startDate || ''}
                  onChange={e => updateTask(task.id, { startDate: e.target.value || null })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
