// 统一数据服务层 - 支持localStorage和Supabase
import {
  pointRecordsAPI,
  timeRecordsAPI,
  studentProfilesAPI,
  // weeklyStatsAPI,
  checkConnection
} from '../utils/supabase.js';
import * as localStorage from '../utils/storage.js';
import { getSettings } from '../utils/storage.js';

// 数据存储模式
const STORAGE_MODE = {
  LOCAL: 'local',
  SUPABASE: 'supabase',
  HYBRID: 'hybrid' // 本地缓存 + 云端同步
};

// 当前存储模式（默认为混合模式）
let currentMode = STORAGE_MODE.HYBRID;
let isOnline = navigator.onLine;
let supabaseAvailable = false;

// 检查Supabase连接状态
const checkSupabaseConnection = async () => {
  try {
    supabaseAvailable = await checkConnection();
    return supabaseAvailable;
  } catch (error) {
    console.warn('Supabase连接检查失败:', error);
    supabaseAvailable = false;
    return false;
  }
};

// 获取当前学生ID（从设置中获取或生成）
const getCurrentStudentId = () => {
  const settings = getSettings();
  if (!settings.studentId) {
    // 生成唯一学生ID
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.updateSettings({ ...settings, studentId });
    return studentId;
  }
  return settings.studentId;
};

