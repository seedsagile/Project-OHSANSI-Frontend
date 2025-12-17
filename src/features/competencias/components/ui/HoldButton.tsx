import { useState, useRef } from 'react';
import { cn } from '@/utils/cn';

interface HoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onHoldComplete: () => void;
  holdDuration?: number;
  label: string;
  loading?: boolean;
}

export const HoldButton = ({ 
  onHoldComplete, 
  holdDuration = 1500, 
  label, 
  className,
  loading,
  ...props 
}: HoldButtonProps) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHold = () => {
    if (loading) return;
    startTimeRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        stopHold();
        onHoldComplete();
      }
    }, 16);
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
  };

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      className={cn("relative overflow-hidden select-none active:scale-95 transition-transform", className)}
      {...props}
    >
      <div 
        className="absolute inset-0 bg-black/10 transition-all ease-linear"
        style={{ width: `${progress}%` }} 
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? 'Procesando...' : (progress > 0 ? 'Mantén presionado...' : label)}
      </span>
    </button>
  );
};