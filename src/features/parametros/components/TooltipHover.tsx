import React from 'react';
import { createPortal } from 'react-dom';

interface TooltipHoverProps {
  children: React.ReactNode;
  x: number;
  y: number;
}

export const TooltipHover: React.FC<TooltipHoverProps> = ({ children, x, y }) => {
  return createPortal(
    <div
      className="fixed z-[99999] bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3"
      style={{ top: y, left: x }}
    >
      {children}
    </div>,
    document.body
  );
};