// 数据同步状态管理
class SyncManager {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = localStorage.getStorageData('lastSyncTime', 0);
  }

  // 添加到同步队列
  addToQueue(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(2, 11)
    });
    this.saveQueueToLocal();
  }

  // 保存队列到本地
  saveQueueToLocal() {
    localStorage.setStorageData('syncQueue', this.syncQueue);
  }

  // 从本地加载队列
  loadQueueFromLocal() {
    this.syncQueue = localStorage.getStorageData('syncQueue', []);
  }

  // 执行同步
  async sync() {
    if (this.isSyncing || !supabaseAvailable || !isOnline) {
      return false;
    }

    this.isSyncing = true;
    console.log('🔄 开始数据同步...');

    try {
      const studentId = getCurrentStudentId();
      
      // 处理同步队列中的操作
      for (const operation of this.syncQueue) {
        try {
          await this.executeOperation(operation, studentId);
        } catch (error) {
          console.error('同步操作失败:', operation, error);
          // 保留失败的操作在队列中
          continue;
        }
      }

      // 清空已成功同步的操作
      this.syncQueue = [];
      this.saveQueueToLocal();
      
      // 更新最后同步时间
      this.lastSyncTime = Date.now();
      localStorage.setStorageData('lastSyncTime', this.lastSyncTime);
      
      console.log('✅ 数据同步完成');
      return true;
    } catch (error) {
      console.error('❌ 数据同步失败:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // 执行单个同步操作
  async executeOperation(operation, studentId) {
    const { type, action, data } = operation;
    
    switch (type) {
      case 'pointRecord':
        if (action === 'create') {
          await pointRecordsAPI.create({ ...data, student_id: studentId });
        }
        break;
      case 'timeRecord':
        if (action === 'create') {
          await timeRecordsAPI.create({ ...data, student_id: studentId });
        }
        break;
      case 'studentProfile':
        if (action === 'upsert') {
          await studentProfilesAPI.upsert({ ...data, id: studentId });
        }
        break;
      default:
        console.warn('未知的同步操作类型:', type);
    }
  }
}

// 创建同步管理器实例
const syncManager = new SyncManager();

// 初始化数据服务
export const initializeDataService = async () => {
  console.log('🚀 初始化数据服务...');
  
  // 检查网络状态
  isOnline = navigator.onLine;
  
  // 检查Supabase连接
  if (isOnline) {
    supabaseAvailable = await checkSupabaseConnection();
  }
  
  // 加载本地同步队列
  syncManager.loadQueueFromLocal();
  
  // 设置存储模式
  if (supabaseAvailable && isOnline) {
    currentMode = STORAGE_MODE.HYBRID;
    console.log('📡 使用混合存储模式（本地缓存 + 云端同步）');
    
    // 尝试同步
    await syncManager.sync();
  } else {
    currentMode = STORAGE_MODE.LOCAL;
    console.log('💾 使用本地存储模式');
  }
  
  // 监听网络状态变化
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return {
    mode: currentMode,
    supabaseAvailable,
    isOnline
  };
};

// 网络状态变化处理
const handleOnline = async () => {
  isOnline = true;
  console.log('🌐 网络已连接');
  
  // 重新检查Supabase连接
  supabaseAvailable = await checkSupabaseConnection();
  
  if (supabaseAvailable) {
    currentMode = STORAGE_MODE.HYBRID;
    // 尝试同步离线期间的数据
    await syncManager.sync();
  }
};

const handleOffline = () => {
  isOnline = false;
  currentMode = STORAGE_MODE.LOCAL;
  console.log('📴 网络已断开，切换到本地存储模式');
};

// 积分记录服务
export const pointRecordService = {
  // 获取所有积分记录
  async getAll() {
    try {
      if (currentMode === STORAGE_MODE.HYBRID && supabaseAvailable) {
        const studentId = getCurrentStudentId();
        const cloudData = await pointRecordsAPI.getAll(studentId);
        
        // 合并本地和云端数据（去重）
        const localData = localStorage.getPointRecords();
        const mergedData = this.mergeRecords(localData, cloudData);
        
        // 更新本地缓存
        localStorage.updatePointRecords(mergedData);
        
        return mergedData;
      } else {
        return localStorage.getPointRecords();
      }
    } catch (error) {
      console.error('获取积分记录失败:', error);
      // 降级到本地存储
      return localStorage.getPointRecords();
    }
  },

  // 创建积分记录
  async create(record) {
    try {
      // 先保存到本地
      const success = localStorage.savePointRecord(record);
      
      if (!success) {
        throw new Error('本地保存失败');
      }
      
      // 如果支持云端同步，添加到同步队列
      if (currentMode === STORAGE_MODE.HYBRID) {
        syncManager.addToQueue({
          type: 'pointRecord',
          action: 'create',
          data: record
        });
        
        // 立即尝试同步（如果在线）
        if (isOnline && supabaseAvailable) {
          await syncManager.sync();
        }
      }
      
      return record;
    } catch (error) {
      console.error('创建积分记录失败:', error);
      throw error;
    }
  },

  // 合并记录（去重）
  mergeRecords(localRecords, cloudRecords) {
    const recordMap = new Map();
    
    // 添加本地记录
    localRecords.forEach(record => {
      recordMap.set(record.id, record);
    });
    
    // 添加云端记录（覆盖本地记录）
    cloudRecords.forEach(record => {
      recordMap.set(record.id, record);
    });
    
    return Array.from(recordMap.values()).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }
};

// 时间记录服务
export const timeRecordService = {
  // 获取所有时间记录
  async getAll() {
    try {
      if (currentMode === STORAGE_MODE.HYBRID && supabaseAvailable) {
        const studentId = getCurrentStudentId();
        const cloudData = await timeRecordsAPI.getAll(studentId);
        const localData = localStorage.getTimeRecords();
        const mergedData = this.mergeRecords(localData, cloudData);
        
        localStorage.updateTimeRecords(mergedData);
        return mergedData;
      } else {
        return localStorage.getTimeRecords();
      }
    } catch (error) {
      console.error('获取时间记录失败:', error);
      return localStorage.getTimeRecords();
    }
  },

  // 创建时间记录
  async create(record) {
    try {
      const success = localStorage.saveTimeRecord(record);
      
      if (!success) {
        throw new Error('本地保存失败');
      }
      
      if (currentMode === STORAGE_MODE.HYBRID) {
        syncManager.addToQueue({
          type: 'timeRecord',
          action: 'create',
          data: record
        });
        
        if (isOnline && supabaseAvailable) {
          await syncManager.sync();
        }
      }
      
      return record;
    } catch (error) {
      console.error('创建时间记录失败:', error);
      throw error;
    }
  },

  // 合并记录
  mergeRecords(localRecords, cloudRecords) {
    const recordMap = new Map();
    
    localRecords.forEach(record => {
      recordMap.set(record.id, record);
    });
    
    cloudRecords.forEach(record => {
      recordMap.set(record.id, record);
    });
    
    return Array.from(recordMap.values()).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }
};

// 学生档案服务
export const studentProfileService = {
  // 获取学生档案
  async get() {
    try {
      if (currentMode === STORAGE_MODE.HYBRID && supabaseAvailable) {
        const studentId = getCurrentStudentId();
        const cloudProfile = await studentProfilesAPI.get(studentId);
        
        if (cloudProfile) {
          // 更新本地设置
          const localSettings = localStorage.getSettings();
          const mergedSettings = { ...localSettings, ...cloudProfile };
          localStorage.updateSettings(mergedSettings);
          return mergedSettings;
        }
      }
      
      return localStorage.getSettings();
    } catch (error) {
      console.error('获取学生档案失败:', error);
      return localStorage.getSettings();
    }
  },

  // 更新学生档案
  async update(profile) {
    try {
      const success = localStorage.updateSettings(profile);
      
      if (!success) {
        throw new Error('本地保存失败');
      }
      
      if (currentMode === STORAGE_MODE.HYBRID) {
        syncManager.addToQueue({
          type: 'studentProfile',
          action: 'upsert',
          data: profile
        });
        
        if (isOnline && supabaseAvailable) {
          await syncManager.sync();
        }
      }
      
      return profile;
    } catch (error) {
      console.error('更新学生档案失败:', error);
      throw error;
    }
  }
};

// 获取同步状态
export const getSyncStatus = () => {
  return {
    mode: currentMode,
    isOnline,
    supabaseAvailable,
    queueLength: syncManager.syncQueue.length,
    lastSyncTime: syncManager.lastSyncTime,
    isSyncing: syncManager.isSyncing
  };
};

// 手动触发同步
export const manualSync = async () => {
  if (currentMode === STORAGE_MODE.HYBRID && isOnline && supabaseAvailable) {
    return await syncManager.sync();
  }
  return false;
};

// 清理资源
export const cleanup = () => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
};
