import React from 'react';
import useResizeObserver from 'use-resize-observer';

interface ResizeObserverProps {
  children: (arg: { width: number; height: number }) => React.ReactNode;
}

export const ResizeObserver: React.FC<ResizeObserverProps> = ({ children }) => {
  const { ref, width = 0, height = 0 } = useResizeObserver();
  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {children({ width, height })}
    </div>
  );
};
