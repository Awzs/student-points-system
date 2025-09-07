import { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, RefreshCw, User, Bell, Palette } from 'lucide-react';
import {
  getSettings,
  updateSettings,
  getCurrentRankings,
  updateCurrentRankings,
  clearAllData,
  exportData,
  importData
} from '../utils/storage';
// import { studentProfileService, getSyncStatus, manualSync } from '../services/dataService';

const SettingsView = () => {
  const [settings, setSettings] = useState({
    studentName: '',
    notifications: true,
    theme: 'light',
  });
  
  const [rankings, setRankings] = useState({
    subjectRanking: 10,
    totalClassRanking: 10,
    totalGradeRanking: 50,
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const userSettings = getSettings();
    const currentRankings = getCurrentRankings();
    
    setSettings(userSettings);
    setRankings(currentRankings);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const success = updateSettings(settings);
      if (success) {
        setMessage({ type: 'success', text: '设置保存成功！' });
      } else {
        setMessage({ type: 'error', text: '设置保存失败，请重试' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: '设置保存失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRankings = async () => {
    setIsLoading(true);
    try {
      const success = updateCurrentRankings(rankings);
      if (success) {
        setMessage({ type: 'success', text: '排名设置保存成功！' });
      } else {
        setMessage({ type: 'error', text: '排名设置保存失败，请重试' });
      }
    } catch (error) {
      console.error('Error saving rankings:', error);
      setMessage({ type: 'error', text: '排名设置保存失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-points-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: '数据导出成功！' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage({ type: 'error', text: '数据导出失败，请重试' });
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = importData(data);
        
        if (success) {
          setMessage({ type: 'success', text: '数据导入成功！页面将刷新以显示新数据。' });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setMessage({ type: 'error', text: '数据导入失败，请检查文件格式' });
        }
      } catch (error) {
        console.error('Error importing data:', error);
        setMessage({ type: 'error', text: '数据导入失败，请检查文件格式' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      try {
        clearAllData();
        setMessage({ type: 'success', text: '数据清除成功！页面将刷新。' });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Error clearing data:', error);
        setMessage({ type: 'error', text: '数据清除失败，请重试' });
      }
    }
  };

  return (
    <div className="settings-view">
      <div className="page-header">
        <h2>设置</h2>
        <p>个人信息和系统设置</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-sections">
        {/* 个人信息设置 */}
        <div className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h3>个人信息</h3>
          </div>
          
          <div className="setting-item">
            <label>学生姓名</label>
            <input
              type="text"
              value={settings.studentName}
              onChange={(e) => setSettings(prev => ({ ...prev, studentName: e.target.value }))}
              placeholder="请输入学生姓名"
            />
          </div>

          <button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="btn-primary"
          >
            <Save size={16} />
            {isLoading ? '保存中...' : '保存个人信息'}
          </button>
        </div>

        {/* 当前排名设置 */}
        <div className="settings-section">
          <div className="section-header">
            <RefreshCw size={20} />
            <h3>当前排名设置</h3>
          </div>
          
          <div className="ranking-inputs">
            <div className="setting-item">
              <label>单科班级排名</label>
              <input
                type="number"
                value={rankings.subjectRanking}
                onChange={(e) => setRankings(prev => ({ ...prev, subjectRanking: parseInt(e.target.value) || 0 }))}
                min="1"
                max="50"
              />
            </div>

            <div className="setting-item">
              <label>总分班级排名</label>
              <input
                type="number"
                value={rankings.totalClassRanking}
                onChange={(e) => setRankings(prev => ({ ...prev, totalClassRanking: parseInt(e.target.value) || 0 }))}
                min="1"
                max="50"
              />
            </div>

            <div className="setting-item">
              <label>总分年级排名</label>
              <input
                type="number"
                value={rankings.totalGradeRanking}
                onChange={(e) => setRankings(prev => ({ ...prev, totalGradeRanking: parseInt(e.target.value) || 0 }))}
                min="1"
                max="500"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveRankings}
            disabled={isLoading}
            className="btn-primary"
          >
            <Save size={16} />
            {isLoading ? '保存中...' : '保存排名设置'}
          </button>
        </div>

        {/* 应用设置 */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={20} />
            <h3>应用设置</h3>
          </div>
          
          <div className="setting-item">
            <label>主题</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
            >
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
              />
              <span>启用通知提醒</span>
            </label>
          </div>

          <button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="btn-primary"
          >
            <Save size={16} />
            {isLoading ? '保存中...' : '保存应用设置'}
          </button>
        </div>

        {/* 数据管理 */}
        <div className="settings-section">
          <div className="section-header">
            <Download size={20} />
            <h3>数据管理</h3>
          </div>
          
          <div className="data-actions">
            <button onClick={handleExportData} className="btn-secondary">
              <Download size={16} />
              导出数据
            </button>

            <div className="import-section">
              <label htmlFor="import-file" className="btn-secondary">
                <Upload size={16} />
                导入数据
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
            </div>

            <button onClick={handleClearData} className="btn-danger">
              <Trash2 size={16} />
              清除所有数据
            </button>
          </div>

          <div className="data-info">
            <p>• 导出数据：将所有积分记录、时间记录等数据导出为JSON文件</p>
            <p>• 导入数据：从JSON文件恢复数据（会覆盖现有数据）</p>
            <p>• 清除数据：删除所有本地存储的数据，不可恢复</p>
          </div>
        </div>

        {/* 系统信息 */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h3>系统信息</h3>
          </div>
          
          <div className="system-info">
            <div className="info-item">
              <span>应用版本:</span>
              <span>1.0.0</span>
            </div>
            <div className="info-item">
              <span>数据存储:</span>
              <span>本地存储 (localStorage)</span>
            </div>
            <div className="info-item">
              <span>最后更新:</span>
              <span>{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
