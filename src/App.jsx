import { useState, useEffect } from 'react';
import { Home, Plus, Clock, History, BookOpen, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PointEntry from './components/PointEntry';
import TimeExchange from './components/TimeExchange';
import HistoryView from './components/HistoryView';
import RulesView from './components/RulesView';
import SettingsView from './components/SettingsView';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import { getSettings } from './utils/storage';
import { runAllTests } from './utils/test';
import { setupDemoFunctions } from './utils/demoData';
import { runIntegrationTests } from './utils/integrationTest';
import { initializeDataService } from './services/dataService';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 初始化数据服务
        const dataServiceStatus = await initializeDataService();
        console.log('📊 数据服务初始化完成:', dataServiceStatus);

        // 加载用户设置
        const userSettings = getSettings();
        setSettings(userSettings);

        // 开发模式下添加测试功能到全局
        if (import.meta.env.DEV) {
          window.runTests = runAllTests;
          window.runIntegrationTests = runIntegrationTests;
          setupDemoFunctions();
          console.log('🧪 开发模式：在控制台输入 runTests() 来运行功能测试');
          console.log('🔧 集成测试：输入 runIntegrationTests() 来运行集成测试');
          console.log('🎭 演示模式：输入 loadDemoData() 来加载演示数据');
        }
      } catch (error) {
        console.error('应用初始化失败:', error);
        // 降级到本地模式
        const userSettings = getSettings();
        setSettings(userSettings);
      }
    };

    initializeApp();
  }, []);

  const tabs = [
    { id: 'dashboard', name: '首页', icon: Home, component: Dashboard },
    { id: 'entry', name: '积分录入', icon: Plus, component: PointEntry },
    { id: 'exchange', name: '时间兑换', icon: Clock, component: TimeExchange },
    { id: 'history', name: '历史记录', icon: History, component: HistoryView },
    { id: 'rules', name: '规则说明', icon: BookOpen, component: RulesView },
    { id: 'settings', name: '设置', icon: Settings, component: SettingsView },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
  };

  if (!settings) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
      <NetworkStatus />
      <div className="app">
        <header className="app-header">
          <h1>学生积分管理系统</h1>
          <p>欢迎，{settings.studentName}！</p>
        </header>

        <main className="app-main">
          <ErrorBoundary>
            <ActiveComponent onNavigate={activeTab === 'dashboard' ? handleNavigate : undefined} />
          </ErrorBoundary>
        </main>

        <nav className="app-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </ErrorBoundary>
  );
}

export default App;
