import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Clock, Filter, Download } from 'lucide-react';
import { pointRecordService, timeRecordService } from '../services/dataService';
import { getHistoricalWeeklyStats } from '../utils/pointsCalculator';
import { POINT_TYPES } from '../utils/dataModel';

const HistoryView = () => {
  const [activeTab, setActiveTab] = useState('points');
  const [pointRecords, setPointRecords] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [filter, setFilter] = useState({
    type: 'all',
    dateRange: 'week',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const points = await pointRecordService.getAll();
      const times = await timeRecordService.getAll();
      const stats = await getHistoricalWeeklyStats(8); // 最近8周

      setPointRecords(points);
      setTimeRecords(times);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const getPointTypeLabel = (type) => {
    const labels = {
      [POINT_TYPES.HANDWRITING]: '书写笔迹优秀',
      [POINT_TYPES.EXAM_TOP5]: '单科班级前5名',
      [POINT_TYPES.SUBJECT_PROGRESS]: '单科排名进步',
      [POINT_TYPES.TOTAL_PROGRESS]: '班级总排名进步',
      [POINT_TYPES.ERROR_COLLECTION]: '错题积累',
      [POINT_TYPES.ERROR_PRACTICE]: '错题举一反三刷题',
      [POINT_TYPES.TEACHER_COMPLAINT]: '老师投诉',
      [POINT_TYPES.BONUS_FREE_TIME]: '连续两周300+积分奖励',
      [POINT_TYPES.SPECIAL_REWARD]: '月考大幅进步特殊奖励',
    };
    return labels[type] || type;
  };

  const filteredPointRecords = pointRecords.filter(record => {
    if (filter.type !== 'all' && record.type !== filter.type) return false;
    
    const recordDate = new Date(record.timestamp);
    const now = new Date();
    
    switch (filter.dateRange) {
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return recordDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return recordDate >= monthAgo;
      }
      case 'all':
      default:
        return true;
    }
  });

  const filteredTimeRecords = timeRecords.filter(record => {
    const recordDate = new Date(record.timestamp);
    const now = new Date();
    
    switch (filter.dateRange) {
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return recordDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return recordDate >= monthAgo;
      }
      case 'all':
      default:
        return true;
    }
  });

  const exportData = () => {
    const data = {
      pointRecords: filteredPointRecords,
      timeRecords: filteredTimeRecords,
      weeklyStats,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-points-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="history-view">
      <div className="page-header">
        <h2>历史记录</h2>
        <button onClick={exportData} className="btn-secondary">
          <Download size={16} />
          导出数据
        </button>
      </div>

      {/* 标签页 */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          积分记录
        </button>
        <button 
          className={`tab ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab('time')}
        >
          时间记录
        </button>
        <button 
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          周统计
        </button>
      </div>

      {/* 过滤器 */}
      <div className="filters">
        <div className="filter-group">
          <label>时间范围:</label>
          <select 
            value={filter.dateRange} 
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
          >
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="all">全部</option>
          </select>
        </div>

        {activeTab === 'points' && (
          <div className="filter-group">
            <label>积分类型:</label>
            <select 
              value={filter.type} 
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="all">全部类型</option>
              {Object.values(POINT_TYPES).map(type => (
                <option key={type} value={type}>
                  {getPointTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="content">
        {activeTab === 'points' && (
          <div className="records-list">
            {filteredPointRecords.length === 0 ? (
              <div className="empty-state">
                <p>暂无积分记录</p>
              </div>
            ) : (
              filteredPointRecords.map(record => (
                <div key={record.id} className="record-item">
                  <div className="record-header">
                    <span className="record-type">{getPointTypeLabel(record.type)}</span>
                    <span className="record-date">{formatDate(record.timestamp)}</span>
                  </div>
                  <div className="record-content">
                    <div className="record-description">{record.description}</div>
                    <div className={`record-points ${record.value >= 0 ? 'positive' : 'negative'}`}>
                      {record.value >= 0 ? '+' : ''}{record.value} 分
                    </div>
                  </div>
                  {record.metadata && Object.keys(record.metadata).length > 0 && (
                    <div className="record-metadata">
                      {record.metadata.oldRankings && record.metadata.newRankings && (
                        <small>
                          排名变化: {record.metadata.oldRankings.subjectRanking || record.metadata.oldRankings.totalClassRanking} 
                          → {record.metadata.newRankings.subjectRanking || record.metadata.newRankings.totalClassRanking}
                        </small>
                      )}
                      {record.metadata.errorPractice && (
                        <small>
                          准确率: {((record.metadata.errorPractice.correct / record.metadata.errorPractice.total) * 100).toFixed(1)}%
                        </small>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'time' && (
          <div className="records-list">
            {filteredTimeRecords.length === 0 ? (
              <div className="empty-state">
                <p>暂无时间记录</p>
              </div>
            ) : (
              filteredTimeRecords.map(record => (
                <div key={record.id} className="record-item">
                  <div className="record-header">
                    <span className="record-type">
                      {record.type === 'game' ? '🎮 游戏时间' : '📱 泛娱乐时间'}
                    </span>
                    <span className="record-date">{formatDate(record.timestamp)}</span>
                  </div>
                  <div className="record-content">
                    <div className="record-description">{record.description}</div>
                    <div className="record-time">
                      <Clock size={16} />
                      {formatTime(record.minutes)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="weekly-stats">
            {weeklyStats.length === 0 ? (
              <div className="empty-state">
                <p>暂无周统计数据</p>
              </div>
            ) : (
              weeklyStats.map(stat => (
                <div key={stat.week} className="week-stat-card">
                  <div className="week-header">
                    <h3>第 {stat.week} 周</h3>
                    <div className="week-points">
                      <span className={`points-value ${stat.totalPoints >= 0 ? 'positive' : 'negative'}`}>
                        {stat.totalPoints >= 0 ? '+' : ''}{stat.totalPoints} 分
                      </span>
                    </div>
                  </div>
                  
                  <div className="week-details">
                    <div className="detail-row">
                      <span>正分:</span>
                      <span className="positive">+{stat.positivePoints}</span>
                    </div>
                    <div className="detail-row">
                      <span>负分:</span>
                      <span className="negative">{stat.negativePoints}</span>
                    </div>
                    <div className="detail-row">
                      <span>可用时间:</span>
                      <span>{formatTime(stat.availableTime.totalMinutes)}</span>
                    </div>
                    <div className="detail-row">
                      <span>已用时间:</span>
                      <span>{formatTime(stat.timeStats.totalTime)}</span>
                    </div>
                  </div>

                  {stat.hasConsecutiveBonus && (
                    <div className="bonus-indicator">
                      🏆 连续两周300+积分奖励
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
