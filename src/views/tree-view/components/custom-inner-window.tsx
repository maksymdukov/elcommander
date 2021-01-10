import React, { CSSProperties } from 'react';
import WindowLasso from './window-lasso';

interface CustomInnerWindowProps {
  style: CSSProperties;
}

// TODO
// pass data needed by WindowLasso through ref
const CustomInnerWindow: React.ForwardRefRenderFunction<
  HTMLDivElement,
  CustomInnerWindowProps
> = ({ children, style }, ref) => {
  return (
    <div ref={ref} style={style}>
      <WindowLasso />
      {children}
    </div>
  );
};

export default React.forwardRef(CustomInnerWindow);
