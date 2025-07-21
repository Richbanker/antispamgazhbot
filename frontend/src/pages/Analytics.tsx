import React, { useState, useEffect } from 'react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('24h');
  const [data, setData] = useState({
    messagesChart: [120, 150, 80, 200, 170, 190, 160, 140, 180, 220, 190, 170],
    spamDetection: [5, 8, 3, 12, 7, 9, 6, 4, 10, 15, 8, 6],
    userActivity: [45, 67, 89, 123, 156, 134, 178, 145, 167, 189, 201, 178]
  });

  const StatBox = ({ title, value, change, icon, color }: any) => (
    <div className={`cyber-card bg-black/80 backdrop-blur-sm border border-${color}-500/50 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-${color}-400 text-lg`}>{icon}</div>
        <div className={`text-xs font-mono ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      </div>
      <div className={`text-2xl font-mono font-bold text-${color}-400 mb-1`}>
        {value}
      </div>
      <div className={`text-xs font-mono text-${color}-300/70 uppercase`}>
        {title}
      </div>
    </div>
  );

  const ChartBar = ({ value, max, color, label }: any) => (
    <div className="flex flex-col items-center space-y-1">
      <div className="h-32 w-6 bg-gray-800 rounded-sm relative overflow-hidden">
        <div 
          className={`absolute bottom-0 w-full bg-gradient-to-t from-${color}-600 to-${color}-400 transition-all duration-1000`}
          style={{ height: `${(value / max) * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 animate-pulse"></div>
        </div>
      </div>
      <div className="text-xs font-mono text-gray-400">{label}</div>
    </div>
  );

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-mono font-bold text-green-400 mb-2 glitch-text">
                АНАЛИТИЧЕСКАЯ МАТРИЦА
              </h1>
              <div className="text-cyan-300 font-mono text-sm">
                ГЛУБОКИЙ АНАЛИЗ ДАННЫХ СИСТЕМЫ
              </div>
            </div>
            
            <div className="flex space-x-2">
              {['1h', '24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 font-mono text-sm rounded border transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-green-600 border-green-400 text-black'
                      : 'bg-black/50 border-green-500/50 text-green-300 hover:border-green-400'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatBox
            title="ВСЕГО СООБЩЕНИЙ"
            value="2,847"
            change={12.5}
            icon="💬"
            color="green"
          />
          <StatBox
            title="СПАМ ЗАБЛОКИРОВАН"
            value="156"
            change={-8.2}
            icon="🛡️"
            color="red"
          />
          <StatBox
            title="АКТИВНЫХ ПОЛЬЗОВАТЕЛЕЙ"
            value="1,234"
            change={5.7}
            icon="👥"
            color="blue"
          />
          <StatBox
            title="ТОЧНОСТЬ ИИ"
            value="94.2%"
            change={2.1}
            icon="🎯"
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Messages Chart */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-green-500/50 rounded-lg p-6">
            <h2 className="text-xl font-mono font-bold text-green-400 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              АКТИВНОСТЬ СООБЩЕНИЙ
            </h2>
            <div className="flex items-end justify-between space-x-2 h-40">
              {data.messagesChart.map((value, index) => (
                <ChartBar
                  key={index}
                  value={value}
                  max={Math.max(...data.messagesChart)}
                  color="green"
                  label={`${index * 2}:00`}
                />
              ))}
            </div>
          </div>

          {/* Spam Detection Chart */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-red-500/50 rounded-lg p-6">
            <h2 className="text-xl font-mono font-bold text-red-400 mb-4 flex items-center">
              <span className="mr-2">🚨</span>
              ОБНАРУЖЕНИЕ УГРОЗ
            </h2>
            <div className="flex items-end justify-between space-x-2 h-40">
              {data.spamDetection.map((value, index) => (
                <ChartBar
                  key={index}
                  value={value}
                  max={Math.max(...data.spamDetection)}
                  color="red"
                  label={`${index * 2}:00`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Users */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-blue-500/50 rounded-lg p-6">
            <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center">
              <span className="mr-2">👑</span>
              ТОП ПОЛЬЗОВАТЕЛИ
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Agent_007', messages: 342, level: 'VIP' },
                { name: 'CyberNinja', messages: 287, level: 'Verified' },
                { name: 'DataMiner', messages: 234, level: 'Active' },
                { name: 'CodeBreaker', messages: 198, level: 'Newbie' }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <div>
                    <div className="font-mono text-blue-300">{user.name}</div>
                    <div className="text-xs text-blue-400/70">{user.level}</div>
                  </div>
                  <div className="text-blue-400 font-mono">{user.messages}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Types */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-yellow-500/50 rounded-lg p-6">
            <h2 className="text-xl font-mono font-bold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              ТИПЫ УГРОЗ
            </h2>
            <div className="space-y-3">
              {[
                { type: 'Спам реклама', count: 45, percent: 65 },
                { type: 'Мошенничество', count: 23, percent: 35 },
                { type: 'Флуд', count: 18, percent: 28 },
                { type: 'Оффтопик', count: 12, percent: 18 }
              ].map((threat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-yellow-300">{threat.type}</span>
                    <span className="text-yellow-400">{threat.count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000"
                      style={{ width: `${threat.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Performance */}
          <div className="cyber-card bg-black/80 backdrop-blur-sm border border-purple-500/50 rounded-lg p-6">
            <h2 className="text-xl font-mono font-bold text-purple-400 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              ПРОИЗВОДИТЕЛЬНОСТЬ
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-mono text-purple-300 mb-2">
                  <span>СКОРОСТЬ ОБРАБОТКИ</span>
                  <span>847 мс</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full w-3/4"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-mono text-purple-300 mb-2">
                  <span>ТОЧНОСТЬ ИИ</span>
                  <span>94.2%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full w-5/6"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-mono text-purple-300 mb-2">
                  <span>ВРЕМЯ ОТКЛИКА</span>
                  <span>23 мс</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
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
      `}</style>
    </div>
  );
} 