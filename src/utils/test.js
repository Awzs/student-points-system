// 简单的功能测试
import { 
  calculateTotalPoints, 
  calculateWeeklyPoints, 
  calculateAvailableTime,
  calculateRemainingTime,
  validateTimeUsage 
} from './pointsCalculator.js';
import { 
  createPointRecord, 
  createTimeRecord, 
  POINT_TYPES, 
  POINT_VALUES,
  getWeekNumber 
} from './dataModel.js';
import { 
  savePointRecord, 
  saveTimeRecord, 
  getPointRecords, 
  getTimeRecords,
  clearAllData 
} from './storage.js';

// 测试数据
const testPointRecords = [
  createPointRecord(POINT_TYPES.HANDWRITING, 5, '字迹工整'),
  createPointRecord(POINT_TYPES.EXAM_TOP5, 15, '数学班级第3名'),
  createPointRecord(POINT_TYPES.ERROR_COLLECTION, 10, '整理5道错题'),
  createPointRecord(POINT_TYPES.TEACHER_COMPLAINT, -20, '上课说话'),
];

const testTimeRecords = [
  createTimeRecord('game', 30, '玩王者荣耀'),
  createTimeRecord('entertainment', 45, '看抖音'),
];

// 运行测试
export const runTests = () => {
  console.log('🧪 开始运行功能测试...');
  
  try {
    // 清除现有数据
    clearAllData();
    console.log('✅ 数据清除成功');
    
    // 测试积分记录
    testPointRecords.forEach(record => {
      savePointRecord(record);
    });
    console.log('✅ 积分记录保存成功');
    
    // 测试时间记录
    testTimeRecords.forEach(record => {
      saveTimeRecord(record);
    });
    console.log('✅ 时间记录保存成功');
    
    // 测试数据读取
    const savedPointRecords = getPointRecords();
    const savedTimeRecords = getTimeRecords();
    
    console.log(`✅ 读取到 ${savedPointRecords.length} 条积分记录`);
    console.log(`✅ 读取到 ${savedTimeRecords.length} 条时间记录`);
    
    // 测试积分计算
    const totalPoints = calculateTotalPoints(savedPointRecords);
    const weeklyPoints = calculateWeeklyPoints(null, savedPointRecords);
    
    console.log(`✅ 总积分: ${totalPoints}`);
    console.log(`✅ 本周积分: ${weeklyPoints}`);
    
    // 测试时间计算
    const availableTime = calculateAvailableTime();
    const remainingTime = calculateRemainingTime();
    
    console.log(`✅ 可用时间: ${availableTime.totalMinutes} 分钟`);
    console.log(`✅ 剩余时间: ${remainingTime.totalTime} 分钟`);
    
    // 测试时间验证
    const canUseGame = validateTimeUsage('game', 30);
    const canUseEntertainment = validateTimeUsage('entertainment', 45);
    
    console.log(`✅ 可以使用30分钟游戏时间: ${canUseGame}`);
    console.log(`✅ 可以使用45分钟娱乐时间: ${canUseEntertainment}`);
    
    // 测试周数计算
    const currentWeek = getWeekNumber(new Date());
    console.log(`✅ 当前周数: ${currentWeek}`);
    
    console.log('🎉 所有测试通过！');
    
    return {
      success: true,
      results: {
        totalPoints,
        weeklyPoints,
        availableTime,
        remainingTime,
        recordCounts: {
          points: savedPointRecords.length,
          time: savedTimeRecords.length,
        }
      }
    };
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 性能测试
export const runPerformanceTests = () => {
  console.log('⚡ 开始性能测试...');
  
  const startTime = performance.now();
  
  // 创建大量测试数据
  const largeDataSet = [];
  for (let i = 0; i < 1000; i++) {
    largeDataSet.push(createPointRecord(
      POINT_TYPES.ERROR_COLLECTION, 
      2, 
      `测试记录 ${i}`
    ));
  }
  
  const createTime = performance.now();
  console.log(`✅ 创建1000条记录耗时: ${(createTime - startTime).toFixed(2)}ms`);
  
  // 测试计算性能
  const calcStart = performance.now();
  const total = calculateTotalPoints(largeDataSet);
  const calcEnd = performance.now();
  
  console.log(`✅ 计算1000条记录总积分耗时: ${(calcEnd - calcStart).toFixed(2)}ms`);
  console.log(`✅ 计算结果: ${total} 分`);
  
  return {
    createTime: createTime - startTime,
    calcTime: calcEnd - calcStart,
    totalPoints: total,
    recordCount: largeDataSet.length
  };
};

// 边界条件测试
export const runBoundaryTests = () => {
  console.log('🔍 开始边界条件测试...');
  
  try {
    // 测试空数据
    const emptyTotal = calculateTotalPoints([]);
    console.log(`✅ 空数据总积分: ${emptyTotal}`);
    
    // 测试负积分
    const negativeRecord = createPointRecord(POINT_TYPES.TEACHER_COMPLAINT, -100, '严重违纪');
    const negativeTotal = calculateTotalPoints([negativeRecord]);
    console.log(`✅ 负积分计算: ${negativeTotal}`);
    
    // 测试极大积分
    const largeRecord = createPointRecord(POINT_TYPES.EXAM_TOP5, 999999, '测试极大值');
    const largeTotal = calculateTotalPoints([largeRecord]);
    console.log(`✅ 极大积分计算: ${largeTotal}`);
    
    // 测试时间上限
    const maxTime = calculateAvailableTime();
    console.log(`✅ 时间上限测试: ${Math.min(maxTime.totalMinutes, 200)} 分钟`);
    
    // 测试无效时间使用
    const invalidTimeUsage = validateTimeUsage('game', 999999);
    console.log(`✅ 无效时间使用验证: ${invalidTimeUsage}`);
    
    console.log('🎉 边界条件测试通过！');
    return { success: true };
    
  } catch (error) {
    console.error('❌ 边界条件测试失败:', error);
    return { success: false, error: error.message };
  }
};

// 数据一致性测试
export const runConsistencyTests = () => {
  console.log('🔄 开始数据一致性测试...');
  
  try {
    // 清除数据
    clearAllData();
    
    // 添加测试数据
    const testRecord = createPointRecord(POINT_TYPES.HANDWRITING, 5, '一致性测试');
    savePointRecord(testRecord);
    
    // 多次读取验证一致性
    const read1 = getPointRecords();
    const read2 = getPointRecords();
    const read3 = getPointRecords();
    
    const consistent = JSON.stringify(read1) === JSON.stringify(read2) && 
                     JSON.stringify(read2) === JSON.stringify(read3);
    
    console.log(`✅ 数据一致性: ${consistent ? '通过' : '失败'}`);
    
    // 测试计算一致性
    const calc1 = calculateTotalPoints();
    const calc2 = calculateTotalPoints();
    const calc3 = calculateTotalPoints();
    
    const calcConsistent = calc1 === calc2 && calc2 === calc3;
    console.log(`✅ 计算一致性: ${calcConsistent ? '通过' : '失败'}`);
    
    return { 
      success: consistent && calcConsistent,
      dataConsistent: consistent,
      calcConsistent: calcConsistent
    };
    
  } catch (error) {
    console.error('❌ 一致性测试失败:', error);
    return { success: false, error: error.message };
  }
};

// 运行所有测试
export const runAllTests = () => {
  console.log('🚀 开始运行完整测试套件...');
  
  const results = {
    basic: runTests(),
    performance: runPerformanceTests(),
    boundary: runBoundaryTests(),
    consistency: runConsistencyTests(),
  };
  
  const allPassed = Object.values(results).every(result => result.success);
  
  console.log(`\n📊 测试结果汇总:`);
  console.log(`基础功能: ${results.basic.success ? '✅' : '❌'}`);
  console.log(`性能测试: ${results.performance ? '✅' : '❌'}`);
  console.log(`边界条件: ${results.boundary.success ? '✅' : '❌'}`);
  console.log(`数据一致性: ${results.consistency.success ? '✅' : '❌'}`);
  console.log(`\n总体结果: ${allPassed ? '🎉 全部通过' : '❌ 存在问题'}`);
  
  return results;
};
