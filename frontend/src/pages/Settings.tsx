import React, { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    aiAntiSpam: true,
    floodControl: true,
    captchaEnabled: true,
    autoPromote: false,
    welcomeMessage: true,
    logLevel: 'info',
    maxWarnings: 3,
    muteTime: 24,
    banThreshold: 5
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingToggle = ({ title, description, enabled, onToggle, color = 'green' }: any) => (
    <div className={`cyber-card bg-black/80 backdrop-blur-sm border border-${color}-500/50 rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={`font-mono text-${color}-400 font-bold text-lg`}>{title}</h3>
          <p className="text-gray-400 text-sm font-mono mt-1">{description}</p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
            enabled ? `bg-${color}-600` : 'bg-gray-600'
          }`}
        >
          <div
            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
              enabled ? 'left-9' : 'left-1'
            }`}
          />
        </button>
      </div>
      <div className={`text-xs font-mono ${enabled ? `text-${color}-300` : 'text-gray-500'}`}>
        СТАТУС: {enabled ? 'АКТИВЕН' : 'ОТКЛЮЧЕН'}
      </div>
    </div>
  );

  const SettingSlider = ({ title, description, value, min, max, unit, onchange, color = 'blue' }: any) => (
    <div className={`cyber-card bg-black/80 backdrop-blur-sm border border-${color}-500/50 rounded-lg p-6`}>
      <div className="mb-4">
        <h3 className={`font-mono text-${color}-400 font-bold text-lg`}>{title}</h3>
        <p className="text-gray-400 text-sm font-mono mt-1">{description}</p>
      </div>
      
      <div className="flex items-center space-x-4 mb-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onchange(parseInt(e.target.value))}
          className={`flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-${color}`}
        />
        <div className={`text-${color}-400 font-mono font-bold text-lg min-w-[80px] text-right`}>
          {value} {unit}
        </div>
      </div>
      
      <div className="flex justify-between text-xs font-mono text-gray-500">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );

  const SettingSelect = ({ title, description, value, options, onChange, color = 'purple' }: any) => (
    <div className={`cyber-card bg-black/80 backdrop-blur-sm border border-${color}-500/50 rounded-lg p-6`}>
      <div className="mb-4">
        <h3 className={`font-mono text-${color}-400 font-bold text-lg`}>{title}</h3>
        <p className="text-gray-400 text-sm font-mono mt-1">{description}</p>
      </div>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-black/50 border border-${color}-500/30 rounded px-4 py-3 text-${color}-300 font-mono focus:border-${color}-400 focus:outline-none`}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value} className="bg-black">
            {option.label}
          </option>
        ))}
      </select>
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
          <h1 className="text-4xl font-mono font-bold text-green-400 mb-2 glitch-text">
            КОНФИГУРАЦИЯ СИСТЕМЫ
          </h1>
          <div className="text-cyan-300 font-mono text-sm">
            НАСТРОЙКА ПАРАМЕТРОВ ЗАЩИТЫ
          </div>
        </div>

        {/* Main Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SettingToggle
            title="ИИ АНТИ-СПАМ"
            description="Автоматическое обнаружение спама с помощью нейросети"
            enabled={settings.aiAntiSpam}
            onToggle={(value: boolean) => updateSetting('aiAntiSpam', value)}
            color="green"
          />
          
          <SettingToggle
            title="КОНТРОЛЬ ФЛУДА"
            description="Блокировка пользователей за частые сообщения"
            enabled={settings.floodControl}
            onToggle={(value: boolean) => updateSetting('floodControl', value)}
            color="blue"
          />
          
          <SettingToggle
            title="КАПЧА ДЛЯ НОВИЧКОВ"
            description="Проверка новых участников перед доступом к чату"
            enabled={settings.captchaEnabled}
            onToggle={(value: boolean) => updateSetting('captchaEnabled', value)}
            color="yellow"
          />
          
          <SettingToggle
            title="АВТО-ПОВЫШЕНИЕ"
            description="Автоматическое повышение активных пользователей"
            enabled={settings.autoPromote}
            onToggle={(value: boolean) => updateSetting('autoPromote', value)}
            color="purple"
          />
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SettingSlider
            title="ЛИМИТ ПРЕДУПРЕЖДЕНИЙ"
            description="Количество предупреждений до блокировки"
            value={settings.maxWarnings}
            min={1}
            max={10}
            unit="шт"
            onchange={(value: number) => updateSetting('maxWarnings', value)}
            color="red"
          />
          
          <SettingSlider
            title="ВРЕМЯ МУТА"
            description="Длительность блокировки в часах"
            value={settings.muteTime}
            min={1}
            max={168}
            unit="ч"
            onchange={(value: number) => updateSetting('muteTime', value)}
            color="orange"
          />
        </div>

        {/* System Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SettingSelect
            title="УРОВЕНЬ ЛОГИРОВАНИЯ"
            description="Детализация системных логов"
            value={settings.logLevel}
            options={[
              { value: 'error', label: 'ERROR - Только ошибки' },
              { value: 'warn', label: 'WARN - Предупреждения и ошибки' },
              { value: 'info', label: 'INFO - Общая информация' },
              { value: 'debug', label: 'DEBUG - Полная отладка' }
            ]}
            onChange={(value: string) => updateSetting('logLevel', value)}
            color="cyan"
          />
          
          <SettingToggle
            title="ПРИВЕТСТВЕННОЕ СООБЩЕНИЕ"
            description="Отправка приветствия новым участникам"
            enabled={settings.welcomeMessage}
            onToggle={(value: boolean) => updateSetting('welcomeMessage', value)}
            color="pink"
          />
        </div>

        {/* Action Buttons */}
        <div className="cyber-card bg-black/80 backdrop-blur-sm border border-green-500/50 rounded-lg p-6">
          <h2 className="text-xl font-mono font-bold text-green-400 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            УПРАВЛЕНИЕ СИСТЕМОЙ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-green-900/30 border border-green-500/50 hover:border-green-400 text-green-300 hover:text-green-200 py-3 px-6 rounded font-mono transition-all duration-300 hover:scale-105">
              💾 СОХРАНИТЬ НАСТРОЙКИ
            </button>
            
            <button className="bg-blue-900/30 border border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-blue-200 py-3 px-6 rounded font-mono transition-all duration-300 hover:scale-105">
              🔄 ПЕРЕЗАГРУЗИТЬ БОТА
            </button>
            
            <button className="bg-red-900/30 border border-red-500/50 hover:border-red-400 text-red-300 hover:text-red-200 py-3 px-6 rounded font-mono transition-all duration-300 hover:scale-105">
              ⚠️ СБРОСИТЬ К УМОЛЧАНИЮ
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
        
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider-red::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }
        
        .slider-orange::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
        }
      `}</style>
    </div>
  );
} 