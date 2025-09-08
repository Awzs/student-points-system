import { useState } from 'react';
import { Plus, Minus, Save, RotateCcw } from 'lucide-react';
import {
  POINT_TYPES,
  POINT_VALUES,
  createPointRecord,
  calculateProgressPoints,
  validateErrorPracticeAccuracy
} from '../utils/dataModel';
import { pointRecordService } from '../services/dataService';
import { getCurrentRankings, updateCurrentRankings } from '../utils/storage';
import { successHaptic, errorHaptic, buttonHaptic } from '../utils/haptics';

const PointEntry = () => {
  const [selectedType, setSelectedType] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [description, setDescription] = useState('');
  const [metadata, setMetadata] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 排名相关状态
  const [rankings, setRankings] = useState(getCurrentRankings());
  const [newRankings, setNewRankings] = useState({
    subjectRanking: '',
    totalClassRanking: '',
    totalGradeRanking: '',
  });

  // 错题练习相关状态
  const [errorPractice, setErrorPractice] = useState({
    correct: '',
    total: '',
  });

  const pointTypeOptions = [
    { value: POINT_TYPES.HANDWRITING, label: '书写笔迹优秀', points: POINT_VALUES[POINT_TYPES.HANDWRITING] },
    { value: POINT_TYPES.EXAM_TOP5, label: '单科班级前5名', points: POINT_VALUES[POINT_TYPES.EXAM_TOP5] },
    { value: POINT_TYPES.SUBJECT_PROGRESS, label: '单科排名进步', points: '根据进步名次计算' },
    { value: POINT_TYPES.TOTAL_PROGRESS, label: '班级总排名进步', points: '根据进步名次计算' },
    { value: POINT_TYPES.ERROR_COLLECTION, label: '错题积累', points: POINT_VALUES[POINT_TYPES.ERROR_COLLECTION] },
    { value: POINT_TYPES.ERROR_PRACTICE, label: '错题举一反三刷题', points: POINT_VALUES[POINT_TYPES.ERROR_PRACTICE] },
    { value: POINT_TYPES.TEACHER_COMPLAINT, label: '老师投诉', points: POINT_VALUES[POINT_TYPES.TEACHER_COMPLAINT] },
  ];

  const calculatePoints = () => {
    if (!selectedType) return 0;

    switch (selectedType) {
      case POINT_TYPES.SUBJECT_PROGRESS:
        if (newRankings.subjectRanking) {
          return calculateProgressPoints(
            rankings.subjectRanking, 
            parseInt(newRankings.subjectRanking), 
            POINT_TYPES.SUBJECT_PROGRESS
          );
        }
        return 0;

      case POINT_TYPES.TOTAL_PROGRESS:
        if (newRankings.totalClassRanking) {
          return calculateProgressPoints(
            rankings.totalClassRanking, 
            parseInt(newRankings.totalClassRanking), 
            POINT_TYPES.TOTAL_PROGRESS
          );
        }
        return 0;

      case POINT_TYPES.ERROR_PRACTICE:
        if (errorPractice.correct && errorPractice.total) {
          const correct = parseInt(errorPractice.correct);
          const total = parseInt(errorPractice.total);
          if (validateErrorPracticeAccuracy(correct, total)) {
            return total * POINT_VALUES[POINT_TYPES.ERROR_PRACTICE];
          }
          return 0;
        }
        return 0;

      default:
        return customValue ? parseInt(customValue) : POINT_VALUES[selectedType] || 0;
    }
  };

  const validateInput = () => {
    if (!selectedType) {
      return '请选择积分类型';
    }

    if (selectedType === POINT_TYPES.SUBJECT_PROGRESS && !newRankings.subjectRanking) {
      return '请输入新的单科排名';
    }

    if (selectedType === POINT_TYPES.TOTAL_PROGRESS && !newRankings.totalClassRanking) {
      return '请输入新的班级总排名';
    }

    if (selectedType === POINT_TYPES.ERROR_PRACTICE) {
      if (!errorPractice.correct || !errorPractice.total) {
        return '请输入正确题数和总题数';
      }
      if (parseInt(errorPractice.correct) > parseInt(errorPractice.total)) {
        return '正确题数不能大于总题数';
      }
      if (!validateErrorPracticeAccuracy(parseInt(errorPractice.correct), parseInt(errorPractice.total))) {
        return '准确率未达到80%要求，无法获得积分';
      }
    }

    const points = calculatePoints();
    if (points === 0 && selectedType !== POINT_TYPES.ERROR_PRACTICE) {
      return '积分计算结果为0，请检查输入';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateInput();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      errorHaptic();
      return;
    }

    setIsSubmitting(true);
    try {
      const points = calculatePoints();

      // 创建积分记录
      const record = createPointRecord(
        selectedType,
        points,
        description || getDefaultDescription(),
        {
          ...metadata,
          oldRankings: selectedType.includes('progress') ? rankings : undefined,
          newRankings: selectedType.includes('progress') ? newRankings : undefined,
          errorPractice: selectedType === POINT_TYPES.ERROR_PRACTICE ? errorPractice : undefined,
        }
      );

      // 保存记录
      await pointRecordService.create(record);

      // 更新排名（如果有变化）
      if (selectedType === POINT_TYPES.SUBJECT_PROGRESS && newRankings.subjectRanking) {
        const updatedRankings = { ...rankings, subjectRanking: parseInt(newRankings.subjectRanking) };
        updateCurrentRankings(updatedRankings);
        setRankings(updatedRankings);
      }

      if (selectedType === POINT_TYPES.TOTAL_PROGRESS && newRankings.totalClassRanking) {
        const updatedRankings = { ...rankings, totalClassRanking: parseInt(newRankings.totalClassRanking) };
        updateCurrentRankings(updatedRankings);
        setRankings(updatedRankings);
      }

      setMessage({ type: 'success', text: `成功添加 ${points} 积分！` });
      successHaptic();

      // 触发数据更新事件，通知其他组件刷新
      window.dispatchEvent(new CustomEvent('pointsUpdated', {
        detail: { points, type: selectedType, record }
      }));

      resetForm();
    } catch (error) {
      console.error('Error saving point record:', error);
      setMessage({ type: 'error', text: '保存失败，请重试' });
      errorHaptic();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultDescription = () => {
    const option = pointTypeOptions.find(opt => opt.value === selectedType);
    return option?.label || '';
  };

  const resetForm = () => {
    setSelectedType('');
    setCustomValue('');
    setDescription('');
    setMetadata({});
    setNewRankings({ subjectRanking: '', totalClassRanking: '', totalGradeRanking: '' });
    setErrorPractice({ correct: '', total: '' });
    buttonHaptic();
  };

  const renderSpecialInputs = () => {
    switch (selectedType) {
      case POINT_TYPES.SUBJECT_PROGRESS:
        return (
          <div className="special-inputs">
            <div className="input-group">
              <label>当前单科排名: {rankings.subjectRanking}</label>
              <input
                type="number"
                placeholder="新的单科排名"
                value={newRankings.subjectRanking}
                onChange={(e) => setNewRankings(prev => ({ ...prev, subjectRanking: e.target.value }))}
                min="1"
                max="50"
              />
            </div>
            <div className="progress-preview">
              {newRankings.subjectRanking && (
                <p>进步名次: {rankings.subjectRanking - parseInt(newRankings.subjectRanking)} 名</p>
              )}
            </div>
          </div>
        );

      case POINT_TYPES.TOTAL_PROGRESS:
        return (
          <div className="special-inputs">
            <div className="input-group">
              <label>当前班级总排名: {rankings.totalClassRanking}</label>
              <input
                type="number"
                placeholder="新的班级总排名"
                value={newRankings.totalClassRanking}
                onChange={(e) => setNewRankings(prev => ({ ...prev, totalClassRanking: e.target.value }))}
                min="1"
                max="50"
              />
            </div>
            <div className="progress-preview">
              {newRankings.totalClassRanking && (
                <p>进步名次: {rankings.totalClassRanking - parseInt(newRankings.totalClassRanking)} 名</p>
              )}
            </div>
          </div>
        );

      case POINT_TYPES.ERROR_PRACTICE:
        return (
          <div className="special-inputs">
            <div className="input-row">
              <div className="input-group">
                <label>正确题数</label>
                <input
                  type="number"
                  placeholder="正确题数"
                  value={errorPractice.correct}
                  onChange={(e) => setErrorPractice(prev => ({ ...prev, correct: e.target.value }))}
                  min="0"
                />
              </div>
              <div className="input-group">
                <label>总题数</label>
                <input
                  type="number"
                  placeholder="总题数"
                  value={errorPractice.total}
                  onChange={(e) => setErrorPractice(prev => ({ ...prev, total: e.target.value }))}
                  min="1"
                />
              </div>
            </div>
            <div className="accuracy-preview">
              {errorPractice.correct && errorPractice.total && (
                <p>
                  准确率: {((parseInt(errorPractice.correct) / parseInt(errorPractice.total)) * 100).toFixed(1)}%
                  {validateErrorPracticeAccuracy(parseInt(errorPractice.correct), parseInt(errorPractice.total)) 
                    ? ' ✅ 达到80%要求' 
                    : ' ❌ 未达到80%要求'}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="point-entry">
      <div className="page-header">
        <h2>积分录入</h2>
        <p>记录学习表现，获得积分奖励</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="entry-form">
        <div className="input-group">
          <label>积分类型 *</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            required
          >
            <option value="">请选择积分类型</option>
            {pointTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({typeof option.points === 'number' ? `${option.points}分` : option.points})
              </option>
            ))}
          </select>
        </div>

        {renderSpecialInputs()}

        {!['subject_progress', 'total_progress', 'error_practice'].includes(selectedType) && (
          <div className="input-group">
            <label>自定义积分值</label>
            <input
              type="number"
              placeholder={`默认: ${POINT_VALUES[selectedType] || 0} 分`}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
            />
          </div>
        )}

        <div className="input-group">
          <label>备注说明</label>
          <textarea
            placeholder="详细说明（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>

        <div className="points-preview">
          <div className="preview-card">
            <span>预计获得积分:</span>
            <span className={`points-value ${calculatePoints() >= 0 ? 'positive' : 'negative'}`}>
              {calculatePoints() >= 0 ? '+' : ''}{calculatePoints()}
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={resetForm} className="btn-secondary">
            <RotateCcw size={16} />
            重置
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            <Save size={16} />
            {isSubmitting ? '保存中...' : '保存积分'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PointEntry;
