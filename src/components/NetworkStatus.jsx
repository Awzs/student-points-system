import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      // 3秒后隐藏状态
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始状态检查
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'} ${!showStatus ? 'hidden' : ''}`}>
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span>网络已连接</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>网络已断开，使用离线模式</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;
