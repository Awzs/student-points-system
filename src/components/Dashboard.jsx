import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Trophy, AlertCircle, Plus } from 'lucide-react';
import { 
  calculateTotalPoints, 
  calculateWeeklyPoints, 
  calculateAvailableTime,
  calculateUsedTime,
  calculateRemainingTime,
  checkConsecutiveWeekBonus 
} from '../utils/pointsCalculator';
import { getWeekNumber, isSettlementDay, isUsageDay } from '../utils/dataModel';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPoints: 0,
    weeklyPoints: 0,
    availableTime: { totalMinutes: 0, gameMinutes: 0, entertainmentMinutes: 0 },
    usedTime: { totalTime: 0, gameTime: 0, entertainmentTime: 0 },
    remainingTime: { totalTime: 0, gameTime: 0, entertainmentTime: 0 },
    hasConsecutiveBonus: false,
  });

  const [currentWeek] = useState(getWeekNumber(new Date()));
  const [isToday] = useState({
    isSettlement: isSettlementDay(),
    isUsage: isUsageDay(),
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const totalPoints = await calculateTotalPoints();
        const weeklyPoints = await calculateWeeklyPoints();
        const availableTime = await calculateAvailableTime();
        const usedTime = await calculateUsedTime();
        const remainingTime = await calculateRemainingTime();
        const hasConsecutiveBonus = await checkConsecutiveWeekBonus();

        setStats({
          totalPoints,
          weeklyPoints,
          availableTime,
          usedTime,
          remainingTime,
          hasConsecutiveBonus,
        });
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };

    loadStats();

    // 每分钟更新一次状态
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const getPointsColor = (points) => {
    if (points >= 300) return 'text-green-600';
    if (points >= 100) return 'text-blue-600';
    if (points >= 0) return 'text-gray-600';
    return 'text-red-600';
  };

  const getTimeColor = (remaining, total) => {
    const ratio = remaining / total;
    if (ratio > 0.7) return 'text-green-600';
    if (ratio > 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>积分概览</h2>
        <p className="week-info">第 {currentWeek} 周</p>
      </div>

      {/* 状态提醒 */}
      <div className="status-alerts">
        {isToday.isSettlement && (
          <div className="alert alert-info">
            <AlertCircle size={16} />
            <span>今天是结算日，积分将在晚上结算为娱乐时间</span>
          </div>
        )}
        {isToday.isUsage && (
          <div className="alert alert-success">
            <Clock size={16} />
            <span>今天可以使用娱乐时间</span>
          </div>
        )}
        {stats.hasConsecutiveBonus && (
          <div className="alert alert-bonus">
            <Trophy size={16} />
            <span>恭喜！连续两周积分超过300分，获得特殊奖励！</span>
          </div>
        )}
      </div>

      {/* 积分卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>总积分</h3>
            <TrendingUp className={getPointsColor(stats.totalPoints)} size={20} />
          </div>
          <div className={`stat-value ${getPointsColor(stats.totalPoints)}`}>
            {stats.totalPoints}
          </div>
          <div className="stat-description">累计获得的积分</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>本周积分</h3>
            {stats.weeklyPoints >= 0 ? (
              <TrendingUp className={getPointsColor(stats.weeklyPoints)} size={20} />
            ) : (
              <TrendingDown className="text-red-600" size={20} />
            )}
          </div>
          <div className={`stat-value ${getPointsColor(stats.weeklyPoints)}`}>
            {stats.weeklyPoints}
          </div>
          <div className="stat-description">
            {stats.weeklyPoints >= 300 ? '表现优秀！' : '继续努力！'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>可用时间</h3>
            <Clock className="text-blue-600" size={20} />
          </div>
          <div className="stat-value text-blue-600">
            {formatTime(stats.availableTime.totalMinutes)}
          </div>
          <div className="stat-description">本周可兑换的娱乐时间</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>剩余时间</h3>
            <Clock className={getTimeColor(stats.remainingTime.totalTime, stats.availableTime.totalMinutes)} size={20} />
          </div>
          <div className={`stat-value ${getTimeColor(stats.remainingTime.totalTime, stats.availableTime.totalMinutes)}`}>
            {formatTime(stats.remainingTime.totalTime)}
          </div>
          <div className="stat-description">本周剩余娱乐时间</div>
        </div>
      </div>

      {/* 时间分配详情 */}
      <div className="time-breakdown">
        <h3>时间分配详情</h3>
        <div className="time-categories">
          <div className="time-category">
            <div className="category-header">
              <span>游戏时间</span>
              <span className="time-ratio">50%</span>
            </div>
            <div className="time-progress">
              <div 
                className="progress-bar game-progress"
                style={{ 
                  width: `${(stats.usedTime.gameTime / stats.availableTime.gameMinutes) * 100}%` 
                }}
              ></div>
            </div>
            <div className="time-details">
              <span>已用: {formatTime(stats.usedTime.gameTime)}</span>
              <span>剩余: {formatTime(stats.remainingTime.gameTime)}</span>
            </div>
          </div>

          <div className="time-category">
            <div className="category-header">
              <span>泛娱乐时间</span>
              <span className="time-ratio">50%</span>
            </div>
            <div className="time-progress">
              <div 
                className="progress-bar entertainment-progress"
                style={{ 
                  width: `${(stats.usedTime.entertainmentTime / stats.availableTime.entertainmentMinutes) * 100}%` 
                }}
              ></div>
            </div>
            <div className="time-details">
              <span>已用: {formatTime(stats.usedTime.entertainmentTime)}</span>
              <span>剩余: {formatTime(stats.remainingTime.entertainmentTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="quick-actions">
        <h3>快速操作</h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            <Plus size={16} />
            <span>录入积分</span>
          </button>
          <button className="action-btn secondary">
            <Clock size={16} />
            <span>使用时间</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
