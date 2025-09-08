// 触觉反馈工具函数

/**
 * 触发轻微的触觉反馈
 */
export const lightHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

/**
 * 触发中等强度的触觉反馈
 */
export const mediumHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

/**
 * 触发强烈的触觉反馈
 */
export const strongHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
};

/**
 * 成功操作的触觉反馈
 */
export const successHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 30, 50]);
  }
};

/**
 * 错误操作的触觉反馈
 */
export const errorHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100, 50, 100]);
  }
};

/**
 * 按钮点击的触觉反馈
 */
export const buttonHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(20);
  }
};
