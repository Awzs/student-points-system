// 演示数据生成器
import { 
  createPointRecord, 
  createTimeRecord, 
  POINT_TYPES, 
  getWeekNumber 
} from './dataModel.js';
import { 
  savePointRecord, 
  saveTimeRecord, 
  clearAllData 
} from './storage.js';

// 生成演示积分记录
export const generateDemoPointRecords = () => {
  const currentWeek = getWeekNumber(new Date());
  const lastWeek = currentWeek - 1;
  
  const demoRecords = [
    // 本周记录
    createPointRecord(POINT_TYPES.HANDWRITING, 5, '语文作业字迹工整', { week: currentWeek }),
    createPointRecord(POINT_TYPES.HANDWRITING, 5, '数学作业字迹优秀', { week: currentWeek }),
    createPointRecord(POINT_TYPES.EXAM_TOP5, 15, '英语考试班级第4名', { week: currentWeek }),
    createPointRecord(POINT_TYPES.ERROR_COLLECTION, 8, '整理4道数学错题', { week: currentWeek }),
    createPointRecord(POINT_TYPES.ERROR_COLLECTION, 6, '整理3道物理错题', { week: currentWeek }),
    createPointRecord(POINT_TYPES.ERROR_PRACTICE, 12, '完成12道错题练习，准确率85%', { 
      week: currentWeek,
      errorPractice: { correct: 10, total: 12 }
    }),
    createPointRecord(POINT_TYPES.SUBJECT_PROGRESS, 15, '数学排名从15名进步到12名', { 
      week: currentWeek,
      oldRanking: 15,
      newRanking: 12
    }),
    
    // 上周记录
    createPointRecord(POINT_TYPES.HANDWRITING, 5, '历史作业字迹工整', { week: lastWeek }),
    createPointRecord(POINT_TYPES.EXAM_TOP5, 15, '化学考试班级第3名', { week: lastWeek }),
    createPointRecord(POINT_TYPES.ERROR_COLLECTION, 10, '整理5道化学错题', { week: lastWeek }),
    createPointRecord(POINT_TYPES.TOTAL_PROGRESS, 25, '班级总排名从15名进步到10名', { 
      week: lastWeek,
      oldRanking: 15,
      newRanking: 10
    }),
    createPointRecord(POINT_TYPES.TEACHER_COMPLAINT, -20, '上课讲话被老师批评', { week: lastWeek }),
    
    // 更早的记录
    createPointRecord(POINT_TYPES.HANDWRITING, 5, '地理作业字迹优秀', { week: lastWeek - 1 }),
    createPointRecord(POINT_TYPES.ERROR_COLLECTION, 4, '整理2道生物错题', { week: lastWeek - 1 }),
    createPointRecord(POINT_TYPES.EXAM_TOP5, 15, '生物考试班级第5名', { week: lastWeek - 1 }),
  ];
  
  return demoRecords;
};

// 生成演示时间记录
export const generateDemoTimeRecords = () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const demoRecords = [
    // 本周记录
    createTimeRecord('game', 45, '玩王者荣耀'),
    createTimeRecord('entertainment', 30, '看抖音短视频'),
    createTimeRecord('game', 60, '玩和平精英'),
    createTimeRecord('entertainment', 40, '刷微博'),
    
    // 上周记录
    createTimeRecord('game', 50, '玩原神'),
    createTimeRecord('entertainment', 35, '看B站视频'),
    createTimeRecord('game', 40, '玩王者荣耀'),
    createTimeRecord('entertainment', 25, '看小红书'),
  ];
  
  // 设置正确的时间戳
  demoRecords[0].timestamp = now.toISOString();
  demoRecords[1].timestamp = yesterday.toISOString();
  demoRecords[2].timestamp = yesterday.toISOString();
  demoRecords[3].timestamp = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  
  demoRecords[4].timestamp = lastWeek.toISOString();
  demoRecords[5].timestamp = new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000).toISOString();
  demoRecords[6].timestamp = new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
  demoRecords[7].timestamp = new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  
  return demoRecords;
};

