import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 1234,
    messages: 567,
    spam: 89,
    chats: 12
  });
  
  const [isOnline, setIsOnline] = useState(true);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(67);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        messages: prev.messages + Math.floor(Math.random() * 10),
        spam: prev.spam + Math.floor(Math.random() * 2),
        chats: prev.chats + (Math.random() > 0.9 ? 1 : 0)
      }));
      
      setCpuUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(30, Math.min(85, prev + (Math.random() - 0.5) * 8)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <div className={`cyber-card bg-black/80 backdrop-blur-sm border border-${color}-500/50 rounded-lg p-6 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500 to-transparent`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className={`text-${color}-400 text-2xl`}>{icon}</div>
        <div className={`text-xs font-mono text-${color}-300 bg-${color}-900/30 px-2 py-1 rounded`}>
          {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
        </div>
      </div>
      
      <div className={`text-3xl font-mono font-bold text-${color}-400 mb-2 glitch-number`}>
        {value.toLocaleString()}
      </div>
      
      <div className={`text-sm font-mono text-${color}-300/80 uppercase tracking-wider`}>
        {title}
      </div>
      
      <div className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent`}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="cyber-grid"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-black to-blue-900/10"></div>
      </div>

      {/* Top border effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 opacity-60"></div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-mono font-bold text-green-400 mb-2 glitch-text">
                МАТРИЦА УПРАВЛЕНИЯ
              </h1>
              <div className="flex items-center space-x-4 text-sm font-mono">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2 animate-pulse`}></div>
                  <span className="text-green-300">СИСТЕМА {isOnline ? 'В СЕТИ' : 'ОТКЛЮЧЕНА'}</span>
                </div>
                <div className="text-cyan-300">
                  ВРЕМЯ РАБОТЫ: {new Date().toLocaleTimeString('ru-RU')}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-green-400 font-mono text-sm mb-1">@GuardianGazhBot</div>
              <div className="text-cyan-300 font-mono text-xs">НЕЙРОСЕТЬ АКТИВНА</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="ПОЛЬЗОВАТЕЛЕЙ ОТСЛЕЖИВАЕТСЯ" 
            value={stats.users} 
            icon="👥" 
            color="green" 
            trend={5.2} 
          />
          <StatCard 
            title="СООБЩЕНИЙ ОБРАБОТАНО" 
            value={stats.messages} 
            icon="💬" 
            color="cyan" 
            trend={12.8} 
          />
          <StatCard 
            title="УГРОЗ ЗАБЛОКИРОВАНО" 
            value={stats.spam} 
            icon="🛡️" 
            color="red" 
            trend={-2.1} 
          />
          <StatCard 
            title="АКТИВНЫХ УЗЛОВ" 
            value={stats.chats} 
            icon="🌐" 
            color="purple" 
            trend={0} 
          />
        </div>

        {/* System Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* System Resources */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-blue-500/50 rounded-lg p-6">
            <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              СИСТЕМНЫЕ РЕСУРСЫ
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-mono text-blue-300 mb-2">
                  <span>ЗАГРУЗКА ЦП</span>
                  <span>{cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 relative"
                    style={{ width: `${cpuUsage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-mono text-green-300 mb-2">
                  <span>ПАМЯТЬ</span>
                  <span>{memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-lime-400 transition-all duration-1000 relative"
                    style={{ width: `${memoryUsage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Status */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-green-500/50 rounded-lg p-6">
            <h2 className="text-xl font-mono font-bold text-green-400 mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              СТАТУС БОТА
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded border-l-4 border-green-500">
                <span className="font-mono text-green-300">ИИ АНТИ-СПАМ</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400 font-mono text-sm">АКТИВЕН</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded border-l-4 border-blue-500">
                <span className="font-mono text-blue-300">КОНТРОЛЬ ФЛУДА</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-blue-400 font-mono text-sm">ВКЛЮЧЕН</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-900/20 rounded border-l-4 border-purple-500">
                <span className="font-mono text-purple-300">СИСТЕМА РОЛЕЙ</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-purple-400 font-mono text-sm">В СЕТИ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="cyber-card bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-6">
          <h2 className="text-xl font-mono font-bold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            БЫСТРЫЕ ДЕЙСТВИЯ
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/analytics')}
              className="cyber-button bg-green-900/30 border border-green-500/50 hover:border-green-400 text-green-300 hover:text-green-200 p-4 rounded transition-all duration-300"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-mono text-sm">АНАЛИТИКА</div>
            </button>
            
            <button 
              onClick={() => navigate('/users')}
              className="cyber-button bg-blue-900/30 border border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-blue-200 p-4 rounded transition-all duration-300"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-mono text-sm">ПОЛЬЗОВАТЕЛИ</div>
            </button>
            
            <button 
              onClick={() => navigate('/users')}
              className="cyber-button bg-red-900/30 border border-red-500/50 hover:border-red-400 text-red-300 hover:text-red-200 p-4 rounded transition-all duration-300"
            >
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-mono text-sm">БЕЗОПАСНОСТЬ</div>
            </button>
            
            <button 
              onClick={() => navigate('/settings')}
              className="cyber-button bg-purple-900/30 border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:text-purple-200 p-4 rounded transition-all duration-300"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-mono text-sm">НАСТРОЙКИ</div>
            </button>
          </div>
        </div>
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
        
        .glitch-number {
          animation: number-glitch 3s infinite;
        }
        
        @keyframes number-glitch {
          0%, 90%, 100% { transform: translate(0); }
          91% { transform: translate(-2px, 0); }
          92% { transform: translate(2px, 0); }
          93% { transform: translate(-1px, 0); }
        }
        
        .cyber-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 255, 136, 0.2);
        }
      `}</style>
    </div>
  );
} 