-- 学生积分管理系统 Supabase 数据库表结构
-- 在 Supabase SQL Editor 中运行此脚本来创建必要的表

-- 1. 学生档案表
CREATE TABLE IF NOT EXISTS student_profiles (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL DEFAULT '学生',
    notifications BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    subject_ranking INTEGER DEFAULT 10,
    total_class_ranking INTEGER DEFAULT 10,
    total_grade_ranking INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 积分记录表
CREATE TABLE IF NOT EXISTS point_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    value INTEGER NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    week_number INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 时间记录表
CREATE TABLE IF NOT EXISTS time_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('game', 'entertainment')),
    minutes INTEGER NOT NULL CHECK (minutes > 0),
    description TEXT,
    date TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 周统计表（可选，用于缓存计算结果）
CREATE TABLE IF NOT EXISTS weekly_stats (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    total_points INTEGER DEFAULT 0,
    positive_points INTEGER DEFAULT 0,
    negative_points INTEGER DEFAULT 0,
    points_by_type JSONB DEFAULT '{}',
    available_time JSONB DEFAULT '{}',
    used_time JSONB DEFAULT '{}',
    remaining_time JSONB DEFAULT '{}',
    record_count INTEGER DEFAULT 0,
    has_consecutive_bonus BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, week_number)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_point_records_student_id ON point_records(student_id);
CREATE INDEX IF NOT EXISTS idx_point_records_week_number ON point_records(week_number);
CREATE INDEX IF NOT EXISTS idx_point_records_timestamp ON point_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_point_records_type ON point_records(type);

CREATE INDEX IF NOT EXISTS idx_time_records_student_id ON time_records(student_id);
CREATE INDEX IF NOT EXISTS idx_time_records_timestamp ON time_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_records_type ON time_records(type);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(date);

CREATE INDEX IF NOT EXISTS idx_weekly_stats_student_id ON weekly_stats(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_week_number ON weekly_stats(week_number);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_student_profiles_updated_at 
    BEFORE UPDATE ON student_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_stats_updated_at 
    BEFORE UPDATE ON weekly_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全性（RLS）
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（允许用户访问自己的数据）
-- 注意：这里假设使用匿名访问，在生产环境中应该使用适当的认证

-- 学生档案策略
CREATE POLICY "Users can view their own profile" ON student_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON student_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON student_profiles
    FOR UPDATE USING (true);

-- 积分记录策略
CREATE POLICY "Users can view their own point records" ON point_records
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own point records" ON point_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own point records" ON point_records
    FOR UPDATE USING (true);

-- 时间记录策略
CREATE POLICY "Users can view their own time records" ON time_records
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own time records" ON time_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own time records" ON time_records
    FOR UPDATE USING (true);

-- 周统计策略
CREATE POLICY "Users can view their own weekly stats" ON weekly_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own weekly stats" ON weekly_stats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own weekly stats" ON weekly_stats
    FOR UPDATE USING (true);

-- 插入示例数据（可选）
-- INSERT INTO student_profiles (id, student_name) VALUES ('demo_student', '演示学生');

-- 创建视图以简化查询
CREATE OR REPLACE VIEW student_summary AS
SELECT 
    sp.id,
    sp.student_name,
    sp.subject_ranking,
    sp.total_class_ranking,
    sp.total_grade_ranking,
    COUNT(pr.id) as total_records,
    COALESCE(SUM(pr.value), 0) as total_points,
    COUNT(tr.id) as total_time_records,
    COALESCE(SUM(tr.minutes), 0) as total_minutes_used
FROM student_profiles sp
LEFT JOIN point_records pr ON sp.id = pr.student_id
LEFT JOIN time_records tr ON sp.id = tr.student_id
GROUP BY sp.id, sp.student_name, sp.subject_ranking, sp.total_class_ranking, sp.total_grade_ranking;

-- 创建函数来计算周统计（可选）
CREATE OR REPLACE FUNCTION calculate_weekly_stats(student_id_param TEXT, week_number_param INTEGER)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_points INTEGER;
    positive_points INTEGER;
    negative_points INTEGER;
    record_count INTEGER;
BEGIN
    -- 计算积分统计
    SELECT 
        COALESCE(SUM(value), 0),
        COALESCE(SUM(CASE WHEN value > 0 THEN value ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN value < 0 THEN value ELSE 0 END), 0),
        COUNT(*)
    INTO total_points, positive_points, negative_points, record_count
    FROM point_records 
    WHERE student_id = student_id_param AND week_number = week_number_param;
    
    -- 构建结果
    result := jsonb_build_object(
        'total_points', total_points,
        'positive_points', positive_points,
        'negative_points', negative_points,
        'record_count', record_count
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 完成提示
SELECT 'Supabase 数据库表结构创建完成！' as message;
