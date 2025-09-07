// 移动端工具函数

// 检测是否为移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 检测是否为iOS设备
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// 检测是否为Android设备
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// 防止页面滚动（用于模态框等）
export const preventScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

// 恢复页面滚动
export const restoreScroll = () => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

// 触觉反馈（如果支持）
export const hapticFeedback = (type = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10]);
        break;
      case 'error':
        navigator.vibrate([50, 50, 50]);
        break;
      default:
        navigator.vibrate(10);
    }
  }
};

// 添加到主屏幕提示
export const showInstallPrompt = () => {
  // 检查是否支持PWA安装
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    return true;
  }
  return false;
};

// 获取安全区域信息（用于iPhone X等有刘海的设备）
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  };
};

// 设置状态栏样式（仅iOS）
export const setStatusBarStyle = (style = 'default') => {
  if (isIOS()) {
    const metaTag = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaTag) {
      metaTag.setAttribute('content', style);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = style;
      document.head.appendChild(meta);
    }
  }
};

// 禁用双击缩放
export const disableDoubleTapZoom = () => {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
};

// 添加触摸类名到元素
export const addTouchClass = (element, className = 'touch-active') => {
  if (!element) return;
  
  const addActiveClass = () => {
    element.classList.add(className);
    hapticFeedback('light');
  };
  
  const removeActiveClass = () => {
    element.classList.remove(className);
  };
  
  element.addEventListener('touchstart', addActiveClass, { passive: true });
  element.addEventListener('touchend', removeActiveClass, { passive: true });
  element.addEventListener('touchcancel', removeActiveClass, { passive: true });
  
  // 返回清理函数
  return () => {
    element.removeEventListener('touchstart', addActiveClass);
    element.removeEventListener('touchend', removeActiveClass);
    element.removeEventListener('touchcancel', removeActiveClass);
  };
};

// 格式化数字显示（移动端友好）
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// 复制到剪贴板（移动端兼容）
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch {
        textArea.remove();
        return false;
      }
    }
  } catch {
    return false;
  }
};

// 分享功能（如果支持Web Share API）
export const shareContent = async (data) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

// 获取网络状态
export const getNetworkStatus = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      online: navigator.onLine,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
  }
  return {
    online: navigator.onLine,
  };
};

// 监听网络状态变化
export const onNetworkChange = (callback) => {
  const handleOnline = () => callback({ online: true });
  const handleOffline = () => callback({ online: false });
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
