import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表名
export const TABLES = {
  POINT_RECORDS: 'point_records',
  TIME_RECORDS: 'time_records',
  STUDENT_PROFILES: 'student_profiles',
  WEEKLY_STATS: 'weekly_stats',
};

// 积分记录相关操作
export const pointRecordsAPI = {
  // 获取所有积分记录
  async getAll(studentId) {
    const { data, error } = await supabase
      .from(TABLES.POINT_RECORDS)
      .select('*')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // 添加积分记录
  async create(record) {
    const { data, error } = await supabase
      .from(TABLES.POINT_RECORDS)
      .insert([record])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // 更新积分记录
  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.POINT_RECORDS)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // 删除积分记录
  async delete(id) {
    const { error } = await supabase
      .from(TABLES.POINT_RECORDS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// 时间记录相关操作
export const timeRecordsAPI = {
  // 获取所有时间记录
  async getAll(studentId) {
    const { data, error } = await supabase
      .from(TABLES.TIME_RECORDS)
      .select('*')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // 添加时间记录
  async create(record) {
    const { data, error } = await supabase
      .from(TABLES.TIME_RECORDS)
      .insert([record])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // 更新时间记录
  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.TIME_RECORDS)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // 删除时间记录
  async delete(id) {
    const { error } = await supabase
      .from(TABLES.TIME_RECORDS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// 学生档案相关操作
export const studentProfilesAPI = {
  // 获取学生档案
  async get(studentId) {
    const { data, error } = await supabase
      .from(TABLES.STUDENT_PROFILES)
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // 创建或更新学生档案
  async upsert(profile) {
    const { data, error } = await supabase
      .from(TABLES.STUDENT_PROFILES)
      .upsert([profile])
      .select();
    
    if (error) throw error;
    return data[0];
  },
};

// 周统计相关操作
export const weeklyStatsAPI = {
  // 获取周统计
  async get(studentId, weekNumber) {
    const { data, error } = await supabase
      .from(TABLES.WEEKLY_STATS)
      .select('*')
      .eq('student_id', studentId)
      .eq('week_number', weekNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // 保存周统计
  async upsert(stats) {
    const { data, error } = await supabase
      .from(TABLES.WEEKLY_STATS)
      .upsert([stats])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // 获取历史周统计
  async getHistory(studentId, limit = 10) {
    const { data, error } = await supabase
      .from(TABLES.WEEKLY_STATS)
      .select('*')
      .eq('student_id', studentId)
      .order('week_number', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },
};

// 检查Supabase连接状态
export const checkConnection = async () => {
  try {
    const { error } = await supabase
      .from('point_records')
      .select('count', { count: 'exact', head: true });

    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
