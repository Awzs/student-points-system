import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Clock, Trophy, AlertTriangle } from 'lucide-react';

const RulesView = () => {
  const [expandedSections, setExpandedSections] = useState({
    points: true,
    time: false,
    rewards: false,
    penalties: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const RuleSection = ({ id, title, icon: Icon, children, color = 'blue' }) => {
    const isExpanded = expandedSections[id];
    
    return (
      <div className={`rule-section ${color}`}>
        <button 
          className="section-header"
          onClick={() => toggleSection(id)}
        >
          <div className="header-content">
            <Icon size={20} />
            <h3>{title}</h3>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {isExpanded && (
          <div className="section-content">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rules-view">
      <div className="page-header">
        <h2>规则说明</h2>
        <p>了解积分系统的详细规则和使用方法</p>
      </div>

      <div className="rules-container">
        {/* 积分评价指标 */}
        <RuleSection id="points" title="积分评价指标" icon={Plus} color="green">
          <div className="rule-category">
            <h4>加分项</h4>
            <div className="rule-items">
              <div className="rule-item">
                <div className="rule-name">书写笔迹优秀</div>
                <div className="rule-value">+5分/次</div>
                <div className="rule-description">字迹工整、美观，获得老师认可</div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">单科班级前5名</div>
                <div className="rule-value">+15分</div>
                <div className="rule-description">任意单科考试成绩进入班级前5名</div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">单科排名进步</div>
                <div className="rule-value">+5分/名次</div>
                <div className="rule-description">单科排名相比上次考试的进步名次</div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">班级总排名进步</div>
                <div className="rule-value">+5分/名次</div>
                <div className="rule-description">班级总分排名相比上次考试的进步名次</div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">错题积累</div>
                <div className="rule-value">+2分/题</div>
                <div className="rule-description">整理错题到错题本，每题2分</div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">错题举一反三刷题</div>
                <div className="rule-value">+1分/题</div>
                <div className="rule-description">针对错题进行相关练习，准确率需达到80%以上</div>
              </div>
            </div>
          </div>

          <div className="rule-category">
            <h4>扣分项</h4>
            <div className="rule-items">
              <div className="rule-item negative">
                <div className="rule-name">老师投诉</div>
                <div className="rule-value">-20分/次</div>
                <div className="rule-description">因违纪、不认真学习等被老师投诉</div>
              </div>
            </div>
          </div>

          <div className="rule-category">
            <h4>初始设定</h4>
            <div className="initial-settings">
              <div className="setting-item">
                <span>单科班级排名:</span>
                <span>第10名</span>
              </div>
              <div className="setting-item">
                <span>总分班级排名:</span>
                <span>第10名</span>
              </div>
              <div className="setting-item">
                <span>总分年级排名:</span>
                <span>第50名</span>
              </div>
            </div>
          </div>
        </RuleSection>

        {/* 时间兑换与使用规则 */}
        <RuleSection id="time" title="时间兑换与使用规则" icon={Clock} color="blue">
          <div className="rule-category">
            <h4>兑换规则</h4>
            <div className="exchange-rules">
              <div className="rule-item">
                <div className="rule-name">兑换比例</div>
                <div className="rule-value">1积分 = 1分钟</div>
                <div className="rule-description">每1积分可兑换1分钟娱乐时间</div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">结算周期</div>
                <div className="rule-value">每周五晚上</div>
                <div className="rule-description">每周五晚上进行积分结算，转换为娱乐时间</div>
              </div>
              
              <div className="rule-item">
                <div className="rule-name">时间上限</div>
                <div className="rule-value">最多200分钟/周</div>
                <div className="rule-description">每周最多获得200分钟娱乐时间</div>
              </div>
            </div>
          </div>

          <div className="rule-category">
            <h4>时间分配</h4>
            <div className="time-allocation">
              <div className="allocation-item">
                <div className="allocation-type">游戏时间</div>
                <div className="allocation-ratio">50%</div>
                <div className="allocation-description">用于玩游戏（王者荣耀、和平精英等）</div>
              </div>
              <div className="allocation-item">
                <div className="allocation-type">泛娱乐时间</div>
                <div className="allocation-ratio">50%</div>
                <div className="allocation-description">用于手机泛娱乐（短视频、社交软件等）</div>
              </div>
            </div>
          </div>

          <div className="rule-category">
            <h4>使用限制</h4>
            <div className="usage-restrictions">
              <div className="restriction-item">
                <span>使用时间:</span>
                <span>仅限周六、周日</span>
              </div>
              <div className="restriction-item">
                <span>时间分配:</span>
                <span>不得集中在一天使用</span>
              </div>
              <div className="restriction-item">
                <span>积分结余:</span>
                <span>未用完的积分可结转下周</span>
              </div>
            </div>
          </div>
        </RuleSection>

        {/* 奖励机制 */}
        <RuleSection id="rewards" title="奖励机制" icon={Trophy} color="yellow">
          <div className="reward-items">
            <div className="reward-item">
              <div className="reward-trigger">连续两周积分超过300分</div>
              <div className="reward-benefit">获得一次"自由娱乐时间"</div>
              <div className="reward-description">
                可以在工作日使用一定时间的娱乐时间，具体时长由家长决定
              </div>
            </div>
            
            <div className="reward-item">
              <div className="reward-trigger">月考大幅进步</div>
              <div className="reward-benefit">特殊家庭活动奖励</div>
              <div className="reward-description">
                如看电影、外出游玩、购买心仪物品等特殊奖励
              </div>
            </div>
          </div>
        </RuleSection>

        {/* 惩罚机制 */}
        <RuleSection id="penalties" title="惩罚机制" icon={AlertTriangle} color="red">
          <div className="penalty-items">
            <div className="penalty-item">
              <div className="penalty-trigger">触发扣分项</div>
              <div className="penalty-consequence">额外禁娱1-7天</div>
              <div className="penalty-description">
                根据扣分严重程度，在原有规则基础上额外禁止娱乐1-7天
              </div>
            </div>
            
            <div className="penalty-item">
              <div className="penalty-trigger">总积分为负数</div>
              <div className="penalty-consequence">本周无娱乐时间</div>
              <div className="penalty-description">
                当总积分为负数时，本周无法获得娱乐时间，下周需先补足负分
              </div>
            </div>
          </div>
        </RuleSection>
      </div>

      {/* 使用建议 */}
      <div className="usage-tips">
        <h3>使用建议</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <h4>📚 学习方面</h4>
            <ul>
              <li>认真完成作业，保持字迹工整</li>
              <li>及时整理错题，加强薄弱环节</li>
              <li>制定学习计划，稳步提升成绩</li>
            </ul>
          </div>
          
          <div className="tip-item">
            <h4>⏰ 时间管理</h4>
            <ul>
              <li>合理安排娱乐时间，避免沉迷</li>
              <li>周六周日均衡使用，不要集中</li>
              <li>优先完成学习任务再使用娱乐时间</li>
            </ul>
          </div>
          
          <div className="tip-item">
            <h4>🎯 目标设定</h4>
            <ul>
              <li>每周争取获得300+积分</li>
              <li>持续进步，争取排名提升</li>
              <li>培养良好的学习和生活习惯</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesView;
