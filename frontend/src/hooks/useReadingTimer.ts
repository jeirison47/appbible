import { useState, useEffect, useRef } from 'react';

interface UseReadingTimerProps {
  onTenMinutes?: (totalSeconds: number) => void;
}

export function useReadingTimer({ onTenMinutes }: UseReadingTimerProps = {}) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastTenMinuteMarkRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1;

          // Verificar si se alcanzó un nuevo hito de 10 minutos (600 segundos)
          const currentTenMinutes = Math.floor(newSeconds / 600);
          const lastTenMinutes = Math.floor(prevSeconds / 600);

          if (currentTenMinutes > lastTenMinutes && onTenMinutes) {
            onTenMinutes(newSeconds);
          }

          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onTenMinutes]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = () => {
    setSeconds(0);
    setIsActive(false);
    lastTenMinuteMarkRef.current = 0;
  };

  const getFormattedTime = () => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getTenMinuteProgress = () => {
    const progressInCurrentBlock = seconds % 600;
    return Math.round((progressInCurrentBlock / 600) * 100);
  };

  const getCompletedTenMinuteBlocks = () => {
    return Math.floor(seconds / 600);
  };

  return {
    seconds,
    formattedTime: getFormattedTime(),
    isActive,
    start,
    pause,
    reset,
    tenMinuteProgress: getTenMinuteProgress(),
    completedBlocks: getCompletedTenMinuteBlocks(),
  };
}
