import {
  POINT_TYPES,
  POINT_VALUES,
  TIME_RULES,
  getWeekNumber
  // calculateProgressPoints,
  // validateErrorPracticeAccuracy
} from './dataModel.js';
import { pointRecordService, timeRecordService } from '../services/dataService.js';

// 计算当前总积分
export const calculateTotalPoints = async (records = null) => {
  const pointRecords = records || await pointRecordService.getAll();
  return pointRecords.reduce((total, record) => total + record.value, 0);
};

// 计算本周积分
export const calculateWeeklyPoints = async (weekNumber = null, records = null) => {
  const currentWeek = weekNumber || getWeekNumber(new Date());
  const pointRecords = records || await pointRecordService.getAll();

  return pointRecords
    .filter(record => record.weekNumber === currentWeek)
    .reduce((total, record) => total + record.value, 0);
};

// 计算可用娱乐时间
export const calculateAvailableTime = async (weekNumber = null) => {
  const weeklyPoints = await calculateWeeklyPoints(weekNumber);
  const totalMinutes = Math.max(0, weeklyPoints * TIME_RULES.POINTS_TO_MINUTES);
  const cappedMinutes = Math.min(totalMinutes, TIME_RULES.MAX_WEEKLY_MINUTES);

  return {
    totalMinutes: cappedMinutes,
    gameMinutes: Math.floor(cappedMinutes * TIME_RULES.GAME_TIME_RATIO),
    entertainmentMinutes: Math.floor(cappedMinutes * TIME_RULES.ENTERTAINMENT_TIME_RATIO),
  };
};

// 计算已使用时间
export const calculateUsedTime = async (weekNumber = null) => {
  const currentWeek = weekNumber || getWeekNumber(new Date());
  const timeRecords = await timeRecordService.getAll();

  const weekRecords = timeRecords.filter(record => {
    const recordDate = new Date(record.timestamp);
    return getWeekNumber(recordDate) === currentWeek;
  });

  const gameTime = weekRecords
    .filter(record => record.type === 'game')
    .reduce((total, record) => total + record.minutes, 0);

  const entertainmentTime = weekRecords
    .filter(record => record.type === 'entertainment')
    .reduce((total, record) => total + record.minutes, 0);

  return {
    gameTime,
    entertainmentTime,
    totalTime: gameTime + entertainmentTime,
  };
};

// 计算剩余时间
export const calculateRemainingTime = async (weekNumber = null) => {
  const available = await calculateAvailableTime(weekNumber);
  const used = await calculateUsedTime(weekNumber);

  return {
    gameTime: Math.max(0, available.gameMinutes - used.gameTime),
    entertainmentTime: Math.max(0, available.entertainmentMinutes - used.entertainmentTime),
    totalTime: Math.max(0, available.totalMinutes - used.totalTime),
  };
};

// 检查是否有连续两周300+积分奖励
export const checkConsecutiveWeekBonus = async (currentWeek = null) => {
  const week = currentWeek || getWeekNumber(new Date());
  const thisWeekPoints = await calculateWeeklyPoints(week);
  const lastWeekPoints = await calculateWeeklyPoints(week - 1);

  return thisWeekPoints >= 300 && lastWeekPoints >= 300;
};

// 计算周统计
export const calculateWeeklyStats = async (weekNumber = null) => {
  const week = weekNumber || getWeekNumber(new Date());
  const pointRecords = await pointRecordService.getAll();
  // const timeRecords = await timeRecordService.getAll();

  // 本周积分记录
  const weekPointRecords = pointRecords.filter(record => record.weekNumber === week);
  // const weekTimeRecords = timeRecords.filter(record => {
  //   const recordDate = new Date(record.timestamp);
  //   return getWeekNumber(recordDate) === week;
  // });

  // 积分统计
  const totalPoints = weekPointRecords.reduce((sum, record) => sum + record.value, 0);
  const positivePoints = weekPointRecords
    .filter(record => record.value > 0)
    .reduce((sum, record) => sum + record.value, 0);
  const negativePoints = weekPointRecords
    .filter(record => record.value < 0)
    .reduce((sum, record) => sum + record.value, 0);

  // 时间统计
  const timeStats = await calculateUsedTime(week);
  const availableTime = await calculateAvailableTime(week);
  const remainingTime = await calculateRemainingTime(week);

  // 积分类型统计
  const pointsByType = {};
  Object.values(POINT_TYPES).forEach(type => {
    pointsByType[type] = weekPointRecords
      .filter(record => record.type === type)
      .reduce((sum, record) => sum + record.value, 0);
  });

  return {
    week,
    totalPoints,
    positivePoints,
    negativePoints,
    pointsByType,
    timeStats,
    availableTime,
    remainingTime,
    recordCount: weekPointRecords.length,
    hasConsecutiveBonus: await checkConsecutiveWeekBonus(week),
  };
};

// 获取历史周统计
export const getHistoricalWeeklyStats = async (weeksBack = 4) => {
  const currentWeek = getWeekNumber(new Date());
  const stats = [];

  for (let i = 0; i < weeksBack; i++) {
    const week = currentWeek - i;
    stats.push(await calculateWeeklyStats(week));
  }

  return stats.reverse(); // 按时间顺序排列
};

// 验证时间使用是否合法
export const validateTimeUsage = async (type, minutes, weekNumber = null) => {
  const remaining = await calculateRemainingTime(weekNumber);

  if (type === 'game') {
    return minutes <= remaining.gameTime;
  } else if (type === 'entertainment') {
    return minutes <= remaining.entertainmentTime;
  }

  return false;
};