// 加载演示数据
export const loadDemoData = () => {
  console.log('🎭 正在加载演示数据...');
  
  try {
    // 清除现有数据
    clearAllData();
    
    // 生成并保存演示数据
    const pointRecords = generateDemoPointRecords();
    const timeRecords = generateDemoTimeRecords();
    
    pointRecords.forEach(record => {
      // 调整时间戳到正确的周
      if (record.metadata.week) {
        const weekDiff = getWeekNumber(new Date()) - record.metadata.week;
        const adjustedDate = new Date(Date.now() - weekDiff * 7 * 24 * 60 * 60 * 1000);
        record.timestamp = adjustedDate.toISOString();
        record.weekNumber = record.metadata.week;
      }
      savePointRecord(record);
    });
    
    timeRecords.forEach(record => {
      saveTimeRecord(record);
    });
    
    console.log(`✅ 成功加载 ${pointRecords.length} 条积分记录`);
    console.log(`✅ 成功加载 ${timeRecords.length} 条时间记录`);
    console.log('🎉 演示数据加载完成！请刷新页面查看效果。');
    
    return {
      success: true,
      pointRecords: pointRecords.length,
      timeRecords: timeRecords.length
    };
    
  } catch (error) {
    console.error('❌ 演示数据加载失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 生成随机积分记录（用于压力测试）
export const generateRandomPointRecords = (count = 50) => {
  console.log(`🎲 正在生成 ${count} 条随机积分记录...`);
  
  const pointTypes = Object.values(POINT_TYPES);
  const descriptions = [
    '语文作业表现优秀', '数学考试进步明显', '英语听写全对',
    '物理实验认真', '化学作业工整', '生物笔记详细',
    '历史背诵流利', '地理图表清晰', '政治思考深入',
    '体育锻炼积极', '音乐课堂活跃', '美术作品精美'
  ];
  
  const records = [];
  const currentWeek = getWeekNumber(new Date());
  
  for (let i = 0; i < count; i++) {
    const randomType = pointTypes[Math.floor(Math.random() * pointTypes.length)];
    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomWeek = currentWeek - Math.floor(Math.random() * 4); // 最近4周
    
    let value;
    switch (randomType) {
      case POINT_TYPES.HANDWRITING:
        value = 5;
        break;
      case POINT_TYPES.EXAM_TOP5:
        value = 15;
        break;
      case POINT_TYPES.ERROR_COLLECTION:
        value = Math.floor(Math.random() * 10) + 2; // 2-12分
        break;
      case POINT_TYPES.ERROR_PRACTICE:
        value = Math.floor(Math.random() * 15) + 5; // 5-20分
        break;
      case POINT_TYPES.SUBJECT_PROGRESS:
        value = Math.floor(Math.random() * 20) + 5; // 5-25分
        break;
      case POINT_TYPES.TOTAL_PROGRESS:
        value = Math.floor(Math.random() * 25) + 10; // 10-35分
        break;
      case POINT_TYPES.TEACHER_COMPLAINT:
        value = -20;
        break;
      default:
        value = Math.floor(Math.random() * 10) + 1; // 1-10分
    }
    
    const record = createPointRecord(randomType, value, randomDesc);
    
    // 调整时间戳
    const weekDiff = currentWeek - randomWeek;
    const adjustedDate = new Date(Date.now() - weekDiff * 7 * 24 * 60 * 60 * 1000 + Math.random() * 7 * 24 * 60 * 60 * 1000);
    record.timestamp = adjustedDate.toISOString();
    record.weekNumber = randomWeek;
    
    records.push(record);
  }
  
  // 保存记录
  records.forEach(record => savePointRecord(record));
  
  console.log(`✅ 成功生成并保存 ${count} 条随机积分记录`);
  return records;
};

// 重置为初始状态
export const resetToInitialState = () => {
  console.log('🔄 重置为初始状态...');
  
  try {
    clearAllData();
    console.log('✅ 数据已清除，应用已重置为初始状态');
    console.log('💡 提示：刷新页面以查看空白状态');
    
    return { success: true };
  } catch (error) {
    console.error('❌ 重置失败:', error);
    return { success: false, error: error.message };
  }
};

// 导出所有演示功能到全局（开发模式）
export const setupDemoFunctions = () => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.loadDemoData = loadDemoData;
    window.generateRandomData = generateRandomPointRecords;
    window.resetApp = resetToInitialState;
    
    console.log('🎭 演示功能已加载：');
    console.log('  - loadDemoData() - 加载演示数据');
    console.log('  - generateRandomData(count) - 生成随机数据');
    console.log('  - resetApp() - 重置应用');
  }
};
