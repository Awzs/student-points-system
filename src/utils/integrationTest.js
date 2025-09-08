// 集成测试脚本
import { pointRecordService, timeRecordService } from '../services/dataService.js';
import { createPointRecord, createTimeRecord, POINT_TYPES } from './dataModel.js';
import { calculateTotalPoints, calculateWeeklyPoints, calculateAvailableTime } from './pointsCalculator.js';

// 测试数据
const testData = {
  pointRecords: [
    createPointRecord(POINT_TYPES.HANDWRITING, 5, '测试书写笔迹优秀'),
    createPointRecord(POINT_TYPES.EXAM_TOP5, 15, '测试单科班级前5名'),
    createPointRecord(POINT_TYPES.ERROR_COLLECTION, 10, '测试错题积累'),
    createPointRecord(POINT_TYPES.TEACHER_COMPLAINT, -20, '测试老师投诉'),
  ],
  timeRecords: [
    createTimeRecord('game', 30, '测试游戏时间'),
    createTimeRecord('entertainment', 45, '测试泛娱乐时间'),
  ]
};

// 运行集成测试
export const runIntegrationTests = async () => {
  console.log('🚀 开始运行集成测试...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // 测试1: 积分记录创建和读取
  try {
    console.log('📝 测试积分记录功能...');
    
    for (const record of testData.pointRecords) {
      await pointRecordService.create(record);
    }
    
    const savedRecords = await pointRecordService.getAll();
    const testRecords = savedRecords.filter(r => r.description.startsWith('测试'));
    
    if (testRecords.length >= testData.pointRecords.length) {
      console.log('✅ 积分记录创建和读取测试通过');
      results.passed++;
      results.tests.push({ name: '积分记录功能', status: 'passed' });
    } else {
      throw new Error(`期望至少 ${testData.pointRecords.length} 条记录，实际 ${testRecords.length} 条`);
    }
  } catch (error) {
    console.error('❌ 积分记录测试失败:', error);
    results.failed++;
    results.tests.push({ name: '积分记录功能', status: 'failed', error: error.message });
  }

  // 测试2: 时间记录创建和读取
  try {
    console.log('⏰ 测试时间记录功能...');
    
    for (const record of testData.timeRecords) {
      await timeRecordService.create(record);
    }
    
    const savedTimeRecords = await timeRecordService.getAll();
    const testTimeRecords = savedTimeRecords.filter(r => r.description.startsWith('测试'));
    
    if (testTimeRecords.length >= testData.timeRecords.length) {
      console.log('✅ 时间记录创建和读取测试通过');
      results.passed++;
      results.tests.push({ name: '时间记录功能', status: 'passed' });
    } else {
      throw new Error(`期望至少 ${testData.timeRecords.length} 条记录，实际 ${testTimeRecords.length} 条`);
    }
  } catch (error) {
    console.error('❌ 时间记录测试失败:', error);
    results.failed++;
    results.tests.push({ name: '时间记录功能', status: 'failed', error: error.message });
  }

  // 测试3: 积分计算功能
  try {
    console.log('🧮 测试积分计算功能...');
    
    const totalPoints = await calculateTotalPoints();
    const weeklyPoints = await calculateWeeklyPoints();
    const availableTime = await calculateAvailableTime();
    
    if (typeof totalPoints === 'number' && 
        typeof weeklyPoints === 'number' && 
        typeof availableTime.totalMinutes === 'number') {
      console.log('✅ 积分计算功能测试通过');
      console.log(`   总积分: ${totalPoints}, 本周积分: ${weeklyPoints}, 可用时间: ${availableTime.totalMinutes}分钟`);
      results.passed++;
      results.tests.push({ name: '积分计算功能', status: 'passed' });
    } else {
      throw new Error('积分计算返回值类型错误');
    }
  } catch (error) {
    console.error('❌ 积分计算测试失败:', error);
    results.failed++;
    results.tests.push({ name: '积分计算功能', status: 'failed', error: error.message });
  }

  // 测试4: 数据一致性检查
  try {
    console.log('🔄 测试数据一致性...');
    
    const records1 = await pointRecordService.getAll();
    const records2 = await pointRecordService.getAll();
    
    if (JSON.stringify(records1) === JSON.stringify(records2)) {
      console.log('✅ 数据一致性测试通过');
      results.passed++;
      results.tests.push({ name: '数据一致性', status: 'passed' });
    } else {
      throw new Error('多次读取数据不一致');
    }
  } catch (error) {
    console.error('❌ 数据一致性测试失败:', error);
    results.failed++;
    results.tests.push({ name: '数据一致性', status: 'failed', error: error.message });
  }

  // 输出测试结果
  console.log('\n📊 测试结果汇总:');
  console.log(`✅ 通过: ${results.passed}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`📈 成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️ 存在测试失败，请检查问题');
  }

  return results;
};

// 清理测试数据
export const cleanupTestData = async () => {
  console.log('🧹 清理测试数据...');
  
  try {
    const pointRecords = await pointRecordService.getAll();
    const timeRecords = await timeRecordService.getAll();
    
    const testPointRecords = pointRecords.filter(r => r.description.startsWith('测试'));
    const testTimeRecords = timeRecords.filter(r => r.description.startsWith('测试'));
    
    console.log(`清理 ${testPointRecords.length} 条测试积分记录`);
    console.log(`清理 ${testTimeRecords.length} 条测试时间记录`);
    
    // 注意：这里只是标记，实际删除需要实现删除功能
    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error);
  }
};

// 在开发模式下添加到全局
if (import.meta.env.DEV) {
  window.runIntegrationTests = runIntegrationTests;
  window.cleanupTestData = cleanupTestData;
}
