import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

export default function ProjectsPage() {
  const { projects, tasks, users, currentUser, createProject, deleteProject } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && key) {
      const project = createProject(name, key.toUpperCase(), description);
      setShowCreate(false);
      setName('');
      setKey('');
      setDescription('');
      navigate(`/board/${project.id}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Проекты</h1>
            <p className="text-gray-500 text-sm mt-1">Управление проектами вашей команды</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Создать проект
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Новый проект</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Мой проект"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ключ (2-5 символов)</label>
                  <input
                    value={key}
                    onChange={e => setKey(e.target.value.toUpperCase().slice(0, 5))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="MP"
                    required
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Описание проекта..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    Отмена
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    Создать
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const doneTasks = projectTasks.filter(t => t.status === 'done').length;
            const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="h-2" style={{ backgroundColor: project.color }}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: project.color + '20', color: project.color }}
                      >
                        {project.key}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-xs text-gray-400">{projectTasks.length} задач</p>
                      </div>
                    </div>
                    {project.ownerId === currentUser?.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('Удалить проект?')) deleteProject(project.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Прогресс</span>
                      <span className="text-xs font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }}></div>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map(memberId => {
                        const user = users.find(u => u.id === memberId);
                        return user ? (
                          <span key={memberId} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs border-2 border-white" title={user.name}>
                            {user.avatar}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <button
                      onClick={() => navigate(`/board/${project.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Открыть →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
