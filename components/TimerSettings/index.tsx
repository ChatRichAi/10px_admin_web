import React, { useState } from 'react';

export interface TimerSettings {
  enabled: boolean;
  interval: number;
  nextRun: Date | null;
  telegramChatId: string;
  telegramBotToken: string;
}

export interface TimerSettingsModalProps {
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => Promise<void>;
  onClose: () => void;
}

// 自定义下拉框组件
const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsOpen(!isOpen);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSelect = (optionValue: number) => {
    onChange(optionValue);
    setIsAnimating(true);
    setIsOpen(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // 点击外部关闭下拉框
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.custom-select')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative custom-select">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full px-4 py-3 pr-12 pl-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-base transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800 cursor-pointer group ${
          isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 选中指示器 - 移到左侧，放在时间前面 */}
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm animate-pulse"></div>
            <span className="text-left">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <svg 
                className={`w-3 h-3 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* 下拉选项列表 */}
      {isOpen && (
        <div className="absolute z-[999999] w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="py-2 max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left transition-all duration-200 cursor-pointer group ${
                  option.value === value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 text-gray-900 dark:text-white'
                } ${
                  index === 0 ? 'rounded-t-xl' : ''
                } ${
                  index === options.length - 1 ? 'rounded-b-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 选项指示器 */}
                    <div className={`w-2 h-2 rounded-full shadow-sm ${
                      option.value === value 
                        ? 'bg-white' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}></div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {option.value === value && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TimerSettingsModal: React.FC<TimerSettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const intervalOptions = [
    { value: 15, label: '15分钟' },
    { value: 30, label: '30分钟' },
    { value: 60, label: '1小时' },
    { value: 120, label: '2小时' },
    { value: 240, label: '4小时' },
    { value: 480, label: '8小时' },
    { value: 1440, label: '24小时' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');
    try {
      if (localSettings.enabled) {
        if (!localSettings.telegramBotToken.trim()) {
          throw new Error('请输入Telegram Bot Token');
        }
        if (!localSettings.telegramChatId.trim()) {
          throw new Error('请输入Telegram Chat ID');
        }
      }
      await onSave(localSettings);
      setSaveStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {/* 头部 */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-blue-500 p-8 overflow-hidden">
          {/* 装饰性背景元素 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">定时AI分析设置</h3>
                <p className="text-white/90 text-sm mt-1 font-medium">配置自动AI分析和Telegram推送</p>
              </div>
            </div>
            <button 
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl hover:scale-110"
              onClick={onClose}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
          {saveStatus === 'success' && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800/30 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="text-base font-semibold">设置保存成功！</span>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    {localSettings.enabled ? `定时器已启动，每${localSettings.interval}分钟自动执行AI分析` : '定时器已关闭'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-800/30 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-base font-semibold">保存失败</span>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 启用开关 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">启用定时分析</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">自动执行AI分析并推送到Telegram</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localSettings.enabled}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-blue-500 shadow-lg group-hover:shadow-xl transition-all duration-300"></div>
              </label>
            </div>
          </div>
          
          {/* 时间间隔设置 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-lg backdrop-blur-sm">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              分析间隔
            </label>
            
            <CustomSelect
              value={localSettings.interval}
              onChange={(value) => setLocalSettings(prev => ({ ...prev, interval: value }))}
              options={intervalOptions}
              placeholder="选择分析间隔"
            />
            
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              设置AI分析的执行频率
            </p>
            
            {/* 当前选择显示 */}
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">当前设置</span>
                </div>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {intervalOptions.find(opt => opt.value === localSettings.interval)?.label}
                </span>
              </div>
            </div>
          </div>
          
          {/* Telegram Bot Token */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200/50 dark:border-cyan-800/30 shadow-lg backdrop-blur-sm">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Telegram Bot Token
            </label>
            <input
              type="password"
              value={localSettings.telegramBotToken}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, telegramBotToken: e.target.value }))}
              placeholder="输入你的Telegram Bot Token"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-base transition-all duration-200 hover:border-cyan-400 dark:hover:border-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              从 @BotFather 获取Bot Token
            </p>
          </div>
          
          {/* Telegram Chat ID */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-lg backdrop-blur-sm">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={localSettings.telegramChatId}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, telegramChatId: e.target.value }))}
              placeholder="输入目标聊天ID（如：123456789）"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-base transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              个人聊天ID或群组ID
            </p>
          </div>
          
          {/* 状态显示 */}
          {localSettings.enabled && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-base font-semibold">定时器状态</span>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    每 {localSettings.interval} 分钟自动执行AI分析并推送到Telegram
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 配置验证按钮 */}
          {localSettings.telegramBotToken && localSettings.telegramChatId && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">配置验证</h5>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    验证Bot Token和Chat ID是否正确
                  </p>
                </div>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/telegram/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          botToken: localSettings.telegramBotToken,
                          chatId: localSettings.telegramChatId
                        })
                      });
                      const result = await response.json();
                      if (response.ok) {
                        alert(`✅ 配置验证成功！\n\nBot: @${result.botInfo.username}\nChat ID: ${result.chatId}\n\n请检查您的Telegram是否收到验证消息。`);
                      } else {
                        let errorMsg = `❌ 验证失败: ${result.error}`;
                        if (result.solution) {
                          errorMsg += `\n\n解决方案: ${result.solution}`;
                        }
                        if (result.details) {
                          errorMsg += `\n\n详细信息: ${result.details}`;
                        }
                        alert(errorMsg);
                      }
                    } catch (error) {
                      alert(`❌ 验证失败: ${error instanceof Error ? error.message : '网络错误'}`);
                    }
                  }}
                >
                  验证配置
                </button>
              </div>
            </div>
          )}
          
          {/* 测试推送按钮 */}
          {localSettings.enabled && localSettings.telegramBotToken && localSettings.telegramChatId && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/30 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">测试推送</h5>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    发送测试消息验证推送功能
                  </p>
                </div>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  onClick={async () => {
                    try {
                      const testMessage = `🔔 定时AI分析测试消息\n\n时间: ${new Date().toLocaleString('zh-CN')}\n状态: 配置验证成功\n\n定时器设置:\n• 间隔: ${localSettings.interval}分钟\n• 状态: 已启用\n\n如果收到此消息，说明Telegram配置正确！`;
                      const response = await fetch('/api/telegram/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          chatId: localSettings.telegramChatId,
                          botToken: localSettings.telegramBotToken,
                          message: testMessage
                        })
                      });
                      if (response.ok) {
                        alert('✅ 测试消息发送成功！请检查您的Telegram。');
                      } else {
                        const error = await response.json();
                        alert(`❌ 测试失败: ${error.error || '未知错误'}`);
                      }
                    } catch (error) {
                      alert(`❌ 测试失败: ${error instanceof Error ? error.message : '网络错误'}`);
                    }
                  }}
                >
                  测试推送
                </button>
              </div>
            </div>
          )}
          
          {/* 帮助信息 */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/20 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              使用说明
            </h5>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>启用后系统将按设定间隔自动执行AI分析</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>分析结果将生成海报图片并推送到Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>确保Bot Token和Chat ID正确配置</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>定时器在页面刷新后会重置，需要重新启用</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>建议先点击"测试推送"验证配置</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex justify-end gap-4 p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button 
            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            onClick={onClose}
            disabled={isSaving}
          >
            取消
          </button>
          <button 
            className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium flex items-center gap-3 shadow-lg hover:shadow-xl transform ${
              isSaving 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 hover:scale-105'
            }`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                保存中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                保存设置
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerSettingsModal; 