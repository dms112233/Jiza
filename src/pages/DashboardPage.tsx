import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

export default function DashboardPage() {
  const { currentUser, projects, tasks, users } = useStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myInProgress = myTasks.filter(t => t.status === 'in_progress');
  const myTodo = myTasks.filter(t => t.status === 'todo');
  const totalDone = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Вот обзор вашей работы на сегодня</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-tasks text-blue-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
                <p className="text-xs text-gray-500">Мои задачи</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-spinner text-amber-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{myInProgress.length}</p>
                <p className="text-xs text-gray-500">В работе</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalDone}</p>
                <p className="text-xs text-gray-500">Завершено</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-pie text-purple-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Прогресс</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My tasks in progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">🔥 В работе</h2>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{myInProgress.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {myInProgress.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Нет задач в работе</p>
              ) : (
                myInProgress.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <button
                      key={task.id}
                      onClick={() => navigate(`/board/${task.projectId}`)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-start gap-3"
                    >
                      <span>{task.type === 'bug' ? '🐛' : task.type === 'story' ? '📗' : task.type === 'epic' ? '⚡' : '✅'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {project?.key}
                          {task.deadline && ` • 📅 ${new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Todo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">📋 К выполнению</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{myTodo.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {myTodo.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Нет задач к выполнению</p>
              ) : (
                myTodo.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <button
                      key={task.id}
                      onClick={() => navigate(`/board/${task.projectId}`)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-start gap-3"
                    >
                      <span>{task.type === 'bug' ? '🐛' : task.type === 'story' ? '📗' : task.type === 'epic' ? '⚡' : '✅'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {project?.key}
                          {task.deadline && ` • 📅 ${new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">📁 Проекты</h2>
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Все проекты →
              </button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {projects.map(project => {
                  const projectTasks = tasks.filter(t => t.projectId === project.id);
                  const doneTasks = projectTasks.filter(t => t.status === 'done').length;
                  return (
                    <button
                      key={project.id}
                      onClick={() => navigate(`/board/${project.id}`)}
                      className="text-left p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: project.color + '20', color: project.color }}>
                          {project.key}
                        </div>
                        <h3 className="font-medium text-gray-800 text-sm truncate">{project.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${projectTasks.length > 0 ? (doneTasks / projectTasks.length) * 100 : 0}%`, backgroundColor: project.color }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{doneTasks}/{projectTasks.length}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
