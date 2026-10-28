import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

export default function Layout() {
  const { currentUser, logout, projects } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1d21] text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <span className="font-bold text-lg">TaskFlow</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              location.pathname === '/dashboard'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fas fa-home w-4"></i>
            <span>Главная</span>
          </button>

          <button
            onClick={() => navigate('/projects')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              location.pathname === '/projects'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fas fa-folder w-4"></i>
            <span>Проекты</span>
          </button>

          <button
            onClick={() => navigate('/users')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              location.pathname === '/users'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fas fa-users w-4"></i>
            <span>Пользователи</span>
          </button>

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Проекты</p>
          </div>

          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => navigate(`/board/${project.id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                location.pathname === `/board/${project.id}`
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: project.color + '30', color: project.color }}>
                {project.key[0]}
              </div>
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-gray-400 hover:text-white transition p-1"
              title="Выйти"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
