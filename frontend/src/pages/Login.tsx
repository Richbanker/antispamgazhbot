import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [isHacking, setIsHacking] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [glitchText, setGlitchText] = useState('МОДХЕЛПЕР');

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/');
    
    // Glitch effect for title
    const glitchInterval = setInterval(() => {
      const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
      const original = 'МОДХЕЛПЕР';
      let glitched = '';
      
      for (let i = 0; i < original.length; i++) {
        if (Math.random() > 0.9) {
          glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          glitched += original[i];
        }
      }
      
      setGlitchText(glitched);
      
      setTimeout(() => setGlitchText('МОДХЕЛПЕР'), 100);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, [navigate]);

  const handleDemoLogin = () => {
    setIsHacking(true);
    
    const hackingSequence = [
      'Инициализация подключения...',
      'Обход брандмауэра...',
      'Расшифровка протоколов...',
      'Доступ к мейнфрейму...',
      'Внедрение полезной нагрузки...',
      'Аутентификация успешна!',
      'Добро пожаловать, Агент.'
    ];
    
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < hackingSequence.length) {
        setTerminalText(prev => prev + '\n> ' + hackingSequence[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          localStorage.setItem('token', 'demo-token');
          navigate('/');
        }, 1000);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-20">
        <div className="matrix-bg"></div>
      </div>
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20"></div>
      
      {/* Cyber grid lines */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-30"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-30"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {!isHacking ? (
          <div className="cyber-panel bg-black/80 backdrop-blur-sm border border-green-500/50 rounded-lg p-8 max-w-lg w-full shadow-2xl shadow-green-500/20">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-mono font-bold text-green-400 mb-2 tracking-wider glitch-text">
                {glitchText}
              </h1>
              <div className="flex items-center justify-center space-x-2 text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono">ПАНЕЛЬ УПРАВЛЕНИЯ TELEGRAM БОТОМ</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-black/60 border border-green-500/30 rounded p-4 mb-6 font-mono text-sm">
              <div className="text-green-400 mb-2 flex items-center">
                <span className="text-green-500 mr-2">●</span>
                СТАТУС СИСТЕМЫ
              </div>
              <div className="text-green-300 space-y-1 pl-4">
                <div className="flex justify-between">
                  <span>БОТ_ID:</span>
                  <span className="text-cyan-400">@GuardianGazhBot</span>
                </div>
                <div className="flex justify-between">
                  <span>СТАТУС:</span>
                  <span className="text-green-400 animate-pulse">В СЕТИ</span>
                </div>
                <div className="flex justify-between">
                  <span>БЕЗОПАСНОСТЬ:</span>
                  <span className="text-red-400">МАКСИМУМ</span>
                </div>
                <div className="flex justify-between">
                  <span>ИИ_МОДУЛЬ:</span>
                  <span className="text-yellow-400">АКТИВЕН</span>
                </div>
              </div>
            </div>

            {/* Access Buttons */}
            <div className="space-y-4">
              <button 
                onClick={handleDemoLogin}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-mono font-bold py-3 px-6 rounded border-2 border-green-400 shadow-lg shadow-green-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-green-400/70"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>⚡</span>
                  <span>НАЧАТЬ ВЗЛОМ</span>
                  <span>⚡</span>
                </span>
              </button>

              <div className="border border-blue-500/30 rounded p-4 bg-blue-900/10">
                <div className="text-blue-400 text-sm font-mono mb-2">
                  🔗 ПРЯМОЙ ДОСТУП:
                </div>
                <a 
                  href="https://t.me/GuardianGazhBot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-mono text-sm underline transition-colors"
                >
                  t.me/GuardianGazhBot
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <div className="text-xs font-mono text-gray-500 mb-2">
                РАБОТАЕТ НА НЕЙРОННЫХ СЕТЯХ
              </div>
              <div className="flex justify-center space-x-4 text-xs font-mono">
                <span className="text-green-500">REACT.JS</span>
                <span className="text-blue-500">VITE</span>
                <span className="text-purple-500">TAILWIND</span>
              </div>
            </div>
          </div>
        ) : (
          // Hacking terminal
          <div className="cyber-panel bg-black/90 backdrop-blur-sm border border-green-500 rounded-lg p-6 max-w-2xl w-full shadow-2xl shadow-green-500/30">
            <div className="text-green-400 font-mono text-sm mb-4 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              ВЗЛОМ В ПРОЦЕССЕ...
            </div>
            <div className="bg-black rounded p-4 h-64 overflow-y-auto">
              <pre className="text-green-300 font-mono text-sm whitespace-pre-wrap">
                {terminalText}
                <span className="animate-pulse">_</span>
              </pre>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .matrix-bg {
          background: linear-gradient(0deg, transparent 24%, rgba(32, 255, 77, 0.03) 25%, rgba(32, 255, 77, 0.03) 26%, transparent 27%, transparent 74%, rgba(32, 255, 77, 0.03) 75%, rgba(32, 255, 77, 0.03) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
          animation: matrix-move 20s linear infinite;
        }
        
        @keyframes matrix-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .cyber-panel {
          position: relative;
        }
        
        .cyber-panel::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #00ff88, #0088ff, #ff0088, #00ff88);
          border-radius: 8px;
          z-index: -1;
          animation: cyber-glow 3s ease-in-out infinite alternate;
          opacity: 0.3;
        }
        
        @keyframes cyber-glow {
          0% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        
        .glitch-text {
          text-shadow: 
            0 0 5px #00ff88,
            0 0 10px #00ff88,
            0 0 15px #00ff88;
        }
      `}</style>
    </div>
  );
} 