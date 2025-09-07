// 数据模型定义
export const POINT_TYPES = {
  // 加分项
  HANDWRITING: 'handwriting', // 书写笔迹优秀
  EXAM_TOP5: 'exam_top5', // 单科班级前5名
  SUBJECT_PROGRESS: 'subject_progress', // 单科排名进步
  TOTAL_PROGRESS: 'total_progress', // 班级总排名进步
  ERROR_COLLECTION: 'error_collection', // 错题积累
  ERROR_PRACTICE: 'error_practice', // 错题举一反三刷题
  
  // 扣分项
  TEACHER_COMPLAINT: 'teacher_complaint', // 老师投诉
  
  // 特殊奖励
  BONUS_FREE_TIME: 'bonus_free_time', // 连续两周300+积分奖励
  SPECIAL_REWARD: 'special_reward', // 月考大幅进步特殊奖励
};

export const POINT_VALUES = {
  [POINT_TYPES.HANDWRITING]: 5,
  [POINT_TYPES.EXAM_TOP5]: 15,
  [POINT_TYPES.SUBJECT_PROGRESS]: 5, // 每名次5分
  [POINT_TYPES.TOTAL_PROGRESS]: 5, // 每名次5分
  [POINT_TYPES.ERROR_COLLECTION]: 2,
  [POINT_TYPES.ERROR_PRACTICE]: 1,
  [POINT_TYPES.TEACHER_COMPLAINT]: -20,
};

export const INITIAL_RANKINGS = {
  subjectRanking: 10, // 单科班级排名
  totalClassRanking: 10, // 总分班级排名
  totalGradeRanking: 50, // 总分年级排名
};

export const TIME_RULES = {
  POINTS_TO_MINUTES: 1, // 1积分 = 1分钟
  MAX_WEEKLY_MINUTES: 200, // 每周最多200分钟
  GAME_TIME_RATIO: 0.5, // 最多50%用于游戏
  ENTERTAINMENT_TIME_RATIO: 0.5, // 50%用于泛娱乐
  SETTLEMENT_DAY: 5, // 周五结算 (0=周日, 5=周五)
  USAGE_DAYS: [6, 0], // 周六、周日可使用 (6=周六, 0=周日)
};

// 创建积分记录
export const createPointRecord = (type, value, description, metadata = {}) => ({
  id: `point_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
  type,
  value,
  description,
  metadata,
  timestamp: new Date().toISOString(),
  weekNumber: getWeekNumber(new Date()),
});

// 创建时间使用记录
export const createTimeRecord = (type, minutes, description) => ({
  id: `time_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
  type, // 'game' or 'entertainment'
  minutes,
  description,
  timestamp: new Date().toISOString(),
  date: new Date().toDateString(),
});

// 获取周数
export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// 检查是否为结算日
export const isSettlementDay = (date = new Date()) => {
  return date.getDay() === TIME_RULES.SETTLEMENT_DAY;
};

// 检查是否为可使用日
export const isUsageDay = (date = new Date()) => {
  return TIME_RULES.USAGE_DAYS.includes(date.getDay());
};

// 计算排名进步积分
export const calculateProgressPoints = (oldRanking, newRanking, type) => {
  const improvement = oldRanking - newRanking;
  if (improvement > 0) {
    return improvement * POINT_VALUES[type];
  }
  return 0;
};

// 验证错题练习准确率
export const validateErrorPracticeAccuracy = (correct, total) => {
  return (correct / total) >= 0.8;
};
