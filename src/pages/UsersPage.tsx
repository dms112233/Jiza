import { useState } from 'react';
import { useStore } from '../hooks/useStore';

export default function UsersPage() {
  const { users, currentUser, addUser, projects } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      addUser(name, email, role);
      setShowAdd(false);
      setName('');
      setEmail('');
      setRole('member');
    }
  };

  const roleLabels = {
    admin: { label: 'Администратор', color: 'bg-red-100 text-red-700' },
    member: { label: 'Участник', color: 'bg-blue-100 text-blue-700' },
    viewer: { label: 'Наблюдатель', color: 'bg-gray-100 text-gray-700' },
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
            <p className="text-gray-500 text-sm mt-1">Управление пользователями системы</p>
          </div>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <i className="fas fa-user-plus"></i>
              Добавить пользователя
            </button>
          )}
        </div>

        {/* Add User Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Новый пользователь</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Иван Иванов"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="admin">Администратор</option>
                    <option value="member">Участник</option>
                    <option value="viewer">Наблюдатель</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    Отмена
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    Добавить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Пользователь</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Роль</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Проекты</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const userProjects = projects.filter(p => p.members.includes(user.id));
                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{user.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleLabels[user.role].color}`}>
                        {roleLabels[user.role].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {userProjects.slice(0, 3).map(p => (
                          <span key={p.id} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded" title={p.name}>
                            {p.key}
                          </span>
                        ))}
                        {userProjects.length > 3 && (
                          <span className="text-xs text-gray-400">+{userProjects.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('ru')}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
