import React, { useState } from 'react';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users] = useState([
    { id: 1, username: 'Agent_007', role: 'VIP', messages: 1234, joinDate: '2024-01-15', status: 'online', warnings: 0 },
    { id: 2, username: 'CyberNinja', role: 'Verified', messages: 856, joinDate: '2024-02-03', status: 'online', warnings: 1 },
    { id: 3, username: 'DataMiner', role: 'Active', messages: 642, joinDate: '2024-01-28', status: 'offline', warnings: 0 },
    { id: 4, username: 'CodeBreaker', role: 'Newbie', messages: 234, joinDate: '2024-03-10', status: 'online', warnings: 2 },
    { id: 5, username: 'NetHunter', role: 'Verified', messages: 789, joinDate: '2024-02-15', status: 'away', warnings: 0 },
    { id: 6, username: 'SystemGhost', role: 'VIP', messages: 1456, joinDate: '2024-01-05', status: 'online', warnings: 0 },
    { id: 7, username: 'ByteWarrior', role: 'Active', messages: 456, joinDate: '2024-02-28', status: 'offline', warnings: 1 },
    { id: 8, username: 'QuantumHack', role: 'Newbie', messages: 123, joinDate: '2024-03-15', status: 'online', warnings: 3 }
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'VIP': return 'purple';
      case 'Verified': return 'blue';
      case 'Active': return 'green';
      case 'Newbie': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'away': return 'yellow';
      case 'offline': return 'gray';
      default: return 'gray';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const UserCard = ({ user }: any) => {
    const roleColor = getRoleColor(user.role);
    const statusColor = getStatusColor(user.status);
    
    return (
      <div className="cyber-card bg-black/80 backdrop-blur-sm border border-gray-500/50 rounded-lg p-4 hover:border-green-500/70 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 bg-${statusColor}-500 rounded-full animate-pulse`}></div>
            <div>
              <div className="font-mono text-green-300 font-bold">{user.username}</div>
              <div className={`text-xs font-mono text-${roleColor}-400 uppercase`}>{user.role}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 font-mono text-sm">{user.messages}</div>
            <div className="text-xs text-gray-400">сообщений</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3">
          <span>Присоединился: {user.joinDate}</span>
          <span className={`${user.warnings > 0 ? 'text-red-400' : 'text-green-400'}`}>
            Предупреждений: {user.warnings}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-900/30 border border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-blue-200 py-2 px-3 rounded font-mono text-xs transition-all duration-300">
            ПРОФИЛЬ
          </button>
          <button className="flex-1 bg-yellow-900/30 border border-yellow-500/50 hover:border-yellow-400 text-yellow-300 hover:text-yellow-200 py-2 px-3 rounded font-mono text-xs transition-all duration-300">
            ПРЕДУПРЕДИТЬ
          </button>
          <button className="flex-1 bg-red-900/30 border border-red-500/50 hover:border-red-400 text-red-300 hover:text-red-200 py-2 px-3 rounded font-mono text-xs transition-all duration-300">
            ЗАБЛОКИРОВАТЬ
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="cyber-grid"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-black to-blue-900/10"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold text-green-400 mb-2 glitch-text">
            БАЗА ДАННЫХ АГЕНТОВ
          </h1>
          <div className="text-cyan-300 font-mono text-sm">
            УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ СИСТЕМЫ
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Search */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-green-500/50 rounded-lg p-4">
            <div className="text-green-400 font-mono text-sm mb-2 flex items-center">
              <span className="mr-2">🔍</span>
              ПОИСК АГЕНТА
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Введите имя..."
              className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-300 font-mono text-sm focus:border-green-400 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-blue-500/50 rounded-lg p-4">
            <div className="text-blue-400 font-mono text-sm mb-2 flex items-center">
              <span className="mr-2">👥</span>
              ФИЛЬТР ПО РОЛИ
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-black/50 border border-blue-500/30 rounded px-3 py-2 text-blue-300 font-mono text-sm focus:border-blue-400 focus:outline-none"
            >
              <option value="all">Все роли</option>
              <option value="VIP">VIP</option>
              <option value="Verified">Verified</option>
              <option value="Active">Active</option>
              <option value="Newbie">Newbie</option>
            </select>
          </div>

          {/* Stats */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-purple-500/50 rounded-lg p-4">
            <div className="text-purple-400 font-mono text-sm mb-2 flex items-center">
              <span className="mr-2">📊</span>
              СТАТИСТИКА
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Всего:</span>
                <span className="text-purple-300">{users.length}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Онлайн:</span>
                <span className="text-green-400">{users.filter(u => u.status === 'online').length}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">С предупреждениями:</span>
                <span className="text-red-400">{users.filter(u => u.warnings > 0).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-red-400 font-mono text-lg mb-2">АГЕНТЫ НЕ НАЙДЕНЫ</div>
            <div className="text-gray-500 font-mono text-sm">Попробуйте изменить параметры поиска</div>
          </div>
        )}
      </div>

      <style>{`
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .cyber-card {
          position: relative;
        }
        
        .cyber-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(45deg, transparent, rgba(0, 255, 136, 0.1), transparent, rgba(0, 136, 255, 0.1), transparent);
          border-radius: 8px;
          z-index: -1;
          animation: border-flow 4s linear infinite;
        }
        
        @keyframes border-flow {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        .glitch-text {
          text-shadow: 
            0 0 5px #00ff88,
            0 0 10px #00ff88,
            0 0 20px #00ff88;
          animation: text-flicker 2s infinite alternate;
        }
        
        @keyframes text-flicker {
          0% { opacity: 1; }
          98% { opacity: 1; }
          99% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 