import { useState, useEffect } from 'react';
import { Clock, Gamepad2, Smartphone, Play, Pause, AlertCircle } from 'lucide-react';
import {
  calculateAvailableTime,
  calculateRemainingTime,
  validateTimeUsage
} from '../utils/pointsCalculator';
import { createTimeRecord } from '../utils/dataModel';
import { timeRecordService } from '../services/dataService';
import { isUsageDay } from '../utils/dataModel';

const TimeExchange = () => {
  const [timeStats, setTimeStats] = useState({
    available: { totalMinutes: 0, gameMinutes: 0, entertainmentMinutes: 0 },
    remaining: { totalTime: 0, gameTime: 0, entertainmentTime: 0 },
  });
  
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionType, setSessionType] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadTimeStats();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 60000); // 每分钟更新
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeSession]);

  const loadTimeStats = async () => {
    try {
      const available = await calculateAvailableTime();
      const remaining = await calculateRemainingTime();
      setTimeStats({ available, remaining });
    } catch (error) {
      console.error('加载时间统计失败:', error);
    }
  };

  const startSession = (type) => {
    if (!isUsageDay()) {
      setMessage({ type: 'error', text: '只能在周六、周日使用娱乐时间' });
      return;
    }

    if (activeSession) {
      setMessage({ type: 'error', text: '请先结束当前会话' });
      return;
    }

    const remainingTime = type === 'game' ? timeStats.remaining.gameTime : timeStats.remaining.entertainmentTime;
    if (remainingTime <= 0) {
      setMessage({ type: 'error', text: `${type === 'game' ? '游戏' : '泛娱乐'}时间已用完` });
      return;
    }

    setActiveSession({
      type,
      startTime: new Date(),
      description: sessionDescription || (type === 'game' ? '游戏时间' : '泛娱乐时间'),
    });
    setSessionType(type);
    setSessionTime(0);
    setIsTimerRunning(true);
    setMessage({ type: 'success', text: `开始${type === 'game' ? '游戏' : '泛娱乐'}会话` });
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
    setMessage({ type: 'info', text: '会话已暂停' });
  };

  const resumeSession = () => {
    setIsTimerRunning(true);
    setMessage({ type: 'info', text: '会话已恢复' });
  };

  const endSession = async () => {
    if (!activeSession) return;

    if (sessionTime === 0) {
      setMessage({ type: 'error', text: '会话时间为0，无需保存' });
      resetSession();
      return;
    }

    try {
      // 验证时间使用是否合法
      const isValid = await validateTimeUsage(activeSession.type, sessionTime);
      if (!isValid) {
        setMessage({ type: 'error', text: '使用时间超出剩余时间限制' });
        return;
      }

      // 创建时间记录
      const record = createTimeRecord(
        activeSession.type,
        sessionTime,
        activeSession.description
      );

      // 保存记录
      await timeRecordService.create(record);

      // 触发数据更新事件，通知其他组件刷新
      window.dispatchEvent(new CustomEvent('timeUpdated', {
        detail: { minutes: sessionTime, type: activeSession.type, record }
      }));

      setMessage({
        type: 'success',
        text: `成功记录${sessionTime}分钟${activeSession.type === 'game' ? '游戏' : '泛娱乐'}时间`
      });
      loadTimeStats(); // 重新加载统计数据
      resetSession();
    } catch (error) {
      console.error('Error saving time record:', error);
      setMessage({ type: 'error', text: '保存失败，请重试' });
    }
  };

  const resetSession = () => {
    setActiveSession(null);
    setSessionTime(0);
    setSessionType('');
    setSessionDescription('');
    setIsTimerRunning(false);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const getTimeColor = (remaining, total) => {
    const ratio = remaining / total;
    if (ratio > 0.7) return 'text-green-600';
    if (ratio > 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const canUseTime = isUsageDay();

  return (
    <div className="time-exchange">
      <div className="page-header">
        <h2>时间兑换</h2>
        <p>使用积分兑换的娱乐时间</p>
      </div>

      {!canUseTime && (
        <div className="alert alert-warning">
          <AlertCircle size={16} />
          <span>娱乐时间只能在周六、周日使用</span>
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* 时间统计 */}
      <div className="time-stats">
        <div className="stat-card">
          <div className="stat-header">
            <Gamepad2 className="text-purple-600" size={24} />
            <h3>游戏时间</h3>
          </div>
          <div className="time-info">
            <div className="time-row">
              <span>剩余:</span>
              <span className={getTimeColor(timeStats.remaining.gameTime, timeStats.available.gameMinutes)}>
                {formatTime(timeStats.remaining.gameTime)}
              </span>
            </div>
            <div className="time-row">
              <span>总计:</span>
              <span>{formatTime(timeStats.available.gameMinutes)}</span>
            </div>
          </div>
          <div className="time-progress">
            <div 
              className="progress-bar game-progress"
              style={{ 
                width: `${((timeStats.available.gameMinutes - timeStats.remaining.gameTime) / timeStats.available.gameMinutes) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <Smartphone className="text-blue-600" size={24} />
            <h3>泛娱乐时间</h3>
          </div>
          <div className="time-info">
            <div className="time-row">
              <span>剩余:</span>
              <span className={getTimeColor(timeStats.remaining.entertainmentTime, timeStats.available.entertainmentMinutes)}>
                {formatTime(timeStats.remaining.entertainmentTime)}
              </span>
            </div>
            <div className="time-row">
              <span>总计:</span>
              <span>{formatTime(timeStats.available.entertainmentMinutes)}</span>
            </div>
          </div>
          <div className="time-progress">
            <div 
              className="progress-bar entertainment-progress"
              style={{ 
                width: `${((timeStats.available.entertainmentMinutes - timeStats.remaining.entertainmentTime) / timeStats.available.entertainmentMinutes) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* 当前会话 */}
      {activeSession && (
        <div className="active-session">
          <div className="session-header">
            <div className="session-info">
              <h3>当前会话</h3>
              <span className="session-type">
                {activeSession.type === 'game' ? '🎮 游戏时间' : '📱 泛娱乐时间'}
              </span>
            </div>
            <div className="session-timer">
              <Clock size={20} />
              <span className="timer-display">{formatTime(sessionTime)}</span>
            </div>
          </div>
          
          <div className="session-controls">
            {isTimerRunning ? (
              <button onClick={pauseSession} className="btn-warning">
                <Pause size={16} />
                暂停
              </button>
            ) : (
              <button onClick={resumeSession} className="btn-success">
                <Play size={16} />
                继续
              </button>
            )}
            <button onClick={endSession} className="btn-primary">
              结束会话
            </button>
          </div>
        </div>
      )}

      {/* 开始新会话 */}
      {!activeSession && canUseTime && (
        <div className="start-session">
          <h3>开始新会话</h3>
          
          <div className="input-group">
            <label>会话描述（可选）</label>
            <input
              type="text"
              placeholder="例如：玩王者荣耀、看抖音等"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
            />
          </div>

          <div className="session-buttons">
            <button 
              onClick={() => startSession('game')}
              disabled={timeStats.remaining.gameTime <= 0}
              className="session-btn game-btn"
            >
              <Gamepad2 size={20} />
              <span>开始游戏时间</span>
              <small>{formatTime(timeStats.remaining.gameTime)} 剩余</small>
            </button>

            <button 
              onClick={() => startSession('entertainment')}
              disabled={timeStats.remaining.entertainmentTime <= 0}
              className="session-btn entertainment-btn"
            >
              <Smartphone size={20} />
              <span>开始泛娱乐时间</span>
              <small>{formatTime(timeStats.remaining.entertainmentTime)} 剩余</small>
            </button>
          </div>
        </div>
      )}

      {/* 使用规则提醒 */}
      <div className="usage-rules">
        <h4>使用规则提醒</h4>
        <ul>
          <li>娱乐时间仅限周六、周日使用</li>
          <li>游戏时间和泛娱乐时间各占50%</li>
          <li>不得将两天的时间集中在一天使用</li>
          <li>每周最多200分钟娱乐时间</li>
          <li>未用完的积分可结转下周</li>
        </ul>
      </div>
    </div>
  );
};

export default TimeExchange;
