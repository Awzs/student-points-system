// 本地存储工具函数
const STORAGE_KEYS = {
  POINT_RECORDS: 'student_point_records',
  TIME_RECORDS: 'student_time_records',
  CURRENT_RANKINGS: 'student_current_rankings',
  WEEKLY_STATS: 'student_weekly_stats',
  SETTINGS: 'student_settings',
};

// 获取存储数据
export const getStorageData = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// 设置存储数据
export const setStorageData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
};

// 积分记录相关
export const getPointRecords = () => {
  return getStorageData(STORAGE_KEYS.POINT_RECORDS, []);
};

export const savePointRecord = (record) => {
  const records = getPointRecords();
  records.push(record);
  return setStorageData(STORAGE_KEYS.POINT_RECORDS, records);
};

export const updatePointRecords = (records) => {
  return setStorageData(STORAGE_KEYS.POINT_RECORDS, records);
};

// 时间记录相关
export const getTimeRecords = () => {
  return getStorageData(STORAGE_KEYS.TIME_RECORDS, []);
};

export const saveTimeRecord = (record) => {
  const records = getTimeRecords();
  records.push(record);
  return setStorageData(STORAGE_KEYS.TIME_RECORDS, records);
};

export const updateTimeRecords = (records) => {
  return setStorageData(STORAGE_KEYS.TIME_RECORDS, records);
};

// 当前排名相关
export const getCurrentRankings = () => {
  return getStorageData(STORAGE_KEYS.CURRENT_RANKINGS, {
    subjectRanking: 10,
    totalClassRanking: 10,
    totalGradeRanking: 50,
  });
};

export const updateCurrentRankings = (rankings) => {
  return setStorageData(STORAGE_KEYS.CURRENT_RANKINGS, rankings);
};

// 周统计相关
export const getWeeklyStats = () => {
  return getStorageData(STORAGE_KEYS.WEEKLY_STATS, {});
};

export const updateWeeklyStats = (stats) => {
  return setStorageData(STORAGE_KEYS.WEEKLY_STATS, stats);
};

// 设置相关
export const getSettings = () => {
  return getStorageData(STORAGE_KEYS.SETTINGS, {
    studentName: '学生',
    notifications: true,
    theme: 'light',
  });
};

export const updateSettings = (settings) => {
  return setStorageData(STORAGE_KEYS.SETTINGS, settings);
};

// 清除所有数据
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// 导出数据
export const exportData = () => {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = getStorageData(key);
  });
  return data;
};

// 导入数据
export const importData = (data) => {
  try {
    Object.entries(data).forEach(([name, value]) => {
      const key = STORAGE_KEYS[name];
      if (key && value !== null) {
        setStorageData(key, value);
      }
    });
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
